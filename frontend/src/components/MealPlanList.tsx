import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import ConfirmModal from '../components/ConfirmModal';
import { Trash2 } from 'lucide-react';


interface MealPlan {
    meal_plan_id: number;
    name: string;
    number_of_meals_per_day: number;
    total_days: number;
    createdAt?: string;
    updatedAt?: string;
}

const MealPlanList: React.FC = () => {
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [planToDelete, setPlanToDelete] = useState<MealPlan | null>(null);



    const fetchMealPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get<MealPlan[]>('/api/meal-plans', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMealPlans(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке планеров:', error);
        } finally {
            setLoading(false);
        }
    };

    // Переход на страницу планера при клике на карточку
    const handlePlanClick = (mealPlanId: number) => {
        navigate(`/planer/${mealPlanId}`);
    };


    // Открыть окно подтверждения для удаления планера
    const handleDeleteClick = (e: React.MouseEvent, plan: MealPlan) => {
        e.stopPropagation();
        setPlanToDelete(plan);
        setConfirmOpen(true);
    };

    // Подтвердить удаление планера
    const confirmDeletePlan = async () => {
        if (!planToDelete) return;
        try {
            await axios.delete(`/api/meal-plans/${planToDelete.meal_plan_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setConfirmOpen(false);
            setPlanToDelete(null);
            fetchMealPlans();
        } catch (error) {
            console.error('Ошибка при удалении планера:', error);
        }
    };


    useEffect(() => {
        fetchMealPlans();
    }, []);


    return (
        <div className="p-4 max-w-md mx-auto">
            {loading ? (
                <p>Загрузка планеров...</p>
            ) : (
                <div className="space-y-3">
                    {mealPlans.map(plan => (
                        <div
                            key={plan.meal_plan_id}
                            onClick={() => handlePlanClick(plan.meal_plan_id)}
                            className="flex justify-between items-center bg-white shadow-md border border-orange-100 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/default.jpg"
                                    alt="План"
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <span className="font-semibold text-gray-800 text-base truncate max-w-[160px]">
                                  {plan.name}
                                </span>
                            </div>
                            <button
                                onClick={(e) => handleDeleteClick(e, plan)}
                                title="Удалить планер"
                                className="text-gray-400 hover:text-red-500 transition"
                            >
                                <Trash2 size={20} />
                            </button>

                        </div>

                    ))}
                </div>
            )}
            {/* Окно подтверждения удаления планера */}
            <ConfirmModal
                isOpen={confirmOpen}
                title="Удаление планера"
                message={`Вы действительно хотите удалить планер "${planToDelete?.name}"?`}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDeletePlan}
            />
        </div>
    );
};

export default MealPlanList;
