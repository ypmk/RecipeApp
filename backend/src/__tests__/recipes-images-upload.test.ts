import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import authRoutes from '../routes/auth';
import recipeRoutes from '../routes/recipeRoutes';
import sequelize from '../database';
import '../models';

import User from '../models/User';
import Recipe from '../models/Recipe';
import RecipeUser from '../models/RecipeUser';
import CookingTime from '../models/CookingTime';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;
let recipeId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    await CookingTime.create({ label: '10 минут' });

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const user = await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });

    const loginRes = await request(app).post('/api/login').send({
        username: 'testuser',
        password: 'testpassword',
    });
    token = loginRes.body.token;

    const recipe = await Recipe.create({
        name: 'С изображением',
        instructions: 'Инструкция',
        cooking_time_id: 1,
        number_of_servings: 2,
    });

    await RecipeUser.create({ user_id: user.id, recipe_id: recipe.recipe_id });
    recipeId = recipe.recipe_id;


    const imagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, 'fake image content');
    }
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/recipes/:id/images', () => {
    it('should upload image to recipe', async () => {
        const imagePath = path.join(__dirname, 'test-image.jpg');
        const res = await request(app)
            .post(`/api/recipes/${recipeId}/images`)
            .set('Authorization', `Bearer ${token}`)
            .attach('images', imagePath);

        expect(res.status).toBe(201);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('image_path');
    });
});
