const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('GET /health', () => {
    afterAll(async () => {
        await db.destroy();
    });

    it('should return 200 and db connected', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        // If DB is not up, this might fail or return error status. 
        // We expect it to work if docker-compose is up.
    });
});
