import { brandsApi } from "../brand.apis";
import toast from "react-hot-toast";
import type { Dispatch, SetStateAction } from "react";

export async function getAllExportedToExcelBrands(brandsFilters: any, loaderSetter: Dispatch<SetStateAction<boolean>>, exportedBrandsSetter: Dispatch<SetStateAction<any>>) {
  try {
    loaderSetter(true);

    const filters: any = {};

    Object.entries(brandsFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        if (key === 'created_at') {
          filters[key] = {
            $val: new Date(value as string).toISOString(),
            $op: 'Eq',
          };
        } else if (key === 'shop_url') {
          const urlValue: string = value as string;
          filters[key] = {
            $val: urlValue?.endsWith('/')
              ? (urlValue?.slice(0, -1) as string) // remove the / from the end
              : urlValue,
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

    const exportedToExcelBrands = await brandsApi.getBrands(
      {
        pagination: {
          take: 10000,
        },
        relations: {
          logo: true,
          product_picture: true,
          background_logo: true,
          banners: true,
        },
        orders: {
          display_order: 'asc',
        },
        filters: filters,
      },
      {
        'x-skip-translations': true,
      }
    );

    const exportedBrands = exportedToExcelBrands?.data?.data || [];
    exportedBrandsSetter(exportedBrands);
  } catch (error) {
    console.error(error);
    toast.error('Failed to export brands. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}
