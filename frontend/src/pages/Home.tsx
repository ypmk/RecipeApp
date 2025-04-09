// Home.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import RecipesList from '../components/RecipesList';
import FilterModal, { FilterParams } from '../components/FilterModal';
import { FaFilter } from 'react-icons/fa';
import AddButton from "../components/AddButton.tsx";

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterParams>({ timeCooking: "", selectedCollections: [] });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <main className="px-4 md:px-40 py-5 flex-1">
                <div className="max-w-[960px] mx-auto">
                    <div className="flex items-center justify-between">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#E4E9F1] text-[#141C24] text-sm font-bold rounded-full"
                        >
                            <FaFilter />
                            Фильтры
                        </button>
                    </div>
                    <div className="flex justify-end px-5 pb-5">
                        <AddButton />
                    </div>
                    <RecipesList searchQuery={searchQuery} filters={filters} />
                </div>
            </main>
            {isFilterOpen && (
                <FilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    onApply={(newFilters) => setFilters(newFilters)}
                    initialFilters={filters}
                />
            )}
        </div>
    );
};

export default Home;
