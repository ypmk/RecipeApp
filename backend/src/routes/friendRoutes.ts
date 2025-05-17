import { Router } from 'express';
import Friendship from '../models/Friendship';
import User from '../models/User';
import {Op} from "sequelize";

const router = Router();

// Отправить запрос
router.post('/request', async (req, res) => {
    const { requesterId, receiverIdentifier } = req.body;

    try {
        const receiver = await User.findOne({ where: { identifier: receiverIdentifier } });
        if (!receiver) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return
        }

        const existingPending = await Friendship.findOne({
            where: {
                requesterId,
                receiverId: receiver.id,
                status: 'pending'
            }
        });

        if (existingPending) {
           res.status(400).json({ error: 'Запрос уже отправлен и ожидает подтверждения' });
            return
        }


        const friendship = await Friendship.create({
            requesterId,
            receiverId: receiver.id,
            status: 'pending',
        });

        res.json(friendship);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при отправке запроса' });
    }
});

// Получить входящие и исходящие
router.get('/list/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const incoming = await Friendship.findAll({
            where: { receiverId: userId, status: 'pending' },
            include: [{ model: User, as: 'Requester', attributes: ['username', 'identifier'] }],
        });

        const outgoing = await Friendship.findAll({
            where: { requesterId: userId, status: 'pending' },
            include: [{ model: User, as: 'Receiver', attributes: ['username', 'identifier'] }],
        });

        res.json({ incoming, outgoing });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении запросов' });
    }
});

// Принять запрос
router.post('/accept', async (req, res) => {
    const { friendshipId } = req.body;
    await Friendship.update({ status: 'accepted' }, { where: { id: friendshipId } });
    res.json({ success: true });
});

// Отклонить
router.post('/reject', async (req, res) => {
    const { friendshipId } = req.body;
    await Friendship.update({ status: 'rejected' }, { where: { id: friendshipId } });
    res.json({ success: true });
});


// Получить список принятых друзей
router.get('/accepted/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { requesterId: userId },
                    { receiverId: userId }
                ]
            },
            include: [
                { model: User, as: 'Requester', attributes: ['id', 'username', 'identifier'] },
                { model: User, as: 'Receiver', attributes: ['id', 'username', 'identifier'] }
            ]
        });

        // Преобразуем: всегда показываем "другом" того, кто не текущий пользователь
        const friends = friendships.map(f => {
            const friend = f.requesterId === +userId ? f.Receiver : f.Requester;
            return {
                id: friend?.id,
                username: friend?.username,
                identifier: friend?.identifier,
                friendshipId: f.id,
            };
        });


        res.json(friends);
    } catch (err) {
        console.error('Ошибка при получении друзей:', err);
        res.status(500).json({ error: 'Ошибка при получении друзей' });
    }
});


router.delete('/:friendshipId', async (req, res) => {
    const { friendshipId } = req.params;

    try {
        await Friendship.destroy({ where: { id: friendshipId } });
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка при удалении дружбы:', err);
        res.status(500).json({ error: 'Не удалось удалить друга' });
    }
});


export default router;
