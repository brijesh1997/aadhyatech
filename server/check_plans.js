const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
    const plans = await prisma.plan.findMany();
    console.log(JSON.stringify(plans, null, 2));
}

checkPlans()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
