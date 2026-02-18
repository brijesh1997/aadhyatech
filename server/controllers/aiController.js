const OpenAI = require('openai');



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.generateDescription = async (req, res) => {
    try {
        const { business_name, industry, keywords, custom_prompt } = req.body;

        // Fetch System Settings
        const settings = await prisma.systemSettings.findFirst();
        const apiKey = settings?.openai_api_key || process.env.OPENAI_API_KEY;

        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            return res.json({
                description: `[AI MOCK] ${business_name} is a leading company in the ${industry} sector. ${custom_prompt ? `(Based on: ${custom_prompt})` : ''} (Add OpenAI Key in Super Admin Settings to generate real text)`
            });
        }

        const openai = new OpenAI({ apiKey: apiKey });

        let prompt = `Write a professional and engaging business description (approx 50-80 words) for a company named "${business_name}" in the "${industry}" industry.`;

        if (custom_prompt) {
            prompt += ` The user specifically requested: "${custom_prompt}"`;
        } else if (keywords) {
            prompt += ` Focus on these keywords: ${keywords}.`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
        });

        const description = response.choices[0].message.content.trim();
        res.json({ description });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
};
