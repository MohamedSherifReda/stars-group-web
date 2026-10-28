import api from "@utils/api";
import { validateImageFile } from "@utils/fileValidation";
import type { ApiResponse, Media } from 'core/types/common.types';

export const mediaApi = {
  upload: async (file: File) => {
    const invalid = await validateImageFile(file);
    if (invalid) throw new Error(invalid);
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<Media>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  update: async (id: number, file: File) => {
    const invalid = await validateImageFile(file);
    if (invalid) throw new Error(invalid);
    const formData = new FormData();
    formData.append('file', file);
    return api.put<Media>(`/media/upload/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getMedia: () => api.get<Media[]>('/media'),
  getMediaInfo: (id: number) => api.get<Media>(`/media/${id}/info`),
};