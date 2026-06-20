export interface User {
  id: number;
  telegram_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  created_at: string;
  last_login: string;
  permissions: {
    is_logging_allowed: boolean;
    is_notification_allowed: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
  };
}
