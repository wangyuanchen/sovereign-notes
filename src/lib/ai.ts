import { createOpenAI } from '@ai-sdk/openai';

// OpenRouter 配置
export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  // OpenRouter 需要的额外 headers
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://note.svgn.org',
    'X-Title': 'Sovereign Notes',
  },
});

// 模型配置
const FREE_MODEL = process.env.OPENROUTER_MODEL_FREE || 'tngtech/deepseek-r1t2-chimera:free';
const PRO_MODEL = process.env.OPENROUTER_MODEL_PRO || 'deepseek/deepseek-chat';

// 根据用户计划获取对应的模型
export function getModelForPlan(plan: 'free' | 'pro' | 'early_bird') {
  if (plan === 'pro' || plan === 'early_bird') {
    return openrouter(PRO_MODEL);
  }
  return openrouter(FREE_MODEL);
}

// 默认模型 (向后兼容)
export const model = openrouter(FREE_MODEL);

// 模型信息 (用于前端显示)
export const MODEL_INFO = {
  free: {
    name: 'DeepSeek R1 (Free)',
    description: 'Basic AI assistance',
  },
  pro: {
    name: 'DeepSeek Chat (Pro)',
    description: 'Advanced AI with structured output support',
  },
} as const;
