import { brandsApi } from '@features/brand/brand.apis';
import { mediaApi } from '@features/media/media.apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Asterisk from '@ui/common/Asterisk';
import { Button } from '@ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/common/dialog';
import { Input } from '@ui/common/input';
import { Label } from '@ui/common/label';
import { Textarea } from '@ui/common/textarea';
import { DataTable, type ColumnDef } from '@ui/common/data-table';
import type { Brand } from 'core/types/brand.types';
import { Edit, Image, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import serveBrandsMeta from '~/meta/serveBrandsMeta';
import { bannersApi } from '@features/banner/banner.apis';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/common/select';
import { MultiSelectInput } from '@ui/common/MultiSelectInput';
import type { Banner } from 'core/types/banner.types';

export const meta = serveBrandsMeta;

interface BrandFormData {
  name: string;
  heading_title: string;
  description: string;
  shop_url: string;
  gradient_hex: string;
  display_order: string | undefined;
  banners?: string[] | number[] | undefined | Banner[];
}

export default function Brands() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingDisplayOrderId, setEditingDisplayOrderId] = useState<
    number | null
  >(null);
  const [editingDisplayOrderValue, setEditingDisplayOrderValue] =
    useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    heading_title: '',
    description: '',
    shop_url: '',
    gradient_hex: '#000000',
    display_order: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [logoBackgroundFile, setLogoBackgroundFile] = useState<File | null>(
    null
  );
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: brands = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading,
  } = useQuery({
    queryKey: ['brands', currentPage, pageSize],
    queryFn: () =>
      brandsApi
        .getBrands({
          'relations[logo]': 'true',
          'relations[product_picture]': 'true',
          'relations[background_logo]': 'true',
          'relations[banners]': 'true',
          'orders[display_order]': 'asc',
          'pagination[take]': pageSize,
          'pagination[skip]': (currentPage - 1) * pageSize,
        })
        .then((res) => res.data),
  });

  const {
    data: banners = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isBannersLoading,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: () =>
      bannersApi
        .getBanners({
          'relations[image_ar]': 'true',
          'relations[image_en]': 'true',
          'relations[brand]': 'true',
        })
        .then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
  });

  const createMutation = useMutation({
    mutationFn: (brand: Partial<Brand>) => brandsApi.createBrand(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success('Brand created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create brand');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, brand }: { id: number; brand: Partial<Brand> }) =>
      brandsApi.updateBrand(id, brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setEditingBrand(null);
      resetForm();
      toast.success('Brand updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update brand');
    },
  });

  const updateDisplayOrderMutation = useMutation({
    mutationFn: ({
      id,
      display_order,
    }: {
      id: number;
      display_order: number;
    }) =>
      brandsApi.reorderBrands({
        brands: [{ id, display_order }],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setEditingDisplayOrderId(null);
      toast.success('Display order updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update display order'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => brandsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      heading_title: '',
      description: '',
      shop_url: '',
      gradient_hex: '#000000',
      display_order: '',
    });
    setLogoFile(null);
    setProductFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmittingForm(true);
    try {
      let logoId: number | undefined;
      let productPictureId: number | undefined;
      let logoBackgroundId: number | undefined;
      if (logoFile) {
        const logoResponse = await uploadMutation.mutateAsync(logoFile);
        logoId = logoResponse.data?.data?.id;
      }

      if (productFile) {
        const productResponse = await uploadMutation.mutateAsync(productFile);
        productPictureId = productResponse.data?.data?.id;
      }

      if (logoBackgroundFile) {
        const logoBackgroundResponse = await uploadMutation.mutateAsync(
          logoBackgroundFile
        );
        logoBackgroundId = logoBackgroundResponse.data?.data?.id;
      }

      const totalBrands = brands?.meta?.total ?? brands?.data?.length ?? 0;

      let displayOrderValue: number | undefined;
      if (formData.display_order !== '') {
        const parsed = Number(formData.display_order);

        if (!Number.isFinite(parsed) || parsed < 0) {
          toast.error('Display order must be a non-negative number');
          return;
        }

        const maxOrderForCreate = totalBrands + 1;
        if (parsed > maxOrderForCreate) {
          toast.error(
            `Display order cannot be greater than ${maxOrderForCreate} for a new brand`
          );
          return;
        }

        displayOrderValue = parsed;
      } else {
        formData.display_order = undefined;
        displayOrderValue = undefined;
      }

      const brandData: any = {
        ...formData,
        ...(logoId && { logo_id: logoId }),
        ...(productPictureId && { product_picture_id: productPictureId }),
        ...(logoBackgroundId && { background_logo_id: logoBackgroundId }),
        ...(displayOrderValue &&
        typeof displayOrderValue === 'number' &&
        displayOrderValue > 0
          ? {
              display_order: displayOrderValue,
            }
          : {}),
        ...(formData?.banners &&
          formData.banners.length > 0 && {
            banners: formData.banners.map((banner) => ({
              id: parseInt(banner as string),
            })),
          }),
        brand_id_brand_translations: [
          {
            description: formData.description,
            name: formData.name,
            heading_title: formData.heading_title,
            language: 'en',
          },
        ],
      };

      if (editingBrand) {
        updateMutation.mutate({ id: editingBrand.id, brand: brandData });
      } else {
        createMutation.mutate(brandData);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    resetForm();
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      heading_title: brand.heading_title,
      description: brand.description,
      shop_url: brand.shop_url || '',
      gradient_hex: brand.gradient_hex,
      display_order: String(brand.display_order ?? ''),
      banners:
        brand.banners?.map((banner: Banner | number | string) =>
          (banner as Banner)?.id?.toString()
        ) ?? [],
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(id);
    }
  };

  const startEditingDisplayOrder = (brand: Brand) => {
    setEditingDisplayOrderId(brand.id);
    setEditingDisplayOrderValue(String(brand.display_order ?? ''));
  };

  const commitDisplayOrderChange = (brand: Brand) => {
    const value = Number(editingDisplayOrderValue);

    if (!Number.isFinite(value)) {
      toast.error('Please enter a valid number for display order');
      return;
    }

    if (value < 0) {
      toast.error('Display order cannot be negative');
      return;
    }

    const totalBrands = brands?.meta?.total ?? brands?.data?.length ?? 0;

    if (value > totalBrands) {
      toast.error(
        `Display order cannot be greater than the total number of brands (${totalBrands})`
      );
      return;
    }

    if (value === brand.display_order) {
      setEditingDisplayOrderId(null);
      return;
    }

    updateDisplayOrderMutation.mutate({ id: brand.id, display_order: value });
  };

  const columns: ColumnDef<Brand>[] = [
    {
      id: 'logo',
      header: 'Logo',
      cell: (brand) =>
        brand.logo?.url ? (
          <img
            src={brand.logo.url + brand.logo?.key}
            crossOrigin="anonymous"
            alt={brand.name}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <Image className="w-4 h-4 text-gray-400" />
          </div>
        ),
    },
    {
      id: 'name',
      header: 'Name',
      cell: (brand) => <span className="font-medium">{brand.name}</span>,
    },
    {
      id: 'description',
      header: 'Description',
      cell: (brand) => (
        <span className="line-clamp-1">{brand.description}</span>
      ),
      className: 'max-w-xs',
    },
    {
      id: 'shop_url',
      header: 'Shop URL',
      cell: (brand) =>
        brand.shop_url ? (
          <a
            href={brand.shop_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit Shop
          </a>
        ) : (
          <span className="text-gray-400">No URL</span>
        ),
    },
    {
      id: 'display_order',
      header: 'Display Order (Double Click to Edit)',
      cell: (brand) => (
        <div
          className="text-gray-400"
          onDoubleClick={() => startEditingDisplayOrder(brand)}
        >
          {editingDisplayOrderId === brand.id ? (
            <Input
              type="number"
              min={0}
              max={brands?.meta?.total ?? undefined}
              value={editingDisplayOrderValue}
              onChange={(e) => setEditingDisplayOrderValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitDisplayOrderChange(brand);
                } else if (e.key === 'Escape') {
                  setEditingDisplayOrderId(null);
                }
              }}
              autoFocus
              className="w-20"
            />
          ) : (
            <p className="flex items-center justify-center  w-1/2">
              {brand.display_order}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'banner',
      header: 'Banner',
      cell: (brand: Brand) => (
        <span className="line-clamp-1 w-fit">
          {brand.banners
            ?.map(
              (banner: Banner | number | string) =>
                (banner as Banner)?.promotion_name
            )
            .join(' - ') || 'N/A'}
        </span>
      ),
      className: 'w-fit',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (brand) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(brand.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(brand)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalBrands = brands?.meta?.total ?? brands?.data?.length ?? 0;

  const sortedBrands = useMemo(() => {
    const list = brands?.data ?? [];
    return [...list].sort((a, b) => a?.display_order - b?.display_order);
  }, [brands?.data]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="mt-2 text-gray-600">
            Manage brand partners and their information.
          </p>
        </div>
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
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
              <DialogDescription>
                Add a new brand partner to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Brand Name
                    <Asterisk />
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heading_title">
                    Heading Title
                    <Asterisk />
                  </Label>
                  <Input
                    id="heading_title"
                    value={formData.heading_title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        heading_title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <Asterisk />
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop_url">
                    Shop URL <Asterisk />
                  </Label>
                  <Input
                    id="shop_url"
                    type="url"
                    value={formData.shop_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shop_url: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradient_hex">Gradient Color</Label>
                  <Input
                    id="gradient_hex"
                    type="color"
                    value={formData.gradient_hex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gradient_hex: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">
                    Logo <Asterisk />
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('logo file', e.target.files?.[0]);
                      setLogoFile(e.target.files?.[0] || null);
                      5;
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_picture">
                    Product Picture <Asterisk />
                  </Label>
                  <Input
                    id="product_picture"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProductFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_background">
                    Logo Background Image <Asterisk />
                  </Label>
                  <Input
                    id="logo_background"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setLogoBackgroundFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="display_order">
                    Display Order (optional)
                  </Label>
                  <Input
                    defaultValue={String(brands?.meta?.total! + 1)}
                    id="display_order"
                    type="number"
                    min={0}
                    max={(brands?.meta?.total ?? brands?.data?.length ?? 0) + 1}
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_order: e.target.value,
                      }))
                    }
                  />
                  {/* <p className="text-xs text-gray-500">
                    Leave empty to let the system assign the next available
                    order.
                  </p> */}
                </div>
                {/* Banner */}
                <div className="space-y-2">
                  <Label htmlFor="banner_id">Banner (Optional)</Label>
                  <MultiSelectInput
                    options={
                      banners?.data?.map((banner) => ({
                        label: banner.promotion_name,
                        value: banner.id.toString(),
                      })) ?? []
                    }
                    value={(formData.banners as string[]) ?? []}
                    onChange={(value) => {
                      console.log('value', value);
                      setFormData((prev) => ({
                        ...prev,
                        banners: value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4"></div>
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
                  disabled={createMutation.isPending || isSubmittingForm}
                >
                  {createMutation.isPending || isSubmittingForm ? (
                    <>
                      <LoaderCircle className="animate-spin " />
                      Creating...
                    </>
                  ) : (
                    'Create Brand'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>
            A list of all brand partners in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable<Brand>
            columns={columns}
            data={sortedBrands}
            pagination={{
              pageIndex: currentPage,
              pageSize,
              totalItems: totalBrands,
            }}
            onPaginationChange={(pageIndex, pageSize) => {
              setCurrentPage(pageIndex);
              setPageSize(pageSize);
            }}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Edit Brand Dialog */}
      <Dialog open={!!editingBrand} onOpenChange={() => setEditingBrand(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Brand Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_heading_title">Heading Title</Label>
                <Input
                  id="edit_heading_title"
                  value={formData.heading_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heading_title: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_shop_url">Shop URL</Label>
                <Input
                  id="edit_shop_url"
                  type="url"
                  value={formData.shop_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shop_url: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_gradient_hex">Gradient Color</Label>
                <Input
                  id="edit_gradient_hex"
                  type="color"
                  value={formData.gradient_hex}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gradient_hex: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_logo">Logo (optional)</Label>
                <Input
                  id="edit_logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_product_picture">
                  Product Picture (optional)
                </Label>
                <Input
                  id="edit_product_picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_background">
                  Logo Background Image <Asterisk />
                </Label>
                <Input
                  id="logo_background"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setLogoBackgroundFile(e.target.files?.[0] || null)
                  }
                />
              </div>
              {/* Banner  (Edit)*/}
              {
                <div className="space-y-2">
                  <Label htmlFor="banner_id">Banner</Label>
                  <MultiSelectInput
                    options={
                      banners?.data?.map((banner) => ({
                        label: banner.promotion_name,
                        value: banner.id.toString(),
                      })) ?? []
                    }
                    value={formData.banners as string[]}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        banners: value,
                      }))
                    }
                  />
                </div>
              }
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingBrand(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
