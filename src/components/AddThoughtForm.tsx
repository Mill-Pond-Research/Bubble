import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addThought, selectAllThoughts } from '../store/thoughtsSlice';
import { v4 as uuidv4 } from 'uuid';

interface AddThoughtFormProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 1000;

const AddThoughtForm: React.FC<AddThoughtFormProps> = ({ onClose, isDarkMode }) => {
  const dispatch = useDispatch();
  const allThoughts = useSelector(selectAllThoughts);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({ title: '', body: '' });

  const existingTags = Array.from(new Set(allThoughts.flatMap(thought => thought.tags)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const newThought = {
        id: uuidv4(),
        title,
        body,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addThought(newThought));
      setTitle('');
      setBody('');
      setTags([]);
      setTagInput('');
      onClose();
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: '', body: '' };

    if (title.trim() === '') {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (body.trim() === '') {
      newErrors.body = 'Body is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    if (tagInput.endsWith(',')) {
      handleAddTag();
    }
  }, [tagInput]);

  return (
    <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-lg p-6 mb-4`}>
      <h2 className="text-xl font-semibold mb-4">Add New Thought</h2>
      <div className="mb-4">
        <label htmlFor="title" className={`block font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : ''
          } ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
          required
          maxLength={MAX_TITLE_LENGTH}
        />
        <div className="flex justify-between text-sm mt-1">
          <span className="text-red-500">{errors.title}</span>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{title.length}/{MAX_TITLE_LENGTH}</span>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="body" className={`block font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.body ? 'border-red-500' : ''
          } ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
          rows={4}
          required
          maxLength={MAX_BODY_LENGTH}
        ></textarea>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-red-500">{errors.body}</span>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{body.length}/{MAX_BODY_LENGTH}</span>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className={`block font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-800'} text-xs px-2 py-1 rounded-full flex items-center`}>
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className={`ml-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-blue-800 hover:text-blue-900'} focus:outline-none`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
            placeholder="Add tags (press Enter or comma to add)"
          />
          <datalist id="tag-suggestions">
            {existingTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Thought
        </button>
      </div>
    </form>
  );
};

export default AddThoughtForm; 