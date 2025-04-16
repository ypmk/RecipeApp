import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import sequelize from '../database';
import '../models';

import authRoutes from '../routes/auth';
import ingredientRoutes from '../routes/ingredientRoutes';

import User from '../models/User';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/ingredients', ingredientRoutes);

let token: string;
let userId: number;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await User.create({
        username: 'ingredientUser',
        password: hashedPassword,
        role: 'user',
    });

    userId = user.id;

    const loginRes = await request(app).post('/api/login').send({
        username: 'ingredientUser',
        password: '123456',
    });

    token = loginRes.body.token;
});

afterAll(async () => {
    await sequelize.close();
});

describe('Ingredients API', () => {
    it('should create a new ingredient', async () => {
        const res = await request(app)
            .post('/api/ingredients')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Чеснок' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('ingredient_id');
        expect(res.body.name).toBe('Чеснок');
    });

    it('should return existing ingredient if duplicate name', async () => {
        const res = await request(app)
            .post('/api/ingredients')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Чеснок' });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Ingredient already exists');
        expect(res.body.ingredient.name).toBe('Чеснок');
    });

    it('should search for ingredients by name substring', async () => {
        const res = await request(app)
            .get('/api/ingredients/search?q=чес')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name.toLowerCase()).toContain('чес');
    });

    it('should return 400 if no query provided', async () => {
        const res = await request(app)
            .get('/api/ingredients/search')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Missing user or query');
    });
});
