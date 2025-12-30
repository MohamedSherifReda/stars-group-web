
import { Input } from '@ui/common/input';

import { Label } from '@ui/common/label';

interface BrandsFiltersProps {
  tempFilters: any;
  setTempFilters: (filters: any) => void;
}
const BrandsFilters = ({ tempFilters, setTempFilters }: BrandsFiltersProps) => {
  return (
    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Name (Ar)</Label>
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
        <Label htmlFor="description">Description (Ar)</Label>
        <Input
          id="description"
          placeholder="Filter by description..."
          value={tempFilters.description || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, description: e.target.value })
          }
        />
      </div>

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
