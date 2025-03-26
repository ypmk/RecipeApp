import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import Recipe from '../models/Recipe';      // или './Recipes' — в зависимости от названия
import RecipeUser from '../models/RecipeUser';
import User from '../models/User';


const router = Router();

/**
 * CREATE - POST /api/recipes
 * Создаём рецепт и привязываем к текущему пользователю через RecipeUser
 */
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id; // ID авторизованного пользователя из токена
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const { name, instructions, time_cooking, number_of_servings } = req.body;

        // 1) Создаём сам рецепт в таблице recipes
        const newRecipe = await Recipe.create({
            name,
            instructions,
            time_cooking,
            number_of_servings,
        });

        // 2) Создаём запись в recipe_user, чтобы «привязать» рецепт к пользователю
        await RecipeUser.create({
            user_id: userId,
            recipe_id: newRecipe.recipe_id, // или newRecipe.id, если поле так называется
        });

        res.status(201).json(newRecipe);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});

/**
 * READ - GET /api/recipes
 * Получаем все рецепты, связанные с текущим пользователем
 */
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        // Ищем все рецепты, связанные с пользователем userId
        const recipes = await Recipe.findAll({
            include: [
                {
                    model: User,
                    where: { id: userId },
                    through: { attributes: [] }, // скрыть поля промежуточной таблицы из ответа
                },
            ],
        });

        res.json(recipes);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});



/**
 * READ - GET /api/recipes/:id
 * Получить конкретный рецепт (по ID), если он принадлежит текущему пользователю
 */
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const recipeId = parseInt(req.params.id, 10);

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

        res.json(recipe);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});



/**
 * UPDATE - PUT /api/recipes/:id
 * Обновить рецепт, если он принадлежит текущему пользователю
 */
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const recipeId = parseInt(req.params.id, 10);
        const { name, instructions, time_cooking, number_of_servings } = req.body;

        // Проверяем, что рецепт принадлежит пользователю
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

        // Обновляем нужные поля
        if (name !== undefined) recipe.name = name;
        if (instructions !== undefined) recipe.instructions = instructions;
        if (time_cooking !== undefined) recipe.time_cooking = time_cooking;
        if (number_of_servings !== undefined) recipe.number_of_servings = number_of_servings;

        await recipe.save();

        res.json(recipe);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
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



export default router;