import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image,
  RotateCcw,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bannersApi } from '@features/banner/banner.apis';
import type { Banner } from 'core/types/banner.types';
import { mediaApi } from '@features/media/media.apis';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/common/dialog';
import { Button } from '@ui/common/button';
import { Label } from '@ui/common/label';
import { Input } from '@ui/common/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import serveBannersMeta from '~/meta/serveBannersMeta';
import Asterisk from '@ui/common/Asterisk';
import { brandsApi } from '@features/brand/brand.apis';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { Toggle } from '~/components/ui/toggle';
import { FileInput } from '@ui/common/file-input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@ui/common/sheet';
import BannersFilters from '@features/banner/components/BannersFilters';
import { Badge } from '@ui/common/badge';
import ExportToExcel from '@ui/common/ExportToExcel/ExportToExcel';
import { getAllExportedToExcelBanners } from '@features/banner/helpers';

export const meta = serveBannersMeta;

interface BannerFormData {
  promotion_name: string;
  redirect_url?: string;
  brand_id?: string | number | null;
}

const recommendedAspectRatio =
  "It's recommended to use an image with a 2:1 (width:height) aspect ratio";

const recommendedAspectRationClassName =
  'text-[10px] text-gray-400 !leading-[0]';
export default function Banners() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    promotion_name: '',
    redirect_url: '',
  });
  const [imageEnFile, setImageEnFile] = useState<File | null>(null);
  const [imageArFile, setImageArFile] = useState<File | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [tempFilters, setTempFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingExportedBanners, setIsLoadingExportedBanners] =
    useState(false);
  const [exportedBanners, setExportedBanners] = useState<Banner[]>([]);
  const queryClient = useQueryClient();

  const excludedBannersColsFromExport = [
    'image_en_id',
    'image_ar_id',
    'brand_id',
    'created_at',
    'updated_at',
    'deleted_at',
  ];

  const {
    data: banners = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isBannersLoading,
  } = useQuery({
    queryKey: ['banners', currentPage, pageSize, appliedFilters],
    queryFn: () => {
      const filters: any = {};
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          if (key === 'created_at') {
            filters[key] = {
              $val: new Date(value as string).toISOString(),
              $op: 'Eq',
            };
          } else if (key === 'brand_id') {
            filters[key] = {
              $val: value,
              $op: 'Eq',
            };
          } else if (key === 'redirect_url') {
            const urlValue = value as string;
            filters[key] = {
              $val: urlValue?.endsWith('/') ? urlValue?.slice(0, -1) : urlValue,
              $op: 'Contains',
            };
          } else {
            filters[key] = {
              $val: value,
              $op: 'Contains',
            };
          }
        }
      });
      return bannersApi
        .getBanners({
          relations: {
            image_ar: true,
            image_en: true,
            brand: true,
          },
          includeAllBranded: true,
          pagination: {
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
          },
          filters,
        })
        .then((res) => res.data);
    },
  });

  const {
    data: brands = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isBrandsLoading,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getBrands().then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
  });
  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: (banner: Partial<Banner>) => bannersApi.createBanner(banner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success('Banner created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    },
  });
  // update banner mutation.
  const updateMutation = useMutation({
    mutationFn: ({ id, banner }: { id: number; banner: Partial<Banner> }) =>
      bannersApi.updateBanner(id, banner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setEditingBanner(null);
      resetForm();
      toast.success('Banner updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update banner');
    },
  });
  // delete banner mutation.
  const deleteMutation = useMutation({
    mutationFn: (id: number) => bannersApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    },
  });

  const resetForm = () => {
    setFormData({
      promotion_name: '',
      redirect_url: '',
      brand_id: null,
    });
    setImageEnFile(null);
    setImageArFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageEnId: number | undefined;
      let imageArId: number | undefined;

      if (imageEnFile) {
        const imageEnResponse = await uploadMutation.mutateAsync(imageEnFile);
        imageEnId = imageEnResponse.data?.data?.id;
      }

      if (imageArFile) {
        const imageArResponse = await uploadMutation.mutateAsync(imageArFile);
        imageArId = imageArResponse.data?.data?.id;
      }

      //if the redirect url is empty or falsy value, then delete it as it is already optional.
      if (!formData.redirect_url) {
        delete formData.redirect_url;
      }

      if (editingBanner) {
        const bannerData = {
          ...formData,
          ...(imageEnId && { image_en_id: imageEnId }),
          ...(imageArId && { image_ar_id: imageArId }),

          brand_id: formData?.brand_id
            ? parseInt(formData.brand_id as string)
            : null,
        };
        updateMutation.mutate({ id: editingBanner.id, banner: bannerData });
      } else {
        // if the brand id is null, then remove it from the payload. (in create mode only).
        if (formData?.brand_id === null) {
          delete formData.brand_id;
        }
        const bannerData = {
          ...formData,
          ...(imageEnId && { image_en_id: imageEnId }),
          ...(imageArId && { image_ar_id: imageArId }),

          ...(formData?.brand_id && {
            brand_id: parseInt(formData.brand_id as string),
          }),
        };
        createMutation.mutate(bannerData);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      resetForm();
    }
  };

  const handleEdit = (banner: Banner) => {
    resetForm();
    setEditingBanner(banner);
    setFormData({
      promotion_name: banner.promotion_name,
      redirect_url: banner.redirect_url || '',
      brand_id: banner?.brand?.id?.toString() ?? null,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
    setIsFilterSidebarOpen(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
    setIsFilterSidebarOpen(false);
  };

  const handleOpenFilters = () => {
    setTempFilters(appliedFilters);
    setIsFilterSidebarOpen(true);
  };

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: 'images',
      header: 'Images',
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex space-x-2">
            {banner.image_en?.url ? (
              <img
                crossOrigin="anonymous"
                src={banner.image_en.url + banner.image_en.key}
                alt={`${banner.promotion_name} (EN)`}
                className="w-16 h-10 object-cover rounded border"
                title="English"
              />
            ) : (
              <div className="w-16 h-10 bg-gray-200 rounded border flex items-center justify-center">
                <Image className="w-4 h-4 text-gray-400" />
              </div>
            )}
            {banner.image_ar?.url ? (
              <img
                crossOrigin="anonymous"
                src={banner.image_ar.url + banner.image_ar.key}
                alt={`${banner.promotion_name} (AR)`}
                className="w-16 h-10 object-cover rounded border"
                title="Arabic"
              />
            ) : (
              <div className="w-16 h-10 bg-gray-200 rounded border flex items-center justify-center">
                <Image className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'promotion_name',
      header: 'Promotion Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.promotion_name}</span>
      ),
    },
    {
      accessorKey: 'redirect_url',
      header: 'Redirect URL',
      cell: ({ row }) => {
        const url = row.original.redirect_url;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Visit URL
          </a>
        ) : (
          <span className="text-gray-400">No redirect</span>
        );
      },
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => {
        const brand = row.original.brand;
        return <span>{brand ? brand.name : 'Home Page'}</span>;
      },
    },
    {
      accessorKey: 'disabled',
      header: 'Visibility',
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <Toggle
            pressed={!banner.disabled}
            onPressedChange={() =>
              updateMutation.mutate({
                id: banner.id,
                banner: { disabled: !banner.disabled },
              })
            }
            aria-label={
              banner.disabled
                ? 'Enable banner visibility'
                : 'Disable banner visibility'
            }
            disabled={updateMutation.isPending}
          >
            {banner.disabled ? 'Disabled' : 'Active'}
          </Toggle>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(banner)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(banner.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // loading all of the banners that match the applied filters to prepare them for export to excel...
  useEffect(() => {
    getAllExportedToExcelBanners(
      appliedFilters,
      setIsLoadingExportedBanners,
      setExportedBanners
    );
  }, [appliedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="mt-2 text-gray-600">
            Manage promotional banners and advertisements.
          </p>
        </div>
        <div className="flex flex-row-reverse items-center gap-4">
          {/* filters button */}
          <Button
            variant="outline"
            onClick={handleOpenFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(appliedFilters).filter(
              (v) => v !== undefined && v !== '' && v !== 'all'
            ).length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 min-w-[1.25rem]"
              >
                {
                  Object.values(appliedFilters).filter(
                    (v) => v !== undefined && v !== '' && v !== 'all'
                  ).length
                }
              </Badge>
            )}
          </Button>

          <ExportToExcel
            data={exportedBanners || []}
            excludedCols={excludedBannersColsFromExport}
            fileName="banners.xlsx"
            isFetchingData={isLoadingExportedBanners}
          />

          <Dialog
            open={isCreateOpen}
            onOpenChange={() => {
              resetForm();
              setIsCreateOpen((prev) => !prev);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Banner</DialogTitle>
                <DialogDescription>
                  Add a new promotional banner to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion_name">
                    Promotion Name <Asterisk />
                  </Label>
                  <Input
                    id="promotion_name"
                    value={formData.promotion_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        promotion_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className=" grid grid-cols-2 gap-x-4">
                  <div>
                    <Label htmlFor="redirect_url">Redirect URL</Label>
                    <Input
                      id="redirect_url"
                      type="url"
                      value={formData.redirect_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          redirect_url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="brand_id">Brand</Label>
                    <Select
                      value={formData.brand_id?.toString() ?? ''}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          brand_id: value,
                        }))
                      }
                    >
                      <SelectTrigger hideChevron={!!formData.brand_id}>
                        <SelectValue placeholder="Attach it to a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {brands?.data?.map((brand) => {
                            return (
                              <SelectItem
                                key={brand?.id}
                                value={brand?.id?.toString()}
                              >
                                {brand?.name}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formData.brand_id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-[70%] -translate-y-1/2 h-4 w-4 p-0 hover:bg-transparent bg-gray-300 rounded-full hover:bg-gray-400"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            brand_id: null,
                          }))
                        }
                      >
                        <X className="h-3 w-3 text-black" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="image_en">
                        English Image <Asterisk />
                      </Label>
                      <FileInput
                        id="image_en"
                        accept="image/*"
                        placeholder="Select a banner image"
                        onChange={(file) => setImageEnFile(file)}
                      />
                      <span className={recommendedAspectRationClassName}>
                        {recommendedAspectRatio}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="image_ar">
                        Arabic Image <Asterisk />
                      </Label>
                      <FileInput
                        id="image_ar"
                        accept="image/*"
                        placeholder="Select a banner image"
                        onChange={(file) => setImageArFile(file)}
                      />
                      <span className={recommendedAspectRationClassName}>
                        {recommendedAspectRatio}
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || uploadMutation.isPending
                    }
                  >
                    {createMutation.isPending || uploadMutation.isPending
                      ? 'Creating...'
                      : 'Create Banner'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl">Filters</SheetTitle>
          </SheetHeader>

          <BannersFilters
            tempFilters={tempFilters}
            setTempFilters={setTempFilters}
            brands={brands?.data || []}
          />

          <SheetFooter className="border-t pt-4 flex-row gap-2 mt-auto">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsFilterSidebarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1 gap-2 border"
              onClick={handleClearFilters}
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Filter
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            A list of all promotional banners in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={banners?.data || []}
            isLoading={isBannersLoading}
            pagination={{
              pageIndex: currentPage,
              pageSize: pageSize,
              totalItems: banners?.meta?.total || 0,
            }}
            onPaginationChange={(pageIndex, pageSize) => {
              setCurrentPage(pageIndex);
              setPageSize(pageSize);
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Banner Dialog */}
      <Dialog
        open={!!editingBanner}
        onOpenChange={() => setEditingBanner(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Update banner information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_promotion_name">
                Promotion Name <Asterisk />
              </Label>
              <Input
                id="edit_promotion_name"
                value={formData.promotion_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    promotion_name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className=" grid grid-cols-2 gap-x-4">
              <div>
                <Label htmlFor="edit_redirect_url">Redirect URL</Label>
                <Input
                  id="edit_redirect_url"
                  type="url"
                  value={formData.redirect_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      redirect_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_id">Brand (Optional)</Label>
                <div className="relative">
                  <Select
                    value={formData.brand_id?.toString() ?? ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        brand_id: value,
                      }))
                    }
                  >
                    <SelectTrigger hideChevron={!!formData.brand_id}>
                      <SelectValue placeholder="Attach it to a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup
                        defaultValue={formData.brand_id?.toString() ?? ''}
                      >
                        {brands?.data?.map((brand) => {
                          return (
                            <SelectItem
                              key={brand?.id}
                              value={brand?.id?.toString()}
                            >
                              {brand?.name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formData.brand_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-[50%] -translate-y-1/2 h-4 w-4 p-0 hover:bg-transparent bg-gray-300 rounded-full hover:bg-gray-400"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          brand_id: null,
                        }))
                      }
                    >
                      <X className="h-3 w-3 text-black" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="edit_image_en">
                    English Image <Asterisk />
                  </Label>
                  <FileInput
                    id="edit_image_en"
                    accept="image/*"
                    placeholder={
                      editingBanner?.image_en?.key?.replace('/assets/', '') ||
                      imageEnFile?.name ||
                      'Select a English image'
                    }
                    onChange={(file) => setImageEnFile(file)}
                  />
                </div>
                {editingBanner?.image_en?.url && (
                  <img
                    crossOrigin="anonymous"
                    src={
                      editingBanner.image_en.url + editingBanner.image_en.key
                    }
                    alt="Current English"
                    className="w-full h-20 object-cover rounded border"
                  />
                )}
                <span className={recommendedAspectRationClassName}>
                  {recommendedAspectRatio}
                </span>
              </div>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="edit_image_ar">
                    Arabic Image <Asterisk />
                  </Label>
                  <FileInput
                    id="edit_image_ar"
                    accept="image/*"
                    placeholder={
                      editingBanner?.image_ar?.key?.replace('/assets/', '') ||
                      imageArFile?.name ||
                      'Select a Arabic image'
                    }
                    onChange={(file) => setImageArFile(file)}
                  />
                </div>
                {editingBanner?.image_ar?.url && (
                  <img
                    crossOrigin="anonymous"
                    src={
                      editingBanner.image_ar.url + editingBanner.image_ar.key
                    }
                    alt="Current Arabic"
                    className="w-full h-20 object-cover rounded border"
                  />
                )}
                <span className={recommendedAspectRationClassName}>
                  {recommendedAspectRatio}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBanner(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || uploadMutation.isPending}
              >
                {updateMutation.isPending || uploadMutation.isPending
                  ? 'Updating...'
                  : 'Update Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
