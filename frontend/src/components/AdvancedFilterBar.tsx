import React, { useState } from 'react';

export interface FilterState {
    mealTypes: string[];
    collections: string[];
    timeCooking: string;
    activeTime: string;
    verified: boolean;
}

interface AdvancedFilterBarProps {
    initialFilters: FilterState;
    onApply: (filters: FilterState) => void;
}

const mealTypeOptions = ["Завтрак", "Обед", "Ужин", "Перекус"];
const collectionOptions = ["Избранное", "Домашнее", "Летнее", "Восточные блюда"];
const timeCookingOptions = ["до 15 минут", "до 30 минут", "до 45 минут", "1 час", "> 1 часа", "не важно"];
const activeTimeOptions = ["до 5 минут", "до 10 минут", "до 20 минут", "30 минут", "до 40 минут", "до 1 часа", "> 1 часа", "не важно"];

const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({ initialFilters, onApply }) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const toggleOption = (option: string, field: "mealTypes" | "collections") => {
        setFilters((prev) => {
            const set = new Set(prev[field]);
            if (set.has(option)) {
                set.delete(option);
            } else {
                set.add(option);
            }
            return {
                ...prev,
                [field]: Array.from(set),
            };
        });
    };

    const handleSelect = (value: string, field: "timeCooking" | "activeTime") => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetFilters = () => {
        setFilters({
            mealTypes: [],
            collections: [],
            timeCooking: "",
            activeTime: "",
            verified: false,
        });
    };

    const applyFilters = () => {
        onApply(filters);
    };

    return (
        <div className="p-4 bg-white rounded-md shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Фильтр рецептов</h2>

            {/* Тип приема пищи */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Тип приема пищи</h3>
                <div className="flex gap-3 flex-wrap">
                    {mealTypeOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => toggleOption(option, "mealTypes")}
                            className={`px-4 py-2 rounded-full border ${
                                filters.mealTypes.includes(option) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Коллекция */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Коллекция</h3>
                <div className="flex flex-col gap-2">
                    {collectionOptions.map((option) => (
                        <label key={option} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={filters.collections.includes(option)}
                                onChange={() => toggleOption(option, "collections")}
                                className="h-5 w-5"
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Время приготовления */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Время приготовления</h3>
                <div className="flex gap-3 flex-wrap">
                    {timeCookingOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option, "timeCooking")}
                            className={`px-4 py-2 rounded-full border ${
                                filters.timeCooking === option ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Активное время приготовления */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Активное время приготовления</h3>
                <div className="flex gap-3 flex-wrap">
                    {activeTimeOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option, "activeTime")}
                            className={`px-4 py-2 rounded-full border ${
                                filters.activeTime === option ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Проверено */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Проверено</h3>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters((prev) => ({ ...prev, verified: e.target.checked }))}
                        className="h-5 w-5"
                    />
                    <span>Только проверенные вами</span>
                </label>
            </div>

            {/* Кнопки */}
            <div className="mt-6 flex gap-4">
                <button onClick={resetFilters} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-full">
                    Сбросить
                </button>
                <button onClick={applyFilters} className="flex-1 bg-blue-500 text-white py-2 rounded-full">
                    Применить
                </button>
            </div>
        </div>
    );
};

export default AdvancedFilterBar;
