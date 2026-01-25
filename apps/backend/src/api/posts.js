const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET /posts - List posts (paginated, sorted, searchable)
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'new'; // 'new' or 'top'
    const query = req.query.q || '';
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        let dbQuery = db('posts')
            .join('users', 'posts.author_id', 'users.id')
            .select('posts.*', 'users.username as author');

        if (query) {
            dbQuery = dbQuery.where(function () {
                this.where('posts.title', 'ILIKE', `%${query}%`)
                    .orWhere('posts.text', 'ILIKE', `%${query}%`);
            });
        }

        if (sort === 'top') {
            dbQuery = dbQuery.orderBy('posts.points', 'desc');
        } else if (sort === 'best') {
            // Hacker News-style ranking: points / (age_in_hours + 2)^1.5
            dbQuery = dbQuery.orderByRaw('posts.points / POW(EXTRACT(EPOCH FROM (NOW() - posts.created_at))/3600 + 2, 1.5) DESC');
        } else {
            dbQuery = dbQuery.orderBy('posts.created_at', 'desc');
        }

        const posts = await dbQuery.limit(limit).offset(offset);

        // Count for current search
        let countQuery = db('posts');
        if (query) {
            countQuery = countQuery.where(function () {
                this.where('title', 'ILIKE', `%${query}%`)
                    .orWhere('text', 'ILIKE', `%${query}%`);
            });
        }
        const [{ count }] = await countQuery.count();
        const totalPages = Math.ceil(count / limit);

        res.json({ posts, page, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// POST /posts - Create post
router.post('/', authenticateToken, async (req, res) => {
    const { title, url, text } = req.body;

    if (!title) return res.status(400).json({ error: 'Title required' });
    if (title.length > 255) return res.status(400).json({ error: 'Title too long (max 255 characters)' });
    if (!url && !text) return res.status(400).json({ error: 'URL or Text required' });

    try {
        const [post] = await db('posts').insert({
            title,
            url,
            text,
            author_id: req.user.id
        }).returning('*');

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// GET /posts/:id - Detail
router.get('/:id', async (req, res) => {
    try {
        const post = await db('posts')
            .join('users', 'posts.author_id', 'users.id')
            .select('posts.*', 'users.username as author')
            .where('posts.id', req.params.id)
            .first();

        if (!post) return res.status(404).json({ error: 'Not found' });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// POST /posts/:id/vote - Vote
router.post('/:id/vote', authenticateToken, async (req, res) => {
    const { value } = req.body; // 1 or -1 (or 0 to unvote)
    const postId = req.params.id;
    const userId = req.user.id;

    if (![1, -1, 0].includes(value)) return res.status(400).json({ error: 'Invalid vote value' });

    try {
        await db.transaction(async trx => {
            const existingVote = await trx('votes')
                .where({ user_id: userId, post_id: postId })
                .first();

            let pointsDelta = 0;

            if (existingVote) {
                if (value === 0) {
                    // Remove vote
                    await trx('votes').where('id', existingVote.id).del();
                    pointsDelta = -existingVote.value;
                } else if (existingVote.value !== value) {
                    // Change vote
                    await trx('votes').where('id', existingVote.id).update({ value });
                    pointsDelta = value - existingVote.value;
                }
            } else if (value !== 0) {
                // New vote
                await trx('votes').insert({ user_id: userId, post_id: postId, value });
                pointsDelta = value;
            }

            if (pointsDelta !== 0) {
                await trx('posts').where('id', postId).increment('points', pointsDelta);
            }

            const [updatedPost] = await trx('posts').where('id', postId).returning('points');
            res.json({ points: updatedPost.points });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// POST /posts/:id/comments - Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
    const { content, parent_id } = req.body;
    const postId = req.params.id;

    if (!content) return res.status(400).json({ error: 'Content required' });

    try {
        const [comment] = await db('comments').insert({
            content,
            post_id: postId,
            author_id: req.user.id,
            parent_id: parent_id || null
        }).returning('*');

        // Increment comments count on post
        await db('posts').where('id', postId).increment('comments_count', 1);

        // Fetch author username for convenience
        const user = await db('users').where('id', req.user.id).first();
        comment.author = user.username;

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// PUT /posts/:postId/comments/:commentId - Edit comment
router.put('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    if (!content) return res.status(400).json({ error: 'Content required' });

    try {
        const comment = await db('comments').where('id', commentId).first();

        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        const [updated] = await db('comments')
            .where('id', commentId)
            .update({ content, updated_at: db.fn.now() })
            .returning('*');

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// DELETE /posts/:postId/comments/:commentId - Delete comment
router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    const { commentId, postId } = req.params;

    try {
        const comment = await db('comments').where('id', commentId).first();

        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        await db('comments').where('id', commentId).del();

        // Decrement comments count on post
        await db('posts').where('id', postId).decrement('comments_count', 1);

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

// GET /posts/:id/comments - Get comments for post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await db('comments')
            .join('users', 'comments.author_id', 'users.id')
            .select('comments.*', 'users.username as author')
            .where('comments.post_id', req.params.id)
            .orderBy('comments.created_at', 'asc');

        const commentMap = {};
        comments.forEach(c => {
            c.replies = [];
            commentMap[c.id] = c;
        });

        const roots = [];
        comments.forEach(c => {
            if (c.parent_id && commentMap[c.parent_id]) {
                commentMap[c.parent_id].replies.push(c);
            } else {
                roots.push(c);
            }
        });

        res.json(roots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
