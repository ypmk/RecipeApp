import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import recipeRoutes from '../routes/recipeRoutes';
import sequelize from '../database';
import User from '../models/User';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import '../models';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;

import CookingTime from '../models/CookingTime';

beforeAll(async () => {
    await sequelize.sync({ force: true });


    await CookingTime.bulkCreate([
        { label: "5 минут" },
        { label: "10 минут" },
        { label: "15 минут" },
        { label: "30 минут" },
    ]);

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });

    const loginRes = await request(app).post('/api/login').send({
        username: 'testuser',
        password: 'testpassword',
    });

    token = loginRes.body.token;

    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
        fs.writeFileSync(testImagePath, 'fake image content');
    }
});


afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/recipes', () => {
    it('should create a recipe with image', async () => {
        const testImagePath = path.join(__dirname, 'test-image.jpg');

        const response = await request(app)
            .post('/api/recipes')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Тестовый рецепт')
            .field('instructions', 'Смешать всё и готовить 20 минут')
            .field('cooking_time_id', '1')
            .field('number_of_servings', '2')
            .attach('main_image', testImagePath);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('name', 'Тестовый рецепт');
        expect(response.body).toHaveProperty('main_image');
    });

    it('should return 401 without token', async () => {
        const response = await request(app)
            .post('/api/recipes')
            .field('name', 'Без токена')
            .field('instructions', 'тест');

        expect(response.status).toBe(401);
    });
});
