// mealPlanRoutes.ts
import { Router } from "express";
import MealPlans from "../models/MealPlans";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";
import {MealPlanRecipes, Recipe} from "../models";

const router = Router();

router.use(authenticateJWT);

// middleware на уровне параметра
router.param("mealPlanId", async (req, res, next, mealPlanId) => {
    try {
        const userId = (req as AuthenticatedRequest).user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const mealPlan = await MealPlans.findOne({
            where: { meal_plan_id: mealPlanId, user_id: userId },
        });

        if (!mealPlan) {
            return res.status(404).json({ message: "Планер не найден" });
        }

        // Сохраняем объект mealPlan в req, чтобы использовать в обработчике маршрута
        (req as any).mealPlan = mealPlan;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Ошибка при получении планера" });
    }
});



// Теперь в обработчиках можно не дублировать код поиска:
router.get("/:mealPlanId", (req, res) => {
    // mealPlan уже лежит в req
    const mealPlan = (req as any).mealPlan;
    res.json(mealPlan);
});



router.post("/:mealPlanId/days", async (req, res) => {
    try {
        const mealPlan = (req as any).mealPlan;
        mealPlan.total_days += 1;
        await mealPlan.save();
        res.json({ message: "День добавлен", mealPlan });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при добавлении дня" });
    }
});



router.post("/:mealPlanId/days/:day/recipes", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const { mealPlanId, day } = req.params;
        const { recipe_id, meal_type, quantity } = req.body;

        if (!recipe_id) {
            res.status(400).json({ message: "recipe_id обязателен" });
            return
        }

        const newRecord = await MealPlanRecipes.create({
            meal_plan_id: Number(mealPlanId),
            recipe_id: recipe_id,
            day: Number(day),
            meal_type: meal_type,
            quantity: quantity || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json(newRecord);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при добавлении блюда в планер" });
    }
});



/**
 * Создание нового планера
 * POST /api/meal-plans
 */
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }

        const { name, total_days } = req.body;
        if (!name) {
            res.status(400).json({ message: "Название планера обязательно" });
            return
        }

        const days = total_days ? Number(total_days) : 1;

        const newMealPlan = await MealPlans.create({
            user_id: userId,
            name,
            number_of_meals_per_day: 0,
            total_days: days,
        });

        res.status(201).json(newMealPlan);
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при создании планера" });
    }
});


// GET /api/meal-plans
router.get("/", async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }
        // Находим все планеры, принадлежащие пользователю
        const mealPlans = await MealPlans.findAll({
            where: { user_id: userId },
            order: [['meal_plan_id', 'DESC']],
        });
        res.json(mealPlans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении списка планеров" });
    }
});


// Удалить планер
router.delete("/:mealPlanId", async (req: AuthenticatedRequest, res) => {
    try {
        const mealPlan = (req as any).mealPlan;
        await mealPlan.destroy();
        res.json({ message: "Планер удалён" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при удалении планера" });
    }
});


// Получение всех блюд планера, сгруппированных по дням
// GET /api/meal-plans/:mealPlanId/recipes
router.get("/:mealPlanId/recipes", async (req: AuthenticatedRequest, res) => {
    try {
        // Поскольку есть router.param("mealPlanId"), mealPlan уже лежит в req.mealPlan
        const mealPlan = (req as any).mealPlan;
        if (!mealPlan) {
            res.status(404).json({ message: "Планер не найден" });
            return
        }

        const records = await MealPlanRecipes.findAll({
            where: { meal_plan_id: mealPlan.meal_plan_id },
            include: [
                {
                    model: Recipe,
                },
            ],
            order: [["day", "ASC"]],
        });


        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении блюд планера" });
    }
});


// Удаление блюда из дня
// DELETE /api/meal-plans/:mealPlanId/days/:day/recipes/:recipeId
router.delete("/:mealPlanId/days/:day/recipes/:recipeId", async (req: AuthenticatedRequest, res) => {
    try {
        const { mealPlanId, day, recipeId } = req.params;
        const record = await MealPlanRecipes.findOne({
            where: {
                meal_plan_id: +mealPlanId,
                day: +day,
                recipe_id: +recipeId
            }
        });
        if (!record) {
            res.status(404).json({ message: "Блюдо не найдено в данном дне" });
            return
        }
        await record.destroy();
        res.json({ message: "Блюдо удалено из дня" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при удалении блюда" });
    }
});


// Изменение количества блюд
// PUT /api/meal-plans/:mealPlanId/days/:day/recipes/:recipeId
router.put("/:mealPlanId/days/:day/recipes/:recipeId", async (req: AuthenticatedRequest, res) => {
    try {
        const { mealPlanId, day, recipeId } = req.params;
        const { quantity } = req.body; // например, { quantity: 3 }

        if (quantity === undefined) {
            res.status(400).json({ message: "quantity не передан" });
            return
        }

        const record = await MealPlanRecipes.findOne({
            where: {
                meal_plan_id: +mealPlanId,
                day: +day,
                recipe_id: +recipeId
            }
        });
        if (!record) {
            res.status(404).json({ message: "Блюдо не найдено в данном дне" });
            return
        }

        record.quantity = quantity;
        await record.save();
        res.json({ message: "Количество обновлено", record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при обновлении количества блюда" });
    }
});




export default router;
