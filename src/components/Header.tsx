import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleDarkMode } from '../store/appSlice';
import { setSearchQuery } from '../store/thoughtsSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <header className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-circle-nodes text-2xl mr-2 text-blue-500"></i>
          <h1 className="text-2xl font-bold">Bubble</h1>
        </div>
        <div className="flex-grow mx-4">
          <input
            type="text"
            placeholder="Search thoughts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full px-3 py-2 text-sm leading-tight ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
            } border rounded shadow appearance-none focus:outline-none focus:shadow-outline`}
          />
        </div>
        <div className="flex items-center">
          <span className="mr-4 text-sm">by Mill Pond Research</span>
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-yellow-400 text-gray-800' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 