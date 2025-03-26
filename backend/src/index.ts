import express from 'express';
import {json} from 'body-parser';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import cors from 'cors';
import 'dotenv/config'
import dotenv from "dotenv";
import sequelize from "./database";
import { User, Recipe, RecipeUser } from './models';

dotenv.config();

const app = express();

app.use(json());

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173'
}));

// Маршруты авторизации (регистрация/логин)
app.use('/api', authRoutes);
// Маршруты, защищённые авторизацией (например, для админа)
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    sequelize
        .sync({alter: true})
        .then(() => {
            console.log('All models were synchronized successfully.');
        });
});
