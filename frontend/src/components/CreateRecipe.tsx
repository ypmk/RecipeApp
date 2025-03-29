import React, { useState } from 'react';
import axios from 'axios';

function CreateRecipe() {
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [timeCooking, setTimeCooking] = useState('');
    const [numberOfServings, setNumberOfServings] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

             await axios.post(
                '/api/recipes',
                {
                    name,
                    instructions,
                    time_cooking: timeCooking ? parseInt(timeCooking, 10) : undefined,
                    number_of_servings: numberOfServings ? parseInt(numberOfServings, 10) : undefined,
                },
                { headers }
            );

            setSuccess('Рецепт успешно создан!');
            setName('');
            setInstructions('');
            setTimeCooking('');
            setNumberOfServings('');
        } catch (err) {
            console.error(err);
            setError('Ошибка при создании рецепта');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-extrabold text-center text-[#1C160C] mb-6">
                Создание рецепта
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название рецепта
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Инструкции
                    </label>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Время приготовления (мин.)
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={timeCooking}
                        onChange={(e) => setTimeCooking(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Количество порций
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={numberOfServings}
                        onChange={(e) => setNumberOfServings(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-200"
                >
                    Создать рецепт
                </button>
            </form>

            {error && <div className="text-red-500 mt-4 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 mt-4 text-sm text-center">{success}</div>}
        </div>
    );
}

export default CreateRecipe;
