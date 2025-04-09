// CollectionsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Интерфейс для коллекции. Предполагается наличие поля updatedAt и, возможно, lastRecipeImage.
interface Collection {
    collection_id: number;
    name: string;
    lastRecipeImage?: string | null;
    updatedAt?: string; // ISO-строка даты последнего изменения
}

type SortOption = 'updated' | 'alphabetical';

const CollectionsList: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('updated');
    const [searchQuery, setSearchQuery] = useState<string>('');

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {sortedAndFilteredCollections.map((collection) => (
                        <div
                            key={collection.collection_id}
                            className="bg-white rounded-md shadow p-3 flex flex-col hover:shadow-md transition"
                        >
                            {/* Отображение изображения последнего добавленного рецепта или заглушка */}
                            <Link to={`/collections/${collection.collection_id}`} key={collection.collection_id}>
                                {collection.lastRecipeImage ? (
                                    <img
                                        src={
                                            collection.lastRecipeImage.startsWith('/')
                                                ? collection.lastRecipeImage
                                                : `/${collection.lastRecipeImage}`
                                        }
                                        alt={collection.name}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">Нет изображения</span>
                                    </div>
                                )}

                                <div className="text-center mt-auto">
                                    <h2 className="text-lg font-semibold">{collection.name}</h2>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionsList;
