// components/Header.tsx
import {Link} from "react-router-dom";

const Header = () => {
    const navItems = [
        { title: 'Главная', to: '/' },
        { title: 'Коллекции', to: '/collections' },
        { title: 'Планнер', to: '/planner' },
        { title: 'Списки', to: '/lists' },
    ];


    return (
        <header className="flex items-center justify-between border-b border-[#E4E9F1] px-10 py-3">
            <div className="flex items-center gap-4 text-[#141C24]">
                <div className="w-4 h-4 text-current">
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
                <div className="flex gap-2">
                    <Link to="/favorites">
                        <IconButton icon="heart" />
                    </Link>
                    <Link to="/profile">
                        <IconButton icon="user" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

const IconButton = ({ icon }: { icon: 'heart' | 'user' }) => {
    const icons = {
        heart: (
            <svg viewBox="0 0 256 256" className="w-5 h-5" fill="currentColor">
                <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62,62,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62,62,0,0,0,178,32Z" />
            </svg>
        ),
        user: (
            <svg viewBox="0 0 256 256" className="w-5 h-5" fill="currentColor">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0A87.83,87.83,0,0,1,74.08,197.5ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Z" />
            </svg>
        ),
    };

    return (
        <button className="h-10 w-10 rounded-full bg-[#E4E9F1] flex items-center justify-center">
            {icons[icon]}
        </button>
    );
};

export default Header;
