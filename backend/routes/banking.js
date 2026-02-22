const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const prisma = require('../prismaClient');

// Apply middleware to all routes in this router
router.use(authenticateToken);

// Get Balance
router.get('/balance', async (req, res) => {
    try {
        const user = await prisma.bank_users.findUnique({
            where: { id: req.user.userId },
            select: { balance: true }
        });
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching balance' });
    }
});

// Deposit
router.post('/deposit', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        const user = await prisma.bank_users.update({
            where: { id: req.user.userId },
            data: { balance: { increment: amount } },
            select: { balance: true }
        });

        res.json({ message: 'Deposit successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ error: 'Error processing deposit' });
    }
});

// Withdraw
router.post('/withdraw', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        // We do it in a transaction to ensure no race conditions ideally, but for this simulation:
        const user = await prisma.bank_users.findUnique({ where: { id: req.user.userId } });
        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const updatedUser = await prisma.bank_users.update({
            where: { id: req.user.userId },
            data: { balance: { decrement: amount } },
            select: { balance: true }
        });

        res.json({ message: 'Withdrawal successful', balance: updatedUser.balance });
    } catch (error) {
        res.status(500).json({ error: 'Error processing withdrawal' });
    }
});

// Transfer
router.post('/transfer', async (req, res) => {
    try {
        const { recipientCustomerId, amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        if (req.user.customerId === recipientCustomerId) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }

        const senderId = req.user.userId;

        await prisma.$transaction(async (tx) => {
            const sender = await tx.bank_users.findUnique({ where: { id: senderId } });
            if (sender.balance < amount) {
                throw new Error('Insufficient funds');
            }

            const recipient = await tx.bank_users.findUnique({ where: { customerId: recipientCustomerId } });
            if (!recipient) {
                throw new Error('Recipient not found');
            }

            await tx.bank_users.update({
                where: { id: senderId },
                data: { balance: { decrement: amount } }
            });

            await tx.bank_users.update({
                where: { id: recipient.id },
                data: { balance: { increment: amount } }
            });
        });

        res.json({ message: 'Transfer successful' });
    } catch (error) {
        if (error.message === 'Insufficient funds' || error.message === 'Recipient not found') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error processing transfer' });
    }
});

// Mock Transactions until we create a transactions table if needed
router.get('/transactions', async (req, res) => {
    try {
        res.json({ transactions: [] });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const user = await prisma.bank_users.findUnique({
            where: { id: req.user.userId },
            select: { customerName: true, customerId: true, phoneNumber: true, email: true, createdAt: true }
        });
        res.json({ profile: user });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

module.exports = router;
