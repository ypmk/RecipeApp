import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext.tsx";

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
}

function RecipesList() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setRecipes([]);
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios
            .get<Recipe[]>('/api/recipes')
            .then((res) => {
                console.log('GET /api/recipes =>', res.data);
                setRecipes(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);

    // Функция для удаления рецепта
    const handleDeleteRecipe = async (id: number) => {
        try {
            await axios.delete(`/api/recipes/${id}`);
            // Обновляем список рецептов, исключая удалённый
            setRecipes((prev) => prev.filter((recipe) => recipe.recipe_id !== id));
        } catch (error) {
            console.error("Ошибка удаления рецепта:", error);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Загрузка рецептов...</div>;
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recipes.map((recipe) => (
                    <div key={recipe.recipe_id} className="relative group">
                        {/* Обёртка Link ведёт к подробностям рецепта */}
                        <Link
                            to={`/recipes/${recipe.recipe_id}`}
                            className="block rounded-md shadow-sm overflow-hidden"
                        >
                            <img
                                src={`${recipe.main_image}`}
                                alt={recipe.name}
                                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-2 text-sm">
                                {recipe.name}
                            </div>
                        </Link>
                        {/* Кнопка удаления в правом верхнем углу */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // предотвращает переход по ссылке
                                e.preventDefault();
                                handleDeleteRecipe(recipe.recipe_id);
                            }}
                            className="absolute top-2 right-2 bg-white/80 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white shadow"
                            title="Удалить рецепт"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecipesList;
