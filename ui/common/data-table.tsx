import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';

export interface ColumnDef<TData> {
  /** Unique identifier for the column */
  id: string;
  /** Column header label */
  header: string;
  /** Function to access/render the cell value */
  cell: (row: TData) => React.ReactNode;
  /** Optional custom className for the column */
  className?: string;
  /** Optional custom className for the header */
  headerClassName?: string;
}

export interface PaginationState {
  /** Current page number (1-indexed) */
  pageIndex: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
}

export interface DataTableProps<TData> {
  /** Array of column definitions */
  columns: ColumnDef<TData>[];
  /** Array of data rows */
  data: TData[];
  /** Pagination state */
  pagination?: PaginationState;
  /** Callback when page changes */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Optional custom className for the table wrapper */
  className?: string;
  /** Show pagination controls */
  showPagination?: boolean;
  /** Page size options for the user to choose from */
  pageSizeOptions?: number[];
}

/**
 * Reusable DataTable component with built-in pagination
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   { id: 'name', header: 'Name', cell: (user) => user.name },
 *   { id: 'email', header: 'Email', cell: (user) => user.email },
 * ];
 * 
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   pagination={{
 *     pageIndex: currentPage,
 *     pageSize: 10,
 *     totalItems: totalUsers,
 *   }}
 *   onPaginationChange={(page, size) => setCurrentPage(page)}
 * />
 * ```
 */
export function DataTable<TData>({
  columns,
  data,
  pagination,
  onPaginationChange,
  isLoading = false,
  emptyState,
  className = '',
  showPagination = true,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<TData>) {
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 1;

  const handlePreviousPage = () => {
    if (pagination && onPaginationChange && pagination.pageIndex > 1) {
      onPaginationChange(pagination.pageIndex - 1, pagination.pageSize);
    }
  };

  const handleNextPage = () => {
    if (pagination && onPaginationChange && pagination.pageIndex < totalPages) {
      onPaginationChange(pagination.pageIndex + 1, pagination.pageSize);
    }
  };

  const handlePageClick = (page: number) => {
    if (pagination && onPaginationChange) {
      onPaginationChange(page, pagination.pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (pagination && onPaginationChange) {
      // Reset to page 1 when changing page size
      onPaginationChange(1, newSize);
    }
  };

  // Generate page numbers to display with ellipsis
  const getPageNumbers = () => {
    if (!pagination) return [];

    const pages: (number | 'ellipsis')[] = [];
    const { pageIndex } = pagination;

    // Always show first page
    pages.push(1);

    // Show ellipsis or pages around current page
    if (pageIndex > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    for (let i = Math.max(2, pageIndex - 1); i <= Math.min(totalPages - 1, pageIndex + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis or last page
    if (pageIndex < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page if there's more than one page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const renderEmptyState = () => {
    if (emptyState) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {emptyState}
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <div className="text-gray-500">No data available</div>
        </TableCell>
      </TableRow>
    );
  };

  const renderLoadingState = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          <div className="text-gray-500">Loading...</div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.headerClassName}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? renderLoadingState()
              : data.length === 0
              ? renderEmptyState()
              : data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column.id}`}
                        className={column.className}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && pagination && data.length > 0 && !isLoading && (
        <div className="flex items-center justify-between">
          {/* Info and Page Size Selector */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium">
                {(pagination.pageIndex - 1) * pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  pagination.pageIndex * pagination.pageSize,
                  pagination.totalItems
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.totalItems}</span>{' '}
              results
            </div>

            {/* Page Size Selector */}
            {pageSizeOptions.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Items per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pagination.pageIndex === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {getPageNumbers().map((page, index) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={page}
                    variant={pagination.pageIndex === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    disabled={isLoading}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.pageIndex === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

