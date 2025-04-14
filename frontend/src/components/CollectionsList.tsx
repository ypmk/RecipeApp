// CollectionsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';


// Интерфейс для коллекции. Предполагается наличие поля updatedAt и, возможно, lastRecipeImage.
interface Collection {
    collection_id: number;
    name: string;
    lastRecipeImage?: string | null;
    updatedAt?: string;
    recipes?: {
        id: number;
        name: string;
        image: string;
    }[];
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

    // Функция загрузки коллекций пользователя
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

    useEffect(() => {
        fetchCollections();
    }, []);

    // Функция сортировки коллекций в зависимости от выбранного варианта
    const sortCollections = (cols: Collection[]): Collection[] => {
        let sorted = [...cols];
        switch (sortOption) {
            case 'updated':
                sorted.sort((a, b) => {
                    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                    return dateB - dateA; // новые сверху
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

    // Фильтрация коллекций по названию
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



    if (loading) {
        return <div className="px-4 py-6 max-w-7xl mx-auto">Загрузка...</div>;
    }

    if (error) {
        return <div className="px-4 py-6 max-w-7xl mx-auto text-red-500">{error}</div>;
    }

    return (
        <div className="px-4 py-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Мои альбомы (коллекции)</h1>

            {/* Форма поиска и сортировки */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
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

            {sortedAndFilteredCollections.length === 0 ? (
                <p>У вас ещё нет коллекций.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">

                {sortedAndFilteredCollections.map((collection,) => (
                        <div
                            key={collection.collection_id}
                            className="relative group bg-gray-100 hover:bg-gray-200 rounded-lg aspect-square w-32 sm:w-36 md:w-40 flex items-center justify-center text-center p-2 shadow-sm transition duration-150 ease-in-out"
                        >
                            <Link
                                to={`/collections/${collection.collection_id}`}
                                className="absolute inset-0 flex items-center justify-center px-2"
                            >
                                <h2 className="text-xs sm:text-sm font-medium text-gray-800 break-words text-center group-hover:scale-105 transition">
                                    {collection.name}
                                </h2>
                            </Link>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    requestDeleteCollection(collection);
                                }}
                                className="absolute top-1.5 right-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                                title="Удалить"
                            >
                                <FaTrash size={10} />
                            </button>
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
