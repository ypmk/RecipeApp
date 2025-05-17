import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface UserInfo {
    username: string;
    identifier: string;
}

interface Friendship {
    id: number;
    requesterId: number;
    receiverId: number;
    status: 'pending' | 'accepted' | 'rejected';
    Requester?: UserInfo;
    Receiver?: UserInfo;
}

interface Props {
    userId: number;
    refreshKey: number;
    onChange: () => void;
}

const FriendRequestsPanel: React.FC<Props> = ({ userId,refreshKey,onChange }) => {
    const [incoming, setIncoming] = useState<Friendship[]>([]);
    const [outgoing, setOutgoing] = useState<Friendship[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/friends/list/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIncoming(res.data.incoming || []);
            setOutgoing(res.data.outgoing || []);
        } catch (err) {
            console.error('Ошибка при загрузке запросов в друзья:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [userId, refreshKey]);

    const handleAction = async (friendshipId: number, action: 'accept' | 'reject') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/friends/${action}`, { friendshipId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchRequests();
            onChange();
        } catch (err) {
            alert('Ошибка при обработке запроса');
        }
    };

    if (loading) return <p className="p-4">Загрузка...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Входящие */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4">Входящие запросы</h2>
                {incoming.length === 0 ? (
                    <p className="text-gray-500">Нет входящих запросов</p>
                ) : (
                    incoming.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 bg-gray-50">
                            <div>
                                <p className="font-medium">{req.Requester?.username}</p>
                                <p className="text-sm text-gray-500">{req.Requester?.identifier}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(req.id, 'accept')}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                >
                                    Принять
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Отклонить
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Исходящие */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4">Исходящие запросы</h2>
                {outgoing.length === 0 ? (
                    <p className="text-gray-500">Нет исходящих запросов</p>
                ) : (
                    outgoing.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 bg-gray-50">
                            <div>
                                <p className="font-medium">{req.Receiver?.username}</p>
                                <p className="text-sm text-gray-500">{req.Receiver?.identifier}</p>
                            </div>
                            <p className="text-sm text-gray-600">Ожидает подтверждения</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

};

export default FriendRequestsPanel;
