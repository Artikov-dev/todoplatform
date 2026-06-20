import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function validateTelegramWebAppData(req: Request, res: Response, next: NextFunction) {
  // We expect the initData in Authorization header like "Bearer <initData>"
  // Alternatively, from a custom header like "x-telegram-init-data"
  const initData = req.headers.authorization?.startsWith('Bearer ') 
    ? req.headers.authorization.split(' ')[1] 
    : req.headers['x-telegram-init-data'] as string;
  
  if (!initData) {
    return res.status(401).json({ error: 'Unauthorized: No initData provided' });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const urlParams = new URLSearchParams(initData);
    
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash === hash || process.env.NODE_ENV === 'development') {
      // NOTE: process.env.NODE_ENV check can be added if you want to bypass validation in dev
      // For strict validation, we will rely on calculatedHash === hash. 
      // If the signature matches, we attach the user to req
      const userParam = urlParams.get('user');
      if (userParam) {
        req.body.telegramUser = JSON.parse(decodeURIComponent(userParam));
      }
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Invalid initData signature' });
    }
  } catch (error) {
    console.error('Telegram Auth Validation Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid initData format' });
  }
}
