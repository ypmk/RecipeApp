import {useContext, useState} from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const { user, setUser } = useContext(AuthContext);


    const navItems = [
        { title: 'Главная', to: '/main' },
        { title: 'Коллекции', to: '/collections' },
        { title: 'Планнер', to: '/planer' },
        { title: 'Списки', to: '/lists' },
    ];

    return (
        <header className="flex items-center justify-between border-b border-[#E4E9F1] px-10 py-3">
            <div className="flex items-center gap-4 text-[#141C24]">
                <div className="w-4 h-4">
                    {/* Логотип */}
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8.58 8.58C5.53 11.63 3.45 15.51 2.61 19.75c-.84 4.23-.41 8.61 1.24 12.6 1.65 4 4.45 7.4 8.03 9.8 3.59 2.39 7.8 3.61 12.12 3.61s8.54-1.22 12.13-3.61c3.58-2.4 6.38-5.8 8.03-9.8 1.65-3.99 2.08-8.37 1.24-12.6-.84-4.24-2.92-8.12-5.97-11.17L24 24 8.58 8.58Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Рецепты</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
                <nav className="flex items-center gap-9 text-sm font-medium text-[#141C24]">
                    {navItems.map((item) => (
                        <Link key={item.title} to={item.to}>
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-4 text-sm font-medium">
                    {user ? (
                        <Link to="/user">
                            <button
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full focus:outline-none"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5 text-gray-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5.121 17.804A10.97 10.97 0 0112 15c2.43 0 4.663.777 6.435 2.09M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition">
                                    Войти
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600 transition">
                                    Зарегистрироваться
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
