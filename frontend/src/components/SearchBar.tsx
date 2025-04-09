// SearchBar.tsx
import React from 'react';

interface SearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onSearchChange }) => {
    return (
        <div className="px-4 py-3">
            <label className="flex flex-col h-12 w-full">
                <div className="flex items-center bg-[#E4E9F1] rounded-xl h-full">
                    <div className="pl-4 text-[#3F5374]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                        </svg>
                    </div>
                    <input
                        className="flex-1 bg-[#E4E9F1] text-[#141C24] placeholder-[#3F5374] px-4 text-base font-normal focus:outline-none"
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Введите название рецепта..."
                    />
                </div>
            </label>
        </div>
    );
};

export default SearchBar;
