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
import collectionRoutes from "./routes/collectionRoutes";
import CookingTime from "./models/CookingTime";
import cookingTimeRoutes from "./routes/cookingTimeRoutes";

dotenv.config();

const app = express();

app.use(json());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Маршруты авторизации (регистрация/логин)
app.use('/api', authRoutes);
// Маршруты для админа
app.use('/api/admin', adminRoutes);

// Маршруты рецептов
app.use('/api/recipes', recipeRoutes);
app.use('/api/recipes/:recipeId/ingredients', recipeIngredientsRoutes);

// Маршруты ингредиентов
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/ingredient-units', ingredientUnitsRoutes);

// Статическая папка для загрузок
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Маршруты коллекций
app.use('/api/collections', collectionRoutes);

// Маршруты времени приготовления
app.use('/api/cooking-times', cookingTimeRoutes);  // <-- подключение нового маршрута


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


const seedCookingTimes = async () => {
    try {
        const count = await CookingTime.count();
        if (count === 0) {
            const times = [
                { label: "5 минут" },
                { label: "10 минут" },
                { label: "15 минут" },
                { label: "30 минут" },
                { label: "45 минут" },
                { label: "1 час" },
                { label: "более часа" },
            ];
            await CookingTime.bulkCreate(times);
            console.log("Таблица 'Время приготовления' успешно заполнена!");
        } else {
            console.log("В таблице 'Время приготовления' уже есть записи.");
        }
    } catch (err) {
        console.error("Ошибка при заполнении таблицы 'Время приготовления':", err);
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
            await seedCookingTimes();
        })
        .catch(err => {
            console.error('Ошибка синхронизации базы данных:', err);
        });
});




