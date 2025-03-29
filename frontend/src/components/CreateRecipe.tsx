import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    // Автоподстановка
    const [suggestions, setSuggestions] = useState<IngredientSuggestion[][]>([[]]);
    const [showSuggestions, setShowSuggestions] = useState<boolean[]>([false]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        setIngredientErrors([]);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Проверка на дубликаты
            const ingredientNames = ingredients.map((ing) => ing.name.trim().toLowerCase());
            const duplicates = ingredientNames.filter(
                (name, idx) => ingredientNames.indexOf(name) !== idx
            );
            if (duplicates.length > 0) {
                setError(`Ингредиенты не должны повторяться: ${[...new Set(duplicates)].join(', ')}`);
                setIsSubmitting(false);
                return;
            }

            // 1. Создание рецепта
            const recipeRes = await axios.post(
                '/api/recipes',
                {
                    name,
                    instructions,
                    time_cooking: timeCooking ? parseInt(timeCooking, 10) : undefined,
                    number_of_servings: numberOfServings ? parseInt(numberOfServings, 10) : undefined,
                },
                { headers }
            );

            const recipeId = recipeRes.data.recipe_id;
            const errors: string[] = [];

            // 2. Добавление ингредиентов
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
                    if (err?.response?.status === 409) {
                        errors[i] = `Ингредиент "${name}" уже добавлен`;
                    } else {
                        errors[i] = `Ошибка с "${name}"`;
                    }
                }
            }

            if (errors.length > 0) {
                setIngredientErrors(errors);
                setSuccess('Рецепт создан, но с ошибками по ингредиентам');
            } else {
                setSuccess('Рецепт успешно создан!');
            }

            // Очистка формы
            setName('');
            setInstructions('');
            setTimeCooking('');
            setNumberOfServings('');
            setIngredients([{ name: '', quantity: 1, unit_id: 1 }]);
            setSuggestions([[]]);
            setShowSuggestions([false]);
        } catch (err) {
            console.error(err);
            setError('Ошибка при создании рецепта');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-extrabold text-center text-[#1C160C] mb-6">
                Создание рецепта
            </h2>

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

                {/* Ингредиенты */}
                <div>
                    <label className="block font-semibold text-gray-700 mb-2">Ингредиенты</label>

                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="mb-4 grid grid-cols-3 gap-2 relative">
                            {/* Название с автоподстановкой */}
                            <div className="relative col-span-1">
                                <input
                                    type="text"
                                    placeholder="Название"
                                    value={ingredient.name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    onFocus={() =>
                                        setShowSuggestions((prev) => {
                                            const copy = [...prev];
                                            copy[index] = true;
                                            return copy;
                                        })
                                    }
                                    onBlur={() =>
                                        setTimeout(() => {
                                            setShowSuggestions((prev) => {
                                                const copy = [...prev];
                                                copy[index] = false;
                                                return copy;
                                            });
                                        }, 150)
                                    }
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

                            {/* Кол-во */}
                            <input
                                type="number"
                                min={0}
                                value={ingredient.quantity}
                                onChange={(e) =>
                                    handleIngredientChange(index, 'quantity', e.target.value)
                                }
                                className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />

                            {/* Единица измерения */}
                            <select
                                value={ingredient.unit_id}
                                onChange={(e) =>
                                    handleIngredientChange(index, 'unit_id', e.target.value)
                                }
                                className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                {unitOptions.map((unit) => (
                                    <option key={unit.ing_unit_id} value={unit.ing_unit_id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>

                            {ingredientErrors[index] && (
                                <div className="col-span-3 text-red-500 text-sm mt-1">
                                    {ingredientErrors[index]}
                                </div>
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-2 rounded-lg transition duration-200 ${
                        isSubmitting
                            ? 'bg-orange-300 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600'
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
