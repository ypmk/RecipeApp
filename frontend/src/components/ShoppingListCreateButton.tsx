import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShoppingListCreateButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/shopping-lists/create')}
            className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50"
            title="Создать список покупок"
        >
            +
        </button>
    );
};

export default ShoppingListCreateButton;
