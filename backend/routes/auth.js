const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Register
router.post('/register', async (req, res) => {
    try {
        const { customerName, phoneNumber, email, password } = req.body;

        const existingUser = await prisma.bank_users.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate an 8-character customer ID
        const customerId = Math.random().toString(36).substring(2, 10).toUpperCase();

        const newUser = await prisma.bank_users.create({
            data: {
                customerId,
                customerName,
                phoneNumber,
                email,
                password: hashedPassword,
                balance: 0 // Default balance
            }
        });

        res.status(201).json({ message: 'Registration successful', customerId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.bank_users.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const tokenPayload = {
            userId: user.id,
            customerId: user.customerId,
            email: user.email
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const expiryTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.bank_tokens.create({
            data: {
                tokenValue: token,
                userId: user.id,
                expiryTime
            }
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                customerName: user.customerName,
                customerId: user.customerId,
                email: user.email,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            await prisma.bank_tokens.deleteMany({ where: { tokenValue: token } });
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error during logout' });
    }
});

module.exports = router;
