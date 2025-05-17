import { Router } from 'express';
import User from '../models/User';

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

export default router;
