import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from "../context/AuthContext.tsx";
import {jwtDecode} from "jwt-decode";
import type { User } from '../context/AuthContext'

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.message || 'Неверный логин/пароль'}`);
                return;
            }


            const data = await response.json();

            localStorage.setItem('token', data.token);
            const decoded = jwtDecode<User>(data.token);
            setUser(decoded);

            navigate('/main');
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при входе.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 bg-gray-50 px-4">
            <div className="flex flex-col sm:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl">

                {/* Левая часть — приветствие и картинка */}
                <div className="sm:w-1/2 bg-[#f7941d] flex flex-col items-center justify-center p-10 text-white text-center">
                    <h2 className="text-3xl sm:text-3xl font-bold mb-2">
                        С возвращением!
                    </h2>
                    <p className="text-lg sm:text-lg mb-6">
                        Войдите, чтобы продолжить искать и сохранять рецепты
                    </p>


                    <img
                        src="https://cdn-icons-png.flaticon.com/512/135/135763.png"
                        alt="login icon"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl shadow-lg"
                    />

                </div>

                {/* Правая часть — форма логина */}
                <div className="sm:w-1/2 p-6 sm:p-12 bg-white">

                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Вход</h3>
                    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">

                    <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Введите имя"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941d]"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941d]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#f7941d] hover:bg-[#e38312] text-white font-semibold py-3 rounded-lg shadow-md transition"
                        >
                            Войти
                        </button>

                        <p className="text-sm text-gray-500 text-center mt-4">
                            Нет аккаунта?{' '}
                            <a href="/register" className="text-[#f7941d] hover:underline">
                                Зарегистрироваться
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default Login;
