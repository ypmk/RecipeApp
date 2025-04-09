import React from 'react';
import Header from "../components/Header.tsx";
import CollectionsList from "../components/CollectionsList.tsx";


const CollectionsListPage: React.FC = () => {
    return (
        <div>
            <Header />
            <CollectionsList />
        </div>
    );
};

export default CollectionsListPage;


