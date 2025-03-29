import { Router, Response } from 'express';
import IngredientUnits from '../models/IngredientUnits';

const router = Router();

router.get('/', async (_, res: Response) => {
    try {
        const units = await IngredientUnits.findAll();
        res.json(units);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при получении единиц измерения' });
    }
});

export default router;
