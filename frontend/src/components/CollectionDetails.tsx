// CollectionDetails.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

interface Recipe {
    recipe_id: number;
    name: string;
    main_image: string;
}

interface Collection {
    collection_id: number;
    name: string;
}

const CollectionDetails: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Запрос рецептов коллекции по её ID
    const fetchRecipes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/collections/${collectionId}/recipes`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setRecipes(response.data);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить рецепты коллекции');
        }
        setLoading(false);
    };

    // Запрос деталей коллекции (например, название)
    const fetchCollectionDetails = async () => {
        try {
            const response = await axios.get('/api/collections', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const allCollections: Collection[] = response.data;

            const found = allCollections.find((col) => col.collection_id === Number(collectionId));
            if (found) {
                setCollection(found);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (collectionId) {
            fetchRecipes();
            fetchCollectionDetails();
        }
    }, [collectionId]);

    return (
        <div className="px-4 py-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                {collection ? collection.name : ``}
            </h1>

            {loading && <p>Загрузка рецептов...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && recipes.length === 0 && (
                <p>В этой коллекции пока нет рецептов.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <div key={recipe.recipe_id} className="bg-white rounded-md shadow overflow-hidden hover:shadow-lg transition">
                        <Link to={`/recipes/${recipe.recipe_id}`}>
                            <img
                                src={recipe.main_image.startsWith('/') ? recipe.main_image : `/${recipe.main_image}`}
                                alt={recipe.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold">{recipe.name}</h2>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollectionDetails;
