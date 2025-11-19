import api from '@utils/api';
import type { ApiResponse } from 'core/types/api.types';
import type { ContactUs } from 'core/types/contact-us.types';

const CONTACT_US_ID = 1;
export const contactUsApi = {
  getContactUs: () => {
    return api.get<ApiResponse<ContactUs>>('/contact-us');
  },
getOneContactUs: () => {
  return api.get<ApiResponse<ContactUs>>(`/contact-us/${CONTACT_US_ID}`);
},
  updateContactUs: (data: Omit<ContactUs, 'id' | 'created_at' | 'updated_at'>) =>
    api.patch<ApiResponse<ContactUs>>(`/contact-us/${CONTACT_US_ID}`, data),
};

