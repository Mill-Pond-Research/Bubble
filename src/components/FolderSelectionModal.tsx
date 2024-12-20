import React from 'react';
import { setDownloadDirectory } from '../utils/storage';

interface FolderSelectionModalProps {
  onFolderSelected: () => void;
}

const FolderSelectionModal: React.FC<FolderSelectionModalProps> = ({ onFolderSelected }) => {
  const handleSelectFolder = async () => {
    try {
      await setDownloadDirectory();
      onFolderSelected();
    } catch (error) {
      console.error('Error selecting folder:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Select Destination Folder</h2>
        <p className="mb-4">Please select a folder where your thoughts will be saved as markdown files.</p>
        <button
          onClick={handleSelectFolder}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Select Folder
        </button>
      </div>
    </div>
  );
};

export default FolderSelectionModal; 