import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Recipe {
    recipe_id: number;
    name: string;
    instructions?: string;
    time_cooking?: number;
    number_of_servings?: number;
}

const RecipeDetails = () => {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        axios
            .get<Recipe>(`/api/recipes/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setRecipe(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-4">Загрузка рецепта...</div>;
    if (!recipe) return <div className="p-4">Рецепт не найден</div>;

    return (
        <div className="px-10 py-6 max-w-4xl mx-auto font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <h1 className="text-3xl font-black text-[#1C160C] mb-4">{recipe.name}</h1>

            {/* Картинка */}
            <div className="w-full aspect-[5/2] rounded-xl overflow-hidden mb-6">
                <img
                    src="/pasta.jpg"
                    alt="Recipe Image"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Ингредиенты */}
            <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3">Ингредиенты:</h2>
            <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
                {['Мука', 'Мука', 'Мука'].map((ingredient, i) => (
                    <div
                        key={i}
                        className="col-span-2 grid grid-cols-subgrid border-t border-t-[#E9DFCE] py-5"
                    >
                        <p className="text-[#A18249] text-sm">{ingredient}</p>
                        <p className="text-[#1C160C] text-sm">150г</p>
                    </div>
                ))}
            </div>

            {/* Инструкции */}
            {recipe.instructions && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Способ приготовления:
                    </h2>
                    <p className="text-[#1C160C] text-base px-4 pt-1 pb-3">
                        {recipe.instructions}
                    </p>
                </>
            )}

            {/* Время приготовления */}
            {recipe.time_cooking && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Время приготовления:
                    </h2>
                    <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#E9DFCE] py-5">
                            <p className="text-[#A18249] text-sm">{recipe.time_cooking}</p>
                            <p className="text-[#1C160C] text-sm">минут</p>
                        </div>
                    </div>
                </>
            )}

            {/* Количество порций */}
            {recipe.number_of_servings && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Количество порций:
                    </h2>
                    <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#E9DFCE] py-5">
                            <p className="text-[#A18249] text-sm">{recipe.number_of_servings}</p>
                            <p className="text-[#1C160C] text-sm"></p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipeDetails;
