// Home.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import AddButton from "../components/AddButton";
import RecipesList from "../components/RecipesList";

const Home: React.FC = () => {

    const [search, setSearch] = useState('');

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <main className="px-4 md:px-40 py-5 flex-1">
                <div className="max-w-[960px] mx-auto">
                    {/* Передаём текущее значение и функцию обновления */}
                    <SearchBar search={search} onSearchChange={setSearch} />
                    <FilterBar />
                    <RecipesList search={search} />
                    <div className="flex justify-end px-5 pb-5">
                        <AddButton />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
