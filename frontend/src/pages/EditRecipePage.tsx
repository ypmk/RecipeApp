import React from 'react';
import Header from "../components/Header.tsx";
import EditRecipe from "../components/EditRecipe.tsx"


const EditRecipePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <EditRecipe/>
        </div>
    );
};

export default EditRecipePage;