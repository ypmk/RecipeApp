import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {Edit3, Trash2, Circle, CheckCircle, ShoppingCart, Package, X, Plus, EyeOff, Eye} from "lucide-react"; // добавляем иконку Package
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

interface UserProduct {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    bought: boolean;
}


interface ShoppingList {
    shopping_list_id: number;
    name: string;
    ShoppingItems: ShoppingItem[];
    UserProducts: UserProduct[];
}

interface ShoppingListViewProps {
    shoppingListId: number;
}

interface IngredientUnit {
    ing_unit_id: number;
    name: string;
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
    const [newProductName, setNewProductName] = useState('');
    const [newProductQuantity, setNewProductQuantity] = useState<string | number>('1');
    const [productNameError, setProductNameError] = useState('');
    const [productQuantityError, setProductQuantityError] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [editedProductName, setEditedProductName] = useState('');
    const [editedProductQuantity, setEditedProductQuantity] = useState<number | string>(1);
    const [editedProductUnit, setEditedProductUnit] = useState('');
    const [confirmDeleteProductOpen, setConfirmDeleteProductOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);
    const [showAddProductRow, setShowAddProductRow] = useState(false);
    const [allUnits, setAllUnits] = useState<IngredientUnit[]>([]);
    const [newProductUnit, setNewProductUnit] = useState('шт');
    const allowedUnits = ['шт', 'кг', 'гр', 'л', 'мл'];
    const [boughtUserProducts, setBoughtUserProducts] = useState<Record<number, boolean>>({});
    const [hidePlanAndStockColumns, setHidePlanAndStockColumns] = useState(false);


    const toggleAddProductRow = () => {
        setShowAddProductRow((prev) => !prev);
    };

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await axios.get('/api/ingredient-units');
                setAllUnits(response.data);
            } catch (error) {
                console.error('Ошибка загрузки единиц измерения:', error);
            }
        };
        fetchUnits();
    }, []);

    const filteredUnits = allUnits.filter((unit) => allowedUnits.includes(unit.name));


    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/shopping-lists/${shoppingListId}`)
            .then((res) => {
                const fetchedList = res.data;
                fetchedList.UserProducts.sort((a: UserProduct, b: UserProduct) => a.id - b.id);
                setShoppingList(fetchedList);
                const initialBought: Record<number, boolean> = {};
                const initialStock: Record<number, number> = {};
                fetchedList.ShoppingItems.forEach((item: any) => {
                    initialBought[item.shopping_item_id] = item.bought;
                    initialStock[item.shopping_item_id] = item.in_stock_quantity || 0;
                });
                const initialBoughtUserProducts: Record<number, boolean> = {};
                fetchedList.UserProducts.forEach((product: UserProduct) => {
                    initialBoughtUserProducts[product.id] = product.bought;
                });
                setBoughtUserProducts(initialBoughtUserProducts);
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
            await axios.put(`/api/shopping-lists/${shoppingListId}`, { name: newName });

            const refreshedList = await axios.get(`/api/shopping-lists/${shoppingListId}`);
            refreshedList.data.UserProducts.sort((a: UserProduct, b: UserProduct) => a.id - b.id);
            setShoppingList(refreshedList.data);
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

    const handleAddProduct = async () => {
        setFormSubmitted(true);

        let hasError = false;

        if (!newProductName.trim()) {
            setProductNameError('Введите название продукта');
            hasError = true;
        } else {
            setProductNameError('');
        }

        if (!newProductQuantity || Number(newProductQuantity) <= 0) {
            setProductQuantityError('Введите количество больше нуля');
            hasError = true;
        } else {
            setProductQuantityError('');
        }

        if (hasError) return;

        try {
            const response = await axios.post(`/api/shopping-lists/${shoppingListId}/user-products`, {
                name: newProductName,
                quantity: newProductQuantity,
                unit: newProductUnit,
            });

            const addedProduct = response.data;

            setShoppingList((prevList) => ({
                ...prevList!,
                UserProducts: [...prevList!.UserProducts, addedProduct],
            }));


            setNewProductName('');
            setNewProductQuantity(1);
            setNewProductUnit('');
            setProductNameError('');
            setProductQuantityError('');
            setFormSubmitted(false);
            setShowAddProductRow(false);
        } catch (error) {
            console.error('Ошибка добавления продукта:', error);
        }
    };



    const startEditProduct = (product: UserProduct) => {
        setEditingProductId(product.id);
        setEditedProductName(product.name);
        setEditedProductQuantity(product.quantity);
        setEditedProductUnit(product.unit);
    };

    const handleSaveEdit = async (productId: number) => {
        try {
            await axios.put(`/api/shopping-lists/${shoppingListId}/user-products/${productId}`, {
                name: editedProductName,
                quantity: editedProductQuantity,
                unit: editedProductUnit,
            });

            setShoppingList((prevList) => ({
                ...prevList!,
                UserProducts: prevList!.UserProducts.map((p) =>
                    p.id === editingProductId
                        ? {
                            ...p,
                            name: editedProductName,
                            quantity: editedProductQuantity === '' ? 0 : Number(editedProductQuantity),
                            unit: editedProductUnit,
                        }
                        : p
                ),
            }));


            setEditingProductId(null);
        } catch (error) {
            console.error('Ошибка при сохранении продукта:', error);
        }
    };


    const handleConfirmDeleteUserProduct = async () => {
        if (productIdToDelete === null) return;
        try {
            await axios.delete(`/api/shopping-lists/${shoppingListId}/user-products/${productIdToDelete}`);
            setShoppingList((prevList) => ({
                ...prevList!,
                UserProducts: prevList!.UserProducts.filter((p) => p.id !== productIdToDelete),
            }));
        } catch (error) {
            console.error('Ошибка при удалении продукта:', error);
        } finally {
            setConfirmDeleteProductOpen(false);
            setProductIdToDelete(null);
        }
    };

    const toggleUserProductBought = async (productId: number) => {
        const newBought = !boughtUserProducts[productId];
        try {
            await axios.put(
                `/api/shopping-lists/${shoppingListId}/user-products/${productId}`,
                { bought: newBought },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setBoughtUserProducts(prev => ({
                ...prev,
                [productId]: newBought,
            }));
        } catch (error) {
            console.error('Ошибка обновления статуса покупки продукта', error);
        }
    };



    if (loading) return <div className="text-center text-gray-500">Загрузка...</div>;
    if (!shoppingList) return <div className="text-center text-red-500">Список не найден</div>;

    return (
        <div className="max-w-2xl mx-auto mt-6 px-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                <div className="order-1 sm:order-none flex-1 min-w-0">
                {editing ? (
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleSaveClick}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveClick();
                                if (e.key === 'Escape') setEditing(false);
                            }}
                            autoFocus
                            className="text-2xl font-bold border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                        />
                    ) : (
                    <h2 className="text-2xl font-bold text-gray-800 break-words whitespace-pre-line">

                    {shoppingList.name}
                        </h2>
                    )}
                </div>


                <div className="flex flex-wrap sm:flex-nowrap pt-2 gap-2 order-2 sm:order-none sm:ml-4 mt-2 sm:mt-0">

                <button
                        onClick={() => setConfirmDeleteOpen(true)}
                        className="p-2 text-red-600 hover:bg-red-100 border border-gray-300 rounded-lg bg-white shadow-sm"
                        title="Удалить"
                    >
                        <Trash2 size={20} />
                    </button>
                    {editing && newName.trim() !== shoppingList.name.trim() ? (
                        <button
                            onClick={handleSaveClick}
                            className="flex items-center gap-2 px-6 py-2 text-sm text-green-700 border border-green-400 rounded-lg bg-white shadow-sm"
                            title="Сохранить"
                        >
                            <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 shadow-sm"
                            title="Редактировать"
                        >
                            <Edit3 size={20} />
                        </button>
                    )}

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
                    {showStockColumn && (
                        <button
                            onClick={() => setHidePlanAndStockColumns(prev => !prev)}
                            className={`border rounded-lg p-2 border-gray-300 shadow-sm hover:bg-gray-100 transition-colors duration-200 ${
                                hidePlanAndStockColumns ? 'text-gray-400' : 'text-gray-700'
                            }`}
                            title={hidePlanAndStockColumns ? 'Показать столбцы "по плану" и "в запасах"' : 'Скрыть столбцы "по плану" и "в запасах"'}
                        >
                            {hidePlanAndStockColumns ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    )}

                    <button
                        onClick={toggleAddProductRow}
                        className="border rounded-lg p-2 border-gray-300 shadow-sm hover:bg-gray-100 transition-colors duration-200"
                        title="Добавить продукт"
                    >
                        <Plus size={20} className="text-gray-700" />
                    </button>
                </div>
            </div>


            <div className="bg-white shadow-md rounded-xl overflow-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        {inStoreMode && <th className="px-4 py-3 w-10"></th>}
                        <th
                            className={`px-6 py-3 text-left text-sm font-medium text-gray-700 ${
                                hidePlanAndStockColumns ? 'w-1/3' : ''
                            }`}
                        >Ингредиент</th>
                        {!hidePlanAndStockColumns &&(<th className="px-6 py-3 w-32 text-center text-sm font-medium text-gray-700">По плану</th> )}
                        {showStockColumn && !hidePlanAndStockColumns && (
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
                                                onClick={() => setEditStockMode((prev) => !prev)}
                                                className={`text-gray-500 hover:text-yellow-500 ${editStockMode ? 'text-yellow-500' : ''}`}
                                                title="Редактировать запасы"
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                        )}
                                    </div>
                                </div>
                            </th>

                        )}

                        <th
                            className={`px-6 py-3 text-center text-sm font-medium text-gray-700 ${
                                hidePlanAndStockColumns ? 'w-1/3' : 'w-28'
                            }`}
                        >
                            Ед. изм.
                        </th>


                        {showStockColumn && (
                            <th
                                className={`px-6 py-3 text-center text-sm font-medium text-gray-700 ${
                                    hidePlanAndStockColumns ? 'w-1/3' : ''
                                }`}
                            >
                                Нужно купить
                            </th>
                        )}



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

                            {!hidePlanAndStockColumns && (
                                <td className="px-6 py-4 text-sm text-center">{item.quantity}</td>
                            )}

                            {showStockColumn && !hidePlanAndStockColumns && (
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
                                        : `${item.quantity - inStock[item.shopping_item_id]}`}
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>

                </table>
            </div>

            {shoppingList.UserProducts?.length > 0 && (
            <div className="mt-6 mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Сопутствующие продукты</h3>
            </div>
            )}

            <div className="bg-white shadow-md rounded-xl overflow-auto mb-6">
                <table className="min-w-full table-auto">
                    {shoppingList.UserProducts?.length > 0 && (
                    <thead className="bg-gray-100">
                    <tr>
                        {inStoreMode && <th className="px-4 py-3 w-10"></th>}
                        <th className="px-5 py-3 text-left text-sm font-medium text-gray-700">Продукт</th>
                        <th className="px-5 py-3 text-center text-sm font-medium text-gray-700">Кол-во</th>
                        <th className="px-5 py-3 text-center text-sm font-medium text-gray-700">Ед. изм.</th>
                        <th className="px-5 py-3 text-center text-sm font-medium text-gray-700">Действия</th>
                    </tr>
                    </thead>
                    )}
                    <tbody className="divide-y divide-gray-200">
                    {shoppingList.UserProducts?.length > 0 && shoppingList.UserProducts.map((product) => (
                        <tr
                            key={product.id}
                            className={`transition ${inStoreMode && boughtUserProducts[product.id] ? 'bg-gray-200 text-gray-500' : 'hover:bg-gray-50'}`}
                        >
                            {inStoreMode && (
                                <td className="px-4 py-4">
                                    <button onClick={() => toggleUserProductBought(product.id)}>
                                        {boughtUserProducts[product.id]
                                            ? <CheckCircle size={20} className="text-green-500" />
                                            : <Circle size={20} className="text-gray-300" />
                                        }
                                    </button>
                                </td>
                            )}

                            {editingProductId === product.id ? (
                                <>
                                    <td className="px-6 py-2 text-sm break-all">
                                        <input
                                            type="text"
                                            value={editedProductName}
                                            onChange={(e) => setEditedProductName(e.target.value)}
                                            className="border px-2 py-1 rounded w-full"
                                            autoFocus
                                        />
                                    </td>
                                    <td className="px-6 py-2">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={editedProductQuantity === 0 ? '' : editedProductQuantity}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const regex = /^(\d+)?(\.\d{0,2})?$/;
                                                if (value === '' || regex.test(value)) {
                                                    setEditedProductQuantity(value);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (
                                                    editedProductQuantity === '' ||
                                                    isNaN(Number(editedProductQuantity)) ||
                                                    Number(editedProductQuantity) <= 0
                                                ) {
                                                    setEditedProductQuantity(1);
                                                }
                                            }}
                                            className="border px-2 py-1 rounded w-20 text-center"
                                        />
                                    </td>
                                    <td className="px-6 py-2 text-center">
                                        <select
                                            value={editedProductUnit}
                                            onChange={(e) => setEditedProductUnit(e.target.value)}
                                            className="border px-2 py-1 rounded w-24 text-center"
                                        >
                                            {filteredUnits.map((unit) => (
                                                <option key={unit.ing_unit_id} value={unit.name}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-2 text-center flex justify-center gap-5">
                                        <button
                                            onClick={() => handleSaveEdit(product.id)}
                                            className="py-2 text-green-500 hover:text-green-700"
                                            title="Сохранить"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => setEditingProductId(null)}
                                            className="text-gray-600 hover:text-gray-800"
                                            title="Отмена"
                                        >
                                            <X size={20} />
                                        </button>
                                    </td>
                                </>

                            ) : (
                                <>
                                    <td className="px-6 py-4 text-sm break-all">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-center">{product.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-center">{product.unit || 'шт'}</td>
                                    <td className="px-6 py-4 text-center flex justify-center gap-5">
                                        <button
                                            onClick={() => startEditProduct(product)}
                                            className="text-gray-700 hover:text-yellow-700"
                                            title="Редактировать"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProductIdToDelete(product.id);
                                                setConfirmDeleteProductOpen(true);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            title="Удалить"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </>
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
            {/* Модальное окно для добавления */}
            {showAddProductRow && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Добавить продукт</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Название"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                className={`border px-3 py-2 rounded w-full ${
                                    formSubmitted && productNameError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Количество"
                                value={newProductQuantity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^(\d+)?(\.\d{0,2})?$/;
                                    if (value === '' || regex.test(value)) {
                                        setNewProductQuantity(value);
                                    }
                                }}
                                onBlur={() => {
                                    if (newProductQuantity === '' || isNaN(Number(newProductQuantity)) || Number(newProductQuantity) <= 0) {
                                        setNewProductQuantity('1');
                                    }
                                }}
                                className={`border px-3 py-2 rounded w-full ${
                                    formSubmitted && productQuantityError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={newProductUnit}
                                onChange={(e) => setNewProductUnit(e.target.value)}
                                className="border px-3 py-2 rounded w-full"
                            >
                                {filteredUnits.map((unit) => (
                                    <option key={unit.ing_unit_id} value={unit.name}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowAddProductRow(false)}
                                    className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    className="px-4 py-2 text-sm bg-[#F19953] hover:bg-[#f18953] text-white rounded"
                                >
                                    Добавить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default ShoppingListView;
