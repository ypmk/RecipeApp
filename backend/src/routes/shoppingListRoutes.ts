import {Router, Response} from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import MealPlans from '../models/MealPlans';
import MealPlanRecipes from '../models/MealPlanRecipes';
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import ShoppingLists from '../models/ShoppingLists';
import ShoppingItems from '../models/ShoppingItems';
import IngredientUnits from '../models/IngredientUnits';
import {User} from "../models";
import Friendship from "../models/Friendship";
import UserProducts from '../models/UserProducts';

import {Op} from "sequelize";

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

        const itemsToCreate: Array<{ shopping_list_id: number, ingredient_id: number, quantity: number, unit: string, bought:boolean, in_stock_quantity: number }> = [];
        aggregated.forEach(agg => {
            const { quantity, baseUnit } = agg;
            const { quantity: finalQuantity, unit: finalUnit } = formatQuantity(quantity, baseUnit);
            itemsToCreate.push({
                shopping_list_id: shoppingList.shopping_list_id,
                ingredient_id: agg.ingredient_id,
                quantity: finalQuantity,
                unit: finalUnit,
                bought:false,
                in_stock_quantity: 0
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
            include: [
                { model: ShoppingItems, include: [{ model: Ingredient, attributes: ['name'] }] },
                { model: UserProducts }
            ]
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
            order: [['createdAt', 'DESC']],
        });

        res.json(shoppingLists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списков покупок' });
    }
});


// Изменение названия списка покупок
router.put('/:shoppingListId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { shoppingListId } = req.params;
        const { name } = req.body;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId }
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список покупок не найден' });
            return;
        }
        shoppingList.name = name;
        await shoppingList.save();

        const updatedShoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId },
            include: [{
                model: ShoppingItems,
                include: [{
                    model: Ingredient,
                    attributes: ['name']
                }]
            }]
        });

        res.json(updatedShoppingList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Удаление списка покупок
router.delete('/:shoppingListId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { shoppingListId } = req.params;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId }
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список покупок не найден' });
            return;
        }
        await ShoppingItems.destroy({ where: { shopping_list_id: shoppingListId } });
        await UserProducts.destroy({ where: { shopping_list_id: shoppingListId } });
        await shoppingList.destroy();

        res.json({ message: 'Список покупок и связанные товары удалены' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Обновление состояния элемента списка покупок в режиме "в магазине"
router.put('/:shoppingListId/items/:shoppingItemId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { shoppingListId, shoppingItemId } = req.params;
        const { bought, in_stock_quantity } = req.body;

        if (bought === undefined && in_stock_quantity === undefined) {
            res.status(400).json({ message: 'Не указано ни bought, ни in_stock_quantity' });
            return;
        }

        if (bought !== undefined && typeof bought !== 'boolean') {
            res.status(400).json({ message: 'Неверное значение для поля bought' });
            return;
        }

        if (in_stock_quantity !== undefined && typeof in_stock_quantity !== 'number') {
            res.status(400).json({ message: 'in_stock_quantity должен быть числом' });
            return;
        }

        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId }
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список покупок не найден' });
            return;
        }

        const item = await ShoppingItems.findOne({
            where: { shopping_item_id: shoppingItemId, shopping_list_id: shoppingListId }
        });
        if (!item) {
            res.status(404).json({ message: 'Элемент списка не найден' });
            return;
        }

        if (bought !== undefined) item.bought = bought;
        if (in_stock_quantity !== undefined) item.in_stock_quantity = in_stock_quantity;

        await item.save();
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Передача (копирование) списка покупок другому пользователю
router.post('/:shoppingListId/transfer', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const senderId = req.user?.id;
        const { shoppingListId } = req.params;
        const { targetUsername } = req.body; // теперь ожидается targetUsername вместо targetUserId

        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return
        }
        if (!targetUsername) {
            res.status(400).json({ message: 'Не указан targetUsername' });
            return
        }

        // Найдем получателя по username
        const targetUser = await User.findOne({ where: { username: targetUsername } });
        if (!targetUser) {
            res.status(404).json({ message: 'Пользователь с указанным именем не найден' });
            return
        }
        if (targetUser.id === senderId) {
           res.status(400).json({ message: 'Нельзя передать список самому себе' });
            return
        }

        // Проверка дружбы (проверяем в обе стороны)
        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { userId: senderId, friendId: targetUser.id },
                    { userId: targetUser.id, friendId: senderId }
                ],
                status: 'accepted'
            }
        });
        if (!friendship) {
            res.status(403).json({ message: 'Передача списка возможна только между друзьями' });
            return
        }

        // Получаем исходный список покупок отправителя с товарами
        const originalList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: senderId },
            include: [{ model: ShoppingItems }]
        });

        if (!originalList) {
            res.status(404).json({ message: 'Список покупок не найден или не принадлежит отправителю' });
            return
        }

        // Создаем новый список для получателя с измененным названием (например, с приставкой "Копия:")
        const newList = await ShoppingLists.create({
            user_id: targetUser.id,
            name: `Копия: ${originalList.name}`
        });

        // Копируем все товары; при этом поле bought устанавливаем в false
        const itemsToCreate = originalList.ShoppingItems ? originalList.ShoppingItems.map((item: any) => ({
            shopping_list_id: newList.shopping_list_id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit: item.unit,
            bought: false,
            in_stock_quantity:0
        })) : [];

        await ShoppingItems.bulkCreate(itemsToCreate);

        res.status(201).json({
            message: 'Список покупок успешно передан',
            shoppingList: newList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/:shoppingListId/user-products', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    const { shoppingListId } = req.params;
    const { name, quantity, unit } = req.body;
    const userId = req.user?.id;
    try {
        const shoppingList = await ShoppingLists.findOne({ where: { shopping_list_id: shoppingListId, user_id: userId } });
        if (!shoppingList){
            res.status(404).json({ message: 'Список не найден' });
            return
        }
        const product = await UserProducts.create({ shopping_list_id: shoppingListId, name, quantity, unit, bought: false });
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:shoppingListId/user-products/:userProductId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    const { shoppingListId, userProductId } = req.params;
    const userId = req.user?.id;

    try {
        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId }
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список не найден' });
            return;
        }

        const product = await UserProducts.findOne({
            where: { id: userProductId, shopping_list_id: shoppingListId }
        });

        if (!product) {
            res.status(404).json({ message: 'Продукт не найден' });
            return;
        }

        await product.destroy();
        res.json({ message: 'Продукт удалён' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/:shoppingListId/user-products/:userProductId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    const { shoppingListId, userProductId } = req.params;
    const { name, quantity, unit, bought } = req.body;
    const userId = req.user?.id;

    try {
        const shoppingList = await ShoppingLists.findOne({
            where: { shopping_list_id: shoppingListId, user_id: userId }
        });
        if (!shoppingList) {
            res.status(404).json({ message: 'Список не найден' });
            return;
        }

        const product = await UserProducts.findOne({
            where: { id: userProductId, shopping_list_id: shoppingListId }
        });

        if (!product) {
            res.status(404).json({ message: 'Продукт не найден' });
            return;
        }

        if (name !== undefined) product.name = name;
        if (quantity !== undefined) product.quantity = quantity;
        if (unit !== undefined) product.unit = unit;
        if (bought !== undefined) product.bought = bought;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});






export default router;
