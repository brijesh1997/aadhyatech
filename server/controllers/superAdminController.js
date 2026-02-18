const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            },
            select: {
                id: true,
                email: true,
                role: true,
                created_at: true
            }
        });
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Promote user to admin
exports.promoteToAdmin = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error promoting logging user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Demote admin to user
exports.demoteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role: 'USER' },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error demoting admin:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                business_profile: true,
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: { plan: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                business_profile: true,
                subscriptions: {
                    include: { plan: true }
                },
                transactions: {
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Delete business profile
        await prisma.businessProfile.deleteMany({ where: { user_id: id } });

        // Delete subscriptions
        await prisma.subscription.deleteMany({ where: { user_id: id } });

        // Delete transactions
        await prisma.transaction.deleteMany({ where: { user_id: id } });

        // Delete user
        await prisma.user.delete({ where: { id } });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const {
        first_name,
        last_name,
        mobile,
        city,
        state,
        country,
        business_profile
    } = req.body;

    try {
        // Check if business profile exists to avoid upsert validation errors on partial updates
        const existingProfile = await prisma.businessProfile.findUnique({
            where: { user_id: id }
        });

        // Update user basic info
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                first_name,
                last_name,
                mobile,
                city,
                state,
                country,
                // Update business profile if provided
                business_profile: business_profile ? (
                    existingProfile ? {
                        update: business_profile
                    } : {
                        create: business_profile
                    }
                ) : undefined
            },
            include: {
                business_profile: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
