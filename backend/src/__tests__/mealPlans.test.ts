import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import authRoutes from '../routes/auth';
import mealPlanRoutes from '../routes/mealPlanRoutes';
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
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;
let userId: number;
let mealPlanId: number;
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

    userId = user.id;

    const loginRes = await request(app).post('/api/login').send({
        username: 'testuser',
        password: 'testpassword',
    });

    token = loginRes.body.token;

    const recipe = await Recipe.create({
        name: 'Рецепт для планера',
        instructions: 'готовим',
        cooking_time_id: 1,
        number_of_servings: 2,
    });

    await RecipeUser.create({ user_id: userId, recipe_id: recipe.recipe_id });
    recipeId = recipe.recipe_id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Meal Plan API', () => {
    it('should create a new meal plan', async () => {
        const res = await request(app)
            .post('/api/meal-plans')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'План питания', total_days: 1 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('meal_plan_id');
        mealPlanId = res.body.meal_plan_id;
    });

    it('should get all meal plans', async () => {
        const res = await request(app)
            .get('/api/meal-plans')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get one meal plan by id', async () => {
        const res = await request(app)
            .get(`/api/meal-plans/${mealPlanId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('meal_plan_id', mealPlanId);
    });

    it('should add a day to the meal plan', async () => {
        const res = await request(app)
            .post(`/api/meal-plans/${mealPlanId}/days`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.mealPlan.total_days).toBe(2);
    });

    it('should add a recipe to day 1', async () => {
        const res = await request(app)
            .post(`/api/meal-plans/${mealPlanId}/days/1/recipes`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipe_id: recipeId, meal_type: 1, quantity: 2 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('meal_plan_id', mealPlanId);
        expect(res.body.day).toBe(1);
    });

    it('should update recipe quantity', async () => {
        const res = await request(app)
            .put(`/api/meal-plans/${mealPlanId}/days/1/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 5 });

        expect(res.status).toBe(200);
        expect(res.body.record.quantity).toBe(5);
    });

    it('should delete recipe from day 1', async () => {
        const res = await request(app)
            .delete(`/api/meal-plans/${mealPlanId}/days/1/recipes/${recipeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('should delete day 1 from meal plan', async () => {
        const res = await request(app)
            .delete(`/api/meal-plans/${mealPlanId}/days/1`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.mealPlan.total_days).toBe(1);
    });

    it('should delete the meal plan', async () => {
        const res = await request(app)
            .delete(`/api/meal-plans/${mealPlanId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Планер удалён');
    });
});
