const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token exists in bank_tokens and is not expired
        const tokenRecord = await prisma.bank_tokens.findUnique({
            where: { tokenValue: token }
        });

        if (!tokenRecord || new Date() > tokenRecord.expiryTime) {
            if (tokenRecord) {
                await prisma.bank_tokens.delete({ where: { tokenValue: token } });
            }
            return res.status(403).json({ error: 'Token expired or invalid' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateToken;
