import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.warn('TELEGRAM_BOT_TOKEN is not defined or is a placeholder in the environment variables.');
}

export const bot = new Telegraf(BOT_TOKEN || 'placeholder_token');

bot.start((ctx) => {
  const webAppUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://your-vercel-domain.vercel.app';
  
  ctx.reply(
    'Welcome to Antigravity! 🚀\n\nStart tracking your habits and boosting your productivity today.',
    Markup.inlineKeyboard([
      Markup.button.webApp('Launch Mini App', webAppUrl)
    ])
  );
});
