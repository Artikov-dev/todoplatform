import fs from 'fs/promises';
import path from 'path';

// A simple in-memory queue to prevent concurrent writes to the same file
const fileLocks: Record<string, Promise<any>> = {};

export class FileRepository<T extends { id: number | string }> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(process.cwd(), 'data', filename);
  }

  private async enqueue<R>(action: () => Promise<R>): Promise<R> {
    if (!fileLocks[this.filePath]) {
      fileLocks[this.filePath] = Promise.resolve();
    }
    
    const lock = fileLocks[this.filePath].then(() => action());
    fileLocks[this.filePath] = lock.catch(() => {}); // catch to prevent breaking the chain
    
    return lock;
  }

  async getAll(): Promise<T[]> {
    return this.enqueue(async () => {
      try {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data) as T[];
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    });
  }

  async getById(id: number | string): Promise<T | null> {
    const items = await this.getAll();
    return items.find(item => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    return this.enqueue(async () => {
      const data = await fs.readFile(this.filePath, 'utf-8').catch(() => '[]');
      const items = JSON.parse(data) as T[];
      items.push(item);
      await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
      return item;
    });
  }

  async update(id: number | string, partialItem: Partial<T>): Promise<T | null> {
    return this.enqueue(async () => {
      const data = await fs.readFile(this.filePath, 'utf-8').catch(() => '[]');
      const items = JSON.parse(data) as T[];
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return null;

      items[index] = { ...items[index], ...partialItem };
      await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
      return items[index];
    });
  }

  async delete(id: number | string): Promise<boolean> {
    return this.enqueue(async () => {
      const data = await fs.readFile(this.filePath, 'utf-8').catch(() => '[]');
      const items = JSON.parse(data) as T[];
      const initialLength = items.length;
      const filtered = items.filter(item => item.id !== id);
      if (filtered.length === initialLength) return false;

      await fs.writeFile(this.filePath, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    });
  }
}
