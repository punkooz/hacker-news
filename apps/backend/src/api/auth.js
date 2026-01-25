const express = require('express');
const db = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../services/auth');

const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const existing = await db('users').where({ username }).first();
        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const hashedPassword = await hashPassword(password);
        const [user] = await db('users').insert({
            username,
            password_hash: hashedPassword
        }).returning(['id', 'username', 'created_at']);

        const token = generateToken(user);
        res.status(201).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const user = await db('users').where({ username }).first();
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
