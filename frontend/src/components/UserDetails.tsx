import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserDetails: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="p-6">
            {user ? (
                <p className="mb-4">Имя: <span className="font-medium">{user.username}</span></p>
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
