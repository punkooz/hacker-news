const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');

const authRouter = require('./api/auth');
const postsRouter = require('./api/posts');

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/posts', postsRouter);

// Health Check
app.get('/health', async (req, res) => {
    try {
        await db.raw('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
    }
});

// Root
app.get('/', (req, res) => {
    res.send('Hacker News Clone API');
});

module.exports = app;
