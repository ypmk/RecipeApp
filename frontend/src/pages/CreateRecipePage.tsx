import React from 'react';
import Header from "../components/Header.tsx";
import CreateRecipe from "../components/CreateRecipe.tsx";


const CreateRecipePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <CreateRecipe/>
        </div>
    );
};

export default CreateRecipePage;