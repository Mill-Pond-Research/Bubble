import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Thought, updateThought, deleteThought } from '../store/thoughtsSlice';

interface ThoughtCardProps {
  thought: Thought;
  isDarkMode: boolean;
}

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 1000;
const PREVIEW_LENGTH = 100;

const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, isDarkMode }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedThought, setEditedThought] = useState(thought);
  const [showFullBody, setShowFullBody] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    dispatch(updateThought({ ...editedThought, updatedAt: new Date().toISOString() }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    dispatch(deleteThought(thought.id));
    setShowDeleteConfirmation(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedThought((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '');
    setEditedThought((prev) => ({ ...prev, tags }));
  };

  if (isEditing) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-lg p-4`}>
        <div className="mb-2">
          <input
            type="text"
            name="title"
            value={editedThought.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
            maxLength={MAX_TITLE_LENGTH}
          />
          <div className="text-right text-sm text-gray-500">
            {editedThought.title.length}/{MAX_TITLE_LENGTH}
          </div>
        </div>
        <div className="mb-2">
          <textarea
            name="body"
            value={editedThought.body}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
            rows={4}
            maxLength={MAX_BODY_LENGTH}
          ></textarea>
          <div className="text-right text-sm text-gray-500">
            {editedThought.body.length}/{MAX_BODY_LENGTH}
          </div>
        </div>
        <div className="mb-2">
          <input
            type="text"
            name="tags"
            value={editedThought.tags.join(', ')}
            onChange={handleTagChange}
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
            placeholder="Enter tags separated by commas"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-2"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-lg p-4`}>
      <h3 className="text-xl font-semibold mb-2">{thought.title}</h3>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
        {showFullBody ? thought.body : `${thought.body.substring(0, PREVIEW_LENGTH)}...`}
        {thought.body.length > PREVIEW_LENGTH && (
          <button
            onClick={() => setShowFullBody(!showFullBody)}
            className="text-blue-500 hover:text-blue-600 ml-2"
          >
            {showFullBody ? 'Read Less' : 'Read More'}
          </button>
        )}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {thought.tags.map((tag) => (
          <span key={tag} className={`${
            isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-800'
          } text-xs px-2 py-1 rounded-full`}>
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Updated: {new Date(thought.updatedAt).toLocaleString()}
        </div>
        <div>
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors mr-2"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-4 rounded-lg`}>
            <p className="mb-4">Are you sure you want to delete this thought?</p>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors mr-2"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtCard; 