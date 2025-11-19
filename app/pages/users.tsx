import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { usersApi } from '@features/user/user.apis';

import { Badge } from '@ui/common/badge';
import serveUsersMeta from '~/meta/serveUsersMeta';
import { DataTable, type ColumnDef } from '@ui/common/data-table';

import type { User } from 'core/types/user.types';
import { useMemo, useState } from 'react';
import DeleteItemAlert from '@ui/common/DeleteItemAlert';
import { queryClient } from '@utils/queryClient';
import toast from 'react-hot-toast';
import { Button } from '@ui/common/button';
import { Trash2 } from 'lucide-react';

export const meta = serveUsersMeta;

export default function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const {
    data: users = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['users', currentPage, pageSize],
    queryFn: () =>
      usersApi
        .getUsers({
          'pagination[skip]': (currentPage - 1) * pageSize,
          'pagination[take]': pageSize,
        })
        .then((res) => {
          return res.data;
        }),
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
  const usersCols = useMemo(
    () => [
      {
        id: 'id',
        header: 'ID',
        cell: (user: User) => <span className="font-mono">{user.id}</span>,
      },
      {
        id: 'name',
        header: 'Name',
        cell: (user: User) => (
          <span className="font-medium">{user.name || 'N/A'}</span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        cell: (user: User) => (
          <span className="text-sm text-gray-500">{user.email}</span>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        cell: (user: User) => (
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        ),
      },
      {
        id: 'verified',
        header: 'Verified',
        cell: (user: User) => (
          <Badge variant={user.account_verified ? 'default' : 'destructive'}>
            {user.account_verified ? 'Verified' : 'Unverified'}
          </Badge>
        ),
      },
      {
        id: 'delete',
        header: 'Actions',
        cell: (user: User) => (
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
        ),
      },
    ],
    [deleteUserId, deleteUserMutation.isPending]
  );
  const usersRows = users?.data || [];
  const totalUsers = users?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-gray-600">
          Manage and view all registered users in the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users registered in the system.
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
