const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Comments API', () => {
    let token;
    let userId;
    let postId;

    beforeAll(async () => {
        await db.migrate.latest();

        // Create user
        const userRes = await request(app)
            .post('/auth/signup')
            .send({ username: 'commenter', password: 'password123' });
        token = userRes.body.token;
        userId = userRes.body.user.id;

        // Create post
        const postRes = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Post', text: 'Some text' });
        postId = postRes.body.id;
    });

    afterAll(async () => {
        await db.destroy();
    });

    test('POST /posts/:id/comments should create a comment', async () => {
        const res = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Root comment' });

        expect(res.status).toBe(201);
        expect(res.body.content).toBe('Root comment');
        expect(res.body.post_id).toBe(postId);
        expect(res.body.author).toBe('commenter');
    });

    test('POST /posts/:id/comments should create a nested comment', async () => {
        // Create root first
        const rootRes = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Parent comment' });

        const parentId = rootRes.body.id;

        const res = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Child comment', parent_id: parentId });

        expect(res.status).toBe(201);
        expect(res.body.parent_id).toBe(parentId);
    });

    test('GET /posts/:id/comments should return threaded comments', async () => {
        const res = await request(app).get(`/posts/${postId}/comments`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        // Find the one with replies
        const parent = res.body.find(c => c.content === 'Parent comment');
        expect(parent).toBeDefined();
        expect(parent.replies.length).toBeGreaterThan(0);
        expect(parent.replies[0].content).toBe('Child comment');
    });
});
