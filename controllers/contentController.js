const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPageContent = async (req, res) => {
    try {
        const { page } = req.params;

        // Fetch all active sections for the page
        const content = await prisma.pageContent.findMany({
            where: {
                page_name: page,
                is_active: true
            }
        });

        // Transform array to object { section_name: content } for easier frontend consumption
        const contentMap = content.reduce((acc, item) => {
            acc[item.section_name] = item.content;
            return acc;
        }, {});

        res.json(contentMap);
    } catch (error) {
        console.error('Get Content Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updatePageContent = async (req, res) => {
    try {
        const { page_name, section_name, content, is_active } = req.body;

        // Upsert: Create if not exists, update if exists
        const updatedContent = await prisma.pageContent.upsert({
            where: {
                page_name_section_name: {
                    page_name,
                    section_name
                }
            },
            update: {
                content,
                is_active: is_active !== undefined ? is_active : true,
            },
            create: {
                page_name,
                section_name,
                content,
                is_active: is_active !== undefined ? is_active : true,
            }
        });

        res.json(updatedContent);
    } catch (error) {
        console.error('Update Content Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllContentAdmin = async (req, res) => {
    try {
        const content = await prisma.pageContent.findMany({
            orderBy: [{ page_name: 'asc' }, { section_name: 'asc' }]
        });
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
