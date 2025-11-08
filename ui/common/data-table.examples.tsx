/**
 * DataTable Usage Examples
 * 
 * This file demonstrates various ways to use the DataTable component
 * with different data types and configurations.
 */

import React, { useState } from 'react';
import { DataTable, type ColumnDef } from './data-table';
import { Button } from './button';
import { Badge } from './badge';

// ============================================================================
// Example 1: Simple User Table
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
}

export function UserTableExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sample data
  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-01-02' },
  ];

  const columns: ColumnDef<User>[] = [
    {
      id: 'id',
      header: 'ID',
      cell: (user) => user.id,
    },
    {
      id: 'name',
      header: 'Name',
      cell: (user) => <span className="font-medium">{user.name}</span>,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (user) => user.email,
    },
    {
      id: 'role',
      header: 'Role',
      cell: (user) => (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (user) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={{
        pageIndex: currentPage,
        pageSize: pageSize,
        totalItems: 100, // Total from API
      }}
      onPaginationChange={(pageIndex, pageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(pageSize);
      }}
    />
  );
}

// ============================================================================
// Example 2: Product Table with Custom Rendering
// ============================================================================

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export function ProductTableExample() {
  const [currentPage, setCurrentPage] = useState(1);

  const products: Product[] = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 50, status: 'active' },
    { id: 2, name: 'Mouse', price: 29.99, stock: 0, status: 'out_of_stock' },
  ];

  const columns: ColumnDef<Product>[] = [
    {
      id: 'name',
      header: 'Product Name',
      cell: (product) => <span className="font-semibold">{product.name}</span>,
    },
    {
      id: 'price',
      header: 'Price',
      cell: (product) => (
        <span className="text-green-600 font-medium">
          ${product.price.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      cell: (product) => (
        <span className={product.stock === 0 ? 'text-red-500' : 'text-gray-900'}>
          {product.stock}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (product) => {
        const statusColors = {
          active: 'bg-green-500',
          inactive: 'bg-gray-500',
          out_of_stock: 'bg-red-500',
        };
        return (
          <Badge className={statusColors[product.status]}>
            {product.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      pagination={{
        pageIndex: currentPage,
        pageSize: 10,
        totalItems: 50,
      }}
      onPaginationChange={(pageIndex) => setCurrentPage(pageIndex)}
    />
  );
}

// ============================================================================
// Example 3: Table Without Pagination
// ============================================================================

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export function TaskTableExample() {
  const tasks: Task[] = [
    { id: 1, title: 'Complete project', completed: false },
    { id: 2, title: 'Review code', completed: true },
  ];

  const columns: ColumnDef<Task>[] = [
    {
      id: 'title',
      header: 'Task',
      cell: (task) => task.title,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (task) => (
        <Badge variant={task.completed ? 'default' : 'secondary'}>
          {task.completed ? 'Completed' : 'Pending'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tasks}
      showPagination={false} // Disable pagination for small datasets
    />
  );
}

// ============================================================================
// Example 4: Server-Side Pagination with API Integration
// ============================================================================

export function ServerPaginatedTableExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Simulated API response
  const apiResponse = {
    data: [
      /* your data here */
    ],
    meta: {
      total: 250,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    },
  };

  // When pagination changes, fetch new data from API
  const handlePaginationChange = (pageIndex: number, newPageSize: number) => {
    setCurrentPage(pageIndex);
    setPageSize(newPageSize);
    
    // Make API call with new pagination params
    // fetchData({
    //   'pagination[skip]': (pageIndex - 1) * newPageSize,
    //   'pagination[take]': newPageSize,
    // });
  };

  const columns: ColumnDef<any>[] = [
    // Define your columns
  ];

  return (
    <DataTable
      columns={columns}
      data={apiResponse.data}
      pagination={{
        pageIndex: currentPage,
        pageSize: pageSize,
        totalItems: apiResponse.meta.total,
      }}
      onPaginationChange={handlePaginationChange}
      isLoading={false} // Set to true while fetching
      pageSizeOptions={[10, 25, 50, 100]} // Custom page size options
    />
  );
}

// ============================================================================
// Example 5: Table with Custom Empty State
// ============================================================================

export function CustomEmptyStateExample() {
  const columns: ColumnDef<any>[] = [
    { id: 'name', header: 'Name', cell: (item) => item.name },
  ];

  return (
    <DataTable
      columns={columns}
      data={[]} // Empty data
      showPagination={false}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No data found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by creating your first item
          </p>
          <Button>Create New</Button>
        </div>
      }
    />
  );
}

