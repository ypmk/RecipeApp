import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Интерфейс для связующей записи, содержащей количество
interface RecipeIngredientInfo {
    quantity: number;
}

// Интерфейс для ингредиента
interface Ingredient {
    ingredient_id: number;
    name: string;
    // Связь RecipesIngredients, где хранится количество для этого рецепта
    RecipesIngredients: RecipeIngredientInfo;
}

// Интерфейс для рецепта с ингредиентами
interface Recipe {
    recipe_id: number;
    name: string;
    instructions?: string;
    time_cooking?: number;
    number_of_servings?: number;
    ingredients?: Ingredient[];
}

const RecipeDetails: React.FC = () => {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const recipeId = parseInt(id || '0', 10);

    useEffect(() => {
        axios
            .get<Recipe>(`/api/recipes/${recipeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                console.log('Полученный рецепт:', res.data);
                setRecipe(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [recipeId]);

    if (loading) return <div className="p-4">Загрузка рецепта...</div>;
    if (!recipe) return <div className="p-4">Рецепт не найден</div>;

    return (
        <div className="px-10 py-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans','Noto_Sans',sans-serif]">
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
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient) => (
                        <div
                            key={ingredient.ingredient_id}
                            className="col-span-2 grid grid-cols-subgrid border-t border-t-[#E9DFCE] py-5"
                        >
                            <p className="text-[#A18249] text-sm">{ingredient.name}</p>
                            <p className="text-[#1C160C] text-sm">
                                {ingredient.RecipesIngredients.quantity} г
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2">Ингредиенты не найдены.</div>
                )}
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
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipeDetails;
