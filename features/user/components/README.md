# UsersDropdown Component

A reusable, paginated user selection dropdown component that integrates seamlessly with React Hook Form.

## Features

- ✅ **React Hook Form Integration** - Works perfectly with `react-hook-form` using the Controller component
- ✅ **Single & Multiple Selection** - Supports both single user and multiple users selection
- ✅ **Pagination/Load More** - Efficiently loads users in batches with a "Load More" button
- ✅ **Loading States** - Displays loading spinners during data fetching
- ✅ **Type-Safe** - Full TypeScript support with generic type parameters
- ✅ **Customizable Rendering** - Custom render function for user items
- ✅ **Maximum Selection Limit** - Optional limit on number of users that can be selected
- ✅ **Error Handling** - Built-in error message display
- ✅ **Accessible** - Built on Radix UI primitives for accessibility
- ✅ **Dark Mode Support** - Fully compatible with dark mode
- ✅ **Responsive** - Works on all screen sizes

## Installation

The component is already set up in your project. It uses the following dependencies:

```json
{
  "react-hook-form": "^7.66.0",
  "@tanstack/react-query": "^5.69.0",
  "@radix-ui/react-select": "^2.2.2"
}
```

## Basic Usage

### Single Selection

```tsx
import { useForm } from 'react-hook-form';
import { UsersDropdown } from '@features/user/components/UsersDropdown';

interface FormData {
  userId: string;
}

function MyForm() {
  const { control, handleSubmit } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <UsersDropdown
        control={control}
        name="userId"
        placeholder="Select a user"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Multiple Selection

```tsx
import { useForm } from 'react-hook-form';
import { UsersDropdown } from '@features/user/components/UsersDropdown';

interface FormData {
  userIds: string[];
}

function MyForm() {
  const { control, handleSubmit } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <UsersDropdown
        control={control}
        name="userIds"
        placeholder="Select users"
        multiple={true}  // Enable multiple selection
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `control` | `Control<T>` | ✅ | - | React Hook Form control object |
| `name` | `Path<T>` | ✅ | - | Field name in the form |
| `placeholder` | `string` | ❌ | `"Select a user"` | Placeholder text |
| `disabled` | `boolean` | ❌ | `false` | Disable the dropdown |
| `onValueChange` | `(value: string \| string[]) => void` | ❌ | - | Callback when selection changes |
| `multiple` | `boolean` | ❌ | `false` | Enable multiple user selection |
| `maxSelections` | `number` | ❌ | - | Maximum number of users that can be selected (multiple mode only) |
| `className` | `string` | ❌ | - | Custom CSS classes for the trigger |
| `defaultValue` | `string` | ❌ | - | Default selected user ID |
| `label` | `string` | ❌ | - | Label displayed above the dropdown |
| `error` | `string` | ❌ | - | Error message to display |
| `pageSize` | `number` | ❌ | `20` | Number of users to load per page |
| `renderUser` | `(user: User) => string` | ❌ | `(user) => user.name` | Custom render function for user items |

## API Integration

The component uses the `getUsers` function from `features/user/user.apis.ts`:

```typescript
interface GetUsersParams {
  take?: number;
  skip?: number;
}

// GET /users?page=1&limit=20
usersApi.getUsers({ take: 20, skip: 20 });
```

### Expected API Response Format

```typescript
{
  data: User[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}
```

## Advanced Examples

### Multiple Selection with Max Limit

```tsx
import { useForm } from 'react-hook-form';

interface FormData {
  userIds: string[];
}

function TeamForm() {
  const { control, watch } = useForm<FormData>();
  const selectedUserIds = watch('userIds');

  return (
    <form>
      <UsersDropdown
        control={control}
        name="userIds"
        label="Select Team Members"
        placeholder="Choose up to 5 members..."
        multiple={true}
        maxSelections={5}  // Limit to 5 users max
      />
      <p>Selected: {selectedUserIds?.length || 0} users</p>
    </form>
  );
}
```

### With Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().min(1, 'Please select a user'),
});

type FormData = z.infer<typeof schema>;

function FormWithValidation() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <UsersDropdown
        control={control}
        name="userId"
        label="Assign to User"
        error={errors.userId?.message}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Custom User Rendering

Display email alongside name:

```tsx
<UsersDropdown
  control={control}
  name="userId"
  renderUser={(user) => `${user.name} (${user.email})`}
/>
```

Display verified badge:

```tsx
<UsersDropdown
  control={control}
  name="userId"
  renderUser={(user) => `${user.name} ${user.account_verified ? '✓' : ''}`}
/>
```

### With onChange Handler

**Single Selection:**

```tsx
function NotificationForm() {
  const { control } = useForm();

  const handleUserChange = (userId: string | string[]) => {
    if (typeof userId === 'string') {
      console.log('Selected user:', userId);
      // Fetch user details, update other fields, etc.
    }
  };

  return (
    <UsersDropdown
      control={control}
      name="recipientId"
      onValueChange={handleUserChange}
    />
  );
}
```

**Multiple Selection:**

```tsx
function BulkNotificationForm() {
  const { control } = useForm();

  const handleUsersChange = (userIds: string | string[]) => {
    if (Array.isArray(userIds)) {
      console.log('Selected users:', userIds);
      console.log(`${userIds.length} users selected`);
    }
  };

  return (
    <UsersDropdown
      control={control}
      name="recipientIds"
      multiple={true}
      onValueChange={handleUsersChange}
    />
  );
}
```

### Custom Page Size

```tsx
<UsersDropdown
  control={control}
  name="userId"
  pageSize={10} // Load 10 users at a time
/>
```

### Conditional Disabled State

```tsx
function TeamForm() {
  const { control, watch } = useForm();
  const teamLeadId = watch('teamLeadId');

  return (
    <>
      <UsersDropdown
        control={control}
        name="teamLeadId"
        label="Team Lead"
      />
      
      <UsersDropdown
        control={control}
        name="memberId"
        label="Team Member"
        disabled={!teamLeadId} // Disabled until team lead is selected
      />
    </>
  );
}
```

### Combining Single and Multiple Dropdowns

```tsx
interface ProjectForm {
  managerId: string;       // Single selection
  teamMemberIds: string[]; // Multiple selection
}

function ProjectAssignment() {
  const { control, watch } = useForm<ProjectForm>();
  const managerId = watch('managerId');

  return (
    <form>
      {/* Single Selection */}
      <UsersDropdown
        control={control}
        name="managerId"
        label="Project Manager"
        placeholder="Select manager..."
      />
      
      {/* Multiple Selection */}
      <UsersDropdown
        control={control}
        name="teamMemberIds"
        label="Team Members"
        placeholder="Select team members..."
        multiple={true}
        maxSelections={10}
        disabled={!managerId}  // Disabled until manager is selected
      />
    </form>
  );
}
```

## Component Behavior

### Selection Modes

The component supports two modes:

1. **Single Selection Mode** (default, `multiple={false}`)
   - Uses Radix UI Select component
   - Returns a single user ID as a string
   - Displays selected user name in the trigger
   - Dropdown closes after selection

2. **Multiple Selection Mode** (`multiple={true}`)
   - Uses Radix UI Popover with checkboxes
   - Returns an array of user IDs
   - Displays selected users as removable chips
   - Shows selection count and "Clear all" button
   - Optional `maxSelections` limit
   - Dropdown stays open for multiple selections

### Pagination

- Users are loaded in batches based on `pageSize` (default: 20)
- A "Load More" button appears at the bottom when more users are available
- The button shows progress: "Load more (X of Y)" 
- Button is automatically disabled when all users are loaded
- When all users are loaded, displays: "All X users loaded"
- Clicking "Load More" fetches the next page
- Already loaded users are accumulated in the dropdown
- The list resets when the dropdown is closed
- Smart prevention: Button won't trigger if all users are already loaded

### Loading States

1. **Initial Load**: Shows a loading spinner in the center
2. **Loading More**: Shows a spinner on the "Load More" button
3. **No Users**: Displays "No users found" message

### Multiple Selection Features

When `multiple={true}`:
- Selected users appear as chips/badges with remove buttons (×)
- Click a chip's × icon to remove that user
- "Clear all" button appears when users are selected
- Selection counter shows "X selected" (and "max Y" if limit is set)
- Users can be toggled by clicking checkboxes
- Maximum selection limit prevents selecting more users when reached

### Data Management

- Uses React Query for efficient data fetching and caching
- Automatically deduplicates users by ID
- Resets to page 1 when dropdown closes (if on a later page)
- Maintains selection state through form control

## User Type

The component expects users to have the following structure:

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  role: string;
  account_verified: boolean;
  created_at: string;
  updated_at: string;
}
```

## Styling

The component uses Tailwind CSS and supports dark mode out of the box. You can customize the appearance by:

1. **Trigger styling**: Pass `className` prop
2. **Content styling**: Modify the SelectContent classes in the component
3. **Theme**: Automatically adapts to your app's theme

## Accessibility

Built on Radix UI primitives, the component includes:

- Keyboard navigation (arrow keys, Enter, Escape)
- Screen reader support
- Focus management
- ARIA attributes

## Troubleshooting

### Users not loading

Check that:
1. The API endpoint `/users` is accessible
2. The API returns data in the correct format (see API Response Format above)
3. Authentication token is properly set

### TypeScript errors

Ensure your form type includes the field name with the correct type:

```typescript
// For single selection
interface MyForm {
  userId: string; // Must match the 'name' prop
}

// For multiple selection
interface MyTeamForm {
  userIds: string[]; // Must be an array for multiple mode
}
```

### Dropdown not closing after selection

- **Single mode**: Dropdown closes automatically after selection (Radix UI Select behavior)
- **Multiple mode**: Dropdown stays open to allow multiple selections. Click outside to close.

## Performance Considerations

- Users are loaded incrementally (default 20 at a time)
- React Query caches API responses
- Previously loaded users are deduplicated
- The dropdown resets when closed to free memory

## See Also

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Radix UI Select Documentation](https://www.radix-ui.com/docs/primitives/components/select)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [UsersDropdown.example.tsx](./UsersDropdown.example.tsx) - Complete working examples

