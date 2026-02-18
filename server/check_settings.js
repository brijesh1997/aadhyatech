const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettings() {
    const settings = await prisma.systemSettings.findFirst();
    console.log(JSON.stringify(settings, null, 2));
}

checkSettings()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
