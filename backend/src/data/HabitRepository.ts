import { FileRepository } from './FileRepository';
import { Habit } from '../models/Habit';

export class HabitRepository extends FileRepository<Habit> {
  constructor() {
    super('habits.json');
  }

  async getByUserId(userId: number): Promise<Habit[]> {
    const habits = await this.getAll();
    return habits.filter(habit => habit.user_id === userId);
  }
}

export const habitRepository = new HabitRepository();
