import request from 'supertest';
import express from 'express';
import sequelize from '../database';
import '../models';

import ingredientUnitsRoutes from '../routes/ingredientUnitsRoutes';
import IngredientUnits from '../models/IngredientUnits';

const app = express();
app.use(express.json());
app.use('/api/ingredient-units', ingredientUnitsRoutes);

beforeAll(async () => {
    await sequelize.sync({ force: true });

    await IngredientUnits.bulkCreate([
        { name: 'грамм' },
        { name: 'миллилитр' },
        { name: 'столовая ложка' },
    ]);
});

afterAll(async () => {
    await sequelize.close();
});

describe('Ingredient Units API', () => {
    it('should return all ingredient units', async () => {
        const res = await request(app).get('/api/ingredient-units');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
        expect((res.body as { name: string }[]).map((u) => u.name)).toContain('грамм');
    });
});
