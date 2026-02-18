const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const geoip = require('geoip-lite');
const requestIp = require('request-ip');

// Helper: Mock currency conversion (1 USD = 83 INR)
// In a real app, use an external API like: https://api.exchangerate-api.com/v4/latest/USD
// CONVERSION_RATE is now imported from utils/stripe

exports.getPublicPlans = async (req, res) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        // Localhost IP often returns null or ::1, default to 'US' or 'IN' for testing
        const geo = geoip.lookup(clientIp) || { country: 'US' };
        const country = geo.country;

        const currency = country === 'IN' ? 'INR' : 'USD';
        const symbol = country === 'IN' ? '₹' : '$';

        const plans = await prisma.plan.findMany({
            where: { is_active: true },
            orderBy: { price_inr: 'asc' },
        });

        // Fetch conversion rate once
        const conversionRate = await getConversionRate();

        // Transform plans based on currency
        const localizedPlans = plans.map((plan) => {
            // If country is India, calculate price based on USD price and conversion rate
            // ignoring the database price_inr
            let price;
            if (country === 'IN') {
                price = Math.ceil(plan.price_usd * conversionRate);
            } else {
                price = plan.price_usd;
            }

            return {
                id: plan.id,
                name: plan.name,
                price: price, // This is now dynamic for INR
                currency: currency,
                symbol: symbol,
                interval: plan.interval, // MONTHLY or YEARLY
                features: plan.features,
                is_popular: plan.is_popular,
                stripe_price_id: country === 'IN' ? null : plan.stripe_price_id_usd
                // For INR we will use dynamic price in checkout, so stripe_price_id might not be useful directly on frontend 
                // but we keep the USD one for reference or if logic changes.
                // Actually, frontend passes 'planName' to checkout, backend handles the rest.
            };
        });

        res.json({
            country,
            currency,
            plans: localizedPlans,
        });
    } catch (error) {
        console.error('Get Plans Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllPlansAdmin = async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const { getStripeClient, getConversionRate } = require('../utils/stripe');

exports.createPlan = async (req, res) => {
    try {
        const stripe = await getStripeClient();
        const { name, interval, features, is_popular } = req.body;
        let { price_usd, price_inr } = req.body;

        const conversionRate = await getConversionRate();

        // 1. Calculate INR if missing (Primary flow now)
        if (price_usd && !price_inr) {
            price_inr = Math.ceil(price_usd * conversionRate);
        } else if (price_inr && !price_usd) {
            // Legacy fallback or if someone manually sends INR
            price_usd = parseFloat((price_inr / conversionRate).toFixed(2));
        }

        if (!price_usd || !price_inr) {
            return res.status(400).json({ error: 'Price (USD) is determined to be required.' });
        }

        // Map interval to Stripe format
        const stripeInterval = interval === 'MONTHLY' ? 'month' : 'year';

        // 1. Create Stripe Product
        const product = await stripe.products.create({
            name: name,
        });

        // 2. Create Stripe Prices
        const priceInrStripe = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(parseFloat(price_inr) * 100), // amount in smallest currency unit (paise)
            currency: 'inr',
            recurring: { interval: stripeInterval },
        });

        const priceUsdStripe = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(parseFloat(price_usd) * 100), // amount in cents
            currency: 'usd',
            recurring: { interval: stripeInterval },
        });

        const newPlan = await prisma.plan.create({
            data: {
                name,
                price_inr: parseFloat(price_inr),
                price_usd: parseFloat(price_usd),
                interval,
                features: features,
                is_popular: is_popular || false,
                stripe_price_id_inr: priceInrStripe.id,
                stripe_price_id_usd: priceUsdStripe.id,
            },
        });

        res.status(201).json(newPlan);
    } catch (error) {
        console.error('Create Plan Error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, price_inr, price_usd, interval, ...otherData } = req.body;

        const conversionRate = await getConversionRate();

        // Auto-calculate INR if USD is provided but INR is not
        if (price_usd !== undefined && price_inr === undefined) {
            price_inr = Math.ceil(parseFloat(price_usd) * conversionRate);
        }

        // 1. Fetch existing plan
        const existingPlan = await prisma.plan.findUnique({ where: { id } });
        if (!existingPlan) return res.status(404).json({ error: 'Plan not found' });

        let stripeUpdates = {};

        // Helper to get Product ID
        const getProductId = async () => {
            try {
                // Try getting it from INR price, else USD
                const priceId = existingPlan.stripe_price_id_inr || existingPlan.stripe_price_id_usd;
                if (!priceId) return null;
                // Check if it's a placeholder
                if (priceId.includes('placeholder')) return null;

                const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
                return price.product.id;
            } catch (error) {
                console.warn("Could not retrieve Stripe Price/Product (likely invalid ID):", error.message);
                return null;
            }
        };

        const stripe = await getStripeClient();
        let productId = await getProductId();
        let productRecreated = false;

        // 2. Update Product Name if changed, OR Create new Product if missing/invalid
        if (!productId) {
            console.log("No valid Stripe Product found for this plan. Creating a new one.");
            const product = await stripe.products.create({ name: name || existingPlan.name });
            productId = product.id;
            productRecreated = true;
        } else if (name && name !== existingPlan.name) {
            await stripe.products.update(productId, { name: name });
        }

        // 3. Handle Price/Interval Changes (Re-create prices)
        // Check if any price-affecting fields changed and differ from existing
        const priceInrChanged = price_inr !== undefined && parseFloat(price_inr) !== existingPlan.price_inr;
        const priceUsdChanged = price_usd !== undefined && parseFloat(price_usd) !== existingPlan.price_usd;
        const intervalChanged = interval !== undefined && interval !== existingPlan.interval;

        // If prices changed OR we just created a fresh product (so we need initial prices), create them.
        if ((priceInrChanged || priceUsdChanged || intervalChanged || productRecreated) && productId) {
            const newPriceInrVal = price_inr !== undefined ? parseFloat(price_inr) : existingPlan.price_inr;
            const newPriceUsdVal = price_usd !== undefined ? parseFloat(price_usd) : existingPlan.price_usd;
            const newInterval = interval || existingPlan.interval;
            const stripeInterval = newInterval === 'MONTHLY' ? 'month' : 'year';

            // Create new INR Price
            const newPriceInrStripe = await stripe.prices.create({
                product: productId,
                unit_amount: Math.round(newPriceInrVal * 100),
                currency: 'inr',
                recurring: { interval: stripeInterval },
            });

            // Create new USD Price
            const newPriceUsdStripe = await stripe.prices.create({
                product: productId,
                unit_amount: Math.round(newPriceUsdVal * 100),
                currency: 'usd',
                recurring: { interval: stripeInterval },
            });

            stripeUpdates.stripe_price_id_inr = newPriceInrStripe.id;
            stripeUpdates.stripe_price_id_usd = newPriceUsdStripe.id;

            // Optionally archive old prices via Stripe API here if desired
        }

        const updatedPlan = await prisma.plan.update({
            where: { id },
            data: {
                name,
                price_inr: price_inr !== undefined ? parseFloat(price_inr) : undefined,
                price_usd: price_usd !== undefined ? parseFloat(price_usd) : undefined,
                interval,
                ...otherData,
                ...stripeUpdates
            },
        });

        res.json(updatedPlan);
    } catch (error) {
        console.error('Update Plan Error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await prisma.plan.findUnique({ where: { id } });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Archive in Stripe
        try {
            const stripe = await getStripeClient();

            // 1. Archive Prices
            if (plan.stripe_price_id_usd) {
                await stripe.prices.update(plan.stripe_price_id_usd, { active: false });
            }
            if (plan.stripe_price_id_inr) {
                await stripe.prices.update(plan.stripe_price_id_inr, { active: false });
            }

            // 2. Archive Product
            // Retrieve product ID from one of the prices
            let productId = null;
            const priceIdToCheck = plan.stripe_price_id_usd || plan.stripe_price_id_inr;

            if (priceIdToCheck) {
                const price = await stripe.prices.retrieve(priceIdToCheck);
                productId = typeof price.product === 'string' ? price.product : price.product.id;
            }

            if (productId) {
                await stripe.products.update(productId, { active: false });
                console.log(`Archived Stripe Product: ${productId}`);
            }

        } catch (stripeError) {
            console.error("Error archiving in Stripe during plan deletion:", stripeError);
            // Continue to delete from DB even if Stripe fails, 
            // so we don't end up with a ghost plan in DB that can't be deleted.
        }

        await prisma.plan.delete({ where: { id } });
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error("Delete Plan Error:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
