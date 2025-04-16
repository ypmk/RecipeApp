import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
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
        name: 'Просматриваемый рецепт',
        instructions: 'Подробные шаги',
        cooking_time_id: 2,
        number_of_servings: 3,
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

describe('GET /api/recipes/:id', () => {
    it('should return recipe if user owns it', async () => {
        const res = await request(app)
            .get(`/api/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('name', 'Просматриваемый рецепт');
        expect(res.body).toHaveProperty('number_of_servings', 3);
        expect(res.body).toHaveProperty('main_image');
    });

    it('should return 401 without token', async () => {
        const res = await request(app).get(`/api/recipes/${recipeId}`);
        expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent recipe', async () => {
        const res = await request(app)
            .get(`/api/recipes/99999`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });
});
