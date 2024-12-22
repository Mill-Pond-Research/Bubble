/// <reference types="vite/client" />

import axios from 'axios';
import { store } from '../store';

// Define the API endpoint - use environment-specific URL
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api/elaborate'  // Development
  : '/api/elaborate';                      // Production

export async function elaborateThought(thoughtBody: string): Promise<string> {
  const apiKey = store.getState().settings.apiKey;
  
  if (!apiKey) {
    throw new Error('Please provide your Anthropic API key in Settings');
  }

  try {
    const response = await axios.post(
      API_URL,
      { thought: thoughtBody },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (response.data && response.data.elaboration) {
      return response.data.elaboration;
    } else {
      throw new Error('No elaboration received from the API');
    }
  } catch (error) {
    console.error('Error elaborating thought:', error);
    throw new Error('Failed to elaborate thought');
  }
}

export function isElaborationAvailable(): boolean {
  return !!store.getState().settings.apiKey;
} 