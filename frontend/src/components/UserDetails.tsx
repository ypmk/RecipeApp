import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDetails: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            axios.get('/api/recipes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
                .then(response => {
                    setRecipes(response.data);
                })
                .catch(error => {
                    console.error('Ошибка получения рецептов', error);
                });
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const handleExport = async () => {
        try {
            const recipeIds = recipes.map(recipe => recipe.recipe_id);
            const response = await axios.post(
                '/api/recipes/export-pdf',
                { recipeIds },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/pdf'
                    },
                    responseType: 'arraybuffer',
                }
            );

            const pdfBlob = new Blob([new Uint8Array(response.data)], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'recipes.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Ошибка экспорта рецептов', error);
        }
    };

    return (
        <div className="p-6 sm:p-10 text-left">
            {user ? (
                <>
                    <h1 className="text-2xl font-bold mb-2">
                        Привет, {user.username} <span role="img" aria-label="wave">👋</span>
                    </h1>
                    <p className="text-gray-500 text-base sm:text-lg mb-2">
                        Добро пожаловать в личный кабинет
                    </p>
                    <p className="text-gray-500 text-base sm:text-lg mb-4">
                        Ваш идентификатор: <span className="font-medium text-[#1C160C]">{user.identifier}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full max-w-md">
                        <button
                            onClick={handleExport}
                            className="w-full sm:w-auto px-5 py-3 text-base font-semibold rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                        >
                            Экспортировать рецепты
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto px-5 py-3 text-base font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                        >
                            Выйти
                        </button>
                    </div>

                </>
            ) : (
                <p className="mb-4 text-red-500">Пользователь не найден</p>
            )}
        </div>
    );


};

export default UserDetails;
