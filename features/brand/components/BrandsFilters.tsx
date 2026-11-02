
import { Input } from '@ui/common/input';

import { Label } from '@ui/common/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';

interface BrandsFiltersProps {
  tempFilters: any;
  setTempFilters: (filters: any) => void;
}
const BrandsFilters = ({ tempFilters, setTempFilters }: BrandsFiltersProps) => {
  // The Language select is only shown while name or description has text;
  // drop its value when it gets hidden so it isn't applied invisibly
  const setTextFilter = (key: 'name' | 'description', value: string) => {
    const next = { ...tempFilters, [key]: value };
    if (!next.name && !next.description) delete next.language;
    setTempFilters(next);
  };
  return (
    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Filter by name..."
          value={tempFilters.name || ''}
          onChange={(e) =>
            setTextFilter('name', e.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Filter by description..."
          value={tempFilters.description || ''}
          onChange={(e) =>
            setTextFilter('description', e.target.value)
          }
        />
      </div>
      {/* The language dropdown input will only appear if the user starts typing in the name or description fields */}

      {tempFilters?.name || tempFilters?.description ? (
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            onValueChange={(value) => {
              setTempFilters({ ...tempFilters, language: value });
            }}
            value={tempFilters?.language}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>

              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <></>
      )}

      <div className="space-y-2">
        <Label htmlFor="shop_url">Shop URL</Label>
        <Input
          id="shop_url"
          placeholder="Filter by shop URL..."
          value={tempFilters.shop_url || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, shop_url: e.target.value })
          }
        />
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

export default BrandsFilters;
