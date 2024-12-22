import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setApiKey } from '../store/settingsSlice';
import { FaTimes } from 'react-icons/fa';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const currentApiKey = useSelector((state: RootState) => state.settings.apiKey);
  const [apiKey, setApiKeyInput] = useState(currentApiKey || '');

  const handleSave = () => {
    dispatch(setApiKey(apiKey.trim() || null));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2" htmlFor="apiKey">
            Anthropic API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            }`}
            placeholder="Enter your Anthropic API key"
          />
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              Anthropic Console
            </a>
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 