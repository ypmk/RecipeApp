import React from 'react';
import Header from "../components/Header.tsx";
import ShoppingListView from "../components/ShoppingListView.tsx";


const ListsPage: React.FC = () => {
    const someId = 23;
    return (
        <div>
            <Header />
            <ShoppingListView shoppingListId={someId} />
        </div>
    );
};

export default ListsPage;


