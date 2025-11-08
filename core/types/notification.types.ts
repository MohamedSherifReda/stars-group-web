import type { User } from "./user.types";


export interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  brand_id?: number;
  users?: number[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // the rest are not yet implemented by the backend...
  scheduled_at?: string; // ISO date string
  sent_at?: string; // ISO date string - when notification was actually sent
  status?: 'scheduled' | 'sent' | 'failed';
  user?: User;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  users: number[];
  link?: string;
  // not yet implemented by the backend...
  scheduled_at?: string;
  brand_id?: number;
  
}


export interface BroadCastNotificationPayload {
  title: string;
  message: string;
  link?: string;
  brand_id?: number;
}

export interface UpdateNotificationPayload {
  title?: string;
  message?: string;
  link?: string;
  scheduled_at?: string;
  target_audience?: 'all';
}

