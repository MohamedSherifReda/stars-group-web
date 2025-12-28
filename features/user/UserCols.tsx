import { Badge } from "@ui/common/badge";
import { cn } from "@utils/cn";
import { formatDate } from "date-fns";
import { type ColumnDef } from '@ui/common/data-table';
import { UserRank, type User } from 'core/types/user.types';

export const usersCols : ColumnDef<User>[]= [
    { 
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono">{row.original.id}</span>
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || 'N/A'}</span>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.original.email}</span>
      )
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.phone_number_key} {row.original.phone_number}
        </span>
      )
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
      )
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
      )
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
      )
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
      )
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
      )
    },
  
  ]
