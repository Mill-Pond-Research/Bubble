import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSelectedTag } from '../store/thoughtsSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const thoughts = useSelector((state: RootState) => state.thoughts.thoughts);
  const selectedTag = useSelector((state: RootState) => state.thoughts.selectedTag);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);

  const allTags = Array.from(new Set(thoughts.flatMap(thought => thought.tags)))
    .sort((a, b) => a.localeCompare(b));

  const handleTagClick = (tag: string) => {
    dispatch(setSelectedTag(tag === selectedTag ? null : tag));
  };

  return (
    <aside className={`w-64 p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-4">Tags</h2>
      <ul className="space-y-2">
        {allTags.map(tag => (
          <li key={tag}>
            <button
              onClick={() => handleTagClick(tag)}
              className={`
                w-full text-left px-4 py-2 rounded-lg 
                transition-all duration-200 
                flex items-center gap-2
                ${
                  tag === selectedTag
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300 hover:translate-x-1'
                    : 'hover:bg-gray-200 text-gray-600 hover:translate-x-1'
                }
              `}
            >
              <span className={`
                inline-block w-2 h-2 rounded-full
                ${tag === selectedTag 
                  ? 'bg-white animate-pulse'
                  : isDarkMode 
                    ? 'bg-blue-400'
                    : 'bg-blue-500'
                }
              `}></span>
              {tag}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar; 