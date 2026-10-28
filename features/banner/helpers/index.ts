import type { Dispatch, SetStateAction } from "react";
import { bannersApi } from "../banner.apis";
import toast from "react-hot-toast";


import { fetchAllForExport, exportTruncatedMessage } from "@utils/exportPaging";

export async function getAllExportedToExcelBanners(
  appliedFilters: any,
  loaderSetter: Dispatch<SetStateAction<boolean>>,
  exportedBannersSetter: Dispatch<SetStateAction<any>>
) {
  try {
    loaderSetter(true);
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

    const { rows, truncated } = await fetchAllForExport((pagination) =>
      bannersApi
        .getBanners({
          relations: {
            image_ar: true,
            image_en: true,
            brand: true,
          },
          includeAllBranded: true,
          pagination,
          filters: filters,
        })
        .then((res) => res.data)
    );
    if (truncated) toast(exportTruncatedMessage);
    exportedBannersSetter(rows);
  } catch (error) {
    if (import.meta.env.DEV) console.error('banners export failed', (error as Error)?.message);
    toast.error('Failed to export banners. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}