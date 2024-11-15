import type { QueueItem } from '../types';
import { prompt as promptAction } from '@/app/promptAction';

export class TranslationQueue {
  private queue: QueueItem[] = [];
  private inProgress = new Set<number>();
  private results: string[] = [];
  private resolveComplete?: () => void;

  constructor(
    private readonly batchSize: number,
    private readonly onProgress: (index: number, result: string) => void,
  ) { }

  async add(items: QueueItem[]) {
    this.queue.push(...items);
    this.results = new Array(items.length).fill('');
    return this.process();
  }

  private async process(): Promise<string[]> {
    return new Promise(resolve => {
      this.resolveComplete = () => resolve(this.results);
      this.processNextBatch();
    });
  }

  private async processNextBatch() {
    const batchPromises: Promise<void>[] = [];

    while (this.inProgress.size < this.batchSize && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      this.inProgress.add(item.index);
      const promise = this.processItem(item).finally(() => {
        this.inProgress.delete(item.index);
      });
      batchPromises.push(promise);
    }

    if (batchPromises.length > 0) {
      await Promise.all(batchPromises);
      if (this.queue.length > 0) {
        this.processNextBatch();
      }
    }

    if (this.queue.length === 0 && this.inProgress.size === 0) {
      this.resolveComplete?.();
    }
  }

  private async processItem(item: QueueItem) {
    try {
      const result = await promptAction(item.chunk, item.prompt);
      this.results[item.index] = result;
      this.onProgress(item.index, result);
    } catch (error) {
      console.error(`Error processing chunk ${item.index}:`, error);
      this.results[item.index] = `Error: Failed to translate chunk ${item.index}`;
    }
  }
} 