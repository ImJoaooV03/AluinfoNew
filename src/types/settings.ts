export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  updated_at?: string;
}

export interface NotificationSettings {
  email_news: boolean;
  email_security: boolean;
  push_comments: boolean;
  push_orders: boolean;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
