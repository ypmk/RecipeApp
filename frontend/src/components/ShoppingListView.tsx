import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, Circle, CheckCircle } from "lucide-react"; // импортируем иконки для режима "в магазине"
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

    // Новое состояние для режима "в магазине"
    const [inStoreMode, setInStoreMode] = useState<boolean>(false);
    // Состояние для отслеживания купленных элементов (ключ – shopping_item_id)
    const [boughtItems, setBoughtItems] = useState<Record<number, boolean>>({});

    useEffect(() => {
        axios.get(`/api/shopping-lists/${shoppingListId}`)
            .then((res) => {
                const fetchedList = res.data;
                setShoppingList(fetchedList);
                const initialBought: Record<number, boolean> = {};
                fetchedList.ShoppingItems.forEach((item: any) => {
                    initialBought[item.shopping_item_id] = item.bought;
                });
                setBoughtItems(initialBought);
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
            navigate('/lists');
        } catch (err) {
            console.error('Ошибка при удалении списка покупок', err);
            alert('Ошибка при удалении списка покупок');
        }
    };

    // Функция переключения состояния "куплено" для конкретного элемента
    const toggleBought = async (itemId: number) => {
        // Предполагаем новое значение
        const newBought = !boughtItems[itemId];
        try {
            await axios.put(
                `/api/shopping-lists/${shoppingListId}/items/${itemId}`,
                { bought: newBought },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            // Если запрос успешен, обновляем локальное состояние
            setBoughtItems(prev => ({ ...prev, [itemId]: newBought }));
        } catch (error) {
            console.error('Ошибка обновления состояния элемента', error);
        }
    };


    if (loading) return <div className="text-center text-gray-500">Загрузка...</div>;
    if (!shoppingList) return <div className="text-center text-red-500">Список не найден</div>;

    return (
        <div className="max-w-2xl mx-auto mt-6">
            {/* Заголовок и кнопки управления списком */}
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

            {/* Кнопка переключения режима "в магазине" */}
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setInStoreMode(prev => !prev)}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                    {inStoreMode ? "Выключить режим 'в магазине'" : "Режим 'в магазине'"}
                </button>
            </div>

            {/* Таблица списка покупок */}
            <div className="bg-white shadow-md rounded-xl oыverflow-hidden">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        {inStoreMode && <th className="px-4 py-3"></th>}
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ингредиент</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Количество</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ед. изм.</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {shoppingList.ShoppingItems.map((item) => (
                        <tr
                            key={item.shopping_item_id}
                            className={`transition ${inStoreMode && boughtItems[item.shopping_item_id] ? 'bg-gray-200 text-gray-500' : 'hover:bg-gray-50'}`}
                        >
                            {inStoreMode &&
                                <td className="px-4 py-4">
                                    <button onClick={() => toggleBought(item.shopping_item_id)}>
                                        {boughtItems[item.shopping_item_id]
                                            ? <CheckCircle size={20} className="text-green-500" />
                                            : <Circle size={20} className="text-gray-300" />
                                        }
                                    </button>
                                </td>
                            }
                            <td className="px-6 py-4 text-sm">{item.Ingredient.name}</td>
                            <td className="px-6 py-4 text-sm">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm">{item.unit}</td>
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
