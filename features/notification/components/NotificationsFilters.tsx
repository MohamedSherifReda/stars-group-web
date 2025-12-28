import { Input } from '@ui/common/input';
import { Label } from '@ui/common/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';

interface NotificationsFiltersProps {
  tempFilters: any;
  setTempFilters: (filters: any) => void;
  redirectionUrls: { label: string; value: string }[];
}

const NotificationsFilters = ({
  tempFilters,
  setTempFilters,
  redirectionUrls,
}: NotificationsFiltersProps) => {
  return (
    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Filter by title..."
          value={tempFilters.title || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, title: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          placeholder="Filter by message..."
          value={tempFilters.message || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, message: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Select
          value={tempFilters.link || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, link: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by link" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              {redirectionUrls.map((url) => (
                <SelectItem key={url.value} value={url.value}>
                  {url.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="is_read">Read Status</Label>
        <Select
          value={tempFilters.is_read || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, is_read: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by read status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Read</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="created_at">Creation Date</Label>
        <Input
          id="created_at"
          type="date"
          value={tempFilters.created_at || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, created_at: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default NotificationsFilters;
