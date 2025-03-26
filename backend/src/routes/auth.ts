import {Request, Response, NextFunction, Router} from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const {username, password, role} = req.body;
    let mappedRole: string = role || 'user';
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            role: mappedRole
        });
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Ошибка при регистрации пользователя'});
    }
});

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body as { username: string; password: string };

        const user: User | null  = await User.findOne({
            where: {
                username: username
            }
        });

        if (!user) {
            res.status(401).json({error: 'Неверное имя пользователя или пароль'});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({error: 'Неверное имя пользователя или пароль'});
            return;
        }

        const token = jwt.sign(
            {id: user.id, username: user.username, role: user.role},
            JWT_SECRET,
            {expiresIn: '1h'}
        );
        res.json({token});
    } catch (err) {
        console.error(err);
        throw err;
    }
});

export default router;
