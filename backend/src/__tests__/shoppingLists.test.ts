import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import sequelize from '../database';
import '../models';

import authRoutes from '../routes/auth';
import recipeRoutes from '../routes/recipeRoutes';
import mealPlanRoutes from '../routes/mealPlanRoutes';
import shoppingListRoutes from '../routes/shoppingListRoutes';

import User from '../models/User';
import Recipe from '../models/Recipe';
import RecipeUser from '../models/RecipeUser';
import CookingTime from '../models/CookingTime';
import Ingredient from '../models/Ingredient';
import RecipesIngredients from '../models/RecipesIngredients';
import IngredientUnits from '../models/IngredientUnits';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);

let token: string;
let userId: number;
let shoppingListId: number;
let itemId: number;
let recipeId: number;
let mealPlanId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    const unit = await IngredientUnits.create({ name: 'гр' });

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const createdUser = await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });

    userId = createdUser.id;

    const ingredient = await Ingredient.create({
        name: 'Мука',
        user_id: userId,
    });

    await CookingTime.create({ label: '10 минут' });

    const login = await request(app).post('/api/login').send({
        username: 'testuser',
        password: 'testpassword',
    });
    token = login.body.token;

    const recipe = await Recipe.create({
        name: 'Рецепт для списка',
        instructions: 'готовить так',
        cooking_time_id: 1,
        number_of_servings: 1,
    });
    recipeId = recipe.recipe_id;

    await RecipeUser.create({ user_id: userId, recipe_id: recipeId });

    await RecipesIngredients.create({
        recipe_id: recipeId,
        ingredient_id: ingredient.ingredient_id,
        quantity: 500,
        unit_id: unit.ing_unit_id,
    });

    const plan = await request(app)
        .post('/api/meal-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'План', total_days: 1 });
    mealPlanId = plan.body.meal_plan_id;

    await request(app)
        .post(`/api/meal-plans/${mealPlanId}/days`)
        .set('Authorization', `Bearer ${token}`);

    await request(app)
        .post(`/api/meal-plans/${mealPlanId}/days/1/recipes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe_id: recipeId, meal_type: 1, quantity: 2 });
});


afterAll(async () => {
    await sequelize.close();
});

describe('Shopping Lists API', () => {
    it('should create shopping list from meal plan', async () => {
        const res = await request(app)
            .post(`/api/shopping-lists/${mealPlanId}/shopping-list`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(201);
        shoppingListId = res.body.shoppingList.shopping_list_id;
    });

    it('should get all shopping lists', async () => {
        const res = await request(app)
            .get('/api/shopping-lists')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get shopping list by id', async () => {
        const res = await request(app)
            .get(`/api/shopping-lists/${shoppingListId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('shopping_list_id', shoppingListId);

        itemId = res.body.ShoppingItems[0].shopping_item_id;
    });

    it('should rename the shopping list', async () => {
        const res = await request(app)
            .put(`/api/shopping-lists/${shoppingListId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Мой список' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Мой список');
    });

    it('should mark item as bought', async () => {
        const res = await request(app)
            .put(`/api/shopping-lists/${shoppingListId}/items/${itemId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ bought: true });
        expect(res.status).toBe(200);
        expect(res.body.bought).toBe(true);
    });

    it('should delete shopping list', async () => {
        const res = await request(app)
            .delete(`/api/shopping-lists/${shoppingListId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Список покупок удалён');
    });
});
