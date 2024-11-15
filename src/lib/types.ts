export type TranslationTone = {
  value: string;
  label: string;
  description: string;
};

export type QueueItem = {
  chunk: string;
  index: number;
  prompt: string;
}; 