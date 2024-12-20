import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Thought, selectAllTags } from '../store/thoughtsSlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ThoughtSaverProps {
  onSave: (title: string, body: string, tags: string[]) => void;
  thoughtToEdit: Thought | null;
  onCancelEdit: () => void;
}

const ThoughtSaver: React.FC<ThoughtSaverProps> = ({ onSave, thoughtToEdit, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const allTags = useSelector(selectAllTags);

  useEffect(() => {
    if (thoughtToEdit) {
      setTitle(thoughtToEdit.title);
      setBody(thoughtToEdit.body.replace(/\n/g, '<br>'));
      setTags(thoughtToEdit.tags);
    } else {
      setTitle('');
      setBody('');
      setTags([]);
    }
  }, [thoughtToEdit]);

  useEffect(() => {
    if (newTag) {
      const suggestions = allTags.filter(tag => 
        tag.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(tag)
      );
      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]);
    }
  }, [newTag, allTags, tags]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedBody = body.replace(/<br>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '\n');
    onSave(title, processedBody, tags);
    setTitle('');
    setBody('');
    setTags([]);
    setNewTag('');
  };

  const handleAddTag = (tagToAdd: string = newTag) => {
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
      setTagSuggestions([]);
    }
  };

  const handleTagKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className={`w-full px-3 py-2 text-sm leading-tight ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
          } border rounded shadow appearance-none focus:outline-none focus:shadow-outline`}
        />
      </div>
      <div className="mb-4">
        <ReactQuill
          theme="snow"
          value={body}
          onChange={setBody}
          modules={modules}
          formats={formats}
          placeholder="Body"
          className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
        />
      </div>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-1 text-sm rounded-full ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
              } flex items-center`}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-xs font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a tag"
              className={`flex-grow px-3 py-2 text-sm leading-tight ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
              } border rounded-l shadow appearance-none focus:outline-none focus:shadow-outline`}
            />
            <button
              type="button"
              onClick={() => handleAddTag()}
              className={`px-4 py-2 font-bold text-white ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } rounded-r transition-colors`}
            >
              Add Tag
            </button>
          </div>
          {tagSuggestions.length > 0 && (
            <ul className={`mt-1 border rounded ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
              {tagSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => handleAddTag(suggestion)}
                  className={`px-3 py-1 cursor-pointer ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className={`px-4 py-2 font-bold text-white ${
            isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
          } rounded-full focus:outline-none focus:shadow-outline`}
        >
          {thoughtToEdit ? 'Update Thought' : 'Save Thought'}
        </button>
        {thoughtToEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`px-4 py-2 font-bold text-white ${
              isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-700'
            } rounded-full focus:outline-none focus:shadow-outline`}
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default ThoughtSaver; 