import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Friend {
    id: number;
    username: string;
    identifier: string;
    friendshipId: number;
}

interface Props {
    userId: number;
    refreshKey: number;
}


const FriendsList: React.FC<Props> = ({ userId,refreshKey}) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRemove = async (friendshipId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/friends/${friendshipId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFriends(friends.filter(f => f.friendshipId !== friendshipId));
        } catch (err) {
            alert('Ошибка при удалении друга');
        }
    };

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/friends/accepted/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(res.data);
            } catch (err) {
                console.error('Ошибка при загрузке друзей:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [userId, refreshKey]);

    if (loading) return <p className="p-4">Загрузка друзей...</p>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Ваши друзья</h2>
            {friends.length === 0 ? (
                <p className="text-gray-500">У вас пока нет друзей</p>
            ) : (
                <ul className="space-y-3">
                    {friends.map(friend => (
                        <li key={friend.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div>
                                <p className="font-medium">{friend.username}</p>
                                <p className="text-sm text-gray-500">{friend.identifier}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(friend.friendshipId)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                                Удалить
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};

export default FriendsList;
