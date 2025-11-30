import type { User } from "./user.types";


export interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  brand_id?: number;
  users?: number[] | null;
  // Now supports multiple ranks (e.g. [1, 2] for Silver & Gold)
  rank?: number[] | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Backend uses schedule_at (without the 'd')
  schedule_at?: string; // ISO date string
  sent_at?: string; // ISO date string - when notification was actually sent
  status?: 'scheduled' | 'sent' | 'failed';
  user?: User;
}

export interface ScheduledNotification {
  id: number;
  title: string;
  message: string;
  link: any;
  brand_id?: number;
  type: string;
  status: string;
  schedule_at: string;
  target_user_ids: number[];
  processed_count: number;
  failed_count: number;
  processed_at: any;
  error_message: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  users: number[] | null;
  link?: string;
  // Backend expects schedule_at (without the 'd')
  schedule_at?: string;
  brand_id?: number;
  // Array of rank ids, e.g. [1, 2] for Silver & Gold
  rank?: number[] | null;
}

export interface BroadCastNotificationPayload {
  title: string;
  message: string;
  link?: string;
  brand_id?: number;
  schedule_at?: string;
}

export interface UpdateNotificationPayload {
  title?: string;
  message?: string;
  link?: string;
  schedule_at?: string;
  target_audience?: 'all';
  users?: number[] | null;
  // Array of rank ids, e.g. [1, 2] for Silver & Gold
  rank?: number[] | null;
}

