import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

export interface Thought {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  order?: number;
}

interface ThoughtsState {
  thoughts: Thought[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
  selectedTag: string | null;
  customOrder: string[];
}

const initialState: ThoughtsState = {
  thoughts: [],
  loading: false,
  error: null,
  searchQuery: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  selectedTag: null,
  customOrder: [],
};

const thoughtsSlice = createSlice({
  name: 'thoughts',
  initialState,
  reducers: {
    setThoughts: (state, action: PayloadAction<Thought[]>) => {
      state.thoughts = action.payload;
    },
    addThought: (state, action: PayloadAction<Thought>) => {
      const newThought = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
      };
      state.thoughts.push(newThought);
    },
    updateThought: (state, action: PayloadAction<Thought>) => {
      const index = state.thoughts.findIndex(thought => thought.id === action.payload.id);
      if (index !== -1) {
        state.thoughts[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteThought: (state, action: PayloadAction<string>) => {
      state.thoughts = state.thoughts.filter(thought => thought.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<ThoughtsState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<ThoughtsState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    setSelectedTag: (state, action: PayloadAction<string | null>) => {
      state.selectedTag = action.payload;
    },
    reorderThoughts: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const customOrder = [...state.customOrder];
      const [removed] = customOrder.splice(fromIndex, 1);
      customOrder.splice(toIndex, 0, removed);
      state.customOrder = customOrder;
      
      // Update the order property of all thoughts
      state.thoughts.forEach((thought, index) => {
        const orderIndex = customOrder.indexOf(thought.id);
        thought.order = orderIndex >= 0 ? orderIndex : index;
      });
    },
    initializeCustomOrder: (state) => {
      if (state.customOrder.length === 0) {
        state.customOrder = state.thoughts.map(thought => thought.id);
      }
    },
  },
});

export const {
  setThoughts,
  addThought,
  updateThought,
  deleteThought,
  setLoading,
  setError,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setSelectedTag,
  reorderThoughts,
  initializeCustomOrder
} = thoughtsSlice.actions;

export default thoughtsSlice.reducer;

export const selectAllThoughts = (state: RootState) => state.thoughts.thoughts;

export const selectFilteredThoughts = (state: RootState) => {
  const { thoughts, searchQuery, sortBy, sortOrder, selectedTag } = state.thoughts;
  let filteredThoughts = thoughts;

  if (selectedTag) {
    filteredThoughts = filteredThoughts.filter(thought => thought.tags.includes(selectedTag));
  }

  if (searchQuery) {
    const lowercaseQuery = searchQuery.toLowerCase();
    filteredThoughts = filteredThoughts.filter(
      thought =>
        thought.title.toLowerCase().includes(lowercaseQuery) ||
        thought.body.toLowerCase().includes(lowercaseQuery) ||
        thought.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  return [...filteredThoughts].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

export const selectAllTags = (state: RootState) => {
  const allTags = state.thoughts.thoughts.flatMap(thought => thought.tags);
  return Array.from(new Set(allTags)).sort();
};

export const selectSelectedTag = (state: RootState) => state.thoughts.selectedTag;

export const selectThoughtsByTag = (state: RootState, tag: string) => {
  return state.thoughts.thoughts.filter(thought => thought.tags.includes(tag));
};

export const selectTotalPages = (state: RootState, perPage: number) => {
  const filteredThoughts = selectFilteredThoughts(state);
  return Math.ceil(filteredThoughts.length / perPage);
};

export const selectThoughtsLoading = (state: RootState) => state.thoughts.loading;
export const selectThoughtsError = (state: RootState) => state.thoughts.error;

export const selectThoughtsInOrder = (state: { thoughts: ThoughtsState }) => {
  if (state.thoughts.customOrder.length === 0) {
    return state.thoughts.thoughts;
  }
  
  const thoughtsMap = new Map(state.thoughts.thoughts.map(t => [t.id, t]));
  return state.thoughts.customOrder
    .map(id => thoughtsMap.get(id))
    .filter((t): t is Thought => t !== undefined);
};
 