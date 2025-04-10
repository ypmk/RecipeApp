import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import CookingTime from '../models/CookingTime';

const router = Router();

// Эндпоинт для получения всех вариантов времени приготовления
// URL: GET /api/cooking-timesы
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const times = await CookingTime.findAll();
        res.json(times);
    } catch (error) {
        console.error("Ошибка при получении вариантов времени:", error);
        res.status(500).json({ message: 'Ошибка при получении вариантов времени' });
    }
});

export default router;
