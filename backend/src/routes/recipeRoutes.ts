import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import Recipe from '../models/Recipe';
import RecipeUser from '../models/RecipeUser';
import User from '../models/User';
import {Collections, CookingTime, Ingredient, IngredientUnits, RecipesIngredients} from "../models";
import {upload} from "../middleware/upload";
import RecipeImage from "../models/RecipeImage";
import {Op} from "sequelize";

const router = Router();

/**
 * CREATE - POST /api/recipes
 * Создаём рецепт и привязываем к текущему пользователю через RecipeUser
 */
router.post('/', authenticateJWT, upload.single('main_image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { name, instructions, cooking_time_id, number_of_servings } = req.body;

        const imagePath = req.file
            ? req.file.path.replace(/\\/g, '/')
            : null;

        const newRecipe = await Recipe.create({
            name,
            instructions,
            cooking_time_id: cooking_time_id ? parseInt(cooking_time_id, 10) : null,
            number_of_servings: number_of_servings ? parseInt(number_of_servings, 10) : null,
            main_image: imagePath,
        });

        await RecipeUser.create({
            user_id: userId,
            recipe_id: newRecipe.recipe_id,
        });

        res.status(201).json(newRecipe);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});




/**
 * READ - GET /api/recipes
 * Получаем все рецепты, связанные с текущим пользователем
 * Если передан query-параметр search, фильтруем по названию рецепта.
 */
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const search = req.query.search as string | undefined;
        const whereClause: any = {};

        // Если есть параметр поиска, добавляем условие фильтрации
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        const recipes = await Recipe.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    where: { id: userId },
                    through: { attributes: [] },
                },
                {
                    model: Ingredient,
                    as: 'ingredients',
                    through: { attributes: ['quantity'] },
                },
                {   model: Collections,
                    as: 'collections',
                    through: { attributes: [] }
                },
                {
                    model: CookingTime,
                    as: 'cookingTime',
                },
            ],
        });

        const result = recipes.map(recipe => {
            const data = recipe.toJSON();
            data.main_image = data.main_image ? `/${data.main_image}` : '/default.jpg';
            return data;
        });
        res.json(result);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});


/**
 * READ - GET /api/recipes/:id
 * Получить конкретный рецепт (по ID), если он принадлежит текущему пользователю
 */
// GET /api/recipes/:id — получить рецепт с единицами измерения из join‑записи
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recipeId = parseInt(req.params.id, 10);

        // Получаем рецепт с ингредиентами.
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [
                {
                    model: User,
                    where: { id: userId },
                    through: { attributes: [] },
                },
                {
                    model: Ingredient,
                    as: 'ingredients',
                    through: { attributes: ['quantity', 'unit_id'] },
                },
                {
                    model: RecipeImage,
                    as: 'images',
                },
                {
                    model: CookingTime,
                    as: 'cookingTime',
                },
            ],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return;
        }

        // Преобразуем данные рецепта в объект
        const data: any = recipe.toJSON();

        // Собираем все unit_id из записей join (RecipesIngredients)
        const unitIdsSet = new Set<number>();
        data.ingredients.forEach((ing: any) => {
            const joinData = ing.RecipesIngredients;
            if (joinData && joinData.unit_id) {
                unitIdsSet.add(joinData.unit_id);
            }
        });
        const unitIds = Array.from(unitIdsSet);

        // Запрашиваем информацию об единицах измерения из IngredientUnits
        const units = await IngredientUnits.findAll({
            where: { ing_unit_id: unitIds },
            attributes: ['ing_unit_id', 'name'],
        });
        const unitMap: Record<number, string> = {};
        units.forEach((unit: any) => {
            unitMap[unit.ing_unit_id] = unit.name;
        });

        // Для каждого ингредиента «пришиваем» значение unitName, взятое из join‑записи через unit_id
        data.ingredients = data.ingredients.map((ing: any) => {
            if (ing.RecipesIngredients && ing.RecipesIngredients.unit_id) {
                ing.RecipesIngredients.unitName = unitMap[ing.RecipesIngredients.unit_id] || '';
            }
            return ing;
        });

        data.main_image = data.main_image ? `/${data.main_image}` : '/default.jpg';
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});








/**
 * UPDATE - PUT /api/recipes/:id
 * Обновить рецепт, если он принадлежит текущему пользователю
 */
router.put('/:id', authenticateJWT, upload.single('main_image'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recipeId = parseInt(req.params.id, 10);
        // Добавляем извлечение нового поля cooking_time_id
        const { name, instructions, time_cooking, number_of_servings, cooking_time_id } = req.body;

        // Проверяем, что рецепт принадлежит пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{
                model: User,
                where: { id: userId },
                through: { attributes: [] },
            }],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return;
        }

        // Обновляем поля рецепта
        if (name !== undefined) recipe.name = name;
        if (instructions !== undefined) recipe.instructions = instructions;
        if (time_cooking !== undefined) recipe.time_cooking = time_cooking;
        if (number_of_servings !== undefined) recipe.number_of_servings = number_of_servings;
        // Новый параметр: обновляем cooking_time_id, если он передан
        if (cooking_time_id !== undefined) {
            recipe.cooking_time_id = cooking_time_id ? parseInt(cooking_time_id, 10) : null;
        }

        // Если передан новый файл главного изображения, обновляем его
        if (req.file) {
            const imagePath = req.file.path.replace(/\\/g, '/');
            recipe.main_image = imagePath;
        }

        await recipe.save();

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




/**
 * DELETE - DELETE /api/recipes/:id
 * Удалить рецепт, если он принадлежит пользователю
 */
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const recipeId = parseInt(req.params.id, 10);

        // Проверяем, что рецепт связан с пользователем
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [
                {
                    model: User,
                    where: { id: userId },
                    through: { attributes: [] },
                },
            ],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return
        }


        await recipe.destroy();

        res.json({ message: 'Recipe deleted' });
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});




/**
 * POST /api/recipes/:id/images
 * Загружает дополнительные изображения для рецепта.
 */
router.post('/:id/images', authenticateJWT, upload.array('images', 5), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recipeId = parseInt(req.params.id, 10);

        // Проверяем, что рецепт существует и принадлежит пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{ model: User, where: { id: userId }, through: { attributes: [] } }],
        });
        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return;
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(400).json({ message: 'No images provided' });
            return;
        }

        const savedImages = await Promise.all(files.map(file => {
            const normalizedPath = file.path.replace(/\\/g, '/');
            return RecipeImage.create({
                recipe_id: recipeId,
                image_path: normalizedPath,
            });
        }));

        res.status(201).json(savedImages);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});



/**
 * GET /api/recipes/:id/images
 * Получает все дополнительные изображения для рецепта.
 */
router.get('/:id/images', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recipeId = parseInt(req.params.id, 10);

        // Проверяем, что рецепт существует и принадлежит пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{
                model: User,
                where: { id: userId },
                through: { attributes: [] },
            }],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return;
        }

        // Получаем все изображения для рецепта
        const images = await RecipeImage.findAll({
            where: { recipe_id: recipeId },
            order: [['createdAt', 'ASC']],
        });

        // Преобразуем путь к изображению, добавляя ведущий слэш (если его нет)
        const transformedImages = images.map(image => {
            const data = image.toJSON();
            data.image_path = data.image_path.startsWith('/') ? data.image_path : `/${data.image_path}`;
            return data;
        });

        res.json(transformedImages);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});


/**
 * DELETE /api/recipes/:recipeId/images/:imageId
 * Удалить одно дополнительное изображение рецепта, если пользователь владеет рецептом
 */
router.delete('/:recipeId/images/:imageId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
           res.status(401).json({ message: 'Unauthorized' });
           return
        }

        const recipeId = parseInt(req.params.recipeId, 10);
        const imageId = parseInt(req.params.imageId, 10);

        // Проверяем, что рецепт существует и принадлежит пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{
                model: User,
                where: { id: userId },
                through: { attributes: [] },
            }],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return
        }

        // Проверяем, что изображение принадлежит этому рецепту
        const image = await RecipeImage.findOne({
            where: { id: imageId, recipe_id: recipeId },
        });

        if (!image) {
            res.status(404).json({ message: 'Image not found or not owned by user' });
            return
        }

        await image.destroy();

        res.json({ message: 'Image deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



/**
 * PUT /api/recipes/:recipeId/ingredients/:ingredientId
 * Обновляет ингредиент в рецепте: имя, единицу измерения и количество.
 */
// PUT /api/recipes/:recipeId/ingredients/:ingredientId
router.put('/:recipeId/ingredients/:ingredientId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const recipeId = parseInt(req.params.recipeId, 10);
        const ingredientId = parseInt(req.params.ingredientId, 10);
        const { name, unit_id, quantity } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Проверка принадлежности рецепта пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{
                model: User,
                where: { id: userId },
                through: { attributes: [] },
            }],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return;
        }

        // Обновляем количество в связующей таблице
        const link = await RecipesIngredients.findOne({
            where: { recipe_id: recipeId, ingredient_id: ingredientId },
        });

        if (!link) {
            res.status(404).json({ message: 'Ingredient link not found for this recipe' });
            return;
        }

        if (quantity !== undefined) {
            link.quantity = quantity;
            // НО: здесь нужно также обновить unit_id в этой же записи, если приходит новый unit_id
            if (unit_id !== undefined) {
                link.unit_id = unit_id;
            }
            await link.save();
        }

        // Обновляем сам ингредиент — только название, но не единицу измерения
        const ingredient = await Ingredient.findOne({ where: { ingredient_id: ingredientId, user_id: userId } });

        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found or not owned by user' });
            return;
        }

        if (name !== undefined) {
            ingredient.name = name;
        }
        // НЕ ОБНОВЛЯЕМ ingredient.unit_id, чтобы единица измерения для этого рецепта не менялась для всех рецептов

        await ingredient.save();

        res.json({ message: 'Ingredient updated successfully' });
        return;
    } catch (error) {
        console.error('Ошибка при обновлении ингредиента:', error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});



/**
 * DELETE /api/recipes/:recipeId/ingredients/:ingredientId
 * Удаляет связь ингредиента с рецептом (и опционально сам ингредиент, если хочешь).
 */
router.delete('/:recipeId/ingredients/:ingredientId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        const recipeId = parseInt(req.params.recipeId, 10);
        const ingredientId = parseInt(req.params.ingredientId, 10);

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        // Проверяем, что рецепт принадлежит пользователю
        const recipe = await Recipe.findOne({
            where: { recipe_id: recipeId },
            include: [{
                model: User,
                where: { id: userId },
                through: { attributes: [] },
            }],
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found or not owned by user' });
            return
        }

        // Удаляем связь из таблицы recipes_ingredients
        const deleted = await RecipesIngredients.destroy({
            where: {
                recipe_id: recipeId,
                ingredient_id: ingredientId,
            },
        });

        if (!deleted) {
            res.status(404).json({ message: 'Ingredient not linked to recipe' });
            return
        }

        res.json({ message: 'Ingredient removed from recipe' });
        return
    } catch (error) {
        console.error('Ошибка при удалении ингредиента из рецепта:', error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});



export default router;