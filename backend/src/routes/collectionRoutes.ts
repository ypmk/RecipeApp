import {Collections, CollectionsRecipes, CollectionUsers} from "../models";
import {Router} from "express";
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Получение коллекций текущего пользователя с пометкой, добавлен ли в них данный рецепт
router.get('/:recipeId/collections',authenticateJWT, async (req:AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const { recipeId } = req.params;

        // Получаем все коллекции пользователя через связь CollectionUsers
        const userCollections = await CollectionUsers.findAll({ where: { user_id: userId } });
        const collectionIds = userCollections.map(cu => cu.collection_id);

        const collections = await Collections.findAll({ where: { collection_id: collectionIds } });

        // Определяем, в каких коллекциях уже присутствует рецепт
        const recipeCollections = await CollectionsRecipes.findAll({ where: { recipe_id: recipeId } });
        const recipeCollectionIds = recipeCollections.map(rc => rc.collection_id);

        // Формируем итоговый список с флагом hasRecipe
        const result = collections.map(collection => ({
            ...collection.toJSON(),
            hasRecipe: recipeCollectionIds.includes(collection.collection_id)
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении коллекций' });
    }
});



// Добавление рецепта в существующую коллекцию
router.post('/:recipeId/collections/:collectionId',authenticateJWT, async (req:AuthenticatedRequest, res) => {
    try {
        const { recipeId, collectionId } = req.params;

        // Проверка наличия записи, чтобы не добавить дубликат
        const exists = await CollectionsRecipes.findOne({
            where: { recipe_id: recipeId, collection_id: collectionId }
        });
        if (exists) {
            res.status(400).json({ message: 'Рецепт уже добавлен в эту коллекцию' });
            return
        }

        // Создаем связь между рецептом и коллекцией
        const newRecord = await CollectionsRecipes.create({
            recipe_id: +recipeId,
            collection_id: +collectionId
        });
        res.status(201).json(newRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при добавлении рецепта в коллекцию' });
    }
});




// Удаление рецепта из коллекции
router.delete('/:recipeId/collections/:collectionId',authenticateJWT, async (req:AuthenticatedRequest, res) => {
    try {
        const { recipeId, collectionId } = req.params;
        const deleted = await CollectionsRecipes.destroy({
            where: { recipe_id: recipeId, collection_id: collectionId }
        });
        if (deleted) {
            res.json({ message: 'Рецепт удален из коллекции' });
        } else {
            res.status(404).json({ message: 'Рецепт не найден в данной коллекции' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при удалении рецепта из коллекции' });
    }
});




// Отдельный эндпоинт для создания новой коллекции (без добавления рецепта)
router.post('/',authenticateJWT, async (req:AuthenticatedRequest, res) => {
    try {
        const { name } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }


        const newCollection = await Collections.create({ name });

        // Связываем коллекцию с пользователем через таблицу CollectionUsers
        await CollectionUsers.create({
            user_id: userId,
            collection_id: newCollection.collection_id
        });

        res.status(201).json(newCollection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании коллекции' });
    }
});

export default router;