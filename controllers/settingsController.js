const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {}
            });
        }

        // Mask secrets for non-admin users if we ever expose this publicly
        // For now, only Super Admin accesses this, so we return everything.
        // Ideally, we might want to mask parts of the keys even for admins in the UI.

        res.json(settings);
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Get Public Settings (for frontend feature flags)
exports.getPublicSettings = async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({ data: {} });
        }

        res.json({
            ai_generation_enabled: settings.ai_generation_enabled,
            // google_client_id: settings.google_client_id // Expose if needed for dynamic auth
        });
    } catch (error) {
        console.error('Get Public Settings Error:', error);
        res.status(500).json({ error: 'Failed to fetch public settings' });
    }
}

// Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const {
            ai_generation_enabled,
            openai_api_key,
            google_client_id,
            stripe_secret_key,
            stripe_publishable_key,
            stripe_webhook_secret
        } = req.body;

        let settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            settings = await prisma.systemSettings.create({ data: {} });
        }

        const updated = await prisma.systemSettings.update({
            where: { id: settings.id },
            data: {
                ai_generation_enabled,
                openai_api_key,
                google_client_id,
                stripe_secret_key,
                stripe_publishable_key,
                stripe_webhook_secret
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
