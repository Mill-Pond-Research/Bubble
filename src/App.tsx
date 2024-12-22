import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setThoughts, addThought, updateThought, deleteThought, selectSelectedTag } from './store/thoughtsSlice';
import { Thought } from './store/thoughtsSlice';
import ThoughtList from './components/ThoughtList';
import ThoughtEditor from './components/ThoughtEditor';
import { loadThoughts, saveThoughtAsMarkdown, deleteThoughtFile } from './utils/storage';
import Header, { SortMethod } from './components/Header';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import FolderSelectionModal from './components/FolderSelectionModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './styles/index.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const thoughts = useSelector((state: RootState) => state.thoughts.thoughts);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const selectedTag = useSelector(selectSelectedTag);
  const [showFolderModal, setShowFolderModal] = useState(true);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [isCreatingNewThought, setIsCreatingNewThought] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [currentSort, setCurrentSort] = useState<SortMethod>('newest');

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

  const handleSaveThought = async (thought: Thought) => {
    if (editingThought) {
      dispatch(updateThought(thought));
    } else {
      dispatch(addThought(thought));
    }

    await saveThoughtAsMarkdown(thought);
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

  const handleDeleteThought = async (thoughtId: string) => {
    const thought = thoughts.find(t => t.id === thoughtId);
    if (thought) {
      try {
        // Update Redux store first
        dispatch(deleteThought(thoughtId));
        // Then handle file system
        await deleteThoughtFile(thought);
      } catch (error) {
        console.error('Error deleting thought:', error);
        // If file operation fails, reload thoughts to ensure UI is in sync
        const loadedThoughts = await loadThoughts();
        dispatch(setThoughts(loadedThoughts));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingThought(null);
    setIsCreatingNewThought(false);
  };

  const handleCreateNewThought = () => {
    setIsCreatingNewThought(true);
    setEditingThought(null);
    // Scroll to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCombineThoughts = (sourceId: string, targetId: string) => {
    const sourceThought = thoughts.find(t => t.id === sourceId);
    const targetThought = thoughts.find(t => t.id === targetId);
    if (sourceThought && targetThought) {
      const combinedThought: Thought = {
        ...targetThought,
        body: `${targetThought.body}\n\n${sourceThought.body}`,
        tags: [...new Set([...targetThought.tags, ...sourceThought.tags])],
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateThought(combinedThought));
      dispatch(deleteThought(sourceId));
      saveThoughtAsMarkdown(combinedThought);
      deleteThoughtFile(sourceThought);
    }
  };

  const handleLayoutToggle = () => {
    setLayout(layout === 'list' ? 'grid' : 'list');
  };

  const handleSortChange = (method: SortMethod) => {
    setCurrentSort(method);
    const sortedThoughts = [...thoughts].sort((a, b) => {
      switch (method) {
        case 'newest':
          return parseInt(b.createdAt) - parseInt(a.createdAt);
        case 'oldest':
          return parseInt(a.createdAt) - parseInt(b.createdAt);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    dispatch(setThoughts(sortedThoughts));
  };

  return (
    <ErrorBoundary isDarkMode={isDarkMode}>
      <DndProvider backend={HTML5Backend}>
        <div className={`app min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <Header
            onSearch={handleSearch}
            onCreateNewThought={handleCreateNewThought}
            onLayoutToggle={handleLayoutToggle}
            onSortChange={handleSortChange}
            layout={layout}
            currentSort={currentSort}
          />
          <div className="flex">
            <Sidebar />
            <main className="flex-grow p-6">
              <div className="max-w-7xl mx-auto">
                {(isCreatingNewThought || editingThought) && (
                  <ThoughtEditor
                    onSave={handleSaveThought}
                    thoughtToEdit={editingThought}
                    onCancelEdit={handleCancelEdit}
                    selectedTag={selectedTag}
                  />
                )}
                <ThoughtList
                  thoughts={thoughts}
                  onEditThought={handleEditThought}
                  onDeleteThought={handleDeleteThought}
                  onCombineThoughts={handleCombineThoughts}
                  searchQuery={searchQuery}
                  selectedTag={selectedTag}
                  layout={layout}
                  sortMethod={currentSort}
                />
              </div>
            </main>
          </div>
          {showFolderModal && <FolderSelectionModal onFolderSelected={handleFolderSelected} />}
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
};

export default App; 