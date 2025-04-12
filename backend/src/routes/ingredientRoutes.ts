import express, { Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import Ingredient from '../models/Ingredient';
import IngredientUnits from '../models/IngredientUnits';
import {Op} from "sequelize";

const router = express.Router();


// POST /api/ingredients
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing name or unit_id' });
            return
        }

        // Проверка: есть ли уже такой ингредиент у пользователя
        const existing = await Ingredient.findOne({
            where: { name, user_id: userId },
        });

        if (existing) {
            res.status(200).json({ message: 'Ingredient already exists', ingredient: existing });
            return
        }



        const newIngredient = await Ingredient.create({
            name,
            user_id: userId,
        });

        res.status(201).json(newIngredient);
        return
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
        return
    }
});



// routes/ingredientRoutes.ts
router.get('/search', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const query = req.query.q as string;

    if (!userId || !query) {
        res.status(400).json({ message: 'Missing user or query' });
        return
    }

    try {
        const matches = await Ingredient.findAll({
            where: {
                user_id: userId,
                name: {
                    [Op.iLike]: `%${query}%`, // поиск по подстроке, нечувствительный к регистру
                },
            },
            limit: 10,
        });

        res.json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при поиске ингредиентов' });
    }
});






export default router;
