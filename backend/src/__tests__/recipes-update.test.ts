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
import CookingTime from '../models/CookingTime';
import Recipe from '../models/Recipe';
import RecipeUser from '../models/RecipeUser';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;
let recipeId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    await CookingTime.bulkCreate([
        { label: '5 минут' },
        { label: '10 минут' },
    ]);

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
        name: 'Старый рецепт',
        instructions: 'Просто смешай',
        cooking_time_id: 1,
        number_of_servings: 1,
    });

    await RecipeUser.create({
        user_id: user.id,
        recipe_id: recipe.recipe_id,
    });

    recipeId = recipe.recipe_id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('PUT /api/recipes/:id', () => {
    it('should update the recipe', async () => {
        const res = await request(app)
            .put(`/api/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Новый рецепт',
                instructions: 'Обновлённые шаги',
                number_of_servings: 4,
                cooking_time_id: 2,
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('name', 'Новый рецепт');
        expect(res.body).toHaveProperty('number_of_servings', 4);
    });

    it('should return 401 if no token provided', async () => {
        const res = await request(app)
            .put(`/api/recipes/${recipeId}`)
            .send({ name: 'Попытка без токена' });

        expect(res.status).toBe(401);
    });
});
