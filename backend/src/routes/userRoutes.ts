import { Router } from 'express';
import User from '../models/User';
import {AuthenticatedRequest, authenticateJWT} from "../middleware/auth";

const router = Router();

// Поиск пользователя по identifier
router.get('/by-identifier/:identifier', async (req, res) => {
    const { identifier } = req.params;

    try {
        const user = await User.findOne({
            where: { identifier },
            attributes: ['id', 'username'],
        });

        if (!user) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return
        }

        res.json(user);
    } catch (err) {
        console.error('Ошибка при поиске пользователя по identifier:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'role', 'identifier'],
        });

        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default router;
