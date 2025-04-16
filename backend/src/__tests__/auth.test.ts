import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import sequelize from '../database';
import '../models';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/register', () => {
    it('should register a new user', async () => {
        const response = await request(app).post('/api/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword'
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username', 'testuser');
    });
});
