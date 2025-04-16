import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import sequelize from '../database';
import User from '../models/User';
import bcrypt from 'bcrypt';
import '../models';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);

beforeAll(async () => {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/login', () => {
    it('should return a JWT token for valid credentials', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');

        // Проверим, что установлен refreshToken в cookie
        const setCookieHeader = response.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader[0]).toMatch(/refreshToken=/);
    });

    it('should return 401 for invalid password', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unknown user', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                username: 'notexist',
                password: 'any',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
});
