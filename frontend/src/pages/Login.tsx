import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                // Ошибка на сервере или неверные данные
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.message || 'Неверный логин/пароль'}`);
                return;
            }

            // Если всё ок, получаем токен (или другой ответ)
            const data = await response.json();
            // Сохраняем токен, например, в localStorage
            localStorage.setItem('token', data.token);

            // Перенаправляем на домашнюю страницу
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Произошла ошибка при входе.');
        }
    };

    return (
        <div>
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default Login;
