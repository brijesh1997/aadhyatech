const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeSubscriptions = await prisma.subscription.count({
            where: { status: 'ACTIVE' }
        });

        // Revenue calculation would typically involve summing up invoice payments from Stripe or local DB records
        // For MVP, we can mock it or calculate based on active subscriptions * plan price (rough estimate)
        const subscriptions = await prisma.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        });

        let monthlyRevenueUSD = 0;
        subscriptions.forEach(sub => {
            // Very rough estimate assuming all pay in USD for simplicity here, or convert
            monthlyRevenueUSD += sub.plan.price_usd;
        });

        res.json({
            totalUsers,
            activeSubscriptions,
            monthlyRevenueUSD: parseFloat(monthlyRevenueUSD.toFixed(2)),
            // Add more stats as needed
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
