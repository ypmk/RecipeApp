import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.message || 'Не удалось зарегистрировать'}`);
                return;
            }

            // Успешная регистрация
            await response.json();
            alert('Регистрация прошла успешно!');

            // Можно сразу логинить пользователя или перенаправить на страницу логина
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при регистрации.');
        }
    };

    return (
        <div className="min-h-screen p-3 flex items-center justify-center bg-gray-50 px-4">

        <div className="flex flex-col sm:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl">

                {/* Левая часть с изображением или заголовком */}
            <div className="w-full sm:w-1/2 bg-amber-500 flex flex-col items-center justify-center p-6 sm:p-10 text-white text-center">

            <h2 className="text-4xl font-bold mb-4">Добро пожаловать!</h2>
                    <p className="text-lg text-center">Создайте аккаунт и начните собирать любимые рецепты</p>
                    <img src="../../public/register_photo.jpg" alt="Food" className="mt-6 rounded-xl shadow-lg" />
                </div>

                {/* Правая часть с формой */}
                <div className="sm:w-1/2 p-8 sm:p-12 bg-white">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Регистрация</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Введите имя"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Введите пароль"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition"
                        >
                            Зарегистрироваться
                        </button>
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Уже есть аккаунт? <a href="/login" className="text-amber-500 hover:underline">Войти</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default Register;
