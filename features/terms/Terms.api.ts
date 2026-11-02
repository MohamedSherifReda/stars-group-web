import api from "@utils/api";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "core/types/common.types";
import type { Terms } from "core/types/terms.types";


// We have only one terms and conditions so we are using a constant for the id
const TERMS_ID = 1;

// Terms and Privacy edit the same row, so they must share one cache entry
export const TERMS_QUERY_KEY = ['terms'] as const;

export const termsAPI = {
  getTerms: () => {
    return api.get<ApiResponse<Terms[]>>('/terms');
  },

  createTerms: (terms: Terms) => {
  return  api.post<ApiResponse<Terms>>('/terms', terms);
  },

  // Partial update: send only the field(s) being edited so the other page's
  // content is never overwritten with a stale copy
  updateTerms: (terms: Partial<Terms>) => {
    return api.patch<ApiResponse<Terms>>(`/terms/${TERMS_ID}`, terms);
  },

  deleteTerms: (id: number) => {
    return api.delete<ApiResponse<Terms>>(`/terms/${id}`);
  },
}

// Shared query for the single terms row used by the Terms and Privacy pages
export const useTermsRow = () =>
  useQuery({
    queryKey: TERMS_QUERY_KEY,
    queryFn: () => termsAPI.getTerms().then((res) => res.data?.data?.[0] ?? null),
  });
