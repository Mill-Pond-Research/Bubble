import React, { useState, useEffect, useMemo } from 'react';
import { Thought } from '../store/thoughtsSlice';
import { elaborateThought, isElaborationAvailable } from '../services/elaborationService';
import { FaRobot, FaSave, FaTimes } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ThoughtStatsProps {
  thought: Thought | null;
  body: string;
  isDarkMode: boolean;
  lastModified: string | null;
}

export const ThoughtStats: React.FC<ThoughtStatsProps> = ({ thought, body, isDarkMode, lastModified }) => {
  const stats = useMemo(() => {
    const words = body.trim().split(/\s+/).filter(word => word.length > 0);
    const tokens = body.length;
    const created = thought?.createdAt ? new Date(thought.createdAt).toLocaleString() : 'Not saved';
    const modified = lastModified ? new Date(lastModified).toLocaleString() : 'Not saved';
    
    return {
      wordCount: words.length,
      tokenCount: tokens,
      created,
      modified
    };
  }, [body, thought, lastModified]);

  return (
    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-2`}>
      <div className="flex flex-wrap gap-4">
        <span>Words: {stats.wordCount}</span>
        <span>Characters: {stats.tokenCount}</span>
        <span>Created: {stats.created}</span>
        <span className={`transition-all duration-300 ${lastModified ? 'scale-105' : ''}`}>
          Modified: {stats.modified}
        </span>
      </div>
    </div>
  );
};

interface ThoughtEditorProps {
  onSave: (thought: Thought) => void;
  thoughtToEdit: Thought | null;
  onCancelEdit: () => void;
  selectedTag: string | null;
  isDarkMode?: boolean;
}

const ThoughtEditor: React.FC<ThoughtEditorProps> = ({
  onSave,
  thoughtToEdit,
  onCancelEdit,
  selectedTag,
  isDarkMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isElaborating, setIsElaborating] = useState(false);
  const [elaborationError, setElaborationError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const saveButtonRef = React.useRef<HTMLButtonElement>(null);

  const elaborationAvailable = isElaborationAvailable();

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

  useEffect(() => {
    if (thoughtToEdit) {
      setTitle(thoughtToEdit.title);
      setBody(thoughtToEdit.body.replace(/\n/g, '<br>'));
      setTags(thoughtToEdit.tags);
      setLastModified(thoughtToEdit.updatedAt);
    } else {
      setTitle('');
      setBody('');
      setTags(selectedTag ? [selectedTag] : []);
      setLastModified(null);
    }
  }, [thoughtToEdit, selectedTag]);

  const triggerConfetti = () => {
    if (saveButtonRef.current) {
      const rect = saveButtonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = rect.top / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#10B981', '#059669', '#047857'],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const processedBody = body.replace(/<br>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '\n');
    const newThought: Thought = {
      id: thoughtToEdit ? thoughtToEdit.id : Date.now().toString(),
      title,
      body: processedBody,
      tags,
      createdAt: thoughtToEdit ? thoughtToEdit.createdAt : now,
      updatedAt: now,
    };
    onSave(newThought);
    setLastModified(now);
    triggerConfetti();
  };

  const handleElaborate = async () => {
    setIsElaborating(true);
    setElaborationError(null);
    try {
      const elaboratedBody = await elaborateThought(body.replace(/<[^>]*>/g, ''));
      setBody(elaboratedBody);
    } catch (error) {
      console.error('Error elaborating thought:', error);
      setElaborationError('Failed to elaborate thought. Please try again later.');
    } finally {
      setIsElaborating(false);
    }
  };

  const renderSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className={`mb-4 p-6 rounded-xl shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' 
        : 'bg-white border border-gray-200 shadow-gray-200/50'
    }`}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={`w-full px-4 py-3 border rounded-lg text-lg font-medium transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500 placeholder-gray-400' 
            : 'bg-white text-gray-800 border-gray-300 focus:border-indigo-400 placeholder-gray-500'
        } focus:ring-2 focus:ring-indigo-500/20 outline-none`}
        required
        maxLength={100}
      />
      <div className={`mt-3 ${isDarkMode ? 'react-quill-dark' : ''}`}>
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
      <input
        type="text"
        value={tags.join(', ')}
        onChange={(e) => setTags(e.target.value.split(',').map((tag) => tag.trim()))}
        placeholder="Tags (comma-separated)"
        className={`w-full px-4 py-3 mt-6 border rounded-lg transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500 placeholder-gray-400' 
            : 'bg-white text-gray-800 border-gray-300 focus:border-indigo-400 placeholder-gray-500'
        } focus:ring-2 focus:ring-indigo-500/20 outline-none`}
      />
      {elaborationError && <div className="text-red-500 mt-3 px-1">{elaborationError}</div>}
      <ThoughtStats thought={thoughtToEdit} body={body.replace(/<[^>]*>/g, '')} isDarkMode={isDarkMode} lastModified={lastModified} />
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={handleElaborate}
          disabled={!elaborationAvailable || isElaborating || !body.trim()}
          className={`${
            !elaborationAvailable || isElaborating || !body.trim()
              ? 'bg-gray-500 cursor-not-allowed opacity-60'
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30'
          } text-white px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg`}
          title={!elaborationAvailable ? 'Elaboration is not available' : ''}
        >
          {isElaborating ? renderSpinner() : <FaRobot className="text-lg" />}
          {isElaborating ? 'Elaborating...' : 'Elaborate'}
        </button>
        <button
          ref={saveButtonRef}
          type="submit"
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          <FaSave className="text-lg" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancelEdit}
          className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-gray-500/30"
        >
          <FaTimes className="text-lg" />
          Close
        </button>
      </div>
    </form>
  );
};

export default ThoughtEditor; 