import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/common/popover';
import { usersApi } from '../user.apis';
import type { User } from 'core/types/user.types';
import { Button } from '@ui/common/button';
import { Loader2, Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@utils/cn';

interface UsersDropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string | string[]) => void;
  className?: string;
  defaultValue?: string | string[];
  label?: string;
  error?: string;
  /**
   * Number of users to load per page
   */
  pageSize?: number;
  /**
   * Custom render function for each user item
   */
  renderUser?: (user: User) => string;
  /**
   * Enable multiple user selection
   */
  multiple?: boolean;
  /**
   * Maximum number of users that can be selected (only for multiple mode)
   */
  maxSelections?: number;
  /**
   * Show "All users" option at the top (only for multiple mode)
   */
  showAllUsersOption?: boolean;
}

// Special constant for "All users" selection
export const ALL_USERS_VALUE = 'ALL_USERS';

export const UsersDropdown = <T extends FieldValues>({
  control,
  name,
  placeholder = 'Select a user',
  disabled = false,
  onValueChange,
  className,
  defaultValue,
  label,
  error,
  pageSize = 20,
  renderUser = (user) => user.name,
  multiple = false,
  maxSelections,
  showAllUsersOption = false,
}: UsersDropdownProps<T>) => {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: async () => {
      const response = await usersApi.getUsers({ "pagination[take]": pageSize, "pagination[skip]": (page - 1) * pageSize });
      return response.data;
    },
    enabled: true,
  });

  // Accumulate users as we load more pages
  useEffect(() => {
    if (data?.data) {
      setAllUsers((prev) => {
        // Remove duplicates by id
        const newUsers = data.data!.filter(
          (newUser) => !prev.some((existingUser) => existingUser.id === newUser.id)
        );
        return [...prev, ...newUsers];
      });
    }
  }, [data?.data]);

  // Reset users when dropdown is closed
  useEffect(() => {
    if (!open && page > 1) {
      setPage(1);
      setAllUsers([]);
    }
  }, [open, page]);

  const totalUsers = data?.meta?.total || 0;
  const loadedUsersCount = allUsers.length;
  const hasMore = totalUsers > 0 && loadedUsersCount < totalUsers;

  const handleLoadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only load more if we haven't reached the total and not currently fetching
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Render single select mode
  if (!multiple) {
    return (
      <div className="w-full">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
            {label}
          </label>
        )}
        <Controller
          control={control}
          name={name}
          defaultValue={defaultValue as any}
          render={({ field }) => (
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
              disabled={disabled}
              open={open}
              onOpenChange={setOpen}
            >
              <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {isLoading && page === 1 ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <>
                    {allUsers.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <>
                        {allUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {renderUser(user)}
                          </SelectItem>
                        ))}
                        {hasMore && (
                          <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={handleLoadMore}
                              disabled={isFetching || !hasMore}
                            >
                              {isFetching ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading...
                                </>
                              ) : (
                                `Load more (${loadedUsersCount} of ${totalUsers})`
                              )}
                            </Button>
                          </div>
                        )}
                        {!hasMore && loadedUsersCount > 0 && totalUsers > 0 && (
                          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2">
                            <p className="text-xs text-center text-gray-500">
                              All {totalUsers} user{totalUsers !== 1 ? 's' : ''}{' '}
                              loaded
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // Render multiple select mode
  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        defaultValue={(defaultValue || []) as any}
        render={({ field }) => {
          const selectedIds: string[] = Array.isArray(field.value)
            ? field.value
            : [];
          const isAllUsersSelected = selectedIds.includes(ALL_USERS_VALUE);

          const toggleUser = (userId: string) => {
            // If toggling "All users"
            if (userId === ALL_USERS_VALUE) {
              const newValue = isAllUsersSelected ? [] : [ALL_USERS_VALUE];
              field.onChange(newValue);
              onValueChange?.(newValue);
              return;
            }

            // If "All users" is selected, don't allow selecting individual users
            if (isAllUsersSelected) {
              return;
            }

            const newValue = selectedIds.includes(userId)
              ? selectedIds.filter((id) => id !== userId)
              : maxSelections && selectedIds.length >= maxSelections
              ? selectedIds
              : [...selectedIds, userId];

            field.onChange(newValue);
            onValueChange?.(newValue);
          };

          const removeUser = (userId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            const newValue = selectedIds.filter((id) => id !== userId);
            field.onChange(newValue);
            onValueChange?.(newValue);
          };

          const clearAll = (e: React.MouseEvent) => {
            e.stopPropagation();
            field.onChange([]);
            onValueChange?.([]);
          };

          const selectedUsers = useMemo(() => {
            return allUsers.filter((user) =>
              selectedIds.includes(user.id.toString())
            );
          }, [selectedIds]);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  className={cn(
                    'flex h-auto min-h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300',
                    className
                  )}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedIds.length === 0 ? (
                      <span className="text-gray-500 dark:text-gray-400">
                        {placeholder}
                      </span>
                    ) : isAllUsersSelected ? (
                      <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded px-2 py-0.5 text-xs font-medium">
                        All users
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={(e) => removeUser(ALL_USERS_VALUE, e)}
                        />
                      </span>
                    ) : (
                      selectedUsers.map((user) => (
                        <span
                          key={user.id}
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-0.5 text-xs"
                        >
                          {renderUser(user)}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={(e) => removeUser(user.id.toString(), e)}
                          />
                        </span>
                      ))
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                  {isLoading && page === 1 ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <>
                      {allUsers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500">
                          No users found
                        </div>
                      ) : (
                        <>
                          <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-950 z-10">
                            <span className="text-xs text-gray-500">
                              {isAllUsersSelected
                                ? 'All users selected'
                                : `${selectedIds.length} selected`}
                              {!isAllUsersSelected &&
                                maxSelections &&
                                ` (max ${maxSelections})`}
                            </span>
                            {selectedIds.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-6 px-2 text-xs"
                              >
                                Clear all
                              </Button>
                            )}
                          </div>
                          <div className="p-1">
                            {showAllUsersOption && (
                              <button
                                type="button"
                                onClick={() => toggleUser(ALL_USERS_VALUE)}
                                className={cn(
                                  'w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left border-b border-gray-200 dark:border-gray-800 mb-1',
                                  isAllUsersSelected &&
                                    'bg-blue-50 dark:bg-blue-900/20'
                                )}
                              >
                                <div
                                  className={cn(
                                    'h-4 w-4 border rounded flex items-center justify-center shrink-0',
                                    isAllUsersSelected
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300 dark:border-gray-600'
                                  )}
                                >
                                  {isAllUsersSelected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="flex-1 font-medium text-blue-700 dark:text-blue-400">
                                  All users
                                </span>
                              </button>
                            )}
                            {allUsers.map((user) => {
                              const isSelected = selectedIds.includes(
                                user.id.toString()
                              );
                              const isDisabled = Boolean(
                                isAllUsersSelected || // Disable if "All users" is selected
                                  (maxSelections &&
                                    selectedIds.length >= maxSelections &&
                                    !isSelected)
                              );

                              return (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() =>
                                    !isDisabled &&
                                    toggleUser(user.id.toString())
                                  }
                                  disabled={isDisabled}
                                  className={cn(
                                    'w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left',
                                    isSelected && 'bg-gray-50 dark:bg-gray-900',
                                    isDisabled &&
                                      'opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'h-4 w-4 border rounded flex items-center justify-center shrink-0',
                                      isSelected
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 dark:border-gray-600'
                                    )}
                                  >
                                    {isSelected && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span className="flex-1">
                                    {renderUser(user)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {hasMore && (
                            <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={handleLoadMore}
                                disabled={isFetching || !hasMore}
                              >
                                {isFetching ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading...
                                  </>
                                ) : (
                                  `Load more (${loadedUsersCount} of ${totalUsers})`
                                )}
                              </Button>
                            </div>
                          )}
                          {!hasMore &&
                            loadedUsersCount > 0 &&
                            totalUsers > 0 && (
                              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2">
                                <p className="text-xs text-center text-gray-500">
                                  All {totalUsers} user
                                  {totalUsers !== 1 ? 's' : ''} loaded
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default UsersDropdown;