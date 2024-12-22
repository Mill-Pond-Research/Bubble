import { readdir, rename, mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const electronDistPath = join(__dirname, '..', 'dist', 'electron');

async function renameJsToCjs(dir) {
  try {
    // Create the directory if it doesn't exist
    await mkdir(dir, { recursive: true });
    
    const files = await readdir(dir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const oldPath = join(dir, file);
        const newPath = join(dir, file.replace('.js', '.cjs'));
        await rename(oldPath, newPath);
        console.log(`Renamed ${file} to ${file.replace('.js', '.cjs')}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

renameJsToCjs(electronDistPath); 