import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Clock,
  CalendarIcon,
  Filter,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { notificationsApi } from '@features/notification/notification.apis';
import type {
  Notification,
  CreateNotificationPayload,
} from 'core/types/notification.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/common/dialog';
import { Button } from '@ui/common/button';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';
import { Textarea } from '@ui/common/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Badge } from '@ui/common/badge';
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import { Calendar } from '@ui/common/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/common/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { cn } from '@utils/cn';
import serveNotificationsMeta from '~/meta/serveNotificationsMeta';
import {
  UsersDropdown,
  ALL_USERS_VALUE,
  RANK_SILVER,
  RANK_GOLD,
  RANK_PLATINUM,
} from '@features/user/components/UsersDropdown';
import type {
  BroadCastNotificationPayload,
  ScheduledNotification,
} from 'core/types/notification.types';
import SelectInput from '@ui/common/SelectInput';
import { brandsApi } from '@features/brand/brand.apis';
import type { Brand } from 'core/types/brand.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { Field, FieldLabel } from '@ui/common/field';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@ui/common/sheet';
import NotificationsFilters from '@features/notification/components/NotificationsFilters';
import ExportToExcel from '@ui/common/ExportToExcel/ExportToExcel';

import {
  getAllExportedToExcelNotifications,
  getAllExportedToExcelScheduledNotifications,
} from '@features/notification/helpers';

export const meta = serveNotificationsMeta;

const redirectionUrls = [
  {
    label: '/brand',
    value: '/brand',
  },
  {
    label: '/home',
    value: '/home',
  },
  {
    label: '/brand/id',
    value: '/brand/id',
  },
  {
    label: '/SDK',
    value: '/sdk',
  },
];

export default function Notifications() {
  // Zod schema for notification form validation
  const notificationSchema = z
    .object({
      title: z
        .string()
        .min(1, 'Title is required')
        .trim()
        .min(1, 'Title cannot be blank')
        .max(100, 'Title must be less than 100 characters'),
      message: z
        .string()
        .min(1, 'Message is required')
        .trim()
        .min(1, 'Message cannot be blank')
        .max(500, 'Message must be less than 500 characters'),
      users: z.array(z.string()).min(1, 'Please select at least one user'),
      link: z.string().optional(),
      scheduled_at: z
        .string()
        .optional()
        .refine(
          (value) => {
            // if value is not provided, return true since it's optional
            if (!value) return true;
            const scheduledDate = new Date(value);
            const now = new Date();
            // Compare timestamps to avoid any date object comparison quirks
            return scheduledDate.getTime() >= now.getTime();
          },
          {
            message: 'Scheduled date and time must be in the future',
          }
        ),
      brand_id: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.link &&
        data.link === redirectionUrls[2]?.value &&
        !data.brand_id?.trim()
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['brand_id'],
          message: 'Brand is required when link is provided',
        });
      }
    });
  type NotificationFormData = z.infer<typeof notificationSchema>;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Reset filters and pagination when switching tabs
  useEffect(() => {
    setAppliedFilters({});
    setTempFilters({});
    setCurrentPage(1);
    setScheduledCurrentPage(1);
  }, [activeTab]);

  // Pagination state for all notifications
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination state for scheduled notifications
  const [scheduledCurrentPage, setScheduledCurrentPage] = useState(1);
  const [scheduledPageSize, setScheduledPageSize] = useState(10);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [tempFilters, setTempFilters] = useState<any>({});
  const [isLoadingExportedNotifications, setIsLoadingExportedNotifications] =
    useState(false);
  const [
    isLoadingExportedScheduledNotifications,
    setIsLoadingExportedScheduledNotifications,
  ] = useState(false);
  const [exportedNotifications, setExportedNotifications] = useState<
    Notification[]
  >([]);
  const [exportedScheduledNotifications, setExportedScheduledNotifications] =
    useState<ScheduledNotification[]>([]);
  const queryClient = useQueryClient();

  // Pagination state for brands used in the SelectInput
  const [brandPage, setBrandPage] = useState(1);
  const BRAND_PAGE_SIZE = 5;
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  // React Hook Form for create/edit form with Zod validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      users: [],
      link: '/home',
      scheduled_at: '',
    },
  });

  // Fetch notifications with pagination
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications', currentPage, pageSize, appliedFilters],
    queryFn: () => {
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

      return notificationsApi
        .getNotifications({
          'pagination[take]': pageSize,
          'pagination[skip]': (currentPage - 1) * pageSize,
          'relations[user]': 'true',
          'orders[created_at]': 'desc',
          filters,
        })
        .then((res) => res.data);
    },
  });

  const notifications = notificationsResponse?.data || [];

  const totalNotifications = notificationsResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalNotifications / pageSize);

  // Fetch scheduled notifications with pagination
  const {
    data: scheduledNotificationsResponse,
    isLoading: isLoadingScheduled,
  } = useQuery({
    queryKey: [
      'scheduled-notifications',
      scheduledCurrentPage,
      scheduledPageSize,
      appliedFilters,
    ],
    queryFn: () => {
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

      return notificationsApi
        .getScheduledNotifications({
          'pagination[take]': scheduledPageSize,
          'pagination[skip]': (scheduledCurrentPage - 1) * scheduledPageSize,
          'orders[created_at]': 'desc',
          filters,
        })
        .then((res) => res.data);
    },
    staleTime: 0,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 mins
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  const { data: brandsPage, isFetching: isFetchingBrands } = useQuery({
    queryKey: ['brands', brandPage, BRAND_PAGE_SIZE],
    queryFn: () =>
      brandsApi
        .getBrands({
          'pagination[take]': BRAND_PAGE_SIZE,
          'pagination[skip]': (brandPage - 1) * BRAND_PAGE_SIZE,
        })
        .then((res: any) => res.data),
  });

  // Accumulate brands across pages while avoiding duplicates
  useEffect(() => {
    if (brandsPage?.data) {
      setAllBrands((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const newItems = brandsPage.data.filter(
          (b: Brand) => !existingIds.has(b.id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [brandsPage?.data]);

  const totalBrands = brandsPage?.meta?.total ?? 0;
  const loadedBrandsCount = allBrands.length;
  const hasMoreBrands = totalBrands > 0 && loadedBrandsCount < totalBrands;

  const scheduledNotifications = scheduledNotificationsResponse?.data || [];
  const totalScheduledNotifications =
    scheduledNotificationsResponse?.meta?.total || 0;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (notification: CreateNotificationPayload) =>
      notificationsApi.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setIsCreateOpen(false);
      setCurrentPage(1); // Reset to first page to see the new notification
      reset();
      toast.success('Notification created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create notification'
      );
    },
  });

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (notification: BroadCastNotificationPayload) =>
      notificationsApi.broadcastNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setIsCreateOpen(false);
      setCurrentPage(1);
      reset();
      toast.success('Notification broadcasted to all users successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to broadcast notification'
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      notification,
    }: {
      id: number;
      notification: CreateNotificationPayload;
    }) => notificationsApi.updateNotification(id, notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setEditingNotification(null);
      reset();
      toast.success('Notification updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update notification'
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete notification'
      );
    },
  });

  // Handle form submission
  const onSubmit = (data: NotificationFormData) => {
    const isAllUsers = data.users.includes(ALL_USERS_VALUE);

    if (isAllUsers) {
      // Use broadcast endpoint for "All users"
      const broadcastData: BroadCastNotificationPayload = {
        title: data.title.trim(),
        message: data.message.trim(),
        ...(data.brand_id && !Number.isNaN(parseInt(data.brand_id as string))
          ? { brand_id: parseInt(data.brand_id) }
          : {}),
        ...(data.link && {
          link: data?.link === '/brand/id' ? '/brand' : data?.link,
        }),
        ...(data.scheduled_at && {
          schedule_at: data.scheduled_at,
        }),
      };

      broadcastMutation.mutate(broadcastData);
    } else {
      // Use regular endpoint for specific users and/or rank-based targeting
      const selectedIds = data.users;

      // Derive ranks from special selection values (can be multiple, e.g. Silver & Gold)
      const ranks: number[] = [];
      if (selectedIds.includes(RANK_SILVER)) {
        ranks.push(1);
      }
      if (selectedIds.includes(RANK_GOLD)) {
        ranks.push(2);
      }
      if (selectedIds.includes(RANK_PLATINUM)) {
        ranks.push(3);
      }

      // Filter out non-user pseudo-values to build the users array
      const userIds = selectedIds
        .filter(
          (id) => id !== RANK_SILVER && id !== RANK_GOLD && id !== RANK_PLATINUM
        )
        .map((id) => parseInt(id, 10))
        .filter((id) => !Number.isNaN(id));

      const hasUsers = userIds.length > 0;

      const notificationData: CreateNotificationPayload = {
        title: data.title.trim(),
        message: data.message.trim(),
        // If only a rank is selected (no individual users), users should be null
        ...(hasUsers ? { users: userIds } : {}),

        ...(data.brand_id && !Number.isNaN(parseInt(data.brand_id as string))
          ? { brand_id: parseInt(data.brand_id) }
          : {}),
        ...(data.link && {
          link: data?.link === '/brand/id' ? '/brand' : data?.link,
        }),
        ...(data.scheduled_at && {
          schedule_at: data.scheduled_at,
        }),
        ...(ranks.length ? { ranks: ranks } : {}),
      };

      if (editingNotification) {
        updateMutation.mutate({
          id: editingNotification.id,
          notification: notificationData,
        });
      } else {
        createMutation.mutate(notificationData);
      }
    }
  };

  const handleEdit = (notification: Notification) => {
    if (notification.status === 'sent') {
      toast.error('Cannot edit a notification that has already been sent');
      return;
    }

    setEditingNotification(notification);

    const userIds =
      notification.users?.map((userId: number) => userId.toString()) || [];

    // Map rank array back to special selection values for the dropdown
    const ranks = notification.rank || [];
    if (Array.isArray(ranks)) {
      if (ranks.includes(1)) {
        userIds.push(RANK_SILVER);
      }
      if (ranks.includes(2)) {
        userIds.push(RANK_GOLD);
      }
      if (ranks.includes(3)) {
        userIds.push(RANK_PLATINUM);
      }
    }
    reset({
      title: notification.title,
      message: notification.message,
      users: userIds,
      link: notification.link || '',
      scheduled_at: notification.schedule_at || '',
    });
  };

  const handleDelete = (notification: Notification) => {
    if (notification.status === 'sent') {
      toast.error('Cannot delete a notification that has already been sent');
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to delete this notification? This action cannot be undone.'
      )
    ) {
      deleteMutation.mutate(notification.id);
    }
  };

  const handleSendNow = (notification: Notification) => {
    if (notification.status === 'sent') {
      toast.error('This notification has already been sent');
      return;
    }

    // if (
    //   window.confirm(
    //     'Are you sure you want to send this notification immediately to all users?'
    //   )
    // ) {
    //   sendNowMutation.mutate(notification.id);
    // }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
    setIsFilterSidebarOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
    setIsFilterSidebarOpen(false);
  };

  const handleOpenFilters = () => {
    setTempFilters(appliedFilters);
    setIsFilterSidebarOpen(true);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Define table columns for all notifications
  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
      accessorKey: 'user.name',
      header: 'Receiver',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => (
        <span className="max-w-xs truncate block">{row.original.message}</span>
      ),
      className: 'max-w-xs',
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      accessorKey: 'is_read',
      header: 'Read Status',
      cell: ({ row }) => (row.original?.is_read ? 'Yes' : 'No'),
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const notification = row.original;
        return (
          <div className="flex space-x-2">
            {notification.status === 'scheduled' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(notification)}
                  title="Edit notification"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendNow(notification)}
                  title="Send now"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </>
            )}
            {notification.status !== 'sent' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(notification)}
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Define table columns for scheduled notifications
  const scheduledColumns: ColumnDef<ScheduledNotification>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => (
        <span className="max-w-xs truncate block">{row.original.message}</span>
      ),
      className: 'max-w-xs',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          className={cn({
            'bg-green-500 hover:bg-green-600':
              row.original.status === 'completed',
            'bg-blue-500 hover:bg-blue-600': row.original.status === 'pending',
            'bg-yellow-500 hover:bg-yellow-600':
              row.original.status === 'processing',
            'bg-red-500 hover:bg-red-600': row.original.status === 'failed',
          })}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'schedule_at',
      header: 'Scheduled At',
      cell: ({ row }) => formatDateTime(row.original.schedule_at),
    },
    {
      accessorKey: 'processed_count',
      header: 'Processed',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.processed_count}</span>
      ),
    },
    {
      accessorKey: 'failed_count',
      header: 'Failed',
      cell: ({ row }) => (
        <span className="font-medium text-red-500">
          {row.original.failed_count}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
  ];

  // loading all of the banners that match the applied filters to prepare them for export to excel...
  useEffect(() => {
    getAllExportedToExcelNotifications(
      appliedFilters,
      setIsLoadingExportedNotifications,
      setExportedNotifications
    );
    getAllExportedToExcelScheduledNotifications(
      appliedFilters,
      setIsLoadingExportedScheduledNotifications,
      setExportedScheduledNotifications
    );
  }, [appliedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Push Notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Send and manage push notifications to your app users.
          </p>
        </div>
        <div className="flex flex-row-reverse gap-4">
          <Button
            variant="outline"
            onClick={handleOpenFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(appliedFilters).filter(
              (v) => v !== undefined && v !== '' && v !== 'all'
            ).length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 min-w-[1.25rem]"
              >
                {
                  Object.values(appliedFilters).filter(
                    (v) => v !== undefined && v !== '' && v !== 'all'
                  ).length
                }
              </Badge>
            )}
          </Button>
          <ExportToExcel
            isFetchingData={
              isLoadingExportedNotifications ||
              isLoadingExportedScheduledNotifications
            }
            data={
              activeTab === 'all'
                ? exportedNotifications || []
                : exportedScheduledNotifications || []
            }
            fileName={
              activeTab === 'all'
                ? 'notifications.xlsx'
                : 'scheduled_notifications.xlsx'
            }
          />
          <Dialog
            open={isCreateOpen}
            onOpenChange={() => {
              reset();
              setIsCreateOpen((prev) => !prev);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl ">
              <DialogHeader>
                <DialogTitle>Create Push Notification</DialogTitle>
                <DialogDescription>
                  Compose a new push notification to send to all users.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter notification title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Enter notification message"
                    rows={4}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Recipients */}
                  <div className="space-y-2">
                    <Label>
                      Recipients <span className="text-red-500">*</span>
                    </Label>
                    <UsersDropdown
                      control={control}
                      name="users"
                      placeholder="Select users to notify..."
                      multiple={true}
                      showAllUsersOption={true}
                      renderUser={(user) => `${user.name} (${user.email})`}
                      {...(errors.users?.message && {
                        error: errors.users.message,
                      })}
                      pageSize={20}
                    />
                    {watch('users')?.length > 0 && (
                      <p className="text-sm text-gray-600">
                        {watch('users').includes(ALL_USERS_VALUE)
                          ? 'Broadcasting to all users'
                          : `${watch('users').length} user${
                              watch('users').length !== 1 ? 's' : ''
                            } selected`}
                      </p>
                    )}
                  </div>
                  {/* Brand (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="brand_id">Brand (Optional)</Label>
                    <SelectInput
                      options={allBrands.map((brand: Brand) => ({
                        label: brand.name,
                        value: brand.id.toString(),
                      }))}
                      control={control}
                      name="brand_id"
                      placeholder="Select a brand"
                      id="brand_id"
                      loadedCount={loadedBrandsCount}
                      totalCount={totalBrands}
                      hasMore={hasMoreBrands}
                      isLoadingMore={isFetchingBrands}
                      onLoadMore={() => {
                        if (hasMoreBrands && !isFetchingBrands) {
                          setBrandPage((prev) => prev + 1);
                        }
                      }}
                    />
                    {errors?.brand_id && (
                      <p className="text-sm text-red-500">
                        {errors?.brand_id?.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Redirect URL */}
                <div className="space-y-2">
                  <Controller
                    name="link"
                    control={control}
                    render={({ field }) => {
                      return (
                        <Field>
                          <FieldLabel htmlFor="link">
                            Redirect URL (Optional)
                          </FieldLabel>
                          <Select
                            value={field?.value || ''}
                            onValueChange={(value) => {
                              setValue('link', value);
                              if (value === '/brand-id/x') {
                                setSelectedBrandId(null);
                              }
                            }}
                          >
                            <SelectTrigger id="link">
                              <SelectValue placeholder="Select a redirection url" />
                            </SelectTrigger>
                            <SelectContent>
                              {redirectionUrls.map((item) => {
                                return (
                                  <SelectItem
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </Field>
                      );
                    }}
                  />
                  {errors.link && (
                    <p className="text-sm text-red-500">
                      {errors.link.message}
                    </p>
                  )}
                  {/* {notificationLinkValue === '/brand-id/x' && (
                  <Controller
                    name="brand_url_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedBrandId(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {allBrands?.map((brand: Brand) => {
                            return (
                              <SelectItem
                                key={brand?.id}
                                value={String(brand?.id)}
                              >
                                {brand?.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors?.brand_url_id && (
                  <p className="text-sm text-red-500">
                    {errors?.brand_url_id.message}
                  </p>
                )} */}
                  <p className="text-sm text-gray-500">
                    Optional: Add a link to direct users to a specific page
                  </p>
                </div>

                {/* Schedule date and time for the notification */}
                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">
                    Schedule Date and Time (Optional)
                  </Label>
                  <Controller
                    name="scheduled_at"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'flex-1 justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), 'PPP p')
                                : 'Pick a date and time'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve time if already set, otherwise set to current time
                                  const currentDate = field.value
                                    ? new Date(field.value)
                                    : new Date();
                                  date.setHours(currentDate.getHours());
                                  date.setMinutes(currentDate.getMinutes());
                                  field.onChange(date.toISOString());
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                            <div className="border-t p-3">
                              <Label className="text-sm">Time</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="23"
                                  placeholder="HH"
                                  value={
                                    field.value
                                      ? new Date(field.value)
                                          .getHours()
                                          .toString()
                                          .padStart(2, '0')
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 0;
                                    const date = field.value
                                      ? new Date(field.value)
                                      : new Date();
                                    date.setHours(hours);
                                    field.onChange(date.toISOString());
                                  }}
                                  className="w-16"
                                />
                                <span className="self-center">:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  placeholder="MM"
                                  value={
                                    field.value
                                      ? new Date(field.value)
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, '0')
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const minutes =
                                      parseInt(e.target.value) || 0;
                                    const date = field.value
                                      ? new Date(field.value)
                                      : new Date();
                                    date.setMinutes(minutes);
                                    field.onChange(date.toISOString());
                                  }}
                                  className="w-16"
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange(undefined)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    )}
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to send immediately, or select a date and time
                    to schedule
                  </p>
                  {errors?.scheduled_at?.message && (
                    <p className="text-sm text-red-500">
                      {errors.scheduled_at.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || broadcastMutation.isPending
                    }
                  >
                    {createMutation.isPending || broadcastMutation.isPending
                      ? 'Sending...'
                      : 'Send Notification'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl">Filters</SheetTitle>
          </SheetHeader>

          <NotificationsFilters
            tempFilters={tempFilters}
            setTempFilters={setTempFilters}
            redirectionUrls={redirectionUrls?.slice(0, 2)}
            activeTab={activeTab}
          />

          <SheetFooter className="border-t pt-4 flex-row gap-2 mt-auto">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsFilterSidebarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1 gap-2 border"
              onClick={handleClearFilters}
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Filter
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Notifications Management</CardTitle>
          <CardDescription>
            View and manage all push notifications sent to your users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Notifications</TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <DataTable
                columns={columns}
                data={notifications}
                pagination={{
                  pageIndex: currentPage,
                  pageSize: pageSize,
                  totalItems: totalNotifications,
                }}
                onPaginationChange={(pageIndex, pageSize) => {
                  setCurrentPage(pageIndex);
                  setPageSize(pageSize);
                }}
                isLoading={isLoading}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12">
                    <Send className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No notifications yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Create your first notification to get started
                    </p>
                  </div>
                }
              />
            </TabsContent>

            <TabsContent value="scheduled">
              <DataTable
                columns={scheduledColumns}
                data={scheduledNotifications}
                pagination={{
                  pageIndex: scheduledCurrentPage,
                  pageSize: scheduledPageSize,
                  totalItems: totalScheduledNotifications,
                }}
                onPaginationChange={(pageIndex, pageSize) => {
                  setScheduledCurrentPage(pageIndex);
                  setScheduledPageSize(pageSize);
                }}
                isLoading={isLoadingScheduled}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">
                      No scheduled notifications
                    </p>
                    <p className="text-gray-400 text-sm">
                      Schedule notifications to be sent at a specific time
                    </p>
                  </div>
                }
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Notification Dialog */}
      <Dialog
        open={!!editingNotification}
        onOpenChange={() => setEditingNotification(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription>
              Update the notification details before it is sent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_title"
                {...register('title')}
                placeholder="Enter notification title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_message">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit_message"
                {...register('message')}
                placeholder="Enter notification message"
                rows={4}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_scheduled_at">
                Schedule Date and Time (Optional)
              </Label>
              <Controller
                name="scheduled_at"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'flex-1 justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), 'PPP p')
                            : 'Pick a date and time'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              // Preserve time if already set, otherwise set to current time
                              const currentDate = field.value
                                ? new Date(field.value)
                                : new Date();
                              date.setHours(currentDate.getHours());
                              date.setMinutes(currentDate.getMinutes());
                              field.onChange(date.toISOString());
                            }
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                        <div className="border-t p-3">
                          <Label className="text-sm">Time</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="number"
                              min="0"
                              max="23"
                              placeholder="HH"
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')
                                  : ''
                              }
                              onChange={(e) => {
                                const hours = parseInt(e.target.value) || 0;
                                const date = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                date.setHours(hours);
                                field.onChange(date.toISOString());
                              }}
                              className="w-16"
                            />
                            <span className="self-center">:</span>
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              placeholder="MM"
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')
                                  : ''
                              }
                              onChange={(e) => {
                                const minutes = parseInt(e.target.value) || 0;
                                const date = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                date.setMinutes(minutes);
                                field.onChange(date.toISOString());
                              }}
                              className="w-16"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange(undefined)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              />
              <p className="text-sm text-gray-500">
                Leave empty to send immediately, or select a date and time to
                schedule
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Recipients <span className="text-red-500">*</span>
              </Label>
              <UsersDropdown
                control={control}
                name="users"
                placeholder="Select users to notify..."
                multiple={true}
                showAllUsersOption={true}
                renderUser={(user) => `${user.name} (${user.email})`}
                {...(errors.users?.message && { error: errors.users.message })}
                pageSize={20}
              />
              {watch('users')?.length > 0 && (
                <p className="text-sm text-gray-600">
                  {watch('users').includes(ALL_USERS_VALUE)
                    ? 'Broadcasting to all users'
                    : `${watch('users').length} user${
                        watch('users').length !== 1 ? 's' : ''
                      } selected`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_link">Redirect URL (Optional)</Label>
              <Input
                id="edit_link"
                type="url"
                {...register('link')}
                placeholder="https://example.com"
              />
              {errors.link && (
                <p className="text-sm text-red-500">{errors.link.message}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="edit_scheduled_at">Schedule (Optional)</Label>
              <Input
                id="edit_scheduled_at"
                type="datetime-local"
                {...register('scheduled_at')}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div> */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingNotification(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending || broadcastMutation.isPending
                }
              >
                {updateMutation.isPending || broadcastMutation.isPending
                  ? 'Updating...'
                  : 'Update Notification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
