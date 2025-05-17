import React, { useState } from 'react';
import axios from 'axios';

interface Props {
    currentUserId: number;
    onFriendAdded: () => void;
}

const FriendSearchForm: React.FC<Props> = ({ currentUserId,onFriendAdded }) => {
    const [identifier, setIdentifier] = useState('');
    const [result, setResult] = useState<null | 'not_found' | 'exists' | 'sent'>(null);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');


        const handleSearchAndSend = async () => {
        setResult(null);
        setUsername('');
        setError('');

        if (!identifier.startsWith('@')) {
            setError('Идентификатор должен начинаться с "@"');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Найти пользователя
            const res = await axios.get(`/api/users/by-identifier/${identifier}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setResult('exists');
            setUsername(res.data.username);

            // Отправить запрос в друзья
            await axios.post(
                '/api/friends/request',
                { requesterId: currentUserId, receiverIdentifier: identifier },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResult('sent');
            onFriendAdded();
        } catch (err: any) {
            if (err.response?.status === 404) {
                setResult('not_found');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Произошла ошибка');
            }
        }
    };

    return (
        <div className="max-w-2xl mt-5 mx-auto bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Добавить друга</h2>
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="@username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <button
                    onClick={handleSearchAndSend}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Найти и добавить
                </button>
            </div>

            {result === 'not_found' && <p className="text-red-500">Пользователь не найден</p>}
            {result === 'exists' && <p className="text-green-600">Пользователь найден: {username}</p>}
            {result === 'sent' && <p className="text-green-700">Запрос отправлен!</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );

};

export default FriendSearchForm;
