import React from "react";
import Header from "../components/Header.tsx";
import CollectionDetails from "../components/CollectionDetails.tsx";


const CollectionDetailsPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
            <Header />
            <CollectionDetails/>
        </div>
    );
};

export default CollectionDetailsPage;