import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

export interface User {
    id: number;
    username: string;
    role: string;
}

interface TokenPayload extends User {
    exp: number;
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

    const checkTokenExpiry = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<TokenPayload>(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    refreshAccessToken();
                } else {
                    setUser(decoded);
                }

            } catch (error) {
                console.error('Ошибка декодирования токена', error);
                setUser(null);
            }
        }
        setIsLoading(false);
    };

    const refreshAccessToken = async () => {
        try {
            const res = await fetch('/api/refresh-token', {
                method: 'POST',
                credentials: 'include' // ВАЖНО! чтобы куки отправились
            });

            if (!res.ok) {
                throw new Error('Не удалось обновить токен');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            const decoded = jwtDecode<TokenPayload>(data.token);
            setUser(decoded);
        } catch (err) {
            console.error('Ошибка при обновлении токена', err);
            localStorage.removeItem('token');
            setUser(null);
        }
    };


    useEffect(() => {
        checkTokenExpiry();
        // Периодическая проверка, например, каждую минуту
        const interval = setInterval(checkTokenExpiry, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>

    );
};
