import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isDarkMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search thoughts..."
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
              : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
          }`}
        />
        <FaSearch
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
      </div>
    </form>
  );
};

export default SearchBar; 