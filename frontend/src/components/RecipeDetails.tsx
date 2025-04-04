import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Lightbox from "react-image-lightbox";
import 'react-image-lightbox/style.css';

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
    IngredientUnit?: {
        name: string;
    };
}


// Интерфейс для дополнительных изображений рецепта
interface RecipeImage {
    id: number;
    image_path: string;
}


// Интерфейс для рецепта с ингредиентами
interface Recipe {
    recipe_id: number;
    name: string;
    instructions?: string;
    time_cooking?: number;
    number_of_servings?: number;
    ingredients?: Ingredient[];
    main_image: string;
    images?: RecipeImage[];
}



const RecipeDetails: React.FC = () => {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const recipeId = parseInt(id || '0', 10);

    // Состояния для Lightbox
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [allImages, setAllImages] = useState<string[]>([]);

    useEffect(() => {
        axios
            .get<Recipe>(`/api/recipes/${recipeId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            .then((res) => {
                const data = res.data;
                const images: string[] = [];
                if (data.main_image) {
                    images.push(
                        data.main_image.startsWith('/')
                            ? data.main_image
                            : `/${data.main_image}`
                    );
                }
                if (data.images && data.images.length > 0) {
                    data.images.forEach((img) => {
                        const url = img.image_path.startsWith('/')
                            ? img.image_path
                            : `/${img.image_path}`;
                        images.push(url);
                    });
                }
                console.log('allImages:', images);
                setAllImages(images);
                setRecipe(data);
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

            {/* Главное изображение */}
            <div className="w-full aspect-[5/2] rounded-xl overflow-hidden mb-6">
                <img
                    src={
                        recipe.main_image.startsWith('/')
                            ? recipe.main_image
                            : `/${recipe.main_image}`
                    }
                    alt="Главное изображение рецепта"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                        setPhotoIndex(0);
                        setIsLightboxOpen(true);
                    }}
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
                                {ingredient.RecipesIngredients.quantity}{' '}
                                {ingredient.IngredientUnit?.name ?? ''}
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

            {/* Дополнительные изображения */}
            {recipe.images && recipe.images.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#1C160C] mb-4">
                        Дополнительные изображения
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recipe.images.map((img, index) => {
                            const imageUrl = img.image_path.startsWith('/')
                                ? img.image_path
                                : `/${img.image_path}`;
                            // Сдвигаем индекс на 1, так как главное изображение занимает 0-й индекс
                            const sliderIndex = index + 1;
                            return (
                                <div key={img.id} className="w-full h-32 overflow-hidden rounded-lg">
                                    <img
                                        src={imageUrl}
                                        alt={`Изображение рецепта ${img.id}`}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => {
                                            setPhotoIndex(sliderIndex);
                                            setIsLightboxOpen(true);
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && allImages.length > 0 && (
                <Lightbox
                    mainSrc={allImages[photoIndex]}
                    nextSrc={allImages[(photoIndex + 1) % allImages.length]}
                    prevSrc={allImages[(photoIndex + allImages.length - 1) % allImages.length]}
                    onCloseRequest={() => setIsLightboxOpen(false)}
                    onMovePrevRequest={() =>
                        setPhotoIndex((photoIndex + allImages.length - 1) % allImages.length)
                    }
                    onMoveNextRequest={() =>
                        setPhotoIndex((photoIndex + 1) % allImages.length)
                    }
                    enableZoom={true}
                />
            )}



        </div>
    );
};

export default RecipeDetails;