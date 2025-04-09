// RecipesList.tsx
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from './ConfirmModal';
import { FilterParams } from './FilterModal';

interface Collection {
    collection_id: number;
    name: string;
}

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
    mealType?: string;
    time_cooking?: number; // в минутах
    collections?: Collection[];
}

interface RecipesListProps {
    searchQuery: string;
    filters: FilterParams;
}

const RecipesList: React.FC<RecipesListProps> = ({ searchQuery, filters }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
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

    // Простейшая функция для преобразования времени из текста в число (или Infinity)
    const parseTimeLimit = (time: string): number => {
        switch(time) {
            case "5 минут": return 5;
            case "10 минут": return 10;
            case "15 минут": return 15;
            case "30 минут": return 30;
            case "45 минут": return 45;
            case "1 час": return 60;
            case "более часа": return Infinity;
            default: return Infinity;
        }
    };

    const filteredRecipes = recipes.filter(recipe => {
        // Фильтр поиска по названию
        const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
        // Фильтр по времени приготовления
        let matchesTimeCooking = true;
        if (filters.timeCooking && filters.timeCooking !== "не важно" && recipe.time_cooking !== undefined) {
            const limit = parseTimeLimit(filters.timeCooking);
            matchesTimeCooking = recipe.time_cooking <= limit;
        }
        // Фильтр по коллекциям: если выбраны какие-либо коллекции, проверяем, принадлежит ли рецепт хотя бы одной из них
        let matchesCollections = true;
        if (filters.selectedCollections.length > 0) {
            matchesCollections = recipe.collections !== undefined &&
                filters.selectedCollections.some(selId =>
                    recipe.collections!.some(col => col.collection_id === selId)
                );
        }
        return matchesSearch && matchesTimeCooking && matchesCollections;
    });

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
