# DataTable Component

A powerful, reusable table component with built-in pagination, loading states, and customizable columns.

## Features

✅ **Type-safe** - Full TypeScript support with generics
✅ **Pagination** - Built-in pagination controls with page size selector
✅ **Loading States** - Automatic loading and empty state handling
✅ **Flexible Columns** - Render any React component in cells
✅ **Customizable** - Custom empty states, styles, and behaviors
✅ **Server-side Ready** - Works seamlessly with server-side pagination

## Installation

The component is already installed in your project at:
```
ui/common/data-table.tsx
```

## Basic Usage

```tsx
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Define columns
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
  ];

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={{
        pageIndex: currentPage,
        pageSize: pageSize,
        totalItems: 100,
      }}
      onPaginationChange={(pageIndex, pageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(pageSize);
      }}
    />
  );
}
```

## API Reference

### DataTable Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `ColumnDef<TData>[]` | ✅ | Array of column definitions |
| `data` | `TData[]` | ✅ | Array of data rows |
| `pagination` | `PaginationState` | ❌ | Pagination configuration |
| `onPaginationChange` | `(pageIndex: number, pageSize: number) => void` | ❌ | Callback when pagination changes |
| `isLoading` | `boolean` | ❌ | Whether data is loading (default: `false`) |
| `emptyState` | `React.ReactNode` | ❌ | Custom empty state component |
| `className` | `string` | ❌ | Custom CSS class for wrapper |
| `showPagination` | `boolean` | ❌ | Show pagination controls (default: `true`) |
| `pageSizeOptions` | `number[]` | ❌ | Page size options (default: `[10, 20, 50, 100]`) |

### ColumnDef Interface

```typescript
interface ColumnDef<TData> {
  id: string;                    // Unique column identifier
  header: string;                // Column header text
  cell: (row: TData) => React.ReactNode;  // Cell renderer function
  className?: string;            // Optional cell CSS class
  headerClassName?: string;      // Optional header CSS class
}
```

### PaginationState Interface

```typescript
interface PaginationState {
  pageIndex: number;    // Current page (1-indexed)
  pageSize: number;     // Items per page
  totalItems: number;   // Total number of items
}
```

## Advanced Examples

### Server-Side Pagination with React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { DataTable, type ColumnDef } from '@ui/common/data-table';

function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', currentPage, pageSize],
    queryFn: () =>
      api.get('/notifications', {
        params: {
          'pagination[take]': pageSize,
          'pagination[skip]': (currentPage - 1) * pageSize,
        },
      }).then((res) => res.data),
  });

  const columns: ColumnDef<Notification>[] = [
    // ... column definitions
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      pagination={{
        pageIndex: currentPage,
        pageSize: pageSize,
        totalItems: data?.meta?.total || 0,
      }}
      onPaginationChange={(pageIndex, pageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(pageSize);
      }}
      isLoading={isLoading}
    />
  );
}
```

### Custom Cell Renderers

```tsx
const columns: ColumnDef<Product>[] = [
  {
    id: 'image',
    header: 'Image',
    cell: (product) => (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-12 h-12 rounded object-cover"
      />
    ),
  },
  {
    id: 'price',
    header: 'Price',
    cell: (product) => (
      <span className="text-green-600 font-semibold">
        ${product.price.toFixed(2)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (product) => (
      <Badge variant={product.active ? 'success' : 'secondary'}>
        {product.active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (product) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleEdit(product)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(product)}>
          Delete
        </Button>
      </div>
    ),
  },
];
```

### Custom Empty State

```tsx
<DataTable
  columns={columns}
  data={data}
  emptyState={
    <div className="flex flex-col items-center justify-center py-12">
      <Send className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">No items found</h3>
      <p className="text-sm text-gray-500 mb-4">
        Get started by creating your first item
      </p>
      <Button onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create New
      </Button>
    </div>
  }
/>
```

### Table Without Pagination (Small Datasets)

```tsx
<DataTable
  columns={columns}
  data={data}
  showPagination={false}
/>
```

### Custom Column Styling

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Full Name',
    cell: (user) => user.name,
    headerClassName: 'bg-blue-50 font-bold',
    className: 'font-medium text-blue-600',
  },
];
```

## Styling

The DataTable component uses Tailwind CSS and inherits styles from the shadcn/ui Table components. You can customize:

1. **Table wrapper**: Pass `className` prop
2. **Column headers**: Use `headerClassName` in column definition
3. **Column cells**: Use `className` in column definition
4. **Pagination**: Modify styles in `data-table.tsx`

## Best Practices

1. **Use TypeScript**: Define proper interfaces for your data types
2. **Memoize columns**: Use `useMemo` for column definitions if they depend on props/state
3. **Handle loading states**: Always pass `isLoading` when fetching data
4. **Server-side pagination**: Let the server handle pagination for large datasets
5. **Unique keys**: Ensure each row has a unique identifier for React keys

## Migration from Manual Tables

Before (Manual table with pagination):
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
{/* Manual pagination controls */}
```

After (DataTable):
```tsx
<DataTable
  columns={[
    { id: 'name', header: 'Name', cell: (item) => item.name },
    { id: 'email', header: 'Email', cell: (item) => item.email },
  ]}
  data={data}
  pagination={paginationState}
  onPaginationChange={handlePaginationChange}
/>
```

## Support

For more examples, see `data-table.examples.tsx` in the same directory.

For issues or questions, refer to the shadcn/ui documentation: https://ui.shadcn.com/docs/components/table

