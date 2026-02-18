const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getStripeClient, getStripeWebhookSecret } = require('../utils/stripe');

exports.createCheckoutSession = async (req, res) => {
    try {
        console.log('Creating checkout session...');
        const stripe = await getStripeClient();
        const { planName } = req.body;
        const userId = req.user.id; // From auth middleware

        console.log(`User: ${userId}, Plan Name: "${planName}"`);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        if (!planName) {
            console.log('Plan name missing');
            return res.status(400).json({ error: 'Plan name is required' });
        }

        // Case-insensitive lookup for plan
        const plan = await prisma.plan.findFirst({
            where: {
                name: {
                    equals: planName,
                    mode: 'insensitive'
                }
            }
        });

        if (!plan) {
            console.log(`Plan not found for name: "${planName}"`);
            return res.status(404).json({ error: 'Plan not found' });
        }
        console.log(`Found plan: ${plan.name} (ID: ${plan.id})`);

        // Determine currency/price ID based on user location logic or plan selection
        // Ideally user selects the currency in frontend or we detect it.
        // For simplicity, we'll check if plan has specific Stripe Price IDs (which are currency specific)
        // If we passed a specific priceId from frontend, use that. 
        // But since backend controls logic, let's assume frontend sends planId and optionally currency preference?
        // Or simpler: Just use the USD one for now as fallback if INR not set.

        // Improving: frontend should send the stripe price ID they want to buy.
        // But we want to validate it belongs to the plan.
        // Let's assume frontend sends { planId, currency }

        // Determine currency/price ID based on user location logic
        let currency = req.body.currency;

        if (!currency) {
            // Auto-detect based on user country if not provided explicitly
            const userCountry = user.country ? user.country.trim().toLowerCase() : '';
            if (userCountry === 'india' || userCountry === 'in') {
                currency = 'INR';
            } else {
                currency = 'USD';
            }
        }

        // Logic to get the price or create dynamic price data
        let lineItem;

        if (currency === 'INR') {
            console.log('Generating dynamic INR price...');
            // 1. Get Product ID from USD Price (assuming USD price exists and is linked to the product)
            if (!plan.stripe_price_id_usd) {
                return res.status(500).json({ error: 'USD Price ID missing on plan, cannot fetch product.' });
            }

            const usdPriceObj = await stripe.prices.retrieve(plan.stripe_price_id_usd);
            const productId = typeof usdPriceObj.product === 'string' ? usdPriceObj.product : usdPriceObj.product.id;

            // 2. Calculate Amount
            // Import getConversionRate at top or require it here
            const { getConversionRate } = require('../utils/stripe');
            const conversionRate = await getConversionRate();
            const unitAmount = Math.round(plan.price_usd * conversionRate * 100); // in paisa

            console.log(`Dynamic INR Amount: ${unitAmount} (Rate: ${conversionRate})`);

            lineItem = {
                price_data: {
                    currency: 'inr',
                    product: productId,
                    unit_amount: unitAmount,
                    recurring: {
                        interval: plan.interval === 'MONTHLY' ? 'month' : 'year',
                    },
                },
                quantity: 1,
            };
        } else {
            // USD or other fixed currency
            const priceId = plan.stripe_price_id_usd;
            if (!priceId) {
                return res.status(400).json({ error: 'Price ID not configured for this plan' });
            }
            lineItem = {
                price: priceId,
                quantity: 1,
            };
        }

        let customerId = user.stripe_customer_id;

        if (!customerId) {
            console.log('Creating new Stripe customer...');
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: user.id },
                data: { stripe_customer_id: customerId }
            });
            console.log(`Created customer: ${customerId}`);
        } else {
            console.log(`Using existing customer: ${customerId}`);
        }

        console.log('Creating Stripe session...');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [lineItem],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/dashboard?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard?payment_status=cancel`,
            metadata: {
                userId: user.id,
                planId: plan.id,
            },
            client_reference_id: user.id, // Helpful for webhooks
        });

        console.log(`Session created: ${session.id}, URL: ${session.url}`);
        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout Session Error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.createPortalSession = async (req, res) => {
    try {
        const stripe = await getStripeClient();
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.stripe_customer_id) {
            return res.status(400).json({ error: 'User does not have a subscription account' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.CLIENT_URL}/dashboard`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Portal Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Webhook handling needs raw body, express.json() might interfere if not handled safely
// We'll handle that in the route or index
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const stripe = await getStripeClient();
        const webhookSecret = await getStripeWebhookSecret();

        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleCheckoutSessionCompleted(session);
            break;
        case 'invoice.payment_succeeded':
            // Extend subscription logic if needed
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await handleSubscriptionUpdated(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

async function handleCheckoutSessionCompleted(session) {
    const userId = session.metadata.userId; // or client_reference_id
    const planId = session.metadata.planId;
    const subscriptionId = session.subscription;

    // Retrieve full subscription details to get dates
    const stripe = await getStripeClient();
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

    // Create or update subscription in DB
    await prisma.subscription.create({
        data: {
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            status: 'ACTIVE',
            current_period_end: new Date(stripeSub.current_period_end * 1000)
        }
    });

    console.log(`Subscription created for user ${userId}`);

    // Update Business Profile Payment Status
    try {
        await prisma.businessProfile.update({
            where: { user_id: userId },
            data: {
                payment_status: 'Paid',
            }
        });
        console.log(`Updated BusinessProfile payment_status to Paid for user ${userId}`);

        // Create Transaction Record
        await prisma.transaction.create({
            data: {
                user_id: userId,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency || 'usd',
                status: 'succeeded',
                stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.id
            }
        });
        console.log(`Transaction record created for user ${userId}`);

    } catch (err) {
        console.error(`Failed to update BusinessProfile or create Transaction for user ${userId}:`, err);
    }
}

async function handleSubscriptionUpdated(stripeSub) {
    // Find subscription in DB by stripe_subscription_id
    const subscription = await prisma.subscription.findFirst({
        where: { stripe_subscription_id: stripeSub.id }
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: stripeSub.status === 'active' ? 'ACTIVE' : 'CANCELED', // Map status properly
                current_period_end: new Date(stripeSub.current_period_end * 1000)
            }
        });
        console.log(`Subscription updated for ${subscription.id}`);
    }
}

exports.verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const stripe = await getStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.metadata.userId; // Ensure metadata is present

            // 1. Update Business Profile
            await prisma.businessProfile.update({
                where: { user_id: userId },
                data: { payment_status: 'Paid' }
            });

            // 2. Create Transaction Record (Idempotent check recommended in prod, but simple here)
            // Check if transaction exists for this payment intent
            const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;
            const existingTx = await prisma.transaction.findFirst({
                where: { stripe_payment_id: paymentId }
            });

            if (!existingTx) {
                await prisma.transaction.create({
                    data: {
                        user_id: userId,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        currency: session.currency || 'usd',
                        status: 'succeeded',
                        stripe_payment_id: paymentId
                    }
                });
                console.log(`Transaction record created (verified) for user ${userId}`);
            }

            // 3. Ensure subscription exists (Idempotent check)
            const subscriptionId = session.subscription;
            if (subscriptionId) {
                const existingSub = await prisma.subscription.findFirst({
                    where: { stripe_subscription_id: subscriptionId }
                });

                if (!existingSub) {
                    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
                    await prisma.subscription.create({
                        data: {
                            user_id: userId,
                            plan_id: session.metadata.planId,
                            stripe_subscription_id: subscriptionId,
                            status: 'ACTIVE',
                            current_period_end: new Date(stripeSub.current_period_end * 1000)
                        }
                    });
                    console.log(`Verified & Created missing subscription for ${userId}`);
                }
            }

            return res.json({ success: true, message: 'Payment verified and profile updated.' });
        } else {
            return res.status(400).json({ error: 'Payment not completed yet.' });
        }

    } catch (error) {
        console.error('Verify Session Error:', error);
        res.status(500).json({ error: error.message });
    }
};
