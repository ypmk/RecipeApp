import React from 'react';
import Header from "../components/Header.tsx";
import RecipeDetails from "../components/RecipeDetails.tsx";


const RecipeDetailsPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <RecipeDetails/>
        </div>
    );
};

export default RecipeDetailsPage;