import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import FilterModal, { FilterParams } from './FilterModal';
import { FaPlus } from 'react-icons/fa';

interface Collection {
    collection_id: number;
    name: string;
}

interface CookingTime {
    id: number;
    label: string;
}

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
    cookingTime?: CookingTime;
    collections?: Collection[];
}

interface AddDishModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealPlanId: number;
    dayNumber: number;
    onDishAdded?: () => void;
}

const AddDishModal: React.FC<AddDishModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       mealPlanId,
                                                       dayNumber,
                                                       onDishAdded,
                                                   }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [filters, setFilters] = useState<FilterParams>({ timeCooking: "", selectedCollections: [] });
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);


    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Recipe[]>('/api/recipes', {
                params: { search: searchQuery },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setRecipes(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке рецептов:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (isOpen) {
            fetchRecipes();
        }
    }, [isOpen, searchQuery, filters]);


    const filteredRecipes = recipes.filter(recipe => {

        let matchesTime = true;
        if (filters.timeCooking && filters.timeCooking !== "не важно") {
            const selectedId = Number(filters.timeCooking);
            matchesTime = recipe.cookingTime ? recipe.cookingTime.id === selectedId : false;
        }
        let matchesCollections = true;
        if (filters.selectedCollections.length > 0) {
            matchesCollections = recipe.collections
                ? recipe.collections.some(col => filters.selectedCollections.includes(col.collection_id))
                : false;
        }
        return matchesTime && matchesCollections;
    });

    const handleAddRecipe = async (recipeId: number) => {
        try {
            await axios.post(
                `/api/meal-plans/${mealPlanId}/days/${dayNumber}/recipes`,
                {
                    recipe_id: recipeId,
                    meal_type: 0,
                    quantity: 1,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            if (onDishAdded) {
                onDishAdded();
            }
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении блюда в планер:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-10 bg-black bg-opacity-30 overflow-auto">
            <div className="bg-white rounded-md max-w-3xl w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Выберите блюдо</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E4E9F1] text-[#141C24] text-sm font-bold rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                        </svg>
                        Фильтры
                    </button>
                </div>

                {loading ? (
                    <p>Загрузка рецептов...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredRecipes.map(recipe => (
                            <div key={recipe.recipe_id} className="relative group border rounded-md overflow-hidden">
                                <img
                                    src={recipe.main_image || '/placeholder.jpg'}
                                    alt={recipe.name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <button
                                        onClick={() => handleAddRecipe(recipe.recipe_id)}
                                        className="bg-white rounded-full p-2 shadow hover:bg-gray-200"
                                        title="Добавить блюдо"
                                    >
                                        <FaPlus className="text-blue-500" />
                                    </button>
                                </div>
                                <div className="p-2">
                                    <p className="text-sm font-semibold">{recipe.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isFilterOpen && (
                <FilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    onApply={(newFilters) => setFilters(newFilters)}
                    initialFilters={filters}
                />
            )}
        </div>
    );
};

export default AddDishModal;
