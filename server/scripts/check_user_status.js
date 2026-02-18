const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
    const userId = '60ff69c4-aef0-4fe4-96b0-a11ff1a66aee';

    console.log('Checking status for user:', userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            business_profile: true
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    console.log('Business Profile:', user.business_profile);
}

checkStatus()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
