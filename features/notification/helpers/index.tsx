import toast from "react-hot-toast";

import type { Dispatch, SetStateAction } from "react";
import type { Notification, ScheduledNotification } from "core/types/notification.types";
import { notificationsApi } from "../notification.apis";

const MAX_EXPORTED_RECORDS_COUNT = 1000000;

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
        } else {
          filters[key] = {
            $val: value,
            $op: 'Contains',
          };
        }
      }
    });

    const exportedNotifications = await notificationsApi.getNotifications({
      relations: {
        user: true,
      },
      orders: {
        created_at: 'desc',
      },
      pagination: {
        take: MAX_EXPORTED_RECORDS_COUNT,
      },
      filters: filters,
    });

    const exportedNotificationsArr = exportedNotifications?.data?.data || [];
    exportedDataSetter(exportedNotificationsArr);
  } catch (error) {
    console.error(error);
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

    const exportedData = await notificationsApi.getScheduledNotifications({
      orders: {
        created_at: 'desc',
      },
      pagination: {
        take: MAX_EXPORTED_RECORDS_COUNT,
      },
      filters: filters,
    });

    const exportedDataArr = exportedData?.data?.data || [];
    exportedDataSetter(exportedDataArr);
  } catch (error) {
    console.error(error);
    toast.error('Failed to export scheduled notifications. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}
