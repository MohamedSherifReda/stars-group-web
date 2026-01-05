import toast from "react-hot-toast";
import { usersApi } from "../user.apis";
import type { Dispatch, SetStateAction } from "react";

const MAX_EXPORTED_RECORDS_COUNT = 100000;

export async function getAllExportedToExcelUsers(
  usersFilters: any,
  loaderSetter: Dispatch<SetStateAction<boolean>>,
  exportedUsersSetter: Dispatch<SetStateAction<any>>
) {
  try {
    loaderSetter(true);
    const filters: any = {};
    Object.entries(usersFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        if (key === 'account_verified') {
          filters[key] = {
            $val: value === 'true',
            $op: 'Is',
          };
        } else if (key === 'role' || key === 'rank') {
          filters[key] = {
            $val: key === 'rank' ? Number(value) : value,
            $op: 'Eq',
          };
        } else if (key === 'id') {
          filters[key] = {
            $val: Number(value),
            $op: 'Eq',
          };
        } else if (key === 'created_at' || key === 'birthdate') {
          filters[key] = {
            $val: new Date(value as string).toISOString(),
            $op: 'Eq',
          };
        } else {
          filters[key] = {
            $val: value,
            $op: 'Contains',
          };
        }
      }
    });

    const exportedToExcelUsers = await usersApi.getUsers({
      pagination: {
        take: MAX_EXPORTED_RECORDS_COUNT,
      },
      filters: filters,
    });

    const exportedUsersArr = exportedToExcelUsers?.data?.data || [];
    exportedUsersSetter(exportedUsersArr);
  } catch (error) {
    console.error(error);
    toast.error('Failed to export users. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}