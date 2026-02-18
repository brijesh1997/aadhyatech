const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plans = [
    {
        name: "Starter",
        price_inr: 3000,
        price_usd: 40,
        interval: "MONTHLY",
        features: ["1 Informative Website", "Free Hosting", "1 Month Free Support", "3 Pages"],
        stripe_price_id_inr: "price_placeholder_starter_inr",
        stripe_price_id_usd: "price_placeholder_starter_usd",
        is_popular: false
    },
    {
        name: "Growth",
        price_inr: 5000,
        price_usd: 65,
        interval: "MONTHLY",
        features: ["2 Informative Templates", "Free Hosting", "2 Months Free Support", "5 Pages", "Advanced UI"],
        stripe_price_id_inr: "price_placeholder_growth_inr",
        stripe_price_id_usd: "price_placeholder_growth_usd",
        is_popular: true
    },
    {
        name: "Pro",
        price_inr: 10000,
        price_usd: 130,
        interval: "MONTHLY",
        features: ["3 Templates", "Free Domain", "3 Months Support", "10 Pages", "Payment Gateway"],
        stripe_price_id_inr: "price_placeholder_pro_inr",
        stripe_price_id_usd: "price_placeholder_pro_usd",
        is_popular: false
    },
    {
        name: "Business+",
        price_inr: 15000,
        price_usd: 200,
        interval: "MONTHLY",
        features: ["Mobile App (Basic)", "Free Domain", "Admin Panel", "API Integrations"],
        stripe_price_id_inr: "price_placeholder_business_inr",
        stripe_price_id_usd: "price_placeholder_business_usd",
        is_popular: false
    }
];

async function main() {
    console.log('Seeding plans...');

    for (const plan of plans) {
        // Upsert to avoid duplicates or errors if re-run
        const createdPlan = await prisma.plan.upsert({
            where: { id: plan.name.toLowerCase().replace(/\s+/g, '-') }, // Using slug as ID if possible? No, ID is uuid. 
            // Wait, scheme says ID is uuid. Upsert needs a unique field. 
            // Plan name is not unique in schema but typically is.
            // Let's check schema.
            // Model Plan: id (uuid), name (String). 
            // We can't use upsert easily without a unique field on name.
            // So we'll findFirst by name, if exists update, else create.
        });
    }
}

// Rewriting logic to be finding first
async function seed() {
    console.log('Seeding plans...');

    for (const plan of plans) {
        const existing = await prisma.plan.findFirst({
            where: { name: plan.name }
        });

        if (existing) {
            console.log(`Updating plan: ${plan.name}`);
            await prisma.plan.update({
                where: { id: existing.id },
                data: plan
            });
        } else {
            console.log(`Creating plan: ${plan.name}`);
            await prisma.plan.create({
                data: plan
            });
        }
    }
    console.log('Seeding completed.');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
