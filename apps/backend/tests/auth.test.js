const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Auth API', () => {
    beforeAll(async () => {
        await db.migrate.latest();
    });

    afterEach(async () => {
        await db('users').del();
    });

    afterAll(async () => {
        await db.destroy();
    });

    const testUser = {
        username: 'testu',
        password: 'password123'
    };

    describe('POST /auth/signup', () => {
        it('should create a new user and return token', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('username', testUser.username);
        });

        it('should fail if username taken', async () => {
            await request(app).post('/auth/signup').send(testUser);
            const res = await request(app).post('/auth/signup').send(testUser);
            expect(res.statusCode).toEqual(409);
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/auth/signup').send(testUser);
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send(testUser);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ ...testUser, password: 'wrong' });

            expect(res.statusCode).toEqual(401);
        });
    });
});
