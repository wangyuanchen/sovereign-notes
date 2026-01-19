import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  // AI 摘要生成逻辑
  return '摘要内容';
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // 语音转文字逻辑
  return '转录文本';
}
