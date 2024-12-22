import React from 'react';

interface DeleteCautionPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCautionPopup: React.FC<DeleteCautionPopupProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
        <h2 className="text-xl font-bold mb-4">Caution</h2>
        <p className="mb-4">
          The thought will be removed from Bubble, but the file will still be accessible locally on your device.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCautionPopup; 