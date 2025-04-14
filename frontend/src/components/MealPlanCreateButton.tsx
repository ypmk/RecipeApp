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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 border border-orange-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-extrabold text-gray-800">Создание планера</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                title="Закрыть"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Название планера</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="Например, План на неделю"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Количество дней</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={totalDays}
                                    onChange={(e) => setTotalDays(+e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={createMealPlan}
                                    className="flex-1 bg-[#F18853] hover:bg-[#f17953] text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition shadow"
                                >
                                    Создать
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default MealPlanCreateButton;
