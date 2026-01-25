const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Posts API', () => {
    let token;
    let userId;

    beforeAll(async () => {
        await db.migrate.latest();
        // Create user for tests
        const res = await request(app).post('/auth/signup').send({ username: 'poster', password: 'pw' });
        token = res.body.token;
        userId = res.body.user.id;
    });

    afterAll(async () => {
        await db.destroy();
    });

    describe('POST /posts', () => {
        it('should create a post', async () => {
            const res = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Test Post', url: 'http://example.com' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('Test Post');
        });

        it('should fail without auth', async () => {
            const res = await request(app).post('/posts').send({ title: 'No Auth' });
            expect(res.statusCode).toEqual(401);
        });
    });

    it('should fail if title is too long', async () => {
        const longTitle = 'a'.repeat(256);
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: longTitle, url: 'http://example.com' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('too long');
    });


    describe('GET /posts', () => {
        it('should list posts', async () => {
            const res = await request(app).get('/posts');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.posts)).toBe(true);
            expect(res.body.posts.length).toBeGreaterThan(0);
        });
    });

    describe('POST /posts/:id/vote', () => {
        let postId;
        beforeAll(async () => {
            const res = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Vote Post', url: 'http://vote.com' });
            postId = res.body.id;
        });

        it('should upvote a post', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/vote`)
                .set('Authorization', `Bearer ${token}`)
                .send({ value: 1 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.points).toBe(1);
        });

        it('should remove vote', async () => {
            const res = await request(app)
                .post(`/posts/${postId}/vote`)
                .set('Authorization', `Bearer ${token}`)
                .send({ value: 0 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.points).toBe(0);
        });
    });
});
