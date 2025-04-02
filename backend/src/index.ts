import express from 'express';
import {json} from 'body-parser';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import cors from 'cors';
import 'dotenv/config'
import dotenv from "dotenv";
import sequelize from "./database";
import recipeRoutes from './routes/recipeRoutes';
import './models';
import IngredientUnits from "./models/IngredientUnits";
import ingredientRoutes from "./routes/ingredientRoutes";
import recipeIngredientsRoutes from './routes/recipeIngredients';
import ingredientUnitsRoutes from "./routes/ingredientUnitsRoutes";
import path from "path";


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

app.use('/api/recipes', recipeRoutes);
app.use('/api/recipes/:recipeId/ingredients', recipeIngredientsRoutes);

app.use('/api/ingredients', ingredientRoutes);

app.use('/api/ingredient-units', ingredientUnitsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const seedIngredientUnits = async () => {
    const existing = await IngredientUnits.count();
    if (existing === 0) {
        const units = ['шт', 'ст', 'ч.л', 'ст.л', 'гр', 'кг', 'мл', 'л'];
        await IngredientUnits.bulkCreate(units.map(name => ({ name })));
        console.log('Единицы измерения успешно добавлены');
    } else {
        console.log('Единицы измерения уже существуют');
    }
};





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    sequelize
        .sync({alter: true})
        .then(async () => {
            console.log('Все модели синхронизированы успешно');
            await seedIngredientUnits();
        })
        .catch(err => {
            console.error('Ошибка синхронизации базы данных:', err);
        });
});




