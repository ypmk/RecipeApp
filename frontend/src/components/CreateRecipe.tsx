import React, { useState } from 'react';
import axios from 'axios';

function CreateRecipe() {
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [timeCooking, setTimeCooking] = useState('');
    const [numberOfServings, setNumberOfServings] = useState('');
    const [ingredients, setIngredients] = useState<string[]>(['']);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [ingredientErrors, setIngredientErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, '']);
        setIngredientErrors([...ingredientErrors, '']);
    };

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // ⛔ Предотвращаем повторную отправку
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        setIngredientErrors([]);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Проверка на дубликаты в списке ингредиентов
            const duplicates = ingredients.filter((item, idx) => ingredients.indexOf(item) !== idx);
            if (duplicates.length > 0) {
                setError(`Ингредиенты не должны повторяться: ${duplicates.join(', ')}`);
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

            // 2. Добавление ингредиентов
            const errors: string[] = [];
            for (let i = 0; i < ingredients.length; i++) {
                const ingredientName = ingredients[i];
                if (!ingredientName.trim()) continue;

                try {
                    await axios.post(
                        `/api/recipes/${recipeId}/ingredients`,
                        {
                            name: ingredientName,
                            unit_id: 1, // временно хардкод
                            quantity: 1,
                        },
                        { headers }
                    );
                } catch (err: any) {
                    if (err?.response?.status === 409) {
                        errors[i] = `Ингредиент "${ingredientName}" уже добавлен`;
                    } else {
                        errors[i] = `Ошибка с "${ingredientName}"`;
                    }
                }
            }

            if (errors.length > 0) {
                setIngredientErrors(errors);
                setSuccess('Рецепт создан, но с ошибками по ингредиентам');
            } else {
                setSuccess('Рецепт успешно создан!');
            }

            // Очистка
            setName('');
            setInstructions('');
            setTimeCooking('');
            setNumberOfServings('');
            setIngredients(['']);
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Название рецепта</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Инструкции</label>
                    <textarea
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время приготовления</label>
                        <input
                            type="number"
                            value={timeCooking}
                            onChange={(e) => setTimeCooking(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Порций</label>
                        <input
                            type="number"
                            value={numberOfServings}
                            onChange={(e) => setNumberOfServings(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Ингредиенты */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ингредиенты</label>
                    {ingredients.map((ingredient, index) => (
                        <div key={index} className="mb-2">
                            <input
                                type="text"
                                placeholder="Название ингредиента"
                                value={ingredient}
                                onChange={(e) => handleIngredientChange(index, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            {ingredientErrors[index] && (
                                <p className="text-red-500 text-sm mt-1">
                                    {ingredientErrors[index]}
                                </p>
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
