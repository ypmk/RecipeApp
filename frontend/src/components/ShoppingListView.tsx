import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal.tsx";

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
    const navigate = useNavigate();

    // Состояния для редактирования
    const [editing, setEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState('');
    // Состояние для модального окна подтверждения удаления
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

    useEffect(() => {
        axios.get(`/api/shopping-lists/${shoppingListId}`)
            .then((res) => {
                setShoppingList(res.data);
            })
            .catch((err) => console.error('Ошибка загрузки списка покупок', err))
            .finally(() => setLoading(false));
    }, [shoppingListId]);

    // Функция запуска режима редактирования
    const handleEditClick = () => {
        setNewName(shoppingList?.name || '');
        setEditing(true);
    };

    // Функция сохранения нового названия списка
    const handleSaveClick = async () => {
        try {
            const res = await axios.put(`/api/shopping-lists/${shoppingListId}`, { name: newName });
            setShoppingList(res.data);
            setEditing(false);
        } catch (err) {
            console.error('Ошибка при обновлении названия списка', err);
            alert('Ошибка при обновлении названия списка');
        }
    };

    // Функция удаления списка покупок
    const handleDelete = async () => {
        try {
            await axios.delete(`/api/shopping-lists/${shoppingListId}`);
            // После успешного удаления можно перенаправить пользователя на страницу со списками
            navigate('/lists');
        } catch (err) {
            console.error('Ошибка при удалении списка покупок', err);
            alert('Ошибка при удалении списка покупок');
        }
    };

    if (loading) return <div className="text-center text-gray-500">Загрузка...</div>;
    if (!shoppingList) return <div className="text-center text-red-500">Список не найден</div>;

    return (
        <div className="max-w-2xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-4">
                {editing ? (
                    <div className="flex gap-2 w-full">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-lg shadow-sm w-full max-w-sm"
                        />
                        <button
                            onClick={handleSaveClick}
                            className="bg-[#F19953] hover:bg-[#f18953] text-white px-4 py-2 rounded-lg shadow"
                        >
                            Сохранить
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800">{shoppingList.name}</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 shadow-sm"
                            >
                                <Edit3 size={20} />
                            </button>
                            <button
                                onClick={() => setConfirmDeleteOpen(true)}
                                className="p-2 text-red-600 hover:bg-red-100 border border-gray-300 rounded-lg bg-white shadow-sm"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ингредиент</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Количество</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ед. изм.</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {shoppingList.ShoppingItems.map((item) => (
                        <tr key={item.shopping_item_id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-800">{item.Ingredient.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-800">{item.unit}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно подтверждения удаления */}
            <ConfirmModal
                isOpen={confirmDeleteOpen}
                title="Удаление списка"
                message={`Вы действительно хотите удалить список "${shoppingList?.name}"?`}
                onCancel={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default ShoppingListView;
