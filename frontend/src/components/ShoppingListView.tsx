import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {Edit3, Trash2, Circle, CheckCircle, ShoppingCart, Package} from "lucide-react"; // добавляем иконку Package
import ConfirmModal from "./ConfirmModal.tsx";

interface ShoppingItem {
    shopping_item_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    bought: boolean;
    in_stock_quantity: number;
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
    const [editing, setEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [inStoreMode, setInStoreMode] = useState<boolean>(false);
    const [boughtItems, setBoughtItems] = useState<Record<number, boolean>>({});
    const [showStockColumn, setShowStockColumn] = useState<boolean>(false);
    const [inStock, setInStock] = useState<Record<number, number>>({});
    const [editStockMode, setEditStockMode] = useState<boolean>(false);
    const [isStockChanged, setIsStockChanged] = useState<boolean>(false);



    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/shopping-lists/${shoppingListId}`)
            .then((res) => {
                const fetchedList = res.data;
                setShoppingList(fetchedList);
                const initialBought: Record<number, boolean> = {};
                const initialStock: Record<number, number> = {};
                fetchedList.ShoppingItems.forEach((item: any) => {
                    initialBought[item.shopping_item_id] = item.bought;
                    initialStock[item.shopping_item_id] = item.in_stock_quantity || 0;
                });
                setBoughtItems(initialBought);
                setInStock(initialStock);
            })
            .catch((err) => console.error('Ошибка загрузки списка покупок', err))
            .finally(() => setLoading(false));
    }, [shoppingListId]);

    const handleEditClick = () => {
        setNewName(shoppingList?.name || '');
        setEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const res = await axios.put(`/api/shopping-lists/${shoppingListId}`, { name: newName });
            setShoppingList(res.data);
            setEditing(false);
        } catch (err) {
            console.error('Ошибка при обновлении названия списка', err);
            console.log('Ошибка при обновлении названия списка');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/shopping-lists/${shoppingListId}`);
            navigate('/lists');
        } catch (err) {
            console.error('Ошибка при удалении списка покупок', err);
            console.log('Ошибка при удалении списка покупок');
        }
    };

    const toggleBought = async (itemId: number) => {
        const newBought = !boughtItems[itemId];
        try {
            await axios.put(
                `/api/shopping-lists/${shoppingListId}/items/${itemId}`,
                { bought: newBought },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setBoughtItems(prev => ({ ...prev, [itemId]: newBought }));
        } catch (error) {
            console.error('Ошибка обновления состояния элемента', error);
        }
    };

    const saveStock = async () => {
        try {
            await Promise.all(
                shoppingList!.ShoppingItems.map(item =>
                    axios.put(
                        `/api/shopping-lists/${shoppingListId}/items/${item.shopping_item_id}`,
                        { in_stock_quantity: inStock[item.shopping_item_id] || 0 },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    )
                )
            );
            console.log('Запасы успешно сохранены!');
            setIsStockChanged(false);
            setEditStockMode(false);
        } catch (error) {
            console.error(error);
            console.log('Ошибка при сохранении запасов');
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
                                onClick={() => setConfirmDeleteOpen(true)}
                                className="p-2 text-red-600 hover:bg-red-100 border border-gray-300 rounded-lg bg-white shadow-sm"
                                title="Удалить"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 shadow-sm"
                                title="Редактировать"
                            >
                                <Edit3 size={20} />
                            </button>
                            <button
                                onClick={() => setInStoreMode(prev => !prev)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white shadow-sm hover:bg-gray-100 ${
                                    inStoreMode ? 'text-green-600 border-green-400' : 'text-gray-700 border-gray-300'
                                }`}
                                title="Режим 'в магазине'"
                            >
                                <ShoppingCart size={20} />
                            </button>
                            <button
                                onClick={() => setShowStockColumn(prev => !prev)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg bg-white shadow-sm hover:bg-gray-100 ${
                                    showStockColumn ? 'text-green-600 border-green-400' : 'text-gray-700 border-gray-300'
                                }`}
                                title="Режим 'запасы'"
                            >
                                <Package size={20} />
                            </button>

                        </div>
                    </>
                )}
            </div>

            <div className="bg-white shadow-md rounded-xl overflow-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        {inStoreMode && <th className="px-4 py-3 w-10"></th>}
                        <th className="px-6 py-3 w-32 text-left text-sm font-medium text-gray-700">Ингредиент</th>
                        <th className="px-6 py-3 w-32 text-center text-sm font-medium text-gray-700">По плану</th>
                        {showStockColumn && (
                            <th className="px-6 py-3 w-32 text-center text-sm font-medium text-gray-700 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    В запасах
                                    <div className="w-5 flex justify-center">
                                        {editStockMode && isStockChanged ? (
                                            <button
                                                onClick={saveStock}
                                                className="text-green-600 hover:text-green-800"
                                                title="Сохранить запасы"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setEditStockMode(true)}
                                                className="text-gray-500 hover:text-yellow-500"
                                                title="Редактировать запасы"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </th>

                        )}

                        <th className="px-6 py-3 w-28 text-center text-sm font-medium text-gray-700">Ед. изм.</th>

                        {showStockColumn && <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Нужно купить</th>
                        }


                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {shoppingList.ShoppingItems.map((item) => (
                        <tr
                            key={item.shopping_item_id}
                            className={`transition ${inStoreMode && boughtItems[item.shopping_item_id] ? 'bg-gray-200 text-gray-500' : 'hover:bg-gray-50'}`}
                        >
                            {inStoreMode && (
                                <td className="px-4 py-4">
                                    <button onClick={() => toggleBought(item.shopping_item_id)}>
                                        {boughtItems[item.shopping_item_id]
                                            ? <CheckCircle size={20} className="text-green-500" />
                                            : <Circle size={20} className="text-gray-300" />
                                        }
                                    </button>
                                </td>
                            )}
                            <td className="px-6 py-4 text-sm ">{item.Ingredient.name}</td>
                            <td className="px-6 py-4 text-sm text-center">{item.quantity}</td>
                            {showStockColumn && (
                                <td className="px-6 py-4 text-sm text-center pl-2">
                                    {editStockMode ? (
                                        <input
                                            type="number"
                                            min={0}
                                            value={inStock[item.shopping_item_id] ?? 0}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                setInStock((prev) => ({
                                                    ...prev,
                                                    [item.shopping_item_id]: val
                                                }));
                                                setIsStockChanged(true);
                                            }}
                                            className="w-20 border rounded px-2 py-1 mx-auto"
                                        />
                                    ) : (
                                        <span>{inStock[item.shopping_item_id] ?? 0}</span>
                                    )}
                                </td>
                            )}

                            <td className="px-6 py-4 text-sm text-center">{item.unit}</td>

                            {showStockColumn && (
                                <td className="px-6 py-4 text-sm text-center">
                                    {inStock[item.shopping_item_id] >= item.quantity
                                        ? '-'
                                        : `${item.quantity - inStock[item.shopping_item_id]}`
                                    }
                                </td>
                            )}

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                title="Удаление списка"
                message={`Вы действительно хотите удалить список "${shoppingList?.name}"?`}
                onCancel={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
            />
            <ConfirmModal
                isOpen={confirmDeleteProductOpen}
                title="Удаление продукта"
                message={`Вы действительно хотите удалить продукт "${shoppingList?.UserProducts?.find(p => p.id === productIdToDelete)?.name}"?`}
                onCancel={() => setConfirmDeleteProductOpen(false)}
                onConfirm={handleConfirmDeleteUserProduct}
            />


        </div>
    );
};

export default ShoppingListView;
