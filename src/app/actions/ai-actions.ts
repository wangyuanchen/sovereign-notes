'use server';

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { getModelForPlan } from '@/lib/ai';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type DocType = 'plain' | 'markdown';

// 获取当前用户的计划
async function getUserPlan(): Promise<'free' | 'pro' | 'early_bird'> {
  try {
    const { userId } = await auth();
    if (!userId) return 'free';

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return (user?.plan as 'free' | 'pro' | 'early_bird') || 'free';
  } catch {
    return 'free';
  }
}

// 尝试从文本中提取标题（取第一行或前50个字符）
function extractTitle(content: string): string {
  const firstLine = content.trim().split('\n')[0];
  // 移除 Markdown 标题符号
  const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
  return cleanTitle.slice(0, 50) || 'Untitled';
}

export async function generateNoteFromPrompt(prompt: string, docType: DocType = 'markdown') {
  try {
    // 根据用户计划选择模型
    const userPlan = await getUserPlan();
    const model = getModelForPlan(userPlan);
    
    console.log(`🤖 AI Generation: Using ${userPlan === 'free' ? 'FREE' : 'PRO'} model`);

    const formatInstructions = docType === 'plain' 
      ? `Generate PLAIN TEXT content only. Do NOT use any markdown syntax like #, **, -, etc. 
         Use simple line breaks and indentation for structure.
         Write in a natural, readable format without any special formatting.`
      : `Generate content in MARKDOWN format. 
         Use proper markdown syntax: # for headings, ** for bold, - for lists, etc.
         Make the content well-structured and visually organized.`;

    // 首先尝试使用 generateObject（结构化输出）
    try {
      const { object } = await generateObject({
        model: model,
        schema: z.object({
          title: z.string().describe('The title of the note'),
          content: z.string().describe(`The ${docType === 'plain' ? 'plain text' : 'markdown'} content of the note`),
          todos: z.array(z.object({
            task: z.string(),
            dueDate: z.string().optional().describe('ISO date string YYYY-MM-DD if mentioned'),
            frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']).default('once'),
          })).describe('List of action items extracted from the prompt'),
        }),
        prompt: `You are a helpful assistant for a note-taking app.
        
        ${formatInstructions}
        
        Generate a structured note and action items based on the following user input:
        "${prompt}"
        
        If the input implies a meeting, summarize it.
        If it implies a plan, structure it.
        Extract any tasks mentioned.`,
      });

      return { success: true, data: object };
    } catch (jsonError) {
      // 如果 generateObject 失败（模型不支持 JSON），回退到 generateText
      console.warn('generateObject failed, falling back to generateText:', jsonError);
      
      const { text } = await generateText({
        model: model,
        prompt: `You are a helpful assistant for a note-taking app.
        
        ${formatInstructions}
        
        Generate a note based on the following user input:
        "${prompt}"
        
        If the input implies a meeting, summarize it.
        If it implies a plan, structure it.`,
      });

      // 从纯文本响应中提取内容
      const content = text.trim();
      const title = extractTitle(content);

      return { 
        success: true, 
        data: {
          title,
          content,
          todos: [], // 纯文本模式下不自动提取 todos
        }
      };
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    return { success: false, error: 'Failed to generate content' };
  }
}
