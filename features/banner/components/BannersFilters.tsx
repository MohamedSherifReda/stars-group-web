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
import type { Brand } from 'core/types/brand.types';

interface BannersFiltersProps {
  tempFilters: any;
  setTempFilters: (filters: any) => void;
  brands: Brand[];
}

const BannersFilters = ({
  tempFilters,
  setTempFilters,
  brands,
}: BannersFiltersProps) => {
  return (
    <div className="flex-1 py-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="promotion_name">Promotion Name</Label>
        <Input
          id="promotion_name"
          placeholder="Filter by promotion name..."
          value={tempFilters.promotion_name || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, promotion_name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="redirect_url">Redirect URL</Label>
        <Input
          id="redirect_url"
          placeholder="Filter by redirect URL..."
          value={tempFilters.redirect_url || ''}
          onChange={(e) =>
            setTempFilters({ ...tempFilters, redirect_url: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_id">Brand</Label>
        <Select
          value={tempFilters.brand_id || 'all'}
          onValueChange={(value) =>
            setTempFilters({ ...tempFilters, brand_id: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
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

export default BannersFilters;
