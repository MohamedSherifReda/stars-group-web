import toast from "react-hot-toast";
import { usersApi } from "../user.apis";
import type { Dispatch, SetStateAction } from "react";

import { fetchAllForExport, exportTruncatedMessage } from "@utils/exportPaging";

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

    const { rows, truncated } = await fetchAllForExport((pagination) =>
      usersApi.getUsers({ pagination, filters }).then((res) => res.data)
    );
    if (truncated) toast(exportTruncatedMessage);
    exportedUsersSetter(rows);
  } catch (error) {
    if (import.meta.env.DEV) console.error('users export failed', (error as Error)?.message);
    toast.error('Failed to export users. Please try again later!');
  } finally {
    loaderSetter(false);
  }
}