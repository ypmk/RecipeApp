import React from 'react';
import Header from '../components/Header'
import SearchBar from "../components/SearchBar.tsx";
import FilterBar from "../components/FilterBar.tsx";
import AddButton from "../components/AddButton.tsx";
import RecipesList from "../components/RecipesList.tsx";



const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <main className="px-4 md:px-40 py-5 flex-1">
                <div className="max-w-[960px] mx-auto">
                    <SearchBar />
                    <FilterBar />
                    <RecipesList/>
                    <div className="flex justify-end px-5 pb-5">
                        <AddButton />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;


