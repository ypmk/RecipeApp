import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const mappedRole = role || 'user';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: mappedRole,
        });
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }
});

// Авторизация пользователя (login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
            return
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
            return
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,         // true только на https
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ token: accessToken });
    } catch (err) {
        console.error('Ошибка при логине', err);
        res.status(500).json({ error: 'Ошибка сервера при авторизации' });
    }
});

// Обновление access-токена по refresh-токену
router.post('/refresh-token', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(401).json({ error: 'Refresh token отсутствует' });
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        const user = await User.findByPk(decoded.id);
        if (!user) {
            res.status(401).json({ error: 'Пользователь не найден' });
            return
        }

        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token: newAccessToken });
    } catch (err) {
        console.error('Ошибка при проверке refresh токена', err);
        res.status(403).json({ error: 'Недействительный refresh token' });
    }
});

// Выход (logout)
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false, //  true в продакшене
        sameSite: 'lax',
    });
    res.status(200).json({ message: 'Вы вышли из системы' });
});

export default router;
