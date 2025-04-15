import React, {JSX, useContext} from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user, setUser } = useContext(AuthContext);
    const location = useLocation();

    // Проверка срока действия токена прямо здесь
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                // Токен истёк — удаляем его и сбрасываем пользователя
                localStorage.removeItem('token');
                setUser(null);
                return <Navigate to="/login" state={{ from: location }} replace />;
            }
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
