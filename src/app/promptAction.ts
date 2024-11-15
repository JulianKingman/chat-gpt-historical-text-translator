'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const prompt = async (input: string, prompt: string) => {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt,
  });
  return text;
};
