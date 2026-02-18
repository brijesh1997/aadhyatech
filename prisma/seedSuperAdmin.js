const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@aadhyatech.com';
    const password = 'Admin@123';
    const role = 'SUPER_ADMIN';

    console.log(`Seeding super admin user...`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role,
            password_hash: passwordHash,
        },
        create: {
            email,
            password_hash: passwordHash,
            role,
            first_name: 'Super',
            last_name: 'Admin',
        },
    });

    console.log(`User ${user.email} created/updated with role ${user.role}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
