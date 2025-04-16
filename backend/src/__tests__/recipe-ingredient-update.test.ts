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
import Ingredient from '../models/Ingredient';
import RecipesIngredients from '../models/RecipesIngredients';
import IngredientUnits from '../models/IngredientUnits';
import CookingTime from '../models/CookingTime';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;
let recipeId: number;
let ingredientId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    const unit = await IngredientUnits.create({ name: 'грамм' });
    await CookingTime.create({ label: '15 мин' });

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
        name: 'С ингредиентом',
        instructions: 'step 1',
        cooking_time_id: 1,
        number_of_servings: 2,
    });

    await RecipeUser.create({ user_id: user.id, recipe_id: recipe.recipe_id });
    recipeId = recipe.recipe_id;

    const ingredient = await Ingredient.create({
        name: 'Сахар',
        user_id: user.id,
    });

    ingredientId = ingredient.ingredient_id;

    await RecipesIngredients.create({
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity: 50,
        unit_id: unit.ing_unit_id,
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('PUT /api/recipes/:recipeId/ingredients/:ingredientId', () => {
    it('should update quantity and name of ingredient', async () => {
        const res = await request(app)
            .put(`/api/recipes/${recipeId}/ingredients/${ingredientId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Кокосовый сахар',
                quantity: 100,
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Ingredient updated successfully');
    });
});
