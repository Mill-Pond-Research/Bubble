import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Thought, updateThought, deleteThought, selectFilteredThoughts, selectSelectedTag } from '../store/thoughtsSlice';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { deleteThoughtFile } from '../utils/storage';

interface ThoughtListProps {
  onEditThought: (thought: Thought) => void;
}

type SortOption = 'dateNewest' | 'dateOldest' | 'titleAZ' | 'titleZA';
type LayoutOption = 'card' | 'grid' | 'list';

const ThoughtList: React.FC<ThoughtListProps> = ({ onEditThought }) => {
  const dispatch = useDispatch();
  const thoughts = useSelector(selectFilteredThoughts);
  const selectedTag = useSelector(selectSelectedTag);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const searchQuery = useSelector((state: RootState) => state.thoughts.searchQuery);

  const [sortOption, setSortOption] = useState<SortOption>('dateNewest');
  const [layoutOption, setLayoutOption] = useState<LayoutOption>('card');

  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => {
      switch (sortOption) {
        case 'dateNewest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'dateOldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'titleAZ':
          return a.title.localeCompare(b.title);
        case 'titleZA':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [thoughts, sortOption]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = parseInt(result.source.index);
    const destIndex = parseInt(result.destination.index);

    if (sourceIndex === destIndex) {
      return;
    }

    const sourceThought = thoughts[sourceIndex];
    const destThought = thoughts[destIndex];

    // Combine thoughts
    const combinedThought: Thought = {
      ...destThought,
      body: `${destThought.body}\n\n${sourceThought.body}`,
      tags: [...new Set([...destThought.tags, ...sourceThought.tags])],
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateThought(combinedThought));
    dispatch(deleteThought(sourceThought.id));
  };

  const truncateBody = (body: string, maxLength: number = 400) => {
    // Remove any HTML tags
    const textOnly = body.replace(/<[^>]*>/g, '');
    // Remove any Markdown formatting
    const plainText = textOnly.replace(/[*_~`#\-\[\]]/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.slice(0, maxLength) + '...';
  };

  const handleDeleteThought = async (thought: Thought) => {
    if (window.confirm(`Are you sure you want to delete "${thought.title}"?`)) {
      try {
        await deleteThoughtFile(thought);
        dispatch(deleteThought(thought.id));
      } catch (error) {
        console.error('Error deleting thought:', error);
        alert('Failed to delete thought. Please try again.');
      }
    }
  };

  const renderThought = (thought: Thought, index: number) => {
    const content = (
      <>
        <h3 className="text-xl font-semibold mb-2">{thought.title}</h3>
        <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {truncateBody(thought.body)}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {thought.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className={`px-2 py-1 text-sm rounded-full ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEditThought(thought)}
            className={`mt-2 px-3 py-1 text-sm rounded ${
              isDarkMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-500 text-white hover:bg-green-600'
            } transition-colors`}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteThought(thought)}
            className={`mt-2 px-3 py-1 text-sm rounded ${
              isDarkMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-500 text-white hover:bg-red-600'
            } transition-colors`}
          >
            Delete
          </button>
        </div>
      </>
    );

    return (
      <Draggable key={thought.id} draggableId={thought.id} index={index}>
        {(provided) => (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`p-4 rounded-lg shadow ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } ${layoutOption === 'list' ? 'mb-4' : ''}`}
          >
            {content}
          </li>
        )}
      </Draggable>
    );
  };

  return (
    <div className="thought-list">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Your Thoughts
          {selectedTag && <span className="text-blue-500 ml-2">- Tag: {selectedTag}</span>}
          {searchQuery && <span className="text-blue-500 ml-2">- Search: "{searchQuery}"</span>}
        </h2>
        <div className="flex gap-4">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={`px-2 py-1 rounded ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            <option value="dateNewest">Newest</option>
            <option value="dateOldest">Oldest</option>
            <option value="titleAZ">Title A-Z</option>
            <option value="titleZA">Title Z-A</option>
          </select>
          <select
            value={layoutOption}
            onChange={(e) => setLayoutOption(e.target.value as LayoutOption)}
            className={`px-2 py-1 rounded ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            <option value="card">Card</option>
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
      </div>
      {sortedThoughts.length === 0 ? (
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          No thoughts found. {selectedTag ? `Try selecting a different tag or create a new thought with the "${selectedTag}" tag.` : searchQuery ? `No results for "${searchQuery}".` : 'Start by adding a new thought!'}
        </p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="thoughts">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`${
                  layoutOption === 'card'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : layoutOption === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4'
                }`}
              >
                {sortedThoughts.map((thought, index) => renderThought(thought, index))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default ThoughtList; 