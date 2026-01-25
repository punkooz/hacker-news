const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Sorting and Search API', () => {
    let token;
    let post1Id;
    let post2Id;

    beforeAll(async () => {
        await db.migrate.latest();

        // Create user
        const userRes = await request(app)
            .post('/auth/signup')
            .send({ username: 'tester', password: 'password123' });
        token = userRes.body.token;

        // Create posts
        const p1Res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Unique Apple', text: 'Fruit' });
        post1Id = p1Res.body.id;

        const p2Res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Common Banana', text: 'Fruit' });
        post2Id = p2Res.body.id;

        // Upvote post 2
        await request(app)
            .post(`/posts/${post2Id}/vote`)
            .set('Authorization', `Bearer ${token}`)
            .send({ value: 1 });
    });

    afterAll(async () => {
        await db.destroy();
    });

    test('GET /posts should sort by new (default)', async () => {
        const res = await request(app).get('/posts');
        expect(res.body.posts[0].id).toBe(post2Id); // Most recent
    });

    test('GET /posts?sort=top should sort by points', async () => {
        const res = await request(app).get('/posts?sort=top');
        expect(res.body.posts[0].id).toBe(post2Id); // More points
    });

    test('GET /posts?q=Apple should filter results', async () => {
        const res = await request(app).get('/posts?q=Apple');
        expect(res.body.posts.length).toBe(1);
        expect(res.body.posts[0].title).toBe('Unique Apple');
    });

    test('GET /posts?q=Fruit should find both', async () => {
        const res = await request(app).get('/posts?q=Fruit');
        expect(res.body.posts.length).toBe(2);
    });
});
