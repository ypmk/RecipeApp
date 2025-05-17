import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export interface User {
    id: number;
    username: string;
    role: string;
    identifier: string;
}

interface TokenPayload {
    id: number;
    username: string;
    role: string;
    exp: number;
    identifier?: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    isLoading: false,
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkTokenExpiry = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                await refreshAccessToken();
            } else {
                if (decoded.identifier) {
                    setUser(decoded as User);
                } else {
                    // Идентификатора нет — подгружаем пользователя с бэка
                    await fetchUserFromBackend(token);
                }
            }
        } catch (error) {
            console.error('Ошибка декодирования токена', error);
            setUser(null);
        }

        setIsLoading(false);
    };

    const fetchUserFromBackend = async (token: string) => {
        try {
            const res = await axios.get<User>('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(res.data);
        } catch (error) {
            console.error('Ошибка при загрузке пользователя с сервера:', error);
            setUser(null);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const res = await fetch('/api/refresh-token', {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Не удалось обновить токен');

            const data = await res.json();
            localStorage.setItem('token', data.token);

            const decoded = jwtDecode<TokenPayload>(data.token);
            if (decoded.identifier) {
                setUser(decoded as User);
            } else {
                await fetchUserFromBackend(data.token);
            }
        } catch (err) {
            console.error('Ошибка при обновлении токена', err);
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    useEffect(() => {
        checkTokenExpiry();
        const interval = setInterval(checkTokenExpiry, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
