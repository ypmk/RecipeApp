// CollectionsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { FaTrash } from "react-icons/fa";

// Интерфейс для коллекции
interface Collection {
    collection_id: number;
    name: string;
    lastRecipeImage?: string | null;
    updatedAt?: string;
    recipesCount?: number;
}

type SortOption = 'updated' | 'alphabetical';

const CollectionsList: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('updated');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');



    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) return;
        try {
            await axios.post('/api/collections', { name: newCollectionName }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setIsCreateModalOpen(false);
            setNewCollectionName('');
            fetchCollections(); // обновим список
        } catch (error) {
            console.error('Ошибка при создании коллекции:', error);
            alert('Не удалось создать коллекцию');
        }
    };



    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/collections', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setCollections(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке коллекций:', err);
            setError('Не удалось загрузить коллекции');
        }
        setLoading(false);
    };

    const sortCollections = (cols: Collection[]): Collection[] => {
        let sorted = [...cols];
        switch (sortOption) {
            case 'updated':
                sorted.sort((a, b) => {
                    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'alphabetical':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
        return sorted;
    };

    const filteredCollections = collections.filter(col =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedAndFilteredCollections = sortCollections(filteredCollections);

    const requestDeleteCollection = (collection: Collection) => {
        setCollectionToDelete(collection);
        setConfirmOpen(true);
    };

    const confirmDeleteCollection = async () => {
        if (!collectionToDelete) return;
        try {
            await axios.delete(`/api/collections/${collectionToDelete.collection_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCollections(prev => prev.filter(c => c.collection_id !== collectionToDelete.collection_id));
            setConfirmOpen(false);
            setCollectionToDelete(null);
        } catch (error) {
            console.error('Ошибка удаления коллекции:', error);
            alert('Не удалось удалить коллекцию');
        }
    };

    const pluralizeRecipe = (count: number): string => {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod10 === 1 && mod100 !== 11) return `${count} рецепт`;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} рецепта`;
        return `${count} рецептов`;
    };

    if (loading) {
        return <div className="px-4 py-6 max-w-7xl mx-auto">Загрузка...</div>;
    }

    if (error) {
        return <div className="px-4 py-6 max-w-7xl mx-auto text-red-500">{error}</div>;
    }

    return (
        <div className="px-4 py-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Ваши коллекции</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 ">
                <input
                    type="text"
                    placeholder="Поиск коллекций..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
                />

                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="border border-gray-300 rounded px-3 py-2"
                >
                    <option value="updated">Сортировка: по дате изменения</option>
                    <option value="alphabetical">Сортировка: по алфавиту</option>
                </select>
            </div>


            <div className="mb-4">


                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-10 right-16 bg-[#f98953] hover:bg-[#f18943] text-white font-semibold px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-50"
                >
                    <span className="text-xl">＋</span>
                    <span>Создать коллекцию</span>
                </button>


            </div>


            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Создать коллекцию</h2>
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Название коллекции"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreateCollection}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {sortedAndFilteredCollections.length === 0 ? (
                <p>У вас ещё нет коллекций.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sortedAndFilteredCollections.map((collection) => (
                        <div key={collection.collection_id}>
                            <div className="relative group bg-white rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-center h-24 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                    <img
                                        src={
                                            collection.recipesCount && collection.recipesCount > 0
                                                ? collection.lastRecipeImage || '/default_collection.jpg'
                                                : '/default_collection.jpg'
                                        }
                                        alt="Превью"
                                        className="object-cover h-full w-full rounded-xl"
                                    />

                                </div>


                                <div className="text-center">
                                    <h2 className="text-base font-semibold text-gray-800 mb-1">{collection.name}</h2>
                                    <p className="text-sm text-gray-500">{pluralizeRecipe(collection.recipesCount ?? 0)}</p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        requestDeleteCollection(collection);
                                    }}
                                    className="absolute top-3 right-3 bg-white text-gray-500 hover:text-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                                    title="Удалить"
                                >
                                    <FaTrash size={12} />
                                </button>

                                <Link to={`/collections/${collection.collection_id}`} className="absolute inset-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                title="Удаление коллекции"
                message={`Вы действительно хотите удалить коллекцию «${collectionToDelete?.name}»?`}
                onCancel={() => {
                    setConfirmOpen(false);
                    setCollectionToDelete(null);
                }}
                onConfirm={confirmDeleteCollection}
            />
        </div>
    );
};

export default CollectionsList;
