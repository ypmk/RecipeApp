// RecipeCollectionsSelector.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Collection {
    collection_id: number;
    name: string;
    hasRecipe: boolean;
}

interface Props {
    recipeId: number;
    onClose: () => void;
}

const RecipeCollectionsSelector: React.FC<Props> = ({ recipeId, onClose }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState<string>('');

    // Запрос списка коллекций с флагом, в каких уже есть рецепт
    const fetchCollections = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/collections/${recipeId}/collections`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setCollections(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить коллекции');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCollections();
    }, [recipeId]);

    // Добавление или удаление рецепта из коллекции по клику
    const handleToggleCollection = async (collectionId: number, hasRecipe: boolean) => {
        try {
            if (hasRecipe) {
                await axios.delete(`/api/collections/${recipeId}/collections/${collectionId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
            } else {
                await axios.post(
                    `/api/collections/${recipeId}/collections/${collectionId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
            }
            fetchCollections();
        } catch (err) {
            console.error(err);
            alert('Ошибка при обновлении коллекции');
        }
    };

    // Создание новой коллекции и добавление в неё рецепта
    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) {
            alert('Введите название коллекции');
            return;
        }
        try {
            // Создаем новую коллекцию (эндпоинт: POST /api/collections)
            const createRes = await axios.post(
                `/api/collections`,
                { name: newCollectionName },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            const newCollectionId = createRes.data.collection_id;
            // Добавляем рецепт в созданную коллекцию
            await axios.post(
                `/api/collections/${recipeId}/collections/${newCollectionId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setNewCollectionName('');
            fetchCollections();
        } catch (err) {
            console.error(err);
            alert('Ошибка при создании коллекции');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-md p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Добавить в коллекции</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        X
                    </button>
                </div>
                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <ul className="space-y-2">
                        {collections.map((collection) => (
                            <li key={collection.collection_id} className="flex items-center">
                                <div
                                    className={`w-6 h-6 border mr-2 cursor-pointer flex justify-center items-center transition-colors ${
                                        collection.hasRecipe ? 'bg-blue-500 text-white' : 'bg-white'
                                    }`}
                                    onClick={() =>
                                        handleToggleCollection(collection.collection_id, collection.hasRecipe)
                                    }
                                >
                                    {collection.hasRecipe && <span>&#10003;</span>}
                                </div>
                                <span>{collection.name}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-4">
                    <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Название новой коллекции"
                        className="border px-2 py-1 mr-2 rounded w-full"
                    />
                    <button
                        onClick={handleCreateCollection}
                        className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded transition"
                    >
                        Создать коллекцию
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeCollectionsSelector;
