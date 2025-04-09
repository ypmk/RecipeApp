import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IngredientInput {
    name: string;
    quantity: number;
    unit_id: number;
}

interface UnitOption {
    ing_unit_id: number;
    name: string;
}

interface IngredientSuggestion {
    ingredient_id: number;
    name: string;
    unit_id: number;
}

function CreateRecipe() {
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [timeCooking, setTimeCooking] = useState('');
    const [numberOfServings, setNumberOfServings] = useState('');
    const [ingredients, setIngredients] = useState<IngredientInput[]>([
        { name: '', quantity: 1, unit_id: 1 },
    ]);
    const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
    const [ingredientErrors, setIngredientErrors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suggestions, setSuggestions] = useState<IngredientSuggestion[][]>([[]]);
    const [showSuggestions, setShowSuggestions] = useState<boolean[]>([false]);
    const [mainImage, setMainImage] = useState<File | null>(null);

    // Состояние для дополнительных изображений (храним файлы в виде массива)
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get<UnitOption[]>('/api/ingredient-units')
            .then((res) => setUnitOptions(res.data))
            .catch((err) => console.error('Ошибка загрузки единиц:', err));
    }, []);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: 1, unit_id: 1 }]);
        setIngredientErrors([...ingredientErrors, '']);
        setSuggestions([...suggestions, []]);
        setShowSuggestions([...showSuggestions, false]);
    };

    const handleRemoveIngredient = (index: number) => {
        if (ingredients.length === 1) return;
        setIngredients(ingredients.filter((_, i) => i !== index));
        setIngredientErrors(ingredientErrors.filter((_, i) => i !== index));
        setSuggestions(suggestions.filter((_, i) => i !== index));
        setShowSuggestions(showSuggestions.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (index: number, field: keyof IngredientInput, value: any) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = field === 'quantity' ? Number(value) : value;
        setIngredients(newIngredients);
    };

    const handleNameChange = async (index: number, value: string) => {
        handleIngredientChange(index, 'name', value);
        setShowSuggestions((prev) => {
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
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.get<IngredientSuggestion[]>(
                `/api/ingredients/search?q=${encodeURIComponent(value)}`,
                { headers }
            );

            const updated = [...suggestions];
            updated[index] = res.data;
            setSuggestions(updated);
        } catch (err) {
            console.error('Ошибка автоподстановки:', err);
        }
    };

    const handleSuggestionClick = (index: number, suggestion: IngredientSuggestion) => {
        const newIngredients = [...ingredients];
        newIngredients[index].name = suggestion.name;
        newIngredients[index].unit_id = suggestion.unit_id;
        setIngredients(newIngredients);

        const updatedShow = [...showSuggestions];
        updatedShow[index] = false;
        setShowSuggestions(updatedShow);
    };

    // Обработчик выбора главного изображения
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setMainImage(e.target.files[0]);
        }
    };

    // Обработчик выбора дополнительных изображений
    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAdditionalImages(prev => [...prev, ...newFiles]);
            e.target.value = "";
        }
    };



    // Обработчик отправки формы создания рецепта
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        setIngredientErrors([]);

        // Проверка на дубли ингредиентов
        const ingredientNames = ingredients.map((ing) => ing.name.trim().toLowerCase());
        const duplicates = ingredientNames.filter((name, idx) => ingredientNames.indexOf(name) !== idx);
        if (duplicates.length > 0) {
            setError(`Ингредиенты не должны повторяться: ${[...new Set(duplicates)].join(', ')}`);
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Формируем FormData для отправки рецепта с главным изображением
            const formData = new FormData();
            formData.append('name', name);
            formData.append('instructions', instructions);
            if (timeCooking) formData.append('time_cooking', timeCooking);
            if (numberOfServings) formData.append('number_of_servings', numberOfServings);
            if (mainImage) {
                formData.append('main_image', mainImage);
            }

            // Создаём рецепт
            const recipeRes = await axios.post('/api/recipes', formData, { headers });
            const recipeId = recipeRes.data.recipe_id;

            // Отправляем ингредиенты, связанные с рецептом
            for (let i = 0; i < ingredients.length; i++) {
                const { name, quantity, unit_id } = ingredients[i];
                if (!name.trim()) continue;
                try {
                    await axios.post(
                        `/api/recipes/${recipeId}/ingredients`,
                        { name, quantity, unit_id },
                        { headers }
                    );
                } catch (err: any) {
                    // Обработка ошибок для ингредиентов (можно собрать ошибки, если требуется)
                    console.error(`Ошибка с ингредиентом "${name}":`, err);
                }
            }

            // Если выбраны дополнительные изображения, отправляем их на сервер сразу после создания рецепта
            if (additionalImages.length > 0) {
                const imagesFormData = new FormData();
                additionalImages.forEach(file => {
                    imagesFormData.append('images', file);
                });
                await axios.post(`/api/recipes/${recipeId}/images`, imagesFormData, { headers });
            }

            setSuccess('Рецепт успешно создан!');
            setName('');
            setInstructions('');
            setTimeCooking('');
            setNumberOfServings('');
            setIngredients([{ name: '', quantity: 1, unit_id: 1 }]);
            setSuggestions([[]]);
            setShowSuggestions([false]);
            setMainImage(null);
            setAdditionalImages([]);
            setIsSubmitting(false);
            navigate('/main');
        } catch (err) {
            console.error(err);
            setError('Ошибка при создании рецепта');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-extrabold text-center mb-6">Создание рецепта</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Название рецепта"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />

                <textarea
                    placeholder="Инструкции"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />

                {/* Блок загрузки главного изображения */}
                <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">Главное изображение</label>
                    {/* Скрытый input */}
                    <input
                        id="mainImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                    />
                    {/* Если главное изображение не выбрано – показываем пустое поле с плюсом */}
                    {!mainImage ? (
                        <label
                            htmlFor="mainImageInput"
                            className="
                                cursor-pointer
                                inline-flex
                                items-center
                                justify-center
                                w-36
                                h-36
                                border-2
                                border-dashed
                                border-gray-300
                                rounded-md
                              "
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                    ) : (
                        <div className="mt-2 relative inline-block">
                            <img
                                src={URL.createObjectURL(mainImage)}
                                alt="Миниатюра главного изображения"
                                className="w-24 h-24 object-cover rounded"
                            />
                            <button
                                type="button"
                                onClick={() => setMainImage(null)}
                                className="
                                                absolute top-1 right-1
                                                bg-red-600 text-white
                                                w-6 h-6 flex items-center justify-center
                                                rounded-full shadow hover:bg-red-700 transition-colors
                                              "title="Удалить изображение"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                </div>




                <div className="flex gap-4">
                    <input
                        type="number"
                        placeholder="Время (мин)"
                        value={timeCooking}
                        onChange={(e) => setTimeCooking(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="number"
                        placeholder="Порции"
                        value={numberOfServings}
                        onChange={(e) => setNumberOfServings(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>



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
                                        onChange={(e) => handleNameChange(index, e.target.value)}
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
                                            {suggestions[index].map((sugg) => (
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
                                    type="number"
                                    min={0}
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
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

                            {ingredientErrors[index] && (
                                <div className="text-red-500 text-sm mt-1">{ingredientErrors[index]}</div>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="mt-2 px-4 py-2 text-sm bg-orange-100 hover:bg-orange-200 rounded-lg"
                    >
                        ➕ Добавить ингредиент
                    </button>
                </div>


                <div className="mb-4">
                    <label className="block font-semibold text-gray-700 mb-2">
                        Дополнительные изображения
                    </label>
                    <div className="flex items-center gap-4">
                        {/* Стилизованный label с пустым полем и кнопкой "плюс" */}
                        <label
                            htmlFor="additionalImagesInput"
                            className="
                                cursor-pointer
                                inline-flex
                                items-center
                                justify-center
                                w-36
                                h-36
                                border-2
                                border-dashed
                                border-gray-300
                                rounded-md
                              "
                        >
                            <span className="text-4xl text-gray-400">+</span>
                        </label>
                        {/* Скрытый input */}
                        <input
                            id="additionalImagesInput"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            className="hidden"
                        />
                    </div>
                    {/* Превью выбранных дополнительных изображений */}
                    {additionalImages.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            {additionalImages.map((file, index) => {
                                const preview = URL.createObjectURL(file);
                                return (
                                    <div key={index} className="relative w-24 h-24">
                                        <img
                                            src={preview}
                                            alt={`Доп. изображение ${index + 1}`}
                                            className="w-full h-full object-cover rounded-md border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAdditionalImages(prev => prev.filter((_, i) => i !== index))
                                            }
                                            className="
                                                absolute top-1 right-1
                                                bg-red-600 text-white
                                                w-6 h-6 flex items-center justify-center
                                                rounded-full shadow hover:bg-red-700 transition-colors
                                              "
                                            title="Удалить изображение"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>






                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-2 rounded-lg transition duration-200 ${
                        isSubmitting ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                >
                    {isSubmitting ? 'Создание...' : 'Создать рецепт'}
                </button>
            </form>

            {error && <div className="text-red-500 mt-4 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 mt-4 text-sm text-center">{success}</div>}
        </div>
    );
}

export default CreateRecipe;
