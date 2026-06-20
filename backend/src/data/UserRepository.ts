import { FileRepository } from './FileRepository';
import { User } from '../models/User';

export class UserRepository extends FileRepository<User> {
  constructor() {
    super('users.json');
  }

  async getByTelegramId(telegramId: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find(user => user.telegram_id === telegramId) || null;
  }
}

export const userRepository = new UserRepository();
