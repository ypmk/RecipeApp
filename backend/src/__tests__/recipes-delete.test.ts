import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
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
    await CookingTime.create({ label: '5 мин' });

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
        name: 'Удаляемый рецепт',
        instructions: 'test',
        cooking_time_id: 1,
        number_of_servings: 1,
    });

    await RecipeUser.create({ user_id: user.id, recipe_id: recipe.recipe_id });
    recipeId = recipe.recipe_id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('DELETE /api/recipes/:id', () => {
    it('should delete recipe', async () => {
        const res = await request(app)
            .delete(`/api/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Recipe deleted');
    });
});
