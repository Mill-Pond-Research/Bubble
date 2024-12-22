import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleDarkMode } from '../store/appSlice';
import { FaSun, FaMoon, FaThList, FaTh, FaPlus, FaSort, FaFolder, FaCog, FaWindowMinimize, FaWindowMaximize, FaWindowClose } from 'react-icons/fa';
import SearchBar from './SearchBar';
import SettingsModal from './SettingsModal';

export type SortMethod = 'newest' | 'oldest' | 'az' | 'za' | 'custom';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCreateNewThought: () => void;
  onLayoutToggle: () => void;
  onSortChange: (method: SortMethod) => void;
  layout: 'list' | 'grid';
  currentSort: SortMethod;
}

declare global {
  interface Window {
    electron?: {
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      openDirectory: () => Promise<void>;
    };
  }
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onCreateNewThought,
  onLayoutToggle,
  onSortChange,
  layout,
  currentSort
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const [showSettings, setShowSettings] = useState(false);

  const buttonBaseClasses = 'rounded-lg transition-colors duration-200 flex items-center justify-center';

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' },
    { value: 'custom', label: 'Custom Order' },
  ];

  const handleMinimize = () => {
    window.electron?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electron?.maximizeWindow();
  };

  const handleClose = () => {
    window.electron?.closeWindow();
  };

  const handleOpenDirectory = () => {
    window.electron?.openDirectory();
  };

  return (
    <header className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 min-w-[120px]">
              <img src="/circle-nodes.svg" alt="Bubble Logo" className="h-8 w-8" />
              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Bubble</span>
            </div>
            <div className="w-[400px]">
              <SearchBar onSearch={onSearch} isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value as SortMethod)}
                className={`${buttonBaseClasses} pl-8 pr-4 py-2 appearance-none cursor-pointer ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FaSort className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm" />
            </div>
            <button
              onClick={onCreateNewThought}
              className={`${buttonBaseClasses} px-4 py-2 ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white font-medium`}
            >
              <FaPlus className="mr-2 text-sm" />
              New Thought
            </button>
            <button
              onClick={onLayoutToggle}
              className={`${buttonBaseClasses} p-2.5 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              aria-label={layout === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
            >
              {layout === 'list' ? <FaTh className="text-lg" /> : <FaThList className="text-lg" />}
            </button>
            <button
              onClick={handleOpenDirectory}
              className={`${buttonBaseClasses} p-2.5 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              aria-label="Open Files Directory"
            >
              <FaFolder className="text-lg" />
            </button>
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`${buttonBaseClasses} p-2.5 ${
                isDarkMode ? 'bg-yellow-400 text-gray-800' : 'bg-gray-800 text-yellow-400'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`${buttonBaseClasses} p-2.5 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              aria-label="Open Settings"
            >
              <FaCog className="text-lg" />
            </button>
            {window.electron && (
              <div className="flex items-center gap-2 ml-4 -mr-2">
                <button
                  onClick={handleMinimize}
                  className={`${buttonBaseClasses} p-2 hover:bg-gray-200`}
                  aria-label="Minimize Window"
                >
                  <FaWindowMinimize className="text-sm" />
                </button>
                <button
                  onClick={handleMaximize}
                  className={`${buttonBaseClasses} p-2 hover:bg-gray-200`}
                  aria-label="Maximize Window"
                >
                  <FaWindowMaximize className="text-sm" />
                </button>
                <button
                  onClick={handleClose}
                  className={`${buttonBaseClasses} p-2 hover:bg-red-500 hover:text-white`}
                  aria-label="Close Window"
                >
                  <FaWindowClose className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
};

export default Header; 