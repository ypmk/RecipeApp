// components/ConfirmModal.tsx
import React from 'react';

type ConfirmModalProps = {
    isOpen: boolean;
    title?: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-[sans-serif]">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md font-normal">

            {title && <h2 className="text-xl font-bold not-italic mb-4 text-center">{title}</h2>}
                <p className="text-gray-800 font-normal mb-6 text-center">{message}</p>


                <div className="flex justify-center gap-4">
                    <button
                        autoFocus
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 "
                        onClick={onCancel}
                    >
                        Отмена
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                        onClick={onConfirm}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
