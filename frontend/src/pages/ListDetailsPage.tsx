import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "../components/Header.tsx";
import ShoppingListView from "../components/ShoppingListView.tsx";

const ListDetailsPage: React.FC = () => {
    const { shoppingListId } = useParams<{ shoppingListId: string }>();

    const listId = shoppingListId ? parseInt(shoppingListId, 10) : null;
    console.log(listId);
    return (
        <div>
            <Header />
            {listId !== null ? (
                <ShoppingListView shoppingListId={listId} />
            ) : (
                <div className="p-4 text-red-500">Некорректный ID списка покупок</div>
            )}
        </div>
    );
};

export default ListDetailsPage;
