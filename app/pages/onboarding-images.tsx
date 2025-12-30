import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { onboardingImagesApi } from '@features/onboarding-images/onboarding-images.apis';
import type { OnboardingImage } from 'core/types/onboarding-images.types';
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
import serveOnboardingImagesMeta from '~/meta/serveOnboardingImagesMeta';
import Asterisk from '@ui/common/Asterisk';
import { FileInput } from '@ui/common/file-input';

export const meta = serveOnboardingImagesMeta;

interface OnboardingImageFormData {
  display_order: number | '';
  image_id?: number;
}

export default function OnboardingImages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<OnboardingImage | null>(null);
  const [formData, setFormData] = useState<OnboardingImageFormData>({
    display_order: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const {
    data: onboardingImages = { data: [] },
    isLoading,
  } = useQuery({
    queryKey: ['onboarding-images'],
    queryFn: () => onboardingImagesApi.getOnboardingImages({
      relations: {
        image: true,
      },
    }).then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => onboardingImagesApi.createOnboardingImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-images'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success('Onboarding image created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create onboarding image');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      onboardingImagesApi.updateOnboardingImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-images'] });
      setEditingImage(null);
      resetForm();
      toast.success('Onboarding image updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update onboarding image');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => onboardingImagesApi.deleteOnboardingImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-images'] });
      toast.success('Onboarding image deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete onboarding image');
    },
  });

  const resetForm = () => {
    setFormData({
      display_order: '',
    });
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageId: number | undefined = formData.image_id;

      if (imageFile) {
        const uploadResponse = await uploadMutation.mutateAsync(imageFile);
        imageId = uploadResponse.data?.data?.id;
      }

      const data = {
        display_order: formData.display_order === '' ? undefined : Number(formData.display_order),
        image_id: imageId,
      };

      if (editingImage) {
        updateMutation.mutate({ id: editingImage.id, data });
      } else {
        if (!imageId) {
          toast.error('Please select an image');
          return;
        }
        createMutation.mutate(data);
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleEdit = (image: OnboardingImage) => {
    resetForm();
    setEditingImage(image);
    setFormData({
      display_order: image.display_order,
      image_id: image.image_id,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this onboarding image?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<OnboardingImage>[] = [
    {
      header: 'Image',
      cell: ({ row }) => {
        const image = row.original.image;
        return image?.url ? (
          <img
            crossOrigin="anonymous"
            src={image.url + image.key}
            alt={`Onboarding Image ${row.original.id}`}
            className="w-24 h-16 object-cover rounded border"
          />
        ) : (
          <div className="w-24 h-16 bg-gray-200 rounded border flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        );
      },
    },
    {
      accessorKey: 'display_order',
      header: 'Display Order',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('display_order')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const sortedData = onboardingImages.data
    ? [...onboardingImages.data].sort((a, b) => a.display_order - b.display_order)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Images</h1>
          <p className="mt-2 text-gray-600">
            Manage images shown during the user onboarding process.
          </p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            if (open) {
              const nextOrder = onboardingImages.data?.length 
                ? Math.max(...onboardingImages.data.map((i: OnboardingImage) => i.display_order)) + 1 
                : 1;
              setFormData({ display_order: nextOrder });
            } else {
              resetForm();
            }
            setIsCreateOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Onboarding Image</DialogTitle>
              <DialogDescription>
                Upload a new image and set its display order.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">
                  Image <Asterisk />
                </Label>
                <FileInput
                  id="image"
                  accept="image/*"
                  placeholder="Select an image"
                  onChange={(file) => setImageFile(file)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">
                  Display Order
                </Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: e.target.value === '' ? '' : parseInt(e.target.value),
                    }))
                  }
                  placeholder="e.g. 1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for auto ordering</p>
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
                  disabled={createMutation.isPending || uploadMutation.isPending}
                >
                  {createMutation.isPending || uploadMutation.isPending
                    ? 'Adding...'
                    : 'Add Image'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Onboarding Images</CardTitle>
          <CardDescription>
            A list of images that will be displayed during onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={sortedData}
            isLoading={isLoading}
            showPagination={false}
            emptyState={
              <div className="text-center py-4 text-gray-500">
                No onboarding images found.
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Edit Image Dialog */}
      <Dialog
        open={!!editingImage}
        onOpenChange={(open) => {
          if (!open) setEditingImage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Onboarding Image</DialogTitle>
            <DialogDescription>Update the image or display order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_image">Image</Label>
              <FileInput
                id="edit_image"
                accept="image/*"
                placeholder={editingImage?.image?.key?.split('/').pop() || "Select an image"}
                onChange={(file) => setImageFile(file)}
              />
              {editingImage?.image?.url && !imageFile && (
                <img
                  crossOrigin="anonymous"
                  src={editingImage.image.url + editingImage.image.key}
                  alt="Current"
                  className="mt-2 w-full h-32 object-cover rounded border"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_display_order">
                Display Order
              </Label>
              <Input
                id="edit_display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: e.target.value === '' ? '' : parseInt(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for auto ordering</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingImage(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || uploadMutation.isPending}
              >
                {updateMutation.isPending || uploadMutation.isPending
                  ? 'Updating...'
                  : 'Update Image'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
