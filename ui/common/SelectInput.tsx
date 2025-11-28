import * as React from 'react';
import { cn } from '@utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { Button } from './button';
import { X } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

export type SelectOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

interface SelectInputProps {
  options: SelectOption[];
  /**
   * Controlled value for the select.
   */
  value?: string;
  /**
   * Uncontrolled initial value.
   */
  defaultValue?: string;
  /**
   * Called whenever the selected value changes.
   */
  onChange?: (value: string) => void;
  /**
   * Placeholder text shown when no value is selected.
   */
  placeholder?: string;
  /**
   * Disable the select.
   */
  disabled?: boolean;
  /**
   * Optional error message displayed below the field.
   */
  error?: string;
  /**
   * Class applied to the outer wrapper.
   */
  className?: string;
  /**
   * Class applied to the trigger element.
   */
  triggerClassName?: string;
  /**
   * Class applied to the dropdown content.
   */
  contentClassName?: string;
  id?: string;
  /**
   * Whether there are more options available to load.
   */
  hasMore?: boolean;
  /**
   * Called when the "Load more" button is clicked.
   */
  onLoadMore?: () => void;
  /**
   * Loading state for the "Load more" action.
   */
  isLoadingMore?: boolean;
  /**
   * Optional count of already loaded options (for display in the footer).
   */
  loadedCount?: number;
  /**
   * Optional total count of options (for display in the footer).
   */
  totalCount?: number;
  control?: Control<any>;
  name?: string;
}

export function SelectInput({
  control,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  disabled,
  error,
  className,
  triggerClassName,
  contentClassName,
  id,
  hasMore,
  onLoadMore,
  isLoadingMore,
  loadedCount,
  totalCount,
  name,
}: SelectInputProps) {
  const handleValueChange = (nextValue: string) => {
    onChange?.(nextValue);
  };

  const handleLoadMoreClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoadingMore && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <>
      {control && name ? (
        <Controller control={control} name={name} render={({ field }) => {
          return (
            <div className={cn('w-full', className)}>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id={id}
                  disabled={disabled}
                  className={`` + triggerClassName}
                >
                  <SelectValue placeholder={placeholder} />
     
                </SelectTrigger>
                <SelectContent className={contentClassName}>
                  <SelectItem value="none" disabled={!field.value}>None</SelectItem>
                  {options.map((option) => (
                    <>
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled ?? false}
                      >
                        {option.label}
                      </SelectItem>
                    </>
                  ))}
                  {onLoadMore && hasMore && (
                    <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-2 mt-1">
                      <button
                        type="button"
                        onClick={handleLoadMoreClick}
                        className="w-full text-sm py-1.5 px-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoadingMore || !hasMore}
                      >
                        {isLoadingMore
                          ? 'Loading...'
                          : totalCount && loadedCount
                          ? `Load more (${loadedCount} of ${totalCount})`
                          : 'Load more'}
                      </button>
                    </div>
                  )}
                  {!hasMore &&
                    totalCount !== undefined &&
                    totalCount > 0 &&
                    loadedCount !== undefined &&
                    loadedCount >= totalCount && (
                      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 mt-1">
                        <p className="text-xs text-center text-gray-500">
                          All {totalCount} option{totalCount !== 1 ? 's' : ''}{' '}
                          loaded
                        </p>
                      </div>
                    )}
                </SelectContent>
              </Select>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
          );
        }} />
      ) : (
        <div className={cn('w-full', className)}>
          <Select
            {...(value !== undefined ? { value } : {})}
            {...(defaultValue !== undefined ? { defaultValue } : {})}
            onValueChange={handleValueChange}
          >
            <SelectTrigger
              id={id}
              disabled={disabled}
              className={`` + triggerClassName}
            >
              <SelectValue placeholder={placeholder} />
            
            </SelectTrigger>
            <SelectContent className={contentClassName}>
              {options.map((option) => (
                <>
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled ?? false}
                  >
                    {option.label}
                  </SelectItem>
                </>
              ))}
              {onLoadMore && hasMore && (
                <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-2 mt-1">
                  <button
                    type="button"
                    onClick={handleLoadMoreClick}
                    className="w-full text-sm py-1.5 px-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingMore || !hasMore}
                  >
                    {isLoadingMore
                      ? 'Loading...'
                      : totalCount && loadedCount
                      ? `Load more (${loadedCount} of ${totalCount})`
                      : 'Load more'}
                  </button>
                </div>
              )}
              {!hasMore &&
                totalCount !== undefined &&
                totalCount > 0 &&
                loadedCount !== undefined &&
                loadedCount >= totalCount && (
                  <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 mt-1">
                    <p className="text-xs text-center text-gray-500">
                      All {totalCount} option{totalCount !== 1 ? 's' : ''}{' '}
                      loaded
                    </p>
                  </div>
                )}
            </SelectContent>
          </Select>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </>
  );
}

export default SelectInput;