import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import CollectionsListPage from "./pages/CollectionsListPage.tsx";
import ListsPage from "./pages/ListsPage.tsx";
import RecipesList from "./components/RecipesList.tsx";
import './api/axiosConfig'
import RecipeDetailsPage from "./pages/RecipeDetailsPage.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import EditRecipePage from "./pages/EditRecipePage.tsx";
import CreateRecipePage from "./pages/CreateRecipePage.tsx";
import CollectionDetailsPage from "./pages/CollectionDetailsPage.tsx";
import PlanerPage from "./pages/PlanerPage.tsx";
import PlanerDetailPage from "./pages/PlanerDetailPage.tsx";

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
                    <Route path="/main" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/lists" element={<ListsPage />} />

                    <Route path="/recipes" element={<RecipesList searchQuery={''} filters={{
                        timeCooking: '',
                        selectedCollections: []
                    }} />} />
                    <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
                    <Route path="/createRecipe" element={<CreateRecipePage />} />
                    <Route path="/recipes/:id/edit" element={<EditRecipePage />} />

                    <Route path="/collections" element={<CollectionsListPage />} />
                    <Route path="/collections/:collectionId" element={<CollectionDetailsPage />} />

                    <Route path="/planer/:mealPlanId" element={<PlanerDetailPage />} />
                    <Route path="/planer" element={<PlanerPage />} />

                </Routes>
            </AuthProvider>
        </div>
    );
};

export default App;
