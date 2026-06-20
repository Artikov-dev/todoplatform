import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { bot } from './bot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start the bot in webhook or long polling mode
  // Using long polling for simplicity in development
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    bot.launch().then(() => {
      console.log('Telegram Bot started');
    }).catch(err => console.error('Failed to start Telegram Bot', err));
  } else {
    console.warn('Skipping bot launch due to missing or placeholder token.');
  }
});
