import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

// Описываем поля, которые приходят из бэкенда
interface Recipe {
    recipe_id: number;
    name: string;
    // Можно добавить другие поля (instructions, time_cooking и т.д.)
}

function RecipesList() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        // Если нужно, добавьте токен в заголовок:
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

        axios.get<Recipe[]>('/api/recipes')
            .then((res) => {
                console.log('GET /api/recipes =>', res.data);
                setRecipes(res.data);  // res.data должен быть массивом рецептов
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-4 text-center">Загрузка рецептов...</div>;
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recipes.map((recipe) => (
                    <Link
                        to={`/recipes/${recipe.recipe_id}`}
                        key={recipe.recipe_id}
                        className="group relative block rounded-md shadow-sm overflow-hidden"
                    >
                        <img
                            src="pasta.jpg"
                            alt={recipe.name}
                            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Полупрозрачная подложка с названием внизу */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-2 text-sm">
                            {recipe.name}
                        </div>
                    </Link>

                ))}
            </div>
        </div>
    );
}

export default RecipesList;
