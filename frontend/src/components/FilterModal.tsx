// components/FilterModal.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export interface FilterParams {
    // Сохраняем время приготовления как id (строка)
    timeCooking: string;
    selectedCollections: number[];
}

interface Collection {
    collection_id: number;
    name: string;
}

interface CookingTimeOption {
    id: number;
    label: string;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterParams) => void;
    initialFilters: FilterParams;
}

const FilterModal: React.FC<FilterModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onApply,
                                                     initialFilters,
                                                 }) => {
    // Локальное состояние инициализируется из initialFilters
    const [timeCooking, setTimeCooking] = useState<string>(initialFilters.timeCooking);
    const [cookingTimeOptions, setCookingTimeOptions] = useState<CookingTimeOption[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<number[]>(initialFilters.selectedCollections);
    const [loadingCollections, setLoadingCollections] = useState<boolean>(false);
    const [loadingCookingTimes, setLoadingCookingTimes] = useState<boolean>(false);

    // При открытии модального окна установить локальные фильтры из initialFilters
    useEffect(() => {
        if (isOpen) {
            setTimeCooking(initialFilters.timeCooking);
            setSelectedCollections(initialFilters.selectedCollections);
        }
    }, [isOpen, initialFilters]);

    // Загружаем коллекции пользователя при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            setLoadingCollections(true);
            axios
                .get('/api/collections', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                })
                .then((res) => {
                    setCollections(res.data);
                    setLoadingCollections(false);
                })
                .catch((err) => {
                    console.error('Ошибка загрузки коллекций:', err);
                    setLoadingCollections(false);
                });
        }
    }, [isOpen]);

    // Загружаем варианты времени приготовления из БД
    useEffect(() => {
        if (isOpen) {
            setLoadingCookingTimes(true);
            axios
                .get<CookingTimeOption[]>('/api/cooking-times', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                })
                .then((res) => {
                    setCookingTimeOptions(res.data);
                    setLoadingCookingTimes(false);
                })
                .catch((err) => {
                    console.error('Ошибка загрузки вариантов времени:', err);
                    setLoadingCookingTimes(false);
                });
        }
    }, [isOpen]);

    const toggleCollection = (id: number) => {
        setSelectedCollections((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setTimeCooking(""); // пустая строка означает отсутствие фильтра по времени
        setSelectedCollections([]);
    };

    const handleApply = () => {
        onApply({ timeCooking, selectedCollections });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-md max-w-lg w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#141C24]">Фильтр рецептов</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Фильтр по времени приготовления */}
                <div>
                    <h3 className="text-lg font-semibold text-[#141C24] mb-2">Время приготовления</h3>
                    {loadingCookingTimes ? (
                        <p>Загрузка вариантов времени...</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {cookingTimeOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setTimeCooking(String(option.id))}
                                    className={`px-4 py-2 rounded-full border ${
                                        timeCooking === String(option.id) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Фильтр по коллекциям */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-[#141C24] mb-2">Коллекция</h3>
                    {loadingCollections ? (
                        <p>Загрузка коллекций...</p>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                            {collections.map((col) => (
                                <label key={col.collection_id} className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedCollections.includes(col.collection_id)}
                                        onChange={() => toggleCollection(col.collection_id)}
                                        className="h-5 w-5 rounded border-gray-300"
                                    />
                                    <span className="text-base text-gray-800">{col.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Кнопки */}
                <div className="mt-6 flex gap-4">
                    <button onClick={resetFilters} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-full">
                        Сбросить
                    </button>
                    <button onClick={handleApply} className="flex-1 bg-blue-500 text-white py-2 rounded-full">
                        Применить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
