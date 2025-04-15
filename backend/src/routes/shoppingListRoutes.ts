import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import MealPlans from '../models/MealPlans';
import MealPlanRecipes from '../models/MealPlanRecipes';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import ShoppingLists from '../models/ShoppingLists';
import ShoppingItems from '../models/ShoppingItems';
import IngredientUnits from '../models/IngredientUnits';

const router = Router();

const unitConversionMapping: Record<string, { baseUnit: string; factor: number }> = {
    "ст.л.": { baseUnit: "мл", factor: 15 },
    "ч.л.": { baseUnit: "мл", factor: 5 },
    "ст":   { baseUnit: "мл", factor: 250 },
    "мл":   { baseUnit: "мл", factor: 1 },
    "л":    { baseUnit: "мл", factor: 1000 },
    "гр":   { baseUnit: "гр", factor: 1 },
    "кг":   { baseUnit: "гр", factor: 1000 },
    "шт":   { baseUnit: "шт", factor: 1 },
};

function convertToBase(quantity: number, unitName: string): { quantity: number; baseUnit: string } {
    const conv = unitConversionMapping[unitName];
    if (conv) {
        return { quantity: quantity * conv.factor, baseUnit: conv.baseUnit };
    }
    return { quantity, baseUnit: unitName };
}

function formatQuantity(quantity: number, baseUnit: string): { quantity: number; unit: string } {
    if (baseUnit === "гр" && quantity >= 1000) {
        return { quantity: quantity / 1000, unit: "кг" };
    }
    if (baseUnit === "мл" && quantity >= 1000) {
        return { quantity: quantity / 1000, unit: "л" };
    }
    return { quantity, unit: baseUnit };
}

router.post('/:mealPlanId/shopping-list', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { mealPlanId } = req.params;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const mealPlan = await MealPlans.findOne({
            where: { meal_plan_id: mealPlanId, user_id: userId }
        });
        if (!mealPlan) {
            res.status(404).json({ message: 'План питания не найден' });
            return;
        }

        const planRecipes = await MealPlanRecipes.findAll({ where: { meal_plan_id: mealPlanId } });
        if (planRecipes.length === 0) {
            res.status(400).json({ message: 'В плане питания отсутствуют рецепты' });
            return;
        }

        // Приводим recipe_id к числу и создаем карту множителей
        const recipeMultipliers = new Map<number, number>();
        planRecipes.forEach(pr => {
            const rId = Number(pr.recipe_id);
            const multiplier = Number(pr.quantity) || 1;
            const prev = recipeMultipliers.get(rId) || 0;
            recipeMultipliers.set(rId, prev + multiplier);
        });

        const recipeIds = planRecipes.map(pr => Number(pr.recipe_id));

        // Загружаем рецепты с ингредиентами. Включаем через join только поля 'quantity' и 'unit_id'
        const recipes = await Recipe.findAll({
            where: { recipe_id: recipeIds },
            include: [{
                model: Ingredient,
                as: 'ingredients',
                // Убираем include для IngredientUnits, теперь берем unit_id через join
                through: { attributes: ['quantity', 'unit_id'] },
            }]
        });

        // Собираем все unit_id из join-записей
        const unitIdsSet = new Set<number>();
        recipes.forEach(recipe => {
            const recipeData: any = recipe.toJSON();
            if (Array.isArray(recipeData.ingredients)) {
                recipeData.ingredients.forEach((ing: any) => {
                    if (ing.RecipesIngredients && ing.RecipesIngredients.unit_id) {
                        unitIdsSet.add(Number(ing.RecipesIngredients.unit_id));
                    }
                });
            }
        });
        const unitIds = Array.from(unitIdsSet);

        // Запрашиваем данные об единицах измерения из IngredientUnits
        const units = await IngredientUnits.findAll({
            where: { ing_unit_id: unitIds },
            attributes: ['ing_unit_id', 'name'],
        });
        const unitMap: Record<number, string> = {};
        units.forEach((unit: any) => {
            unitMap[unit.ing_unit_id] = unit.name;
        });

        // Агрегируем ингредиенты
        const aggregated = new Map<number, { ingredient_id: number; name: string; quantity: number; baseUnit: string }>();
        recipes.forEach(recipe => {
            const recipeData: any = recipe.toJSON();
            const recipeId = Number(recipeData.recipe_id);
            const multiplier = recipeMultipliers.get(recipeId) || 1;

            if (Array.isArray(recipeData.ingredients)) {
                recipeData.ingredients.forEach((ing: any) => {
                    const ingredientId = Number(ing.ingredient_id);
                    const origQuantity = Number(ing.RecipesIngredients.quantity) || 0;
                    const totalQuantity = origQuantity * multiplier;

                    const unitId = ing.RecipesIngredients.unit_id;
                    if (!unitId) {
                        throw new Error(`Не найдена единица измерения у ингредиента id=${ingredientId}`);
                    }
                    const unitName = unitMap[Number(unitId)];
                    if (!unitName) {
                        throw new Error(`Не найдено название единицы измерения для unit_id=${unitId}`);
                    }

                    const { quantity: baseQty, baseUnit } = convertToBase(totalQuantity, unitName);

                    if (aggregated.has(ingredientId)) {
                        const existing = aggregated.get(ingredientId)!;
                        if (existing.baseUnit !== baseUnit) {
                            throw new Error(`Несоответствие единиц измерения для ингредиента ${ingredientId}`);
                        }
                        existing.quantity += baseQty;
                    } else {
                        aggregated.set(ingredientId, {
                            ingredient_id: ingredientId,
                            name: ing.name,
                            quantity: baseQty,
                            baseUnit
                        });
                    }
                });
            }
        });

        const shoppingList = await ShoppingLists.create({
            user_id: userId,
            name: `Список покупок для плана "${mealPlan.name}"`
        });

        const itemsToCreate: Array<{ shopping_list_id: number, ingredient_id: number, quantity: number, unit: string }> = [];
        aggregated.forEach(agg => {
            const { quantity, baseUnit } = agg;
            const { quantity: finalQuantity, unit: finalUnit } = formatQuantity(quantity, baseUnit);
            itemsToCreate.push({
                shopping_list_id: shoppingList.shopping_list_id,
                ingredient_id: agg.ingredient_id,
                quantity: finalQuantity,
                unit: finalUnit,
            });
        });

        await ShoppingItems.bulkCreate(itemsToCreate);

        res.status(201).json({
            message: 'Список покупок успешно создан',
            shoppingList
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
});

router.get('/:shoppingListId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { shoppingListId } = req.params;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId },
            include: [{
                model: ShoppingItems,
                include: [{
                    model: Ingredient,
                    attributes: ['name']
                }]
            }]
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список покупок не найден' });
            return;
        }
        res.json(shoppingList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Получение всех списков покупок пользователя
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const shoppingLists = await ShoppingLists.findAll({
            where: { user_id: userId },
            include: [{
                model: ShoppingItems,
            }],
        });
        res.json(shoppingLists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списков покупок' });
    }
});


export default router;
