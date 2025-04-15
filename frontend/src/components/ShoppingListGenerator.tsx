import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ShoppingListGeneratorProps {
    mealPlanId: number;
    onSuccess?: (data: any) => void;
}

const ShoppingListGenerator: React.FC<ShoppingListGeneratorProps> = ({ mealPlanId, onSuccess }) => {
    const navigate = useNavigate();

    const handleGenerate = async () => {
        try {
            const response = await axios.post(
                `/api/meal-plans/${mealPlanId}/shopping-list`,
                null,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            const listId = response.data.shoppingList.shopping_list_id;
            if (onSuccess) onSuccess(response.data);
            navigate(`/shopping-lists/${listId}`);
        } catch (error) {
            console.error('Ошибка генерации списка покупок:', error);
            alert('Ошибка генерации списка покупок');
        }
    };

    return (
        <button
            onClick={handleGenerate}
            className="bg-[#F19953] hover:bg-[#f18953] text-white font-semibold px-5 py-2 rounded-full shadow transition"
        >
            Сгенерировать список покупок
        </button>
    );
};

export default ShoppingListGenerator;
