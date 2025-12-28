import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { usersApi } from '@features/user/user.apis';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Badge } from '@ui/common/badge';
import serveUsersMeta from '~/meta/serveUsersMeta';
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import { UserRank, type User } from 'core/types/user.types';
import { useMemo, useState } from 'react';
import DeleteItemAlert from '@ui/common/DeleteItemAlert';
import { queryClient } from '@utils/queryClient';
import toast from 'react-hot-toast';
import { Button } from '@ui/common/button';
import { Trash2, Filter, X, RotateCcw, SearchIcon } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@ui/common/sheet';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { formatDate } from 'date-fns';
import UsersFilters from '@features/user/components/UsersFilters';

export const meta = serveUsersMeta;

export default function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [tempFilters, setTempFilters] = useState<any>({});
  const [searchValue, setSearchValue] = useState<string>('');

  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const {
    data: users = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, appliedFilters],
    queryFn: () => {
      const filters: any = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          if (key === 'account_verified') {
            filters[key] = {
              $val: value === 'true',
              $op: 'Is',
            };
          } else if (key === 'role' || key === 'rank') {
            filters[key] = {
              $val: key === 'rank' ? Number(value) : value,
              $op: 'Eq',
            };
          } else if (key === 'id') {
            filters[key] = {
              $val: Number(value),
              $op: 'Eq',
            };
          } else if (key === 'created_at' || key === 'birthdate') {
            filters[key] = {
              $val: new Date(value as string).toISOString(),
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

      return usersApi
        .getUsers({
          pagination: {
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
          },
          filters,
        })
        .then((res) => {
          return res.data;
        });
    },
  });

  const deleteUserMutation = useMutation({
    mutationKey: ['delete-user'],
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const usersCols = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-mono">{row.original.id}</span>,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name || 'N/A'}</span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.email}</span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original.phone_number_key} {row.original.phone_number}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge
            className={cn(row.original.role === 'admin' && 'hover:text-black')}
            variant={row.original.role === 'admin' ? 'default' : 'secondary'}
          >
            {row.original.role}
          </Badge>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'rank',
        header: 'Membership',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.rank === UserRank.Gold ? 'default' : 'secondary'
            }
          >
            <span className="text-uppercase">
              {UserRank[row.original?.rank] || 'N/A'}
            </span>
          </Badge>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'account_verified',
        header: 'Verified',
        cell: ({ row }) => (
          <Badge
            className={cn(row.original.account_verified && 'hover:text-black')}
            variant={row.original.account_verified ? 'default' : 'destructive'}
          >
            {row.original.account_verified ? 'Verified' : 'Unverified'}
          </Badge>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'created_at',
        header: 'Joining Date',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original?.created_at
              ? formatDate(row.original?.created_at, 'dd-MMM-yyyy')
              : 'N/A'}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'birthdate',
        header: 'Birthdate',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original?.birthdate
              ? formatDate(row.original?.birthdate, 'dd-MMM-yyyy')
              : 'N/A'}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        id: 'delete',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DeleteItemAlert
              isDeleting={deleteUserMutation.isPending}
              itemName={user.name || 'User'}
              onDelete={() => {
                deleteUserMutation.mutate(user.id);
              }}
              isOpen={deleteUserId === user.id}
              setIsOpen={(isOpen) => setDeleteUserId(isOpen ? user.id : null)}
              triggerButton={
                <Button
                  variant="destructive"
                  className="bg-white group"
                  onClick={() => setDeleteUserId(user.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-white" />
                </Button>
              }
            />
          );
        },
      },
    ],
    [deleteUserId, deleteUserMutation.isPending]
  );
  const usersRows = users?.data || [];
  const totalUsers = users?.meta?.total || 0;

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

  const handleSearch = () => {
    setAppliedFilters({
      ...appliedFilters,
      search: searchValue,
    });
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    setAppliedFilters({
      ...appliedFilters,
      search: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">
            Manage and view all registered users in the system.
          </p>
        </div>
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
      </div>

      <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl">Filters</SheetTitle>
          </SheetHeader>

          <UsersFilters
            tempFilters={tempFilters}
            setTempFilters={setTempFilters}
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
          <CardTitle>All Users</CardTitle>
          <CardDescription className="flex justify-between ">
            <p>A list of all users registered in the system.</p>
            <div className="min-w-[450px] flex gap-2">
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="!h-full flex-1"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (e.target.value?.trim() === '') {
                    handleClearSearch();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <div>
                <Button onClick={handleSearch} className="!h-full flex gap-x-2">
                  <SearchIcon className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading users...</div>
            </div>
          ) : (
            <DataTable
              columns={usersCols}
              data={usersRows}
              pagination={{
                pageIndex: currentPage,
                pageSize: pageSize,
                totalItems: totalUsers,
              }}
              onPaginationChange={(pageIndex, pageSize) => {
                setCurrentPage(pageIndex);
                setPageSize(pageSize);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// old Table.

// <Table>
//   <TableHeader>
//     <TableRow>
//       <TableHead>ID</TableHead>
//       <TableHead>Name</TableHead>
//       <TableHead>Email</TableHead>
//       <TableHead>Role</TableHead>
//       <TableHead>Verified</TableHead>
//       <TableHead>Created At</TableHead>
//     </TableRow>
//   </TableHeader>
//   <TableBody>
//     {users.data?.map((user) => (
//       <TableRow key={user.id}>
//         <TableCell className="font-mono">{user.id}</TableCell>
//         <TableCell>{user.name}</TableCell>
//         <TableCell>{user.email}</TableCell>
//         <TableCell>
//           <Badge
//             variant={user.role === 'admin' ? 'default' : 'secondary'}
//           >
//             {user.role}
//           </Badge>
//         </TableCell>
//         <TableCell>
//           <Badge
//             variant={user.account_verified ? 'default' : 'destructive'}
//           >
//             {user.account_verified ? 'Verified' : 'Unverified'}
//           </Badge>
//         </TableCell>
//         <TableCell>
//           {format(new Date(user.created_at), 'MMM dd, yyyy')}
//         </TableCell>
//       </TableRow>
//     ))}
//   </TableBody>
// </Table>;
