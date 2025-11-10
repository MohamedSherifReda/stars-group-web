import api from '@utils/api';
import type {
  Notification,
  CreateNotificationPayload,
  UpdateNotificationPayload,
  BroadCastNotificationPayload,
  ScheduledNotification,
} from 'core/types/notification.types';

/**
 * API service for managing push notifications
 */
export const notificationsApi = {
  /**
   * Get all notifications with optional filtering
   */
  getNotifications: (params?: Record<string, any>) =>
    api.get<{
      data: Notification[];
      meta: { total: number; skip: number; take: number };
    }>('/notifications', { params }),

  getScheduledNotifications: (params?: Record<string, any>) =>
    api.get<{
      data: ScheduledNotification[];
      meta: { total: number; skip: number; take: number };
    }>('/scheduled-notifications', { params }),

  getScheduledNotification: (id: number, params?: Record<string, any>) =>
    api.get<ScheduledNotification>(`/scheduled-notifications/${id}`, {
      params,
    }),

  /**
   * Get a single notification by ID
   */
  getNotification: (id: number, params?: Record<string, any>) =>
    api.get<Notification>(`/notifications/${id}`, { params }),

  /**
   * Create a new push notification
   */
  createNotification: (notification: CreateNotificationPayload) =>
    api.post<Notification>('/notifications', notification),
  /**
   * Broadcast a notification to all users
   */
  broadcastNotification: (notification: BroadCastNotificationPayload) =>
    api.post<Notification>('/notifications/broadcast', notification),

  /**
   * Update an existing notification (only scheduled ones can be updated)
   */
  updateNotification: (id: number, notification: UpdateNotificationPayload) =>
    api.patch<Notification>(`/notifications/${id}`, notification),

  /**
   * Delete a notification (only scheduled ones can be deleted)
   */
  deleteNotification: (id: number) => api.delete(`/notifications/${id}/soft`),
};

