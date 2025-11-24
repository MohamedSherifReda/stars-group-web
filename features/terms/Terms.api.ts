import api from "@utils/api";
import type { ApiResponse } from "core/types/common.types";
import type { Terms } from "core/types/terms.types";


// We have only one terms and conditions so we are using a constant for the id
const TERMS_ID = 1;
export const termsAPI = {
  getTerms: () => {
    return api.get<ApiResponse<Terms[]>>('/terms');
  },

  createTerms: (terms: Terms) => {
  return  api.post<ApiResponse<Terms>>('/terms', terms);
  },

  updateTerms: ( terms: Terms) => {
    return api.patch<ApiResponse<Terms>>(`/terms/${TERMS_ID}`, terms);
  },

  deleteTerms: (id: number) => {
    return api.delete<ApiResponse<Terms>>(`/terms/${id}`);
  },
}