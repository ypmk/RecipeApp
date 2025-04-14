import React from 'react';
import axios from 'axios';

interface ShoppingListGeneratorProps {
    mealPlanId: number;
    onSuccess?: (data: any) => void;
}

const ShoppingListGenerator: React.FC<ShoppingListGeneratorProps> = ({ mealPlanId, onSuccess }) => {
    const handleGenerate = async () => {
        try {
            const response = await axios.post(
                `/api/meal-plans/${mealPlanId}/shopping-list`,
                null,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            alert('Список покупок успешно создан!');
            if (onSuccess) onSuccess(response.data);
        } catch (error) {
            console.error('Ошибка генерации списка покупок:', error);
            alert('Ошибка генерации списка покупок');
        }
    };

    return (
        <button
            onClick={handleGenerate}
            className="bg-[#F19953] hover:bg-[#f18953] text-white font-semibold px-5 py-2 rounded-full shadow transition">
            Сгенерировать список покупок
        </button>
    );
};

export default ShoppingListGenerator;
