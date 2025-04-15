import React from 'react';
import Header from "../components/Header";
import UserDetails from "../components/UserDetails.tsx";

const UserPage: React.FC = () => {
    return (
        <div>
            <Header />
            <UserDetails />
        </div>
    );
};

export default UserPage;
