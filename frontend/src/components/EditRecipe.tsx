// EditRecipe.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate} from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface RecipeIngredientInfo {
    quantity: number;
    unit_id: number;
}

interface IngredientInput {
    ingredient_id?: number;
    name: string;
    quantity: number | string;
    unit_id: number;
    [key: string]: string | number | undefined;
}

interface RecipeImage {
    id: number;
    image_path: string;
}

interface Ingredient {
    ingredient_id: number;
    name: string;
    RecipesIngredients: RecipeIngredientInfo;
    IngredientUnit?: {
        name: string;
        ing_unit_id: number;
    };
}

interface CookingTime {
    id: number;
    label: string;
}

interface Recipe {
    recipe_id: number;
    name: string;
    instructions?: string;
    // Старое поле можно оставить для совместимости, но используется cooking_time_id через ассоциацию
    time_cooking?: number;
    number_of_servings?: number;
    main_image: string;
    images?: RecipeImage[];
    ingredients?: Ingredient[];
    // Ассоциация с CookingTime – должна приходить из GET /api/recipes/:id
    cookingTime?: CookingTime;
}

interface UnitOption {
    ing_unit_id: number;
    name: string;
}

interface CookingTimeOption {
    id: number;
    label: string;
}

const EditRecipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const recipeId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    // Состояние для выбора времени приготовления – сохраняем cooking_time_id как строку
    const [cookingTimeId, setCookingTimeId] = useState('');
    const [numberOfServings, setNumberOfServings] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
    const [initialIngredients, setInitialIngredients] = useState<IngredientInput[]>([]);
    const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
    const [suggestions, setSuggestions] = useState<any[][]>([[]]);
    const [showSuggestions, setShowSuggestions] = useState<boolean[]>([false]);
    const [existingAdditionalImages, setExistingAdditionalImages] = useState<RecipeImage[]>([]);
    const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
    const [deletedAdditionalImageIds, setDeletedAdditionalImageIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, ] = useState(false);

    // Состояние для вариантов времени приготовления, загруженных из БД
    const [cookingTimeOptions, setCookingTimeOptions] = useState<CookingTimeOption[]>([]);

    // Эффект загрузки рецепта
    useEffect(() => {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        axios.get<Recipe>(`/api/recipes/${recipeId}`, { headers })
            .then((res) => {
                const data = res.data;
                setRecipe(data);
                setName(data.name);
                setInstructions(data.instructions || '');
                // Если ассоциация cookingTime присутствует – используем её id
                if (data.cookingTime && data.cookingTime.id) {
                    setCookingTimeId(String(data.cookingTime.id));
                } else if (data.time_cooking) {
                    setCookingTimeId(data.time_cooking.toString());
                } else {
                    setCookingTimeId('');
                }
                setNumberOfServings(data.number_of_servings?.toString() || '');
                const ingr = data.ingredients?.map((ing) => ({
                    ingredient_id: ing.ingredient_id,
                    name: ing.name,
                    quantity: ing.RecipesIngredients.quantity,
                    unit_id: Number(ing.RecipesIngredients?.unit_id) || 1,
                })) || [];
                setIngredients(ingr);
                setInitialIngredients(ingr);
                setExistingAdditionalImages(data.images || []);
                setLoading(false);
            })
            .catch(() => {
                setError('Ошибка загрузки рецепта');
                setLoading(false);
            });
    }, [recipeId]);

    // Эффект загрузки единиц измерения
    useEffect(() => {
        axios.get<UnitOption[]>('/api/ingredient-units')
            .then((res) => setUnitOptions(res.data))
            .catch((err) => console.error('Ошибка загрузки единиц:', err));
    }, []);

    // Эффект загрузки вариантов времени приготовления
    useEffect(() => {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        axios.get<CookingTimeOption[]>('/api/cooking-times', { headers })
            .then((res) => {
                setCookingTimeOptions(res.data);
                // Устанавливаем значение по умолчанию только если cookingTimeId ещё не задано
                setCookingTimeId(prev => prev || (res.data.length > 0 ? String(res.data[0].id) : ''));
            })
            .catch((err) => console.error('Ошибка загрузки вариантов времени:', err));
    }, [recipeId]);

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setMainImage(e.target.files[0]);
        }
    };

    const handleDeleteExistingImage = (imageId: number) => {
        setExistingAdditionalImages(prev => prev.filter(img => img.id !== imageId));
        setDeletedAdditionalImageIds(prev => [...prev, imageId]);
    };

    const handleAddIngredient = () => {
        setIngredients(prev => [...prev, { name: '', quantity: 1, unit_id: 1 }]);
        setSuggestions(prev => [...prev, []]);
        setShowSuggestions(prev => [...prev, false]);
    };

    const handleRemoveIngredient = (index: number) => {
        if (ingredients.length === 1) return;
        setIngredients(prev => prev.filter((_, i) => i !== index));
        setSuggestions(prev => prev.filter((_, i) => i !== index));
        setShowSuggestions(prev => prev.filter((_, i) => i !== index));
    };


    const handleIngredientChange = (index: number, field: keyof IngredientInput, value: any) => {
        const newIngredients = [...ingredients];
        if (field === 'quantity') {
            newIngredients[index][field] = value;
        } else {
            newIngredients[index][field] = value;
        }
        setIngredients(newIngredients);
    };

    const handleNameChangeForIngredient = async (index: number, value: string) => {
        handleIngredientChange(index, 'name', value);
        setShowSuggestions(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
        });
        if (!value.trim()) {
            const updated = [...suggestions];
            updated[index] = [];
            setSuggestions(updated);
            return;
        }
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            const res = await axios.get(`/api/ingredients/search?q=${encodeURIComponent(value)}`, { headers });
            const updated = [...suggestions];
            updated[index] = res.data;
            setSuggestions(updated);
        } catch (err) {
            console.error('Ошибка автоподстановки:', err);
        }
    };

    const handleSuggestionClick = (index: number, suggestion: any) => {
        const updated = [...ingredients];
        updated[index].name = suggestion.name;
        updated[index].unit_id = suggestion.unit_id;
        setIngredients(updated);
        const show = [...showSuggestions];
        show[index] = false;
        setShowSuggestions(show);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('instructions', instructions);
            if (cookingTimeId) formData.append('cooking_time_id', cookingTimeId);
            if (numberOfServings) formData.append('number_of_servings', numberOfServings);
            if (mainImage) formData.append('main_image', mainImage);

            await axios.put(`/api/recipes/${recipeId}`, formData, { headers });

            // Обновление ингредиентов
            const deletedIngredients = initialIngredients.filter(
                init => init.ingredient_id && !ingredients.some(curr => curr.ingredient_id === init.ingredient_id)
            );
            for (const ing of deletedIngredients) {
                await axios.delete(`/api/recipes/${recipeId}/ingredients/${ing.ingredient_id}`, { headers });
            }
            for (const ing of ingredients) {
                if (!ing.name.trim()) continue;

                if (ing.ingredient_id) {
                    await axios.put(
                        `/api/recipes/${recipeId}/ingredients/${ing.ingredient_id}`,
                        {
                            name: ing.name,
                            quantity: ing.quantity,
                            unit_id: ing.unit_id,
                        },
                        { headers }
                    );

                } else {
                    await axios.post(`/api/recipes/${recipeId}/ingredients`, ing, { headers });
                }
            }

            // Удаление старых дополнительных изображений
            for (const imageId of deletedAdditionalImageIds) {
                await axios.delete(`/api/recipes/${recipeId}/images/${imageId}`, { headers });
            }
            if (newAdditionalImages.length > 0) {
                const imagesFormData = new FormData();
                newAdditionalImages.forEach(file => imagesFormData.append('images', file));
                await axios.post(`/api/recipes/${recipeId}/images`, imagesFormData, { headers });
            }

            navigate(`/recipes/${recipeId}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при обновлении рецепта');
        }
    };

    if (loading) return <div>Загрузка рецепта...</div>;
    if (!recipe) return <div>Рецепт не найден</div>;

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold mb-4">Редактировать рецепт</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Название рецепта */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-1">Название рецепта</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Название рецепта"
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>

                {/* Инструкции */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-1">Способ приготовления</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Инструкции"
                        className="w-full px-4 py-2 border rounded-lg"
                        rows={4}
                    />
                </div>

                {/* Время приготовления и порции */}
                <div className="flex gap-4">
                    <div className="w-full">
                        <label className="block font-semibold text-gray-700 mb-1">Время приготовления</label>
                        <select
                            value={cookingTimeId}
                            onChange={(e) => setCookingTimeId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Выберите время приготовления</option>
                            {cookingTimeOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full">
                        <label className="block font-semibold text-gray-700 mb-1">Количество порций</label>
                        <input
                            type="number"
                            value={numberOfServings}
                            onChange={(e) => setNumberOfServings(e.target.value)}
                            placeholder="Порции"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Блок главного изображения */}
                <div className="mb-6">
                    <label className="block font-semibold text-gray-700 mb-2">Главное изображение</label>
                    <div className="flex gap-2 items-start flex-wrap">
                        {!mainImage && (
                            <>
                                <label
                                    htmlFor="editMainImageInput"
                                    className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center"
                                >
                                    <span className="text-4xl text-gray-400">+</span>
                                </label>
                                <input
                                    id="editMainImageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                />
                            </>
                        )}
                        {!mainImage && recipe?.main_image && (
                            <div className="relative w-24 h-24">
                                <img
                                    src={recipe.main_image.startsWith('/') ? recipe.main_image : `/${recipe.main_image}`}
                                    alt="Главное изображение"
                                    className="w-full h-full object-cover rounded-md border border-gray-200"
                                />
                                <label
                                    htmlFor="editMainImageInput"
                                    className="absolute top-1 right-1 bg-gray-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow hover:bg-gray-700 cursor-pointer transition-colors"
                                    title="Изменить изображение"
                                >
                                    ✎
                                </label>
                                <input
                                    id="editMainImageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                />
                            </div>
                        )}
                        {mainImage && (
                            <div className="relative w-24 h-24">
                                <img
                                    src={URL.createObjectURL(mainImage)}
                                    alt="Новое главное изображение"
                                    className="w-full h-full object-cover rounded-md border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMainImage(null)}
                                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow hover:bg-red-700 transition-colors"
                                    title="Удалить изображение"
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Блок дополнительных изображений */}
                <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Дополнительные изображения</label>
                    <div className="flex gap-2 flex-wrap">
                        <label
                            htmlFor="editAdditionalImagesInput"
                            className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center"
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        <input
                            id="editAdditionalImagesInput"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                setNewAdditionalImages((prev) => [...prev, ...files]);
                                e.target.value = '';
                            }}
                            className="hidden"
                        />

                        {existingAdditionalImages.map((img) => {
                            const url = img.image_path.startsWith('/') ? img.image_path : `/${img.image_path}`;
                            return (
                                <div key={img.id} className="relative w-24 h-24 rounded-md overflow-hidden">
                                    <img
                                        src={url}
                                        alt={`Доп. изображение ${img.id}`}
                                        className="w-full h-full object-cover border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteExistingImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow hover:bg-red-700 transition-colors"
                                        title="Удалить изображение"
                                    >
                                        &times;
                                    </button>
                                </div>
                            );
                        })}

                        {newAdditionalImages.map((file, index) => {
                            const preview = URL.createObjectURL(file);
                            return (
                                <div key={`new-${index}`} className="relative w-24 h-24 rounded-md overflow-hidden">
                                    <img
                                        src={preview}
                                        alt={`Новое изображение ${index + 1}`}
                                        className="w-full h-full object-cover border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setNewAdditionalImages(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow hover:bg-red-700 transition-colors"
                                        title="Удалить изображение"
                                    >
                                        &times;
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Блок ингредиентов */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-2">Ингредиенты</label>
                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="mb-4">
                            <div className="grid grid-cols-6 gap-2 items-center">
                                <div className="relative col-span-3">
                                    <input
                                        type="text"
                                        placeholder="Название"
                                        value={ingredient.name}
                                        onChange={(e) => handleNameChangeForIngredient(index, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        onFocus={() => {
                                            const copy = [...showSuggestions];
                                            copy[index] = true;
                                            setShowSuggestions(copy);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                const copy = [...showSuggestions];
                                                copy[index] = false;
                                                setShowSuggestions(copy);
                                            }, 150);
                                        }}
                                    />
                                    {showSuggestions[index] && suggestions[index]?.length > 0 && (
                                        <ul className="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full shadow-lg text-sm max-h-40 overflow-y-auto">
                                            {suggestions[index].map((sugg: any) => (
                                                <li
                                                    key={sugg.ingredient_id}
                                                    onClick={() => handleSuggestionClick(index, sugg)}
                                                    className="px-3 py-1 cursor-pointer hover:bg-orange-100"
                                                >
                                                    {sugg.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Кол-во"
                                    inputMode="decimal"
                                    value={ingredient.quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const regex = /^(\d+)?(\.\d{0,2})?$/;
                                        if (value === '' || regex.test(value)) {
                                            handleIngredientChange(index, 'quantity', value);
                                        }
                                    }}
                                    onBlur={() => {
                                        let quantity = ingredient.quantity;
                                        if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) <= 0) {
                                            quantity = '1';
                                        }
                                        handleIngredientChange(index, 'quantity', quantity);
                                    }}
                                    className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />


                                <select
                                    value={ingredient.unit_id}
                                    onChange={(e) => handleIngredientChange(index, 'unit_id', e.target.value)}
                                    className="col-span-1 px-2 py-2 border border-gray-300 rounded-lg"
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit.ing_unit_id} value={unit.ing_unit_id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(index)}
                                    className="text-red-500 px-3 hover:text-red-700"
                                    title="Удалить ингредиент"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex mt-4">
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="px-4 py-2 bg-white text-orange-500 border border-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> <span>Добавить ингредиент</span>
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-2 rounded-lg transition duration-200 ${
                        isSubmitting ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>
        </div>
    );
};

export default EditRecipe;
