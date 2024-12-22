import React, { useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Thought } from '../store/thoughtsSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import DeleteCautionPopup from './DeleteCautionPopup';
import { SortMethod } from './Header';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface ThoughtListProps {
  thoughts: Thought[];
  onEditThought: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
  onCombineThoughts: (sourceId: string, targetId: string) => void;
  onReorderThought?: (dragIndex: number, hoverIndex: number) => void;
  searchQuery: string;
  selectedTag: string | null;
  layout: 'list' | 'grid';
  sortMethod: SortMethod;
}

const ThoughtItem: React.FC<{
  thought: Thought;
  onEdit: () => void;
  onDelete: () => void;
  onCombine: (sourceId: string, targetId: string) => void;
  onReorder?: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  layout: 'list' | 'grid';
  sortMethod: SortMethod;
}> = ({ thought, onEdit, onDelete, onCombine, onReorder, index, layout, sortMethod }) => {
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleDelete = useCallback(() => {
    const hasSeenCaution = localStorage.getItem('hasSeenDeleteCaution');
    if (hasSeenCaution) {
      onDelete();
    } else {
      setShowDeletePopup(true);
    }
  }, [onDelete]);

  const handleConfirmDelete = useCallback(() => {
    localStorage.setItem('hasSeenDeleteCaution', 'true');
    setShowDeletePopup(false);
    onDelete();
  }, [onDelete]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: sortMethod === 'custom' ? 'reorder' : 'thought',
    item: { id: thought.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [thought.id, index, sortMethod]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: sortMethod === 'custom' ? 'reorder' : 'thought',
    drop: (item: { id: string; index: number }) => {
      if (sortMethod === 'custom') {
        if (item.index !== index) {
          onReorder?.(item.index, index);
        }
      } else if (item.id !== thought.id) {
        onCombine(item.id, thought.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [thought.id, index, sortMethod, onReorder, onCombine]);

  const itemClasses = `${
    layout === 'grid' ? 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2' : 'w-full mb-4'
  }`;

  const contentClasses = `p-4 rounded-lg shadow-md transition-all duration-200 ${
    isDarkMode
      ? 'bg-gray-800 text-white hover:bg-gray-700'
      : 'bg-white text-gray-800 hover:bg-gray-50'
  } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-2 border-blue-500' : ''} ${
    sortMethod === 'custom' ? 'cursor-move' : ''
  }`;

  const excerptLength = layout === 'list' ? 300 : 100;

  return (
    <div className={itemClasses}>
      <div ref={(node) => drag(drop(node))} className={contentClasses}>
        <h3 className="text-xl font-bold mb-2">{thought.title}</h3>
        <p className={`mb-4 ${layout === 'list' ? 'text-base' : 'text-sm'}`}>
          {thought.body.length > excerptLength
            ? `${thought.body.substring(0, excerptLength)}...`
            : thought.body}
        </p>
        {layout === 'grid' ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {thought.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tag}
                </span>
              )).concat(
                thought.tags.length > 5 
                  ? [(
                      <span
                        key="more"
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isDarkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        +{thought.tags.length - 5} more
                      </span>
                    )]
                  : []
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onEdit}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <FaEdit className="text-lg" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FaTrash className="text-lg" />
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 flex-grow">
              {thought.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Created: {new Date(parseInt(thought.createdAt)).toLocaleString()}
                {thought.updatedAt !== thought.createdAt && 
                  ` • Modified: ${new Date(parseInt(thought.updatedAt)).toLocaleString()}`
                }
              </span>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={onEdit}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <FaEdit className="text-lg" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FaTrash className="text-lg" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      {showDeletePopup && (
        <DeleteCautionPopup
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}
    </div>
  );
};

const ThoughtList: React.FC<ThoughtListProps> = ({
  thoughts,
  onEditThought,
  onDeleteThought,
  onCombineThoughts,
  onReorderThought,
  searchQuery,
  selectedTag,
  layout,
  sortMethod,
}) => {
  const filteredThoughts = thoughts
    .filter(
      (thought) =>
        (selectedTag ? thought.tags.includes(selectedTag) : true) &&
        (thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thought.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thought.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    );

  const sortedThoughts = [...filteredThoughts].sort((a, b) => {
    switch (sortMethod) {
      case 'newest':
        return parseInt(b.updatedAt) - parseInt(a.updatedAt);
      case 'oldest':
        return parseInt(a.updatedAt) - parseInt(b.updatedAt);
      case 'az':
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      case 'za':
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
      case 'custom':
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        }
        return 0;
      default:
        return parseInt(b.updatedAt) - parseInt(a.updatedAt);
    }
  });

  return (
    <div className={`${layout === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
      {sortedThoughts.map((thought, index) => (
        <ThoughtItem
          key={thought.id}
          thought={thought}
          onEdit={() => onEditThought(thought)}
          onDelete={() => onDeleteThought(thought.id)}
          onCombine={onCombineThoughts}
          onReorder={onReorderThought}
          index={index}
          layout={layout}
          sortMethod={sortMethod}
        />
      ))}
    </div>
  );
};

export default ThoughtList;
