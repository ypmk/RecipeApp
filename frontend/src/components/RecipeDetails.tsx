import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import RecipeCollectionsSelector from './RecipeCollectionsSelector';
import {Bookmark, Edit3, Trash2} from "lucide-react";
import ConfirmModal from "./ConfirmModal.tsx";
import SendRecipeModal from "./SendRecipeModal.tsx";

interface RecipeIngredientInfo {
    quantity: number;
    unitName?: string;
}

interface Ingredient {
    ingredient_id: number;
    name: string;
    RecipesIngredients: RecipeIngredientInfo;
}

interface RecipeImage {
    id: number;
    image_path: string;
}

interface Recipe {
    recipe_id: number;
    name: string;
    instructions?: string;
    time_cooking?: number;
    number_of_servings?: number;
    ingredients?: Ingredient[];
    main_image: string;
    images?: RecipeImage[];
    cookingTime?: {
        id: number;
        label: string;
    };
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

    // Состояние для отображения окна коллекций
    const [showCollections, setShowCollections] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const navigate = useNavigate();

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);



    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/recipes/${recipeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate('/main');
        } catch (error) {
            console.error('Ошибка при удалении рецепта:', error);
            alert('Не удалось удалить рецепт');
        }
    };



    useEffect(() => {
        async function fetchRecipe() {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get<Recipe>(`/api/recipes/${recipeId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
                setAllImages(images);
                setRecipe(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        }
        fetchRecipe();
    }, [recipeId]);

    useEffect(() => {
        if (showCollections) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showCollections]);


    if (loading) return <div className="p-4">Загрузка рецепта...</div>;
    if (!recipe) return <div className="p-4">Рецепт не найден</div>;

    return (
        <div className="px-1 py-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans','Noto_Sans',sans-serif]">
            <div className="flex flex-col-reverse sm:flex-col mb-4 gap-4">
                {/* Название и кнопки — мобильный порядок */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4">
                    <h1 className="text-2xl font-black text-[#1C160C]">{recipe.name}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            title="Удалить рецепт"
                            className="p-2 bg-white border border-gray-300 text-red-700 rounded-lg hover:bg-red-200 transition shadow-sm"
                        >
                            <Trash2 size={20} strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => navigate(`/recipes/${recipe.recipe_id}/edit`)}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-bold rounded-lg hover:bg-gray-100 transition"
                        >
                            <Edit3 size={24} strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => setIsSendModalOpen(true)}
                            title="Отправить пользователю"
                            className="p-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition shadow-sm"
                        >
                            📤
                        </button>

                        <button
                            onClick={() => setShowCollections(true)}
                            title="Добавить в коллекцию"
                            className="p-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition shadow-sm"
                        >
                            <Bookmark size={24} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Главное изображение */}
                <div className="w-full aspect-[5/2] rounded-xl overflow-hidden px-4">
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
            </div>


            {/* Ингредиенты рецепта */}
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
                                {ingredient.RecipesIngredients.unitName ?? ''}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2">Ингредиенты не найдены.</div>
                )}
            </div>

            {recipe.instructions && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Способ приготовления:
                    </h2>
                    <div className="text-[#1C160C] text-base px-4 pt-1 pb-3">
                        {recipe.instructions.split('\n').map((line, idx) =>
                            line.trim() === '' ? <br key={idx} /> : <p key={idx} className="pb-1">{line}</p>
                        )}
                    </div>
                </>
            )}

            {recipe.cookingTime && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Время приготовления:
                    </h2>
                    <p className="text-[#1C160C] text-base px-4 pt-1 pb-3">
                        {recipe.cookingTime.label}
                    </p>
                </>
            )}

            {recipe.number_of_servings && (
                <>
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Количество порций:
                    </h2>
                    <p className="text-[#1C160C] text-base px-4 pt-1 pb-5">
                        {recipe.number_of_servings}
                    </p>
                </>
            )}

            {recipe.images && recipe.images.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-[22px] font-bold text-[#1C160C] px-4 pb-3 pt-5">
                        Дополнительные изображения
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4">
                        {recipe.images.map((img, index) => {
                            const imageUrl = img.image_path.startsWith('/')
                                ? img.image_path
                                : `/${img.image_path}`;
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

            {isLightboxOpen && allImages.length > 0 && (
                <Lightbox
                    mainSrc={allImages[photoIndex]}
                    nextSrc={allImages[(photoIndex + 1) % allImages.length]}
                    prevSrc={
                        allImages[(photoIndex + allImages.length - 1) % allImages.length]
                    }
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

            {/* Модальное окно для работы с коллекциями */}
            {showCollections && (
                <RecipeCollectionsSelector
                    recipeId={recipe.recipe_id}
                    onClose={() => setShowCollections(false)}
                />
            )}
            {/* Подтверждение удаления */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удалить рецепт"
                message={`Вы уверены, что хотите удалить рецепт «${recipe?.name}»?`}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
            {/* Отправка рецепта другому пользователю */}
            {isSendModalOpen && (
                <SendRecipeModal
                    recipeId={recipe.recipe_id}
                    onClose={() => setIsSendModalOpen(false)}
                />
            )}


        </div>
    );
};

export default RecipeDetails;
