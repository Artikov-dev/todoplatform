import { Router } from 'express';
import { validateTelegramWebAppData } from '../middleware/telegramAuth';
import { userRepository } from '../data/UserRepository';

const router = Router();

// TMA API routes (Secured with Telegram Auth Validation)
router.post('/user', validateTelegramWebAppData, async (req, res) => {
  try {
    const telegramUser = req.body.telegramUser;
    const { permissions, location } = req.body;

    if (!telegramUser) {
      return res.status(400).json({ error: 'Missing telegramUser payload' });
    }

    let user = await userRepository.getByTelegramId(telegramUser.id.toString());
    
    if (user) {
      // Update existing user with last login and new permissions/location
      user = await userRepository.update(user.id, {
        last_login: new Date().toISOString(),
        ...(permissions && { permissions }),
        ...(location && { location })
      });
    } else {
      // Create new user
      const usersList = await userRepository.getAll();
      const newId = usersList.length > 0 ? Math.max(...usersList.map(u => u.id)) + 1 : 1;
      
      user = await userRepository.create({
        id: newId,
        telegram_id: telegramUser.id.toString(),
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        permissions: permissions || { is_logging_allowed: false, is_notification_allowed: false },
        location: location || undefined
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /user endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import { habitRepository } from '../data/HabitRepository';

// Admin API routes (Secured via simple header for this phase)
router.get('/admin/users', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await userRepository.getAll();
    const habits = await habitRepository.getAll();

    const usersWithStats = users.map(user => {
      const userHabits = habits.filter(h => h.user_id === user.id);
      const totalHabits = userHabits.length;
      const currentStreak = userHabits.reduce((acc, h) => acc + h.current_streak, 0); // or calculate average/max

      return {
        ...user,
        stats: {
          total_habits: totalHabits,
          current_streak: currentStreak
        }
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
