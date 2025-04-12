import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import ConfirmModal from '../components/ConfirmModal';

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
                <div className="space-y-2 mb-6">
                    {mealPlans.map(plan => (
                        <div
                            key={plan.meal_plan_id}
                            className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded flex items-center justify-between cursor-pointer"
                            onClick={() => handlePlanClick(plan.meal_plan_id)}
                        >
                            <span>{plan.name}</span>
                            <button
                                onClick={(e) => handleDeleteClick(e, plan)}
                                className="bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
                                title="Удалить планер"
                            >
                                &times;
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
