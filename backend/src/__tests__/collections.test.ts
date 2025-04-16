import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import authRoutes from '../routes/auth';
import collectionRoutes from '../routes/collectionRoutes';
import recipeRoutes from '../routes/recipeRoutes';
import sequelize from '../database';
import '../models';

import User from '../models/User';
import Collection from '../models/Collections';
import Recipe from '../models/Recipe';
import RecipeUser from '../models/RecipeUser';
import CookingTime from '../models/CookingTime';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/recipes', recipeRoutes);

let token: string;
let userId: number;
let recipeId: number;
let collectionId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    await CookingTime.create({ label: '10 мин' });

    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
    });

    userId = user.id;

    const loginRes = await request(app).post('/api/login').send({
        username: 'testuser',
        password: '123456',
    });

    token = loginRes.body.token;

    const recipe = await Recipe.create({
        name: 'Рецепт для коллекции',
        instructions: 'Готовить вкусно',
        cooking_time_id: 1,
        number_of_servings: 2,
    });

    await RecipeUser.create({
        user_id: userId,
        recipe_id: recipe.recipe_id,
    });

    recipeId = recipe.recipe_id;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Collections API', () => {
    it('should create a new collection', async () => {
        const res = await request(app)
            .post('/api/collections')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Любимые блюда',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('name', 'Любимые блюда');
        collectionId = res.body.collection_id;
    });

    it('should get all collections of user', async () => {
        const res = await request(app)
            .get('/api/collections')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should add recipe to collection', async () => {
        const res = await request(app)
            .post(`/api/collections/${recipeId}/collections/${collectionId}`) // ✅ исправлено
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('collection_id', collectionId);
    });



});
