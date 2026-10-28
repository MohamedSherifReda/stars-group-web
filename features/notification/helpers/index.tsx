import toast from "react-hot-toast";

import type { Dispatch, SetStateAction } from "react";
import type { Notification, ScheduledNotification } from "core/types/notification.types";
import { notificationsApi } from "../notification.apis";

import { fetchAllForExport, exportTruncatedMessage } from "@utils/exportPaging";

export async function getAllExportedToExcelNotifications(
  appliedFilters: any,
  loaderSetter: Dispatch<SetStateAction<boolean>>,
  exportedDataSetter: Dispatch<SetStateAction<Notification[]>>
) {
  try {
    loaderSetter(true);
    const filters: any = {};
    const notificationsFilters = [
      'title',
      'message',
      'link',
      'is_read',
      'created_at',
      'brand_id',
    ];
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        value !== 'all' &&
        notificationsFilters.includes(key)
      ) {
        if (key === 'created_at') {
          filters[key] = {
            $val: new Date(value as string).toISOString(),
            $op: 'Eq',
          };
        } else if (key === 'is_read') {
          filters[key] = {
            $val: value === 'true',
            $op: 'Is',
          };
        } else if (key === 'brand_id') {
          filters[key] = {
            $val: parseInt(value as string, 10),
            $op: 'Eq',
          };
        } else {
          filters[key] = {
            $val: value,
            $op: 'Contains',
          };
        }
      }
    });

    const { rows, truncated } = await fetchAllForExport<Notification>((pagination) =>
      notificationsApi
        .getNotifications({
          relations: {
            user: true,
          },
          orders: {
            created_at: 'desc',
          },
          pagination,
          filters: filters,
        })
        .then((res) => res.data)
    );
    if (truncated) toast(exportTruncatedMessage);
    // Only keep what the export needs from the nested user (never tokens / device data)
    exportedDataSetter(
      rows.map((n) => {
        const { user, ...rest } = n;
        return user ? { ...rest, user: { id: user.id, name: user.name } as typeof user } : rest;
      })
    );
  } catch (error) {
    if (import.meta.env.DEV) console.error('notifications export failed', (error as Error)?.message);
    toast.error('Failed to export notifications. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}

// scheduled notifications
export async function getAllExportedToExcelScheduledNotifications(
  appliedFilters: any, loaderSetter: Dispatch<SetStateAction<boolean>>, exportedDataSetter: Dispatch<SetStateAction<ScheduledNotification[]>>
) {
  try {
    loaderSetter(true);
      const filters: any = {};
      const scheduledFilters = [
        'title',
        'message',
        'status',
        'type',
        'schedule_at',
        'processed_count',
        'failed_count',
        'created_at',
      ];
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== '' &&
          value !== 'all' &&
          scheduledFilters.includes(key)
        ) {
          if (key === 'created_at' || key === 'schedule_at') {
            filters[key] = {
              $val: new Date(value as string).toISOString(),

              $op: 'Eq',
            };
          } else if (key === 'processed_count' || key === 'failed_count') {
            filters[key] = {
              $val: parseInt(value as string, 10),
              $op: 'Eq',
            };
          } else {
            filters[key] = {
              $val: value,
              $op: 'Contains',
            };
          }
        }
      });

    const { rows, truncated } = await fetchAllForExport<ScheduledNotification>((pagination) =>
      notificationsApi
        .getScheduledNotifications({
          orders: {
            created_at: 'desc',
          },
          pagination,
          filters: filters,
        })
        .then((res) => res.data)
    );
    if (truncated) toast(exportTruncatedMessage);
    exportedDataSetter(rows);
  } catch (error) {
    if (import.meta.env.DEV) console.error('notifications export failed', (error as Error)?.message);
    toast.error('Failed to export scheduled notifications. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}
