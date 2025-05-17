import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {Earth} from "lucide-react";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(prev => !prev);
    const { user,  } = useContext(AuthContext);
    const location = useLocation();
    const isCreatePage = location.pathname === '/createRecipe';
    const isEditPage = /^\/recipes\/\d+\/edit$/.test(location.pathname);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);




    const navItems = [
        { title: 'Главная', to: '/main' },
        { title: 'Коллекции', to: '/collections' },
        { title: 'Планнер', to: '/planer' },
        { title: 'Списки', to: '/lists' },
    ];

    if (isMobile && (isCreatePage || isEditPage)) return null;


    return (
        <header className="border-b border-[#E4E9F1] px-6 md:px-10 py-3">
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3 text-[#141C24]">
                    <button onClick={toggleMenu} className="md:hidden text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="w-5 h-5">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.58 8.58C5.53 11.63 3.45 15.51 2.61 19.75c-.84 4.23-.41 8.61 1.24 12.6 1.65 4 4.45 7.4 8.03 9.8 3.59 2.39 7.8 3.61 12.12 3.61s8.54-1.22 12.13-3.61c3.58-2.4 6.38-5.8 8.03-9.8 1.65-3.99 2.08-8.37 1.24-12.6-.84-4.24-2.92-8.12-5.97-11.17L24 24 8.58 8.58Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold">Рецепты</h2>
                </div>


                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#141C24]">
                    {navItems.map((item) => (
                        <Link key={item.title} to={item.to}>{item.title}</Link>
                    ))}
                    {user ? (
                        <>
                            <Link to="/friends">
                                <button className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                                    <Earth className="w-5 h-5 text-gray-800" />
                                </button>
                            </Link>

                            <Link to="/user">
                                <button className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A10.97 10.97 0 0112 15c2.43 0 4.663.777 6.435 2.09M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600">Войти</button>
                            </Link>
                            <Link to="/register">
                                <button className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600">Зарегистрироваться</button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            {/* Мобильная версия */}
            {menuOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-[9999] px-4 sm:px-6 py-4 flex flex-col text-lg font-medium text-[#141C24] shadow-md overflow-x-hidden">
                <button
                        onClick={() => setMenuOpen(false)}
                        className="self-end text-gray-800 mb-4"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <Link key={item.title} to={item.to} onClick={() => setMenuOpen(false)}>
                                {item.title}
                            </Link>
                        ))}

                        {user ? (
                            <Link
                                to="/user"
                                onClick={() => setMenuOpen(false)}
                            >
                                Аккаунт
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 w-full">Войти</button>
                                </Link>
                                <Link to="/register">
                                    <button className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600 w-full">Зарегистрироваться</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}


        </header>
    );
};

export default Header;
