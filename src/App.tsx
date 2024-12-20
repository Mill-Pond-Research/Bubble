import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setThoughts, addThought, updateThought, selectSelectedTag } from './store/thoughtsSlice';
import { Thought } from './store/thoughtsSlice';
import ThoughtList from './components/ThoughtList';
import ThoughtSaver from './components/ThoughtSaver';
import { loadThoughts, saveThoughtAsMarkdown } from './utils/storage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import FolderSelectionModal from './components/FolderSelectionModal';
import './styles/index.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const thoughts = useSelector((state: RootState) => state.thoughts.thoughts);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const selectedTag = useSelector(selectSelectedTag);
  const [showFolderModal, setShowFolderModal] = useState(true);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [isCreatingNewThought, setIsCreatingNewThought] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedThoughts = await loadThoughts();
        dispatch(setThoughts(savedThoughts));
      } catch (error) {
        console.error('Error initializing app:', error);
        // You might want to show an error message to the user here
      }
    };

    if (!showFolderModal) {
      initializeApp();
    }
  }, [dispatch, showFolderModal]);

  const handleFolderSelected = () => {
    setShowFolderModal(false);
  };

  const handleSaveThought = async (title: string, body: string, tags: string[]) => {
    const newThought: Thought = {
      id: editingThought ? editingThought.id : Date.now().toString(),
      title,
      body,
      tags,
      createdAt: editingThought ? editingThought.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingThought) {
      dispatch(updateThought(newThought));
    } else {
      dispatch(addThought(newThought));
    }

    await saveThoughtAsMarkdown(newThought);
    setEditingThought(null);
    setIsCreatingNewThought(false);
  };

  const handleEditThought = (thought: Thought) => {
    setEditingThought(thought);
    setIsCreatingNewThought(false);
    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCancelEdit = () => {
    setEditingThought(null);
    setIsCreatingNewThought(false);
  };

  const handleCreateNewThought = () => {
    setIsCreatingNewThought(true);
    setEditingThought(selectedTag ? { id: '', title: '', body: '', tags: [selectedTag], createdAt: '', updatedAt: '' } : null);
    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ErrorBoundary>
      <div className={`app min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <Header />
        <div className="main-content flex">
          <Sidebar />
          <div className="flex-grow p-6">
            {(isCreatingNewThought || editingThought) && (
              <ThoughtSaver
                onSave={handleSaveThought}
                thoughtToEdit={editingThought}
                onCancelEdit={handleCancelEdit}
              />
            )}
            {!isCreatingNewThought && !editingThought && (
              <button
                onClick={handleCreateNewThought}
                className={`mb-4 px-4 py-2 font-bold text-white rounded-full ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors`}
              >
                Create New Thought {selectedTag && `with tag "${selectedTag}"`}
              </button>
            )}
            <ThoughtList onEditThought={handleEditThought} />
          </div>
        </div>
        {showFolderModal && <FolderSelectionModal onFolderSelected={handleFolderSelected} />}
      </div>
    </ErrorBoundary>
  );
};

export default App; 