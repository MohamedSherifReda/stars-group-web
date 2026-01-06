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
  activeTab: string;
}

const NotificationsFilters = ({
  tempFilters,
  setTempFilters,
  redirectionUrls,
  activeTab,
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

      {activeTab === 'all' && (
        <>
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
                  {redirectionUrls?.map((url) => (
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
        </>
      )}

      {activeTab === 'scheduled' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={tempFilters.status || 'all'}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              placeholder="Filter by type..."
              value={tempFilters.type || ''}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, type: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule_at">Scheduled At</Label>
            <Input
              id="schedule_at"
              type="date"
              value={tempFilters.schedule_at || ''}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, schedule_at: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="processed_count">Processed Count</Label>
            <Input
              id="processed_count"
              type="number"
              placeholder="Filter by processed count..."
              value={tempFilters.processed_count || ''}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  processed_count: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="failed_count">Failed Count</Label>
            <Input
              id="failed_count"
              type="number"
              placeholder="Filter by failed count..."
              value={tempFilters.failed_count || ''}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, failed_count: e.target.value })
              }
            />
          </div>
        </>
      )}

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
