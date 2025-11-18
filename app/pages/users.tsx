import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { usersApi } from '@features/user/user.apis';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/common/table';
import { Badge } from '@ui/common/badge';
import serveUsersMeta from '~/meta/serveUsersMeta';
import { DataTable } from '@ui/common/data-table';

import type { User } from 'core/types/user.types';

export const meta = serveUsersMeta;

export default function Users() {
  const {
    data: users = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers().then((res) => res.data),
  });

  const usersCols = [
    {
      id: 'id',
      header: 'ID',
      cell: (user: User) => <span className="font-mono">{user.id}</span>,
    },
    {
      id: 'name',
      header: 'Name',
      cell: (user: User) => <span className="font-medium">{user.name}</span>,
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
  ];
  const usersRows = users?.data || [];

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
            <DataTable columns={usersCols} data={usersRows} />
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