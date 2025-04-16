import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import recipeRoutes from '../routes/recipeRoutes';
import sequelize from '../database';
import User from '../models/User';
import bcrypt from 'bcrypt';
import '../models';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });

    const response = await request(app).post('/api/login').send({
        username: 'testuser',
        password: 'testpassword',
    });

    token = response.body.token;
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /api/recipes (protected route)', () => {
    it('should return 200 with empty array if user has no recipes', async () => {
        const response = await request(app)
            .get('/api/recipes')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 if token is missing', async () => {
        const response = await request(app).get('/api/recipes');
        expect(response.status).toBe(401);
    });

    it('should return 403 if token is invalid', async () => {
        const response = await request(app)
            .get('/api/recipes')
            .set('Authorization', 'Bearer invalidtoken');
        expect(response.status).toBe(403);
    });
});
