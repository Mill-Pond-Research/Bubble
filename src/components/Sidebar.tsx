import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSelectedTag, selectAllTags, selectSelectedTag } from '../store/thoughtsSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const allTags = useSelector(selectAllTags);
  const selectedTag = useSelector(selectSelectedTag);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);

  const handleTagClick = (tag: string | null) => {
    dispatch(setSelectedTag(tag));
  };

  // Filter out empty or whitespace-only tags
  const validTags = allTags.filter(tag => tag.trim() !== '');

  return (
    <aside className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100'} p-4 w-64`}>
      <h2 className="text-xl font-semibold mb-4">Tags</h2>
      <ul>
        <li key="see-all" className="mb-2">
          <button
            onClick={() => handleTagClick(null)}
            className={`flex justify-center items-center w-full px-3 py-1 rounded-full text-sm transition-colors ${
              selectedTag === null
                ? 'bg-blue-600 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            <span className="truncate">See All</span>
          </button>
        </li>
        {validTags.map((tag) => (
          <li key={tag} className="mb-2">
            <button
              onClick={() => handleTagClick(tag)}
              className={`flex justify-center items-center w-full px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <span className="truncate">{tag}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar; 