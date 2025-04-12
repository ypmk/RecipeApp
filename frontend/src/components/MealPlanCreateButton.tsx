import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const MealPlanCreateButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [planName, setPlanName] = useState("");
    const [totalDays, setTotalDays] = useState(1);
    const navigate = useNavigate();

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const createMealPlan = async () => {
        if (!planName.trim()) return;
        try {
            const response = await axios.post(
                '/api/meal-plans',
                { name: planName.trim(), total_days: totalDays },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            const createdPlan = response.data;
            closeModal();
            navigate(`/planer/${createdPlan.meal_plan_id}`);
        } catch (error) {
            console.error('Ошибка при создании планера:', error);
        }
    };

    return (
        <>
            {/* Кнопка, открывающая форму */}
            <button
                className="w-10 h-10 bg-orange-500 text-white text-6xlxl rounded-full flex items-center justify-center hover:bg-orange-600 transition"
                onClick={openModal}
                aria-label="Создать планер"
                title="Создать планер"
            >
                <FiPlus className="text-lg" />
            </button>


            {/* Модалка с формой */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-md max-w-sm w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Создание планера</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Название планера</label>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Количество дней</label>
                            <input
                                type="number"
                                min={1}
                                value={totalDays}
                                onChange={(e) => setTotalDays(+e.target.value)}
                                className="w-full border p-2 rounded"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={createMealPlan}
                                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                            >
                                Создать
                            </button>
                            <button
                                onClick={closeModal}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MealPlanCreateButton;
