import React from "react";
import Header from "../components/Header.tsx";


const CollectionPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <CollectionPage/>
        </div>
    );
};

export default CollectionPage;