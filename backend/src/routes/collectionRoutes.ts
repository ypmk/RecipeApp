import {Collections, CollectionsRecipes, CollectionUsers, Recipe} from "../models";
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
router.post('/:recipeId/collections/:collectionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const { recipeId, collectionId } = req.params;

        // Проверка наличия записи, чтобы не добавить дубликат
        const exists = await CollectionsRecipes.findOne({
            where: { recipe_id: recipeId, collection_id: collectionId }
        });
        if (exists) {
            res.status(400).json({ message: 'Рецепт уже добавлен в эту коллекцию' });
            return;
        }

        // Создаем связь между рецептом и коллекцией
        const newRecord = await CollectionsRecipes.create({
            recipe_id: +recipeId,
            collection_id: +collectionId
        });

        // Обновляем коллекцию, чтобы поле updatedAt было обновлено
        await Collections.update(
            { updatedAt: new Date() },
            { where: { collection_id: +collectionId } }
        );

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


//Получить все коллекции пользователя
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const userCollectionLinks = await CollectionUsers.findAll({
            where: { user_id: userId },
        });
        const collectionIds = userCollectionLinks.map((c) => c.collection_id);

        const collections = await Collections.findAll({
            where: { collection_id: collectionIds },
        });

        // Для каждой коллекции находим последнее изображение рецепта
        const collectionsWithExtraData = await Promise.all(
            collections.map(async (collection) => {
                const recipeLinks = await CollectionsRecipes.findAll({
                    where: { collection_id: collection.collection_id },
                    include: [{
                        model: Recipe,
                        as: 'recipe',
                        attributes: ['main_image'],
                        required: true
                    }],
                    order: [['createdAt', 'DESC']],
                }) as (CollectionsRecipes & { recipe?: { main_image: string | null } })[];

                const lastRecipeWithImage = recipeLinks.find(link => link.recipe?.main_image);

                const lastRecipeImage = lastRecipeWithImage?.recipe?.main_image
                    ? `/${lastRecipeWithImage.recipe.main_image}`
                    : '/default.jpg';


                return {
                    ...collection.toJSON(),
                    lastRecipeImage,
                    recipesCount: recipeLinks.length,
                };
            })
        );


        res.json(collectionsWithExtraData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении коллекций' });
    }
});


// Эндпоинт для получения рецептов конкретной коллекции
// URL: GET /api/collections/:collectionId/recipes
router.get('/:collectionId/recipes', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const { collectionId } = req.params;
        // Находим коллекцию и включаем связанные рецепты.
        const collection = await Collections.findByPk(collectionId, {
            include: [
                {
                    model: Recipe,
                    as: 'recipes',
                },
            ],
        });
        if (!collection) {
            res.status(404).json({ message: 'Коллекция не найдена' });
            return
        }
        const { recipes } = collection as Collections & { recipes: any[] };
        res.json(recipes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении рецептов коллекции' });
    }
});


// Удаление коллекции
router.delete('/:collectionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { collectionId } = req.params;

        // Проверка, что коллекция принадлежит пользователю
        const link = await CollectionUsers.findOne({
            where: { user_id: userId, collection_id: collectionId },
        });

        if (!link) {
            res.status(403).json({ message: 'Нет доступа к удалению этой коллекции' });
            return
        }


        await CollectionsRecipes.destroy({ where: { collection_id: collectionId } });
        await CollectionUsers.destroy({ where: { collection_id: collectionId } });

        await Collections.destroy({ where: { collection_id: collectionId } });

        res.json({ message: 'Коллекция удалена' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при удалении коллекции' });
    }
});


// Обновление названия коллекции
router.put('/:collectionId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const { collectionId } = req.params;
        const { name } = req.body;

        const link = await CollectionUsers.findOne({
            where: { user_id: userId, collection_id: collectionId },
        });

        if (!link) {
            res.status(403).json({ message: 'Нет доступа к изменению этой коллекции' });
            return
        }

        await Collections.update(
            { name },
            { where: { collection_id: collectionId } }
        );

        res.json({ message: 'Название коллекции обновлено' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при обновлении коллекции' });
    }
});





export default router;