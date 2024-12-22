import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Thought, updateThought, deleteThought } from '../store/thoughtsSlice';
import { elaborateThought } from '../services/elaborationService.ts';
import { ThoughtStats } from './ThoughtEditor';
import { FaEdit, FaTrash, FaUndo, FaRedo, FaRobot, FaSave, FaTimes } from 'react-icons/fa';

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
  const [isElaborating, setIsElaborating] = useState(false);
  const [elaborationError, setElaborationError] = useState<string | null>(null);
  const [originalBody, setOriginalBody] = useState(thought.body);

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

  const handleElaborate = async () => {
    setIsElaborating(true);
    setElaborationError(null);
    try {
      const elaboratedBody = await elaborateThought(thought.body);
      const updatedThought = { ...thought, body: elaboratedBody, updatedAt: new Date().toISOString() };
      dispatch(updateThought(updatedThought));
      setEditedThought(updatedThought);
      setOriginalBody(thought.body);
    } catch (error) {
      console.error('Error elaborating thought:', error);
      setElaborationError('Failed to elaborate thought. Please try again later.');
    } finally {
      setIsElaborating(false);
    }
  };

  const handleRevert = () => {
    const revertedThought = { ...thought, body: originalBody, updatedAt: new Date().toISOString() };
    dispatch(updateThought(revertedThought));
    setEditedThought(revertedThought);
  };

  const handleRegenerate = () => {
    handleElaborate();
  };

  if (isEditing) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-lg p-4`}>
        <div className="bg-red-500 text-white p-2 mb-4 rounded">TEMPORARY: Editing Mode Active</div>
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
        <ThoughtStats thought={editedThought} body={editedThought.body} isDarkMode={isDarkMode} />
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleElaborate}
            className={`${
              isElaborating
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white px-4 py-2 rounded-lg transition-colors`}
            disabled={isElaborating}
          >
            {isElaborating ? 'Elaborating...' : 'Elaborate'}
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
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
        {elaborationError && (
          <div className="mt-2 text-red-500">{elaborationError}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-lg p-4`}>
      <div className="bg-blue-500 text-white p-2 mb-4 rounded">TEMPORARY: View Mode Active</div>
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
      <ThoughtStats thought={thought} body={thought.body} isDarkMode={isDarkMode} />
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
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
      {thought.body !== originalBody && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleRevert}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <FaUndo className="text-lg" />
            Revert
          </button>
          <button
            onClick={handleRegenerate}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <FaRedo className="text-lg" />
            Regenerate
          </button>
        </div>
      )}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-xl`}>
            <p className="mb-6 text-lg">Are you sure you want to delete this thought?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FaTrash className="text-lg" />
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaTimes className="text-lg" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtCard; 