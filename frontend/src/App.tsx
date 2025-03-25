import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';
import Collections from "./pages/Collections.tsx";
import Planner from "./pages/Planner.tsx";
import Lists from "./pages/Lists.tsx";

const App: React.FC = () => {
    return (
        <div>
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

            </Routes>
        </div>
    );
};

export default App;
