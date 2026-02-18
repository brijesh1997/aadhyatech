const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Default role is USER, but allow creating ADMIN/EDITOR if secret key is provided (simplified for now)
        // In production, admin creation should be seeding or protected differently.
        // For this MVP, we'll allow role passed in body for testing flexibility, 
        // BUT typically we would restrict this.
        // Let's restrict it: only 'USER' can be created via public registration.

        // Check if it's the first user, make them ADMIN automatically? 
        // Or just default to USER. Let's default to USER.
        const userRole = 'USER';

        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: passwordHash,
                role: userRole,
            },
        });

        const token = generateToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login attempt for:', req.body.email);
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        console.log('User found:', user.role);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();

        let user = await prisma.user.findUnique({ where: { email } });

        // Split name into first and last
        const nameParts = name ? name.split(' ') : [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        if (!user) {
            // Create a new user if not exists
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(Math.random().toString(36).slice(-8), salt); // Random password

            user = await prisma.user.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    role: 'USER',
                    first_name: firstName,
                    last_name: lastName
                },
            });
        } else {
            // If user exists but names are missing, update them
            if (!user.first_name || !user.last_name) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        first_name: user.first_name || firstName,
                        last_name: user.last_name || lastName
                    }
                });
            }
        }

        const jwtToken = generateToken(user);

        res.json({
            message: 'Google login successful',
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            },
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(400).json({ error: 'Google login failed' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                created_at: true,
                first_name: true,
                last_name: true
            },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
