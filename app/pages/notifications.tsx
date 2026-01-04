import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Send, Clock, Filter, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  getAllExportedToExcelNotifications,
  getAllExportedToExcelScheduledNotifications,
} from '@features/notification/helpers';
import NotificationForm from '@features/notification/components/NotificationForm';
import { redirectionUrls } from '@features/notification/constants';
import type {
  Notification,
  CreateNotificationPayload,
  BroadCastNotificationPayload,
  ScheduledNotification,
} from 'core/types/notification.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/common/dialog';
import { Button } from '@ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Badge } from '@ui/common/badge';
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { cn } from '@utils/cn';
import serveNotificationsMeta from '~/meta/serveNotificationsMeta';
import { brandsApi } from '@features/brand/brand.apis';
import type { Brand } from 'core/types/brand.types';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@ui/common/sheet';
import NotificationsFilters from '@features/notification/components/NotificationsFilters';
import ExportToExcel from '@ui/common/ExportToExcel/ExportToExcel';
import { notificationsApi } from '@features/notification/notification.apis';

export const meta = serveNotificationsMeta;

export default function Notifications() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Pagination state for all notifications
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination state for scheduled notifications
  const [scheduledCurrentPage, setScheduledCurrentPage] = useState(1);
  const [scheduledPageSize, setScheduledPageSize] = useState(10);

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

  // Pagination state for brands used in the NotificationForm
  const [brandPage, setBrandPage] = useState(1);
  const BRAND_PAGE_SIZE = 5;
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  // Reset filters and pagination when switching tabs
  useEffect(() => {
    setAppliedFilters({});
    setTempFilters({});
    setCurrentPage(1);
    setScheduledCurrentPage(1);
  }, [activeTab]);

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

  const scheduledNotifications = scheduledNotificationsResponse?.data || [];
  const totalScheduledNotifications =
    scheduledNotificationsResponse?.meta?.total || 0;

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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (notification: CreateNotificationPayload) =>
      notificationsApi.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setIsCreateOpen(false);
      setCurrentPage(1);
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
      toast.success('Notification broadcasted to all users successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to broadcast notification'
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

  // Handle notification form submission
  const handleNotificationSubmit = (
    payload: CreateNotificationPayload | BroadCastNotificationPayload,
    isBroadcast: boolean
  ) => {
    if (isBroadcast) {
      broadcastMutation.mutate(payload as BroadCastNotificationPayload);
    } else {
      createMutation.mutate(payload as CreateNotificationPayload);
    }
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
    // sendNow logic was commented out in original file
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendNow(notification)}
                title="Send now"
              >
                <Send className="w-4 h-4" />
              </Button>
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
              <NotificationForm
                allBrands={allBrands}
                totalBrands={totalBrands}
                loadedBrandsCount={loadedBrandsCount}
                hasMoreBrands={hasMoreBrands}
                isFetchingBrands={isFetchingBrands}
                onLoadMoreBrands={() => {
                  if (hasMoreBrands && !isFetchingBrands) {
                    setBrandPage((prev) => prev + 1);
                  }
                }}
                isSubmitting={
                  createMutation.isPending || broadcastMutation.isPending
                }
                onCancel={() => setIsCreateOpen(false)}
                onSubmit={handleNotificationSubmit}
              />
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
    </div>
  );
}
