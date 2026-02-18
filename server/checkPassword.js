const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@example.com';
    const password = 'password123';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Stored Hash:', user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password Match:', isMatch);

    // Test hashing again to see if it matches expectations
    const newHash = await bcrypt.hash(password, 10);
    console.log('Test New Hash:', newHash);
    const isNewMatch = await bcrypt.compare(password, newHash);
    console.log('Test New Hash Match:', isNewMatch);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
