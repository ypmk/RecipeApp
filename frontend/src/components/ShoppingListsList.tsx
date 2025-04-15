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
        <div className="w-full px-4">
            <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-6 max-w-screen-lg w-full mx-auto">
                    {shoppingLists.map(list => (
                        <Link
                            to={`/shopping-lists/${list.shopping_list_id}`}
                            key={list.shopping_list_id}
                            className="w-full sm:w-[300px]"
                        >
                            <div className="h-full p-4 min-h-[120px] flex flex-col justify-between border border-gray-200 rounded-lg shadow bg-white hover:shadow-md transition">
                                <h3 className="text-lg text-center font-semibold text-gray-800 break-words">
                                    {list.name}
                                </h3>
                                <p className="text-sm text-center text-gray-500 mt-2">
                                    Позиций: {list.ShoppingItems?.length ?? 0}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>



    );


};

export default ShoppingListsList;
