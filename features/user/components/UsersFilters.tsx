import {  Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@ui/common/select';
import { Input } from '@ui/common/input';
import React from 'react'
import { Label } from '@ui/common/label';


interface UsersFiltersProps{
  tempFilters: any;
  setTempFilters: (filters: any) => void;
}
const UsersFilters = ({tempFilters,setTempFilters}: UsersFiltersProps) => {
  return (
    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="id">User ID</Label>
        <Input
          id="id"
          type="number"
          placeholder="Filter by ID..."
          value={tempFilters.id || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, id: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Filter by name..."
          value={tempFilters.name || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="Filter by email..."
          value={tempFilters.email || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, email: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          placeholder="Filter by phone number..."
          value={tempFilters.phone_number || ''}
          onChange={(e) =>
            setTempFilters({
              ...tempFilters,
              phone_number: e.target.value,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number_key">Phone Number Key</Label>
        <Input
          id="phone_number_key"
          placeholder="e.g. +20"
          value={tempFilters.phone_number_key || ''}
          onChange={(e) =>
            setTempFilters({
              ...tempFilters,
              phone_number_key: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="created_at">Joining Date</Label>
        <Input
          id="created_at"
          type="date"
          value={tempFilters.created_at || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, created_at: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Birthdate</Label>
        <Input
          id="birthdate"
          type="date"
          value={tempFilters.birthdate || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, birthdate: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={tempFilters.role || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, role: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Verification Status</Label>
        <Select
          value={tempFilters.account_verified || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, account_verified: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Membership</Label>
        <Select
          value={tempFilters.rank || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, rank: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Memberships</SelectItem>
            <SelectItem value="2">Gold</SelectItem>
            <SelectItem value="1">Silver</SelectItem>
            <SelectItem value="3">Platinum</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default UsersFilters