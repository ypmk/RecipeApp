import { Router, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import Ingredient from '../models/Ingredient';
import RecipesIngredients from '../models/RecipesIngredients';

const router = Router({ mergeParams: true });

/**
 * POST /api/recipes/:recipeId/ingredients
 * Добавляет ингредиент к рецепту.
 * Если ингредиент с таким именем уже существует у пользователя, он не создаётся заново.
 * При создании записи в join‑таблице сохраняется единица измерения (unit_id) как указано в запросе.
 */
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recipeId = parseInt(req.params.recipeId, 10);
        const { name, unit_id, quantity } = req.body;

        if (!name || !unit_id || quantity == null) {
            res.status(400).json({ message: 'Missing ingredient name, unit_id or quantity' });
            return;
        }

        // Проверяем, существует ли уже ингредиент с таким именем для данного пользователя.
        // Заметим – единица измерения здесь может использоваться как дефолт, но для рецепта будет своя.
        let ingredient = await Ingredient.findOne({
            where: { name, user_id: userId },
        });

        if (!ingredient) {
            // Создаем новый мастер-ингредиент с дефолтной единицей.
            ingredient = await Ingredient.create({
                name,
                user_id: userId,
            });
        }

        // Проверяем, не добавлен ли уже этот ингредиент к данному рецепту.
        const existingRecipeIngredient = await RecipesIngredients.findOne({
            where: { recipe_id: recipeId, ingredient_id: ingredient.ingredient_id },
        });

        if (existingRecipeIngredient) {
            res.status(409).json({
                message: 'Ingredient already added to this recipe',
                recipeIngredient: existingRecipeIngredient,
            });
            return;
        }

        // При создании связи используем unit_id, полученный из запроса – это та единица, которую выбрал пользователь для данного рецепта.
        const recipeIngredient = await RecipesIngredients.create({
            recipe_id: recipeId,
            ingredient_id: ingredient.ingredient_id,
            quantity,
            unit_id,
        });

        res.status(201).json({
            message: 'Ingredient added to recipe',
            recipeIngredient,
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});


/**
 * PUT /api/recipes/:recipeId/ingredients/:ingredientId
 * Обновляет количество и единицу измерения существующего ингредиента в рецепте.
 */
router.put('/:ingredientId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }

        const recipeId = parseInt(req.params.recipeId, 10);
        const ingredientId = parseInt(req.params.ingredientId, 10);
        const { quantity, unit_id } = req.body;

        if (quantity == null || !unit_id) {
            res.status(400).json({ message: 'Missing quantity or unit_id' });
            return
        }

        const recipeIngredient = await RecipesIngredients.findOne({
            where: { recipe_id: recipeId, ingredient_id: ingredientId },
        });

        if (!recipeIngredient) {
            res.status(404).json({ message: 'Ingredient not found in recipe' });
            return
        }

        recipeIngredient.quantity = quantity;
        recipeIngredient.unit_id = unit_id;
        await recipeIngredient.save();

        res.status(200).json({
            message: 'Ingredient updated successfully',
            recipeIngredient,
        });
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return
    }
});



export default router;
