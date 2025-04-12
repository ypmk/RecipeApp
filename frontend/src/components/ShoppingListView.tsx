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
                setError('Ошибка загрузки списка покупок');
            } finally {
                setLoading(false);
            }
        }
        fetchShoppingList();
    }, [shoppingListId]);

    if (loading) return <div>Загрузка списка покупок...</div>;
    if (error) return <div>{error}</div>;
    if (!shoppingList) return <div>Список покупок не найден</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{shoppingList.name}</h1>
            <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ингредиент</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Количество</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {shoppingList.ShoppingItems.map(item => (
                    <tr key={item.shopping_item_id}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.Ingredient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}  {item.unit}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


        </div>
    );
};

export default ShoppingListView;
