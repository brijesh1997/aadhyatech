const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            // Personal Details
            first_name,
            last_name,
            mobile,
            country,
            state,
            city,
            // Business Details
            business_name,
            industry,
            description,
            website_goal,
            target_audience,
            logo_url,
            primary_color,
            secondary_color,
            contact_email,
            contact_phone,
            selected_plan,
            plan_price,
            payment_status,
            existing_website
        } = req.body;

        // Update User Personal Details
        await prisma.user.update({
            where: { id: userId },
            data: {
                first_name,
                last_name,
                mobile,
                country,
                state,
                city
            }
        });

        // Ensure plan_price is a string
        const planPriceStr = plan_price ? String(plan_price) : null;

        // Upsert Business Profile
        const profile = await prisma.businessProfile.upsert({
            where: { user_id: userId },
            update: {
                business_name,
                industry,
                description,
                website_goal,
                target_audience,
                logo_url,
                primary_color,
                secondary_color,
                contact_email,
                contact_phone,
                selected_plan,
                plan_price: planPriceStr,
                payment_status,
                existing_website
            },
            create: {
                user_id: userId,
                business_name,
                industry,
                description,
                website_goal,
                target_audience,
                logo_url,
                primary_color,
                secondary_color,
                contact_email,
                contact_phone,
                selected_plan,
                plan_price: planPriceStr,
                payment_status, // Schema has default "Pending", so undefined works if we omit it, but passing undefined is also safe usually
                existing_website
            }
        });

        res.json(profile);
    } catch (error) {
        console.error('Error creating/updating profile:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch via User model since it seems to have the fresher schema metadata
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                business_profile: true
            }
        });

        if (!user || !user.business_profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Construct response to match previous structure (BusinessProfile at root + nested user info)
        const profile = {
            ...user.business_profile,
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                mobile: user.mobile,
                country: user.country,
                state: user.state,
                city: user.city
            }
        };

        console.log('Returning profile for user:', userId, 'Status:', profile.website_status);
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
