import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ShoppingItem {
    shopping_item_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    Ingredient: {
        name: string;
    };
}

interface ShoppingList {
    shopping_list_id: number;
    name: string;
    ShoppingItems: ShoppingItem[];
}

interface ShoppingListViewProps {
    shoppingListId: number;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ shoppingListId }) => {
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchShoppingList() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/shopping-lists/${shoppingListId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setShoppingList(response.data);
            } catch (err: any) {
                console.error(err);
                setError('Не удалось загрузить список покупок.');
            } finally {
                setLoading(false);
            }
        }
        fetchShoppingList();
    }, [shoppingListId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-lg text-gray-500">
                Загрузка списка покупок...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 font-medium mt-8">
                {error}
            </div>
        );
    }

    if (!shoppingList) {
        return (
            <div className="text-center text-gray-500 mt-8">
                Список покупок не найден.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {shoppingList.name}
            </h1>

            {shoppingList.ShoppingItems.length === 0 ? (
                <div className="text-center text-gray-400">Пока нет ингредиентов</div>
            ) : (
                <table className="w-full border-t border-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Ингредиент</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Количество</th>
                    </tr>
                    </thead>
                    <tbody>
                    {shoppingList.ShoppingItems.map(item => (
                        <tr key={item.shopping_item_id} className="border-t">
                            <td className="px-4 py-3 text-gray-700">{item.Ingredient.name}</td>
                            <td className="px-4 py-3 text-gray-700">{item.quantity} {item.unit}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ShoppingListView;
