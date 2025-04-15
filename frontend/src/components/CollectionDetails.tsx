// CollectionDetails.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {Edit3, Trash2} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useNavigate } from 'react-router-dom';

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
    const [editing, setEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [recipeToRemove, setRecipeToRemove] = useState<Recipe | null>(null);
    const navigate = useNavigate();

    //Запрос удаления рецепта из коллекции
    const requestRemoveRecipe = (recipe: Recipe) => {
        setRecipeToRemove(recipe);
        setConfirmOpen(true);
    };

    //Удаление рецепта из коллекции по подтверждению
    const confirmRemoveRecipe = async () => {
        if (!recipeToRemove) return;
        try {
            await axios.delete(`/api/collections/${recipeToRemove.recipe_id}/collections/${collectionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setConfirmOpen(false);
            setRecipeToRemove(null);
            fetchRecipes();
        } catch (error) {
            console.error('Ошибка при удалении рецепта из коллекции:', error);
            alert('Не удалось удалить рецепт');
        }
    };


    //Удаление коллекции
    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/collections/${collectionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            navigate('/collections'); // или на главную
        } catch (error) {
            console.error('Ошибка при удалении коллекции:', error);
            alert('Не удалось удалить коллекцию');
        }
    };


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


    const handleEditClick = () => {
        setNewName(collection?.name || '');
        setEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            await axios.put(`/api/collections/${collectionId}`, { name: newName }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setCollection((prev) => prev ? { ...prev, name: newName } : prev);
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert('Ошибка при обновлении названия');
        }
    };

    useEffect(() => {
        if (collectionId) {
            fetchRecipes();
            fetchCollectionDetails();
        }
    }, [collectionId]);

    return (
        <div className="px-6 py-6 mx-auto">

        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                {editing ? (
                    <>
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-lg shadow-sm w-full max-w-sm"
                        />
                        <button
                            onClick={handleSaveClick}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-lg font-medium text-white  bg-[#F19953] hover:bg-[#f18953] rounded-md  transition-colors duration-200 shadow-sm"
                            title="Сохранить название"
                        >
                            Сохранить
                        </button>
                    </>
                ) : (
                    <>
                        {collection ? collection.name : ''}
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition shadow-sm"
                            title="Редактировать"
                        >
                            <Edit3 size={22} />
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition shadow-sm"
                            title="Удалить коллекцию"
                        >
                            <Trash2 size={22} />
                        </button>
                    </>
                )}
            </h1>



            {loading && <p>Загрузка рецептов...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && recipes.length === 0 && (
                <p>В этой коллекции пока нет рецептов.</p>
            )}

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6">


            {recipes.map((recipe) => (
                <div
                    key={recipe.recipe_id}
                    className="group relative w-full bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                <Link to={`/recipes/${recipe.recipe_id}`} className="block">
                            <img
                                src={recipe.main_image
                                    ? (recipe.main_image.startsWith('/') ? recipe.main_image : `/${recipe.main_image}`)
                                    : '/default.jpg'
                                }
                                alt={recipe.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold">{recipe.name}</h2>
                            </div>
                        </Link>

                        {/* Всплывающая кнопка-крестик */}
                        <div className="absolute top-2 right-2 hidden group-hover:flex">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    requestRemoveRecipe(recipe);
                                }}
                                className="bg-white text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full p-1 shadow transition"
                                title="Удалить рецепт из коллекции"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>


                ))}
            </div>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Удаление коллекции"
                message={`Вы уверены, что хотите удалить коллекцию «${collection?.name}»?`}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
            <ConfirmModal
                isOpen={confirmOpen}
                title="Удаление рецепта"
                message={`Вы действительно хотите удалить рецепт «${recipeToRemove?.name}» из коллекции?`}
                onCancel={() => {
                    setConfirmOpen(false);
                    setRecipeToRemove(null);
                }}
                onConfirm={confirmRemoveRecipe}
            />
        </div>
    );
};

export default CollectionDetails;
