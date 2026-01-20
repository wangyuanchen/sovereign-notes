'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { model } from '@/lib/ai';

export async function generateNoteFromPrompt(prompt: string) {
  try {
    const { object } = await generateObject({
      model: model,
      schema: z.object({
        title: z.string().describe('The title of the note'),
        content: z.string().describe('The markdown content of the note'),
        todos: z.array(z.object({
          task: z.string(),
          dueDate: z.string().optional().describe('ISO date string YYYY-MM-DD if mentioned'),
          frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']).default('once'),
        })).describe('List of action items extracted from the prompt'),
      }),
      prompt: `You are a helpful assistant for a note-taking app. 
      Generate a structured note and action items based on the following user input:
      "${prompt}"
      
      If the input implies a meeting, summarize it.
      If it implies a plan, structure it.
      Extract any tasks mentioned.`,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return { success: false, error: 'Failed to generate content' };
  }
}
