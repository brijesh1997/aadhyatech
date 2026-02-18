const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe');

let stripeInstance = null;

/**
 * Returns an initialized Stripe client.
 * Prioritizes keys from SystemSettings, falls back to process.env.
 */
const getStripeClient = async () => {
    // If we have a cached valid instance that hasn't expired (though keys might change?), 
    // for simplicity, let's re-fetch settings or cache smartly.
    // For now, let's fetch settings every time or assume low traffic admin ops.
    // Actually Stripe client initialization is cheap.

    try {
        const settings = await prisma.systemSettings.findFirst();
        const secretKey = (settings && settings.stripe_secret_key) ? settings.stripe_secret_key : process.env.STRIPE_SECRET_KEY;

        if (!secretKey) {
            throw new Error('Stripe Secret Key not found in System Settings or Environment Variables.');
        }

        return stripe(secretKey);
    } catch (error) {
        console.error("Error initializing Stripe client:", error);
        throw error;
    }
};

/**
 * Returns the Stripe Webhook Secret.
 * Prioritizes DB, falls back to env.
 */
const getStripeWebhookSecret = async () => {
    const settings = await prisma.systemSettings.findFirst();
    return (settings && settings.stripe_webhook_secret) ? settings.stripe_webhook_secret : process.env.STRIPE_WEBHOOK_SECRET;
};

let cachedRate = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600 * 1000; // 1 hour

const getConversionRate = async () => {
    const now = Date.now();
    if (cachedRate && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedRate;
    }

    try {
        // Dynamic import for node-fetch if running in environment supporting it, or use global fetch if Node 18+
        // Assuming Node 18+ which has global fetch. If not, might need axios or https.
        // The project uses axios in client, let's see if it's in server package.json or just use global fetch.
        // Safe bet: use global fetch if available, else require https.
        // For simplicity in this environments, let's try fetch first.

        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.INR) {
            cachedRate = data.rates.INR;
            lastFetchTime = now;
            console.log(`Fetched fresh conversion rate: ${cachedRate}`);
            return cachedRate;
        }
    } catch (error) {
        console.error("Error fetching conversion rate:", error);
    }

    // Fallback if API fails
    return cachedRate || 90;
};

module.exports = { getStripeClient, getStripeWebhookSecret, getConversionRate };
