import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const model = openai('gpt-4-turbo'); // 或者 'gpt-3.5-turbo' 取决于你的 key 权限和余额
