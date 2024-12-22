import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { setDownloadDirectory } from '../utils/storage';

interface FolderSelectionModalProps {
  onFolderSelected: () => void;
}

const FolderSelectionModal: React.FC<FolderSelectionModalProps> = ({ onFolderSelected }) => {
  const [folderPath, setFolderPath] = useState('');
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);

  useEffect(() => {
    const restoreDirectoryHandle = async () => {
      try {
        const savedHandle = await window.showDirectoryPicker();
        setDirectoryHandle(savedHandle);
        setFolderPath(savedHandle.name);
        await setDownloadDirectory(savedHandle);
      } catch (error) {
        console.error('Error restoring directory handle:', error);
      }
    };

    const savedFolderPath = localStorage.getItem('selectedFolderPath');
    if (savedFolderPath) {
      setFolderPath(savedFolderPath);
      restoreDirectoryHandle();
    }
  }, []);

  const handleSelectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setFolderPath(handle.name);
      setDirectoryHandle(handle);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleContinue = async () => {
    if (directoryHandle) {
      try {
        await setDownloadDirectory(directoryHandle);
        onFolderSelected();
      } catch (error) {
        console.error('Error setting download directory:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-2xl font-bold mb-4">Select Folder for Thoughts</h2>
        <p className="mb-4">Please select a folder to store your thoughts:</p>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={folderPath}
            readOnly
            className={`flex-grow p-2 rounded-l ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
            }`}
            placeholder="No folder selected"
          />
          <button
            onClick={handleSelectFolder}
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            Select Folder
          </button>
        </div>
        <button
          onClick={handleContinue}
          className={`w-full px-4 py-2 rounded ${
            directoryHandle
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!directoryHandle}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FolderSelectionModal; 