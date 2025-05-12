// PlanerDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddDishModal from '../components/AddDishModal';
import ConfirmModal from '../components/ConfirmModal';
import { FaPlus, FaMinus} from 'react-icons/fa';
import ShoppingListGenerator from "./ShoppingListGenerator.tsx";
import {Edit3, Plus, Trash2} from "lucide-react";

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

    // Состояния для редактирования названия планера
    const [editing, setEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>('');

    // Состояния для удаления дня планера
    const [confirmDayOpen, setConfirmDayOpen] = useState<boolean>(false);
    const [dayToDelete, setDayToDelete] = useState<number | null>(null);


    const handleDeleteDayClick = (day: number) => {
        setDayToDelete(day);
        setConfirmDayOpen(true);
    };

    const confirmDeleteDay = async () => {
        if (!mealPlanId || dayToDelete === null) return;
        try {
            await axios.delete(`/api/meal-plans/${mealPlanId}/days/${dayToDelete}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setConfirmDayOpen(false);
            setDayToDelete(null);
            refreshData();
        } catch (error) {
            console.error("Ошибка при удалении дня", error);
            alert("Не удалось удалить день");
        }
    };



    const handleEditClick = () => {
        setNewName(mealPlan?.name || '');
        setEditing(true);
    };

    const handleSaveClick = async () => {
        if (!mealPlanId) return;
        try {
            await axios.put(`/api/meal-plans/${mealPlanId}`, { name: newName }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMealPlan((prev) => prev ? { ...prev, name: newName } : prev);
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert('Ошибка при обновлении названия');
        }
    };

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

    useEffect(() => {
        if (showAddDishModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showAddDishModal]);


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
        <div className="bg-[#F9F9F9] min-h-screen px-2 py-8">
            <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4">

            {/* Заголовок и кнопки */}
                <div className="flex items-center gap-2 mb-6 px-2">
                    {editing ? (
                        <>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="border border-gray-300 px-4 py-2 rounded-lg text-lg shadow-sm w-full max-w-sm"
                            />
                            <button
                                onClick={handleSaveClick}
                                className="bg-[#F19953] hover:bg-[#f18953] text-white px-4 py-2 rounded-lg  transition shadow"
                            >
                                Сохранить
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-gray-800">{mealPlan.name}</h1>
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition shadow-sm"
                            >
                                <Edit3 size={22} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setConfirmPlanOpen(true)}
                        className="p-2 text-red-600 hover:bg-red-100 border border-gray-300 rounded-lg bg-white transition shadow-sm"
                    >
                        <Trash2 size={22} />
                    </button>
                </div>

                <div className="mb-6">
                    <ShoppingListGenerator mealPlanId={numericPlanId} />
                </div>

                {/* День и блюда */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">

                {dayNumbers.map(day => (
                        <div key={day} className="bg-white rounded-xl shadow-md p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-700">День {day}</h2>
                                {dayNumbers.length > 1 && (
                                    <button
                                        onClick={() => handleDeleteDayClick(day)}
                                        className="p-2 mr-3 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition"
                                        title="Удалить день"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>


                            {groupedRecipes[day] && groupedRecipes[day].length > 0 ? (
                                groupedRecipes[day].map(dish => (
                                    <div
                                        key={dish.id_meal_plan_recipe}
                                        onClick={() => navigate(`/recipes/${dish.Recipe.recipe_id}`)}
                                        className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 transition cursor-pointer"
                                    >
                                        <span className="gap-2 text-gray-950 font-medium break-words leading-snug flex-grow min-w-0">
                                            {dish.Recipe?.name}
                                        </span>
                                        <div className="flex items-center ">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(day, dish.Recipe.recipe_id, dish.quantity - 1)}}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F19953] hover:text-white text-gray-700 flex items-center justify-center transition"
                                                title="Уменьшить"
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="w-6 text-center font-medium">{dish.quantity}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(day, dish.Recipe.recipe_id, dish.quantity + 1)}}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F19953] hover:text-white text-gray-700 flex items-center justify-center transition"
                                                title="Увеличить"
                                            >
                                                <FaPlus />
                                            </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDishDeleteClick(day, dish.Recipe.recipe_id, dish.Recipe.name)}}
                                                    className="p-2 ml-3  text-gray-500 hover:bg-red-500 hover:text-white  rounded-lg transition"
                                                    title="Удалить блюдо"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Нет добавленных блюд</p>
                            )}

                            <button
                                onClick={() => openAddDishModal(day)}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-base shadow transition"
                            >
                                <Plus size={20} />

                            </button>



                        </div>
                    ))}
                </div>



                {/* Кнопка добавить день */}
                <div className="mt-6">
                    <button
                        onClick={addDay}
                        className="bg-[#F19953] hover:bg-[#f18953] text-white px-6 py-3 rounded-full shadow transition font-semibold"
                    >
                        Добавить день
                    </button>
                </div>
            </div>
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

            {/* Окно подтвержденя удаления дня планера */}
            <ConfirmModal
                isOpen={confirmDayOpen}
                title="Удаление дня"
                message={`Вы действительно хотите удалить день ${dayToDelete}? Все блюда будут удалены.`}
                onCancel={() => {
                    setConfirmDayOpen(false);
                    setDayToDelete(null);
                }}
                onConfirm={confirmDeleteDay}
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
