import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ExternalLink, Image } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/common/table';
import serveBannersMeta from '~/meta/serveBannersMeta';
import Asterisk from '@ui/common/Asterisk';

export const meta = serveBannersMeta;

interface BannerFormData {
  promotion_name: string;
  redirect_url: string;
}

export default function Banners() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    promotion_name: '',
    redirect_url: '',
  });
  const [imageEnFile, setImageEnFile] = useState<File | null>(null);
  const [imageArFile, setImageArFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

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
        })
        .then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
  });

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

      const bannerData = {
        ...formData,
        ...(imageEnId && { image_en_id: imageEnId }),
        ...(imageArId && { image_ar_id: imageArId }),
      };

      if (editingBanner) {
        updateMutation.mutate({ id: editingBanner.id, banner: bannerData });
      } else {
        createMutation.mutate(bannerData);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleEdit = (banner: Banner) => {
    resetForm();
    setEditingBanner(banner);
    setFormData({
      promotion_name: banner.promotion_name,
      redirect_url: banner.redirect_url || '',
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="mt-2 text-gray-600">
            Manage promotional banners and advertisements.
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
              <div className="space-y-2">
                <Label htmlFor="redirect_url">
                  Redirect URL <Asterisk />
                </Label>
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
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_en">
                    English Image <Asterisk />
                  </Label>
                  <Input
                    id="image_en"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageEnFile(e.target.files?.[0] || null)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_ar">
                    Arabic Image <Asterisk />
                  </Label>
                  <Input
                    id="image_ar"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageArFile(e.target.files?.[0] || null)
                    }
                    required
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
                  {createMutation.isPending || uploadMutation.isPending
                    ? 'Creating...'
                    : 'Create Banner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            A list of all promotional banners in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBannersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading banners...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Images</TableHead>
                  <TableHead>Promotion Name</TableHead>
                  <TableHead>Redirect URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners?.data?.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.promotion_name}
                    </TableCell>
                    <TableCell>
                      {banner.redirect_url ? (
                        <a
                          href={banner.redirect_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visit URL
                        </a>
                      ) : (
                        <span className="text-gray-400">No redirect</span>
                      )}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
            <div className="space-y-2">
              <Label htmlFor="edit_redirect_url">
                Redirect URL <Asterisk />
              </Label>
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
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_image_en">
                  English Image <Asterisk />
                </Label>
                <Input
                  id="edit_image_en"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageEnFile(e.target.files?.[0] || null)}
                  required
                />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image_ar">
                  Arabic Image <Asterisk />
                </Label>
                <Input
                  id="edit_image_ar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageArFile(e.target.files?.[0] || null)}
                  required
                />
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
