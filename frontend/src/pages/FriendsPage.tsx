import React, {useContext, useState} from 'react';
import Header from "../components/Header";
import FriendRequestsPanel from "../components/FriendRequestsPanel";
import { AuthContext } from "../context/AuthContext";
import FriendSearchForm from "../components/FriendSearchForm";
import FriendsList from "../components/FriendsList.tsx";


const FriendsPage: React.FC = () => {
    const { user, isLoading } = useContext(AuthContext);
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshAll = () => setRefreshKey(prev => prev + 1);


    if (isLoading) return <p className="p-4">Загрузка...</p>;

    return (
        <div>
            <Header />
            <FriendSearchForm currentUserId={user!.id} onFriendAdded={refreshAll} />
            <FriendRequestsPanel userId={user!.id} refreshKey={refreshKey} onChange={refreshAll} />
            <FriendsList userId={user!.id} refreshKey={refreshKey} />

        </div>
    );
};


export default FriendsPage;
