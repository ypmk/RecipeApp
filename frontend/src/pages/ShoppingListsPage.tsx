// ShoppingListsPage.tsx
import React from 'react';
import Header from "../components/Header";
import ShoppingListsList from "../components/ShoppingListsList";
import ShoppingListCreateButton from "../components/ShoppingListCreateButton";

const ShoppingListsPage: React.FC = () => {
    return (
        <div>
            <Header />
            <div className="flex items-center gap-6 mt-10 justify-center">
                <h2 className="text-2xl font-bold">Ваши списки покупок</h2>
            </div>
            <main className="max-w-4xl mx-auto px-8 mt-12">
                <ShoppingListsList />
            </main>
            <ShoppingListCreateButton />
        </div>
    );
};

export default ShoppingListsPage;
