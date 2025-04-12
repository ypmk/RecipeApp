// PlanerDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddDishModal from '../components/AddDishModal';
import ConfirmModal from '../components/ConfirmModal';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import ShoppingListGenerator from "./ShoppingListGenerator.tsx";

interface MealPlan {
    meal_plan_id: number;
    name: string;
    number_of_meals_per_day: number;
    total_days: number;
}

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
}

interface MealPlanRecipe {
    id_meal_plan_recipe: number;
    meal_plan_id: number;
    recipe_id: number;
    day: number;
    meal_type: number;
    quantity: number;
    Recipe: Recipe;
}

const PlanerDetailPage: React.FC = () => {
    const { mealPlanId } = useParams<{ mealPlanId: string }>();
    const navigate = useNavigate();

    // Состояния для модалки добавления блюда
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showAddDishModal, setShowAddDishModal] = useState<boolean>(false);

    // Состояния для данных планера и блюд
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [dayRecipes, setDayRecipes] = useState<MealPlanRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Состояния для подтверждения удаления блюда
    const [confirmDishOpen, setConfirmDishOpen] = useState<boolean>(false);
    const [dishToDelete, setDishToDelete] = useState<{ day: number; recipeId: number; name: string } | null>(null);

    // Состояния для подтверждения удаления планера
    const [confirmPlanOpen, setConfirmPlanOpen] = useState<boolean>(false);

    const numericPlanId = mealPlanId ? parseInt(mealPlanId, 10) : 0;


    // Функция загрузки данных планера
    const fetchMealPlan = async () => {
        if (!mealPlanId) return;
        try {
            const response = await axios.get<MealPlan>(`/api/meal-plans/${mealPlanId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMealPlan(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке планера:', error);
        }
    };

    // Функция загрузки блюд планера
    const fetchDayRecipes = async () => {
        if (!mealPlanId) return;
        try {
            const response = await axios.get<MealPlanRecipe[]>(`/api/meal-plans/${mealPlanId}/recipes`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setDayRecipes(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке блюд планера:', error);
        }
    };

    const refreshData = async () => {
        await fetchMealPlan();
        await fetchDayRecipes();
        setLoading(false);
    };

    useEffect(() => {
        if (mealPlanId) {
            refreshData();
        }
    }, [mealPlanId]);

    // Группировка блюд по дню
    const groupedRecipes: Record<number, MealPlanRecipe[]> = dayRecipes.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, MealPlanRecipe[]>);

    // Массив дней [1..total_days]
    const dayNumbers = mealPlan ? Array.from({ length: mealPlan.total_days }, (_, i) => i + 1) : [];

    // Изменение количества блюда
    const updateQuantity = async (day: number, recipeId: number, newQuantity: number) => {
        if (!mealPlanId || newQuantity < 1) return;
        try {
            await axios.put(
                `/api/meal-plans/${mealPlanId}/days/${day}/recipes/${recipeId}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            refreshData();
        } catch (error) {
            console.error('Ошибка при обновлении количества:', error);
        }
    };

    // Открытие окна подтверждения удаления блюда
    const handleDishDeleteClick = (day: number, recipeId: number, name: string) => {
        setDishToDelete({ day, recipeId, name });
        setConfirmDishOpen(true);
    };

    // Удаление блюда после подтверждения
    const confirmDeleteDish = async () => {
        if (!mealPlanId || !dishToDelete) return;
        try {
            await axios.delete(
                `/api/meal-plans/${mealPlanId}/days/${dishToDelete.day}/recipes/${dishToDelete.recipeId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setConfirmDishOpen(false);
            setDishToDelete(null);
            refreshData();
        } catch (error) {
            console.error('Ошибка при удалении блюда:', error);
        }
    };

    // Удаление планера с подтверждением
    const confirmDeletePlan = async () => {
        if (!mealPlanId) return;
        try {
            await axios.delete(`/api/meal-plans/${mealPlanId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setConfirmPlanOpen(false);
            navigate("/planer");
        } catch (error) {
            console.error('Ошибка при удалении планера:', error);
        }
    };

    // Добавление дня
    const addDay = async () => {
        if (!mealPlanId) return;
        try {
            await axios.post(`/api/meal-plans/${mealPlanId}/days`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            refreshData();
        } catch (error) {
            console.error('Ошибка при добавлении дня:', error);
        }
    };

    // Открытие модалки для добавления блюда
    const openAddDishModal = (day: number) => {
        setSelectedDay(day);
        setShowAddDishModal(true);
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    if (!mealPlan) {
        return <div className="p-4">Планер не найден</div>;
    }

    return (
        <div className="p-4">
            {/* Заголовок с названием планера и кнопкой удаления планера */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{mealPlan.name}</h1>
                <button onClick={() => setConfirmPlanOpen(true)} className="text-red-600 hover:text-red-800" title="Удалить планер">
                    <FaTrash />
                </button>
            </div>

            <div className="mt-6">
                <ShoppingListGenerator mealPlanId={numericPlanId} />
            </div>

            {/* Карточки дней */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {dayNumbers.map(day => (
                    <div key={day} className="bg-gray-200 p-4 rounded shadow relative">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">День {day}</span>
                        </div>
                        {/* Список блюд для дня */}
                        <div className="space-y-2">
                            {groupedRecipes[day] && groupedRecipes[day].length > 0 ? (
                                groupedRecipes[day].map(dish => (
                                    <div key={dish.id_meal_plan_recipe} className="flex items-center justify-between bg-white p-2 rounded shadow">
                                        <span>{dish.Recipe?.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(day, dish.Recipe.recipe_id, dish.quantity - 1)}
                                                className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400"
                                                title="Уменьшить количество"
                                            >
                                                <FaMinus />
                                            </button>
                                            <span>{dish.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(day, dish.Recipe.recipe_id, dish.quantity + 1)}
                                                className="bg-gray-300 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-400"
                                                title="Увеличить количество"
                                            >
                                                <FaPlus />
                                            </button>
                                            <button
                                                onClick={() => handleDishDeleteClick(day, dish.Recipe.recipe_id, dish.Recipe.name)}
                                                className="bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-red-600"
                                                title="Удалить блюдо"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Нет добавленных блюд</p>
                            )}
                        </div>
                        {/* Кнопка добавления блюда */}
                        <button
                            onClick={() => openAddDishModal(day)}
                            className="mt-3 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            title="Добавить блюдо"
                        >
                            <FaPlus />
                            Добавить блюдо
                        </button>
                    </div>
                ))}
            </div>

            {/* Кнопка добавления дня */}
            <button
                onClick={addDay}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Добавить день
            </button>


            {/* Модалка для добавления блюда */}
            {showAddDishModal && selectedDay !== null && (
                <AddDishModal
                    isOpen={showAddDishModal}
                    onClose={() => setShowAddDishModal(false)}
                    mealPlanId={Number(mealPlanId)}
                    dayNumber={selectedDay}
                    onDishAdded={refreshData}
                />
            )}

            {/* Окно подтверждения удаления блюда */}
            <ConfirmModal
                isOpen={confirmDishOpen}
                title="Удаление блюда"
                message={`Удалить блюдо "${dishToDelete?.name}" из дня ${dishToDelete?.day}?`}
                onCancel={() => {
                    setConfirmDishOpen(false);
                    setDishToDelete(null);
                }}
                onConfirm={confirmDeleteDish}
            />

            {/* Окно подтверждения удаления планера */}
            <ConfirmModal
                isOpen={confirmPlanOpen}
                title="Удаление планера"
                message={`Вы действительно хотите удалить планер "${mealPlan.name}"?`}
                onCancel={() => setConfirmPlanOpen(false)}
                onConfirm={confirmDeletePlan}
            />
        </div>
    );
};

export default PlanerDetailPage;
