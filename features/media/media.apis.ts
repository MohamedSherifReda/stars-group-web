import api from "@utils/api";
import type { ApiResponse, Media } from 'core/types/common.types';

export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<Media>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  update: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put<Media>(`/media/upload/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getMedia: () => api.get<Media[]>('/media'),
  getMediaInfo: (id: number) => api.get<Media>(`/media/${id}/info`),
};