import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import CollectionsListPage from "./pages/CollectionsListPage.tsx";
import RecipesList from "./components/RecipesList.tsx";
import './api/axiosConfig'
import RecipeDetailsPage from "./pages/RecipeDetailsPage.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import EditRecipePage from "./pages/EditRecipePage.tsx";
import CreateRecipePage from "./pages/CreateRecipePage.tsx";
import CollectionDetailsPage from "./pages/CollectionDetailsPage.tsx";
import PlanerPage from "./pages/PlanerPage.tsx";
import PlanerDetailPage from "./pages/PlanerDetailPage.tsx";
import ShoppingListsPage from "./pages/ShoppingListsPage.tsx";
import ListDetailsPage from "./pages/ListDetailsPage.tsx";
import {RequireAuth} from "./context/RequireAuth.tsx";
import UserPage from "./pages/UserPage.tsx";

const App: React.FC = () => {
    return (
        <div>
            <AuthProvider>
                {/*
                <nav style={{ marginBottom: '1rem' }}>
                    <Link to="/">Home</Link> |{' '}
                    <Link to="/login">Login</Link> |{' '}
                    <Link to="/register">Register</Link>
                </nav>
                */}

                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/main" element={
                        <RequireAuth>
                            <Home />
                        </RequireAuth>
                        }
                    />

                    <Route path="/recipes" element={
                        <RequireAuth>
                            <RecipesList searchQuery={''} filters={{
                                timeCooking: '',
                                selectedCollections: []
                                }}
                            />
                        </RequireAuth>
                        }
                    />

                    <Route path="/recipes/:id" element={
                        <RequireAuth>
                            <RecipeDetailsPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/createRecipe" element={
                        <RequireAuth>
                            <CreateRecipePage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/recipes/:id/edit" element={
                        <RequireAuth>
                            <EditRecipePage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/collections" element={
                        <RequireAuth>
                            <CollectionsListPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/collections/:collectionId" element={
                        <RequireAuth>
                            <CollectionDetailsPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/planer/:mealPlanId" element={
                        <RequireAuth>
                            <PlanerDetailPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/planer" element={
                        <RequireAuth>
                            <PlanerPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/lists" element={
                        <RequireAuth>
                            <ShoppingListsPage />
                        </RequireAuth>
                        }
                    />

                    <Route path="/shopping-lists/:shoppingListId" element={
                        <RequireAuth>
                            <ListDetailsPage />
                        </RequireAuth>
                        }
                    />



                    <Route path="/user" element={

                            <UserPage />

                    }
                    />


                </Routes>
            </AuthProvider>
        </div>
    );
};

export default App;
