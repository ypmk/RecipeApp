import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface ShoppingList {
    shopping_list_id: number;
    name: string;
    createdAt: string;
    ShoppingItems?: Array<{ shopping_item_id: number }>;
}

const ShoppingListsList: React.FC = () => {
    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/shopping-lists', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setShoppingLists(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Ошибка загрузки списков покупок');
            } finally {
                setLoading(false);
            }
        };
        fetchLists();
    }, []);

    if (loading) return <div>Загрузка списков покупок...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (shoppingLists.length === 0) return <div>Списков покупок ещё нет.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shoppingLists.map(list => (
                <Link to={`/shopping-lists/${list.shopping_list_id}`} key={list.shopping_list_id}>
                    <div className="p-4 border rounded shadow hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold">{list.name}</h3>
                        <p className="text-sm text-gray-500">
                            Элементов: {list.ShoppingItems ? list.ShoppingItems.length : 0}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ShoppingListsList;
