import { Thought } from '../store/thoughtsSlice';

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

let directoryHandle: FileSystemDirectoryHandle | null = null;
let deletedFolderHandle: FileSystemDirectoryHandle | null = null;

export const setDownloadDirectory = async (existingHandle?: FileSystemDirectoryHandle): Promise<void> => {
  try {
    if (existingHandle) {
      directoryHandle = existingHandle;
      localStorage.setItem('selectedFolderPath', existingHandle.name);
    } else {
      directoryHandle = await window.showDirectoryPicker();
      localStorage.setItem('selectedFolderPath', directoryHandle.name);
    }
    
    deletedFolderHandle = await directoryHandle.getDirectoryHandle('deleted', { create: true });
  } catch (error) {
    console.error('Error setting download directory:', error);
    throw error;
  }
};

export const loadMarkdownFiles = async (): Promise<Thought[]> => {
  if (!directoryHandle) {
    throw new Error('Download directory not set');
  }

  const thoughts: Thought[] = [];

  for await (const [name, entry] of directoryHandle.entries()) {
    if (entry.kind === 'file' && name.endsWith('.md')) {
      if (entry instanceof FileSystemFileHandle) {
        const file = await entry.getFile();
        const content = await file.text();
        const thought = await parseMarkdownToThought(content, name, file);
        thoughts.push(thought);
      }
    }
  }

  return thoughts;
};

const parseMarkdownToThought = async (content: string, fileName: string, file: File): Promise<Thought> => {
  const lines = content.split('\n');
  const title = lines[0].startsWith('# ') ? lines[0].slice(2) : fileName.slice(0, -3);
  
  let body = '';
  let tags: string[] = [];
  let inBody = true;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().toLowerCase().startsWith('tags:')) {
      inBody = false;
      tags = line.slice(5).split(',').map(tag => tag.trim());
    } else if (inBody) {
      body += line + (i < lines.length - 1 ? '\n' : '');
    }
  }

  body = body.trim();

  // Extract inline tags from the body
  const inlineTags = extractInlineTags(body);
  tags = [...new Set([...tags, ...inlineTags])];

  return {
    id: generateId(),
    title,
    body,
    tags,
    createdAt: file.lastModified.toString(),
    updatedAt: file.lastModified.toString(),
  };
};

const extractInlineTags = (body: string): string[] => {
  const tagRegex = /#(\w+)/g;
  const matches = body.match(tagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const saveThoughtAsMarkdown = async (thought: Thought): Promise<void> => {
  if (!directoryHandle) {
    throw new Error('Download directory not set');
  }

  const fileName = `${thought.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  const content = `# ${thought.title}\n\n${thought.body.trim()}\n\nTags: ${thought.tags.join(', ')}`;

  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
};

export const loadThoughts = async (): Promise<Thought[]> => {
  if (!directoryHandle) {
    throw new Error('Download directory not set');
  }
  return loadMarkdownFiles();
};

export const deleteThoughtFile = async (thought: Thought): Promise<void> => {
  if (!directoryHandle || !deletedFolderHandle) {
    throw new Error('Download directory or deleted folder not set');
  }

  const fileName = `${thought.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;

  try {
    // Get the file from the main directory
    const fileHandle = await directoryHandle.getFileHandle(fileName);

    // Read the file content
    const file = await fileHandle.getFile();
    const content = await file.text();

    // Write the file to the deleted folder
    const deletedFileHandle = await deletedFolderHandle.getFileHandle(fileName, { create: true });
    const deletedWritable = await deletedFileHandle.createWritable();
    await deletedWritable.write(content);
    await deletedWritable.close();

    // Remove the file from the main directory
    await directoryHandle.removeEntry(fileName);

    console.log(`Thought "${thought.title}" moved to deleted folder`);
  } catch (error) {
    console.error('Error deleting thought file:', error);
    throw error;
  }
};

export async function loadThoughtsFromFileSystem(): Promise<Thought[]> {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    const thoughts: Thought[] = [];

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === 'file' && name.endsWith('.json')) {
        if (handle instanceof FileSystemFileHandle) {
          const file = await handle.getFile();
          const content = await file.text();
          const thought = JSON.parse(content);
          thoughts.push(thought);
        }
      }
    }

    return thoughts;
  } catch (error) {
    console.error('Error loading thoughts from file system:', error);
    return [];
  }
}

export const saveThoughtsToLocalStorage = (thoughts: Thought[]) => {
  localStorage.setItem('thoughts', JSON.stringify(thoughts));
};

export const loadThoughtsFromLocalStorage = (): Thought[] => {
  const storedThoughts = localStorage.getItem('thoughts');
  return storedThoughts ? JSON.parse(storedThoughts) : [];
};

export const saveThoughtToFileSystem = async (thought: Thought) => {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    const fileHandle = await directoryHandle.getFileHandle(`${thought.id}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(thought));
    await writable.close();
  } catch (error) {
    console.error('Error saving thought to file system:', error);
  }
};

export const saveThoughtsToFileSystem = async (thoughts: Thought[]) => {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    for (const thought of thoughts) {
      const fileHandle = await directoryHandle.getFileHandle(`${thought.id}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(thought));
      await writable.close();
    }
  } catch (error) {
    console.error('Error saving thoughts to file system:', error);
  }
};

export const deleteThoughtFromFileSystem = async (thoughtId: string) => {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    await directoryHandle.removeEntry(`${thoughtId}.json`);
  } catch (error) {
    console.error('Error deleting thought from file system:', error);
  }
};

export const updateThoughtInFileSystem = async (thought: Thought) => {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    const fileHandle = await directoryHandle.getFileHandle(`${thought.id}.json`, { create: false });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(thought));
    await writable.close();
  } catch (error) {
    console.error('Error updating thought in file system:', error);
  }
};

// ... existing code ... 