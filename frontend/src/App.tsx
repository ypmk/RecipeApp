import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import Collections from "./pages/Collections.tsx";
import Planner from "./pages/Planner.tsx";
import Lists from "./pages/Lists.tsx";
import RecipesList from "./components/RecipesList.tsx";
import './api/axiosConfig'
import RecipeDetailsPage from "./pages/RecipeDetailsPage.tsx";
import CreateRecipe from "./components/CreateRecipe.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";

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
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/collections" element={<Collections />} />

                    <Route path="/planner" element={<Planner />} />
                    <Route path="/lists" element={<Lists />} />

                    <Route path="/recipes" element={<RecipesList />} />
                    <Route path="/recipes/:id" element={<RecipeDetailsPage />} />

                    <Route path="/createRecipe" element={<CreateRecipe />} />

                </Routes>
            </AuthProvider>
        </div>
    );
};

export default App;
