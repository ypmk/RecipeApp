import React, { useState } from 'react';
import axios from 'axios';

interface SendRecipeModalProps {
    recipeId: number;
    onClose: () => void;
}


const SendRecipeModal: React.FC<SendRecipeModalProps> = ({ recipeId, onClose }) => {
    const [identifier, setIdentifier] = useState('');
    const [foundUser, setFoundUser] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setFoundUser(null);
        setNotFound(false);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/users/by-identifier/${identifier}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFoundUser(res.data.username); // предположим, что backend вернёт username
        } catch (err) {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/recipes/${recipeId}/send`, {
                receiverIdentifier: identifier,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Рецепт успешно отправлен!');
            onClose();

        } catch (err) {
            alert('Ошибка при отправке рецепта');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    aria-label="Закрыть"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-lg font-bold mb-4">Отправить рецепт</h2>

                <input
                    type="text"
                    placeholder="@username"
                    className="w-full p-2 border rounded mb-3"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-3"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Найти пользователя
                </button>

                {foundUser && <p className="text-green-600">Пользователь найден: {foundUser}</p>}
                {notFound && <p className="text-red-600">Пользователь не найден</p>}


                {foundUser && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSend}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            Отправить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

};

export default SendRecipeModal;
