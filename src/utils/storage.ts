import { Thought } from '../store/thoughtsSlice';

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

let directoryHandle: FileSystemDirectoryHandle | null = null;
let deletedFolderHandle: FileSystemDirectoryHandle | null = null;

export const setDownloadDirectory = async (): Promise<void> => {
  directoryHandle = await window.showDirectoryPicker();
  deletedFolderHandle = await directoryHandle.getDirectoryHandle('deleted', { create: true });
};

export const loadMarkdownFiles = async (): Promise<Thought[]> => {
  if (!directoryHandle) {
    throw new Error('Download directory not set');
  }

  const thoughts: Thought[] = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      const file = await entry.getFile();
      const content = await file.text();
      const thought = parseMarkdownToThought(content, entry.name);
      thoughts.push(thought);
    }
  }

  return thoughts;
};

const parseMarkdownToThought = (content: string, fileName: string): Thought => {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    await setDownloadDirectory();
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

// ... existing code ... 