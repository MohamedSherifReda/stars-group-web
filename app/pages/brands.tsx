import { brandsApi } from '@features/brand/brand.apis';
import { mediaApi } from '@features/media/media.apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/common/table';
import { Textarea } from '@ui/common/textarea';
import type { Brand } from 'core/types/brand.types';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import serveBrandsMeta from '~/meta/serveBrandsMeta';

export const meta = serveBrandsMeta;

interface BrandFormData {
  name: string;
  heading_title: string;
  description: string;
  shop_url: string;
  gradient_hex: string;
}

export default function Brands() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    heading_title: '',
    description: '',
    shop_url: '',
    gradient_hex: '#000000',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const {
    data: brands = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () =>
      brandsApi
        .getBrands({
          'relations[logo]': 'true',
          'relations[product_picture]': 'true',
          'relations[banners]': 'true',
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
    });
    setLogoFile(null);
    setProductFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let logoId: number | undefined;
      let productPictureId: number | undefined;

      if (logoFile) {
        const logoResponse = await uploadMutation.mutateAsync(logoFile);
        logoId = logoResponse.data.id;
      }

      if (productFile) {
        const productResponse = await uploadMutation.mutateAsync(productFile);
        productPictureId = productResponse.data.id;
      }

      const brandData = {
        ...formData,
        ...(logoId && { logo_id: logoId }),
        ...(productPictureId && { product_picture_id: productPictureId }),
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
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(id);
    }
  };

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
                  <Label htmlFor="name">Brand Name</Label>
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
                  <Label htmlFor="heading_title">Heading Title</Label>
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
                <Label htmlFor="description">Description</Label>
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
                  <Label htmlFor="shop_url">Shop URL</Label>
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
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_picture">Product Picture</Label>
                  <Input
                    id="product_picture"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProductFile(e.target.files?.[0] || null)
                    }
                  />
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Brand'}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading brands...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Shop URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands?.data?.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      {brand.logo?.url ? (
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
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {brand.description}
                    </TableCell>
                    <TableCell>
                      {brand.shop_url ? (
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
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(brand)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
