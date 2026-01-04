import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@utils/cn';

import { Button } from '@ui/common/button';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';
import { Textarea } from '@ui/common/textarea';
import { Calendar } from '@ui/common/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/common/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/common/select';
import { Field, FieldLabel } from '@ui/common/field';
import { DialogFooter } from '@ui/common/dialog';
import SelectInput from '@ui/common/SelectInput';
import { UsersDropdown, ALL_USERS_VALUE, RANK_SILVER, RANK_GOLD, RANK_PLATINUM } from '@features/user/components/UsersDropdown';

import type { Brand } from 'core/types/brand.types';
import type { CreateNotificationPayload, BroadCastNotificationPayload } from 'core/types/notification.types';

import { redirectionUrls } from '../constants';

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
          if (!value) return true;
          const scheduledDate = new Date(value);
          const now = new Date();
          return scheduledDate.getTime() >= now.getTime();
        },
        {
          message: 'Scheduled date and time must be in the future',
        }
      ),
    brand_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.link === '/brand/id' && !data.brand_id?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['brand_id'],
        message: 'Brand is required when link is provided',
      });
    }
  });

type NotificationFormData = z.infer<typeof notificationSchema>;

interface NotificationFormProps {
  allBrands: Brand[];
  totalBrands: number;
  loadedBrandsCount: number;
  hasMoreBrands: boolean;
  isFetchingBrands: boolean;
  onLoadMoreBrands: () => void;
  isSubmitting: boolean;
  onSuccess?: () => void;
  onCancel: () => void;
  onSubmit: (payload: CreateNotificationPayload | BroadCastNotificationPayload, isBroadcast: boolean) => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({
  allBrands,
  totalBrands,
  loadedBrandsCount,
  hasMoreBrands,
  isFetchingBrands,
  onLoadMoreBrands,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
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

  const notificationLinkValue = watch('link');
  const selectedUsers = watch('users') || [];

  const handleActualSubmit = (data: NotificationFormData) => {
    const isAllUsers = data.users.includes(ALL_USERS_VALUE);

    if (isAllUsers) {
      const broadcastData: BroadCastNotificationPayload = {
        title: data.title.trim(),
        message: data.message.trim(),
        ...(data.brand_id && !Number.isNaN(parseInt(data.brand_id))
          ? { brand_id: parseInt(data.brand_id) }
          : {}),
        ...(data.link && {
          link: data.link === '/brand/id' ? '/brand' : data.link,
        }),
        ...(data.scheduled_at && {
          schedule_at: data.scheduled_at,
        }),
      };
      onSubmit(broadcastData, true);
    } else {
      const selectedIds = data.users;
      const ranks: number[] = [];
      if (selectedIds.includes(RANK_SILVER)) ranks.push(1);
      if (selectedIds.includes(RANK_GOLD)) ranks.push(2);
      if (selectedIds.includes(RANK_PLATINUM)) ranks.push(3);

      const userIds = selectedIds
        .filter((id) => id !== RANK_SILVER && id !== RANK_GOLD && id !== RANK_PLATINUM)
        .map((id) => parseInt(id, 10))
        .filter((id) => !Number.isNaN(id));

      const hasUsers = userIds.length > 0;

      const notificationData: CreateNotificationPayload = {
        title: data.title.trim(),
        message: data.message.trim(),
        ...(hasUsers ? { users: userIds } : {}),
        ...(data.brand_id && !Number.isNaN(parseInt(data.brand_id))
          ? { brand_id: parseInt(data.brand_id) }
          : {}),
        ...(data.link && {
          link: data.link === '/brand/id' ? '/brand' : data.link,
        }),
        ...(data.scheduled_at && {
          schedule_at: data.scheduled_at,
        }),
        ...(ranks.length ? { ranks: ranks } : {}),
      };

      onSubmit(notificationData, false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit(handleActualSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input id="title" {...register('title')} placeholder="Enter notification title" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-red-500">*</span>
        </Label>
        <Textarea id="message" {...register('message')} placeholder="Enter notification message" rows={4} />
        {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
      </div>

      {/* Redirect URL */}
      <div className="space-y-2">
        <Controller
          name="link"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="link">Redirect URL (Optional)</FieldLabel>
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Clear brand_id if link is changed away from /brand/id
                  if (value !== '/brand/id') {
                    setValue('brand_id', undefined);
                  }
                }}
              >
                <SelectTrigger id="link">
                  <SelectValue placeholder="Select a redirection url" />
                </SelectTrigger>
                <SelectContent>
                  {redirectionUrls.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        {errors.link && <p className="text-sm text-red-500">{errors.link.message}</p>}
        <p className="text-sm text-gray-500">Optional: Add a link to direct users to a specific page</p>
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
          {selectedUsers.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedUsers.includes(ALL_USERS_VALUE)
                ? 'Broadcasting to all users'
                : `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`}
            </p>
          )}
        </div>

        {/* Brand (Conditional) */}
        {notificationLinkValue === '/brand/id' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label htmlFor="brand_id">Brand <span className="text-red-500">*</span></Label>
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
              onLoadMore={onLoadMoreBrands}
            />
            {errors.brand_id && <p className="text-sm text-red-500">{errors.brand_id.message}</p>}
          </div>
        )}

        {/* Schedule date and time */}
        <div className={cn("space-y-2", notificationLinkValue === '/brand/id' && "col-span-2")}>
          <Label htmlFor="scheduled_at">Schedule Date and Time (Optional)</Label>
          <Controller
            name="scheduled_at"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('flex-1 justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), 'PPP p') : 'Pick a date and time'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentDate = field.value ? new Date(field.value) : new Date();
                          date.setHours(currentDate.getHours());
                          date.setMinutes(currentDate.getMinutes());
                          field.onChange(date.toISOString());
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                          value={field.value ? new Date(field.value).getHours().toString().padStart(2, '0') : ''}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value) || 0;
                            const date = field.value ? new Date(field.value) : new Date();
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
                          value={field.value ? new Date(field.value).getMinutes().toString().padStart(2, '0') : ''}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0;
                            const date = field.value ? new Date(field.value) : new Date();
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
                  <Button type="button" variant="outline" onClick={() => field.onChange(undefined)}>
                    Clear
                  </Button>
                )}
              </div>
            )}
          />
          <p className="text-sm text-gray-500">Leave empty to send immediately, or select a date and time to schedule</p>
          {errors.scheduled_at && <p className="text-sm text-red-500">{errors.scheduled_at.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Notification'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default NotificationForm;