import { TRANSLATION_TONES } from "../constants";

export const chunkText = (text: string, chunkSize: number): string[] => {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    currentChunk.push(line);
    currentLength += line.length;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentLength = 0;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
};

export const createTranslationPrompt = (text: string, toneValue: string) => {
  const selectedTone = TRANSLATION_TONES.find(tone => tone.value === toneValue);
  if (!selectedTone) return text;

  return `Translate the text below into english. ${selectedTone.description}
  
  ${text}`;
}; 