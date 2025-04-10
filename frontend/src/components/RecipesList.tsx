// RecipesList.tsx
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from './ConfirmModal';

interface Collection {
    collection_id: number;
    name: string;
}

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
    mealType?: string;
    collections?: Collection[];
    cookingTime?: {
        id: number;
        label: string;
    };
}

interface RecipesListProps {
    searchQuery: string;
    filters: {
        timeCooking: string;
        selectedCollections: number[];
    };
}

const RecipesList: React.FC<RecipesListProps> = ({ searchQuery, filters }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

    const requestDeleteRecipe = (recipe: Recipe) => {
        setRecipeToDelete(recipe);
        setConfirmOpen(true);
    };

    const confirmDeleteRecipe = async () => {
        if (!recipeToDelete) return;
        try {
            await axios.delete(`/api/recipes/${recipeToDelete.recipe_id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setRecipes((prev) => prev.filter(r => r.recipe_id !== recipeToDelete.recipe_id));
            setConfirmOpen(false);
            setRecipeToDelete(null);
        } catch (err) {
            console.error('Ошибка удаления:', err);
        }
    };

    const filteredRecipes = recipes.filter(recipe => {
        // Фильтр по названию
        const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Фильтр по времени приготовления
        let matchesCookingTime = true;
        if (filters.timeCooking && filters.timeCooking !== "не важно") {
            const selectedCookingTimeId = Number(filters.timeCooking);
            // Если ассоциация не загружена, recipe.cookingTime может быть undefined
            matchesCookingTime = recipe.cookingTime ? recipe.cookingTime.id === selectedCookingTimeId : false;
        }

        // Фильтр по коллекциям
        let matchesCollections = true;
        if (filters.selectedCollections.length > 0) {
            matchesCollections = Array.isArray(recipe.collections) && recipe.collections.some((col) => {
                const colId = col.collection_id || (col as any).id;
                return filters.selectedCollections.includes(Number(colId));
            });
        }

        return matchesSearch && matchesCookingTime && matchesCollections;
    });


    useEffect(() => {
        if (!user) {
            setRecipes([]);
            return;
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios.get<Recipe[]>('/api/recipes')
            .then((res) => {
                setRecipes(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);



    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredRecipes.map(recipe => (
                    <div key={recipe.recipe_id} className="relative group">
                        <Link to={`/recipes/${recipe.recipe_id}`} className="block rounded-md shadow-sm overflow-hidden">
                            <img
                                src={recipe.main_image}
                                alt={recipe.name}
                                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-2 text-sm">
                                {recipe.name}
                            </div>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                requestDeleteRecipe(recipe);
                            }}
                            className="absolute top-2 right-2 bg-white/80 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white shadow"
                            title="Удалить рецепт"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <ConfirmModal
                isOpen={confirmOpen}
                title="Удаление рецепта"
                message={`Вы действительно хотите удалить рецепт «${recipeToDelete?.name}»?`}
                onCancel={() => {
                    setConfirmOpen(false);
                    setRecipeToDelete(null);
                }}
                onConfirm={confirmDeleteRecipe}
            />
        </div>
    );
};

export default RecipesList;
