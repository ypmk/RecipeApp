// UserDetails.tsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDetails: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<any[]>([]);

    // Получаем список рецептов пользователя при монтировании компонента
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
            // Собираем все recipe_id из полученного списка рецептов
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
        <div className="p-6">
            {user ? (
                <>
                    <p className="mb-4">
                        Имя: <span className="font-medium">{user.username}</span>
                    </p>
                    <button
                        onClick={handleExport}
                        className="mb-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                        Экспортировать мои рецепты
                    </button>
                </>
            ) : (
                <p className="mb-4 text-red-500">Пользователь не найден</p>
            )}
            <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
                Выйти
            </button>
        </div>
    );
};

export default UserDetails;
