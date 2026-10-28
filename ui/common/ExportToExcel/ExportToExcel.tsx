import React, { useState } from 'react'
import XLSX from 'xlsx-js-style';
import saveAs from 'file-saver';
import { Button } from '../button';
import { UserRank } from 'core/types/user.types';
import { formatDate } from 'date-fns';
import { Download } from 'lucide-react';
import { safeHttpUrl } from '@utils/sanitizeHtml';

// Columns that must never end up in a spreadsheet, whatever the API returns
const SECRET_COLUMN_PATTERN =
  /token|fcm|password|passwd|refresh|de_?square|secret|otp|session|ui_configurations/i;

// users.xlsx contains only these columns (everything else is dropped)
const USER_EXPORT_COLUMNS = [
  'id',
  'name',
  'email',
  'phone_number_key',
  'phone_number',
  'account_verified',
  'role',
  'rank',
  'birthdate',
  'created_at',
];

/** Neutralises spreadsheet formula injection: cells starting with = + - @ tab or CR become text. */
const FORMULA_START = /^[=+\-@\t\r]/;
const guardCell = (value: unknown): unknown =>
  typeof value === 'string' && FORMULA_START.test(value) ? `'${value}` : value;

/** Joins a media base url + key and keeps it only when it is a real http(s) URL. */
const mediaUrl = (media: any): string =>
  (media?.url && safeHttpUrl(String(media.url) + String(media.key ?? ''))) || 'N/A';

interface ExportToExcelProps {
  data: any[];
  fileName?: string;
  excludedCols?: string[];
  isFetchingData?: boolean;
}
const ExportToExcel = ({
  data,
  fileName,
  excludedCols,
  isFetchingData,
}: ExportToExcelProps) => {
  const [isExporting, setIsExportingData] = useState(false);


  function exportToExcelHandler() {
    setIsExportingData(true);
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    const updatedData = data.map((row) => {
      const updatedRow = { ...row };
      if (excludedCols && excludedCols?.length > 0) {
        Object.entries(updatedRow).forEach(([key, value]) => {
          if (excludedCols?.includes(key)) {
            delete updatedRow[key];
          }
        });
      }

      if (fileName?.includes('users')) {
        const picked: Record<string, any> = {};
        USER_EXPORT_COLUMNS.forEach((col) => {
          if (col in updatedRow) picked[col] = updatedRow[col];
        });
        return {
          ...picked,
          rank: UserRank[updatedRow.rank] || 'N/A',
          birthdate: updatedRow?.birthdate
            ? formatDate(updatedRow?.birthdate, 'dd-MMM-yyyy')
            : 'N/A',
          created_at: updatedRow?.created_at
            ? formatDate(updatedRow?.created_at, 'dd-MMM-yyyy')
            : 'N/A',
        };
      }

      if (fileName?.includes('brands')) {
        return {
          // ...updatedRow,
          id: updatedRow?.id || 'N/A',
          name_ar: updatedRow?.name || 'N/A',
          heading_title_ar: updatedRow?.heading_title || 'N/A',
          description_ar: updatedRow?.description || 'N/A',
          name_en:
            updatedRow?.brand_id_brand_translations?.length > 0
              ? updatedRow?.brand_id_brand_translations[0]?.name
              : 'N/A',
          description_en:
            updatedRow?.brand_id_brand_translations?.length > 0
              ? updatedRow?.brand_id_brand_translations[0]?.description
              : 'N/A',
          heading_title_en:
            updatedRow?.brand_id_brand_translations?.length > 0
              ? updatedRow?.brand_id_brand_translations[0]?.heading_title
              : 'N/A',
          shop_url: safeHttpUrl(updatedRow?.shop_url) || 'N/A',

          display_order: updatedRow?.display_order || 'N/A',
          banner:
            updatedRow?.banners?.length > 0
              ? updatedRow?.banners[0]?.promotion_name
              : 'N/A',
          logo: mediaUrl(updatedRow?.logo),
          product_picture: mediaUrl(updatedRow?.product_picture),
          background_logo: mediaUrl(updatedRow?.background_logo),
        };
      }

      if (fileName?.includes('banners')) {
        return {
          id: updatedRow?.id || 'N/A',
          promotion_name: updatedRow?.promotion_name || 'N/A',
          redirect_url: safeHttpUrl(updatedRow?.redirect_url) || 'N/A',
          brand: updatedRow?.brand?.name || 'Home Page',
          visibility: updatedRow?.disabled ? 'Disabled' : 'Active',
          image_en: mediaUrl(updatedRow?.image_en),
          image_ar: mediaUrl(updatedRow?.image_ar),
        };
      }

      if (fileName?.includes('scheduled_notifications')) {
        return {
          id: updatedRow?.id || 'N/A',
          title: updatedRow?.title || 'N/A',
          message: updatedRow?.message || 'N/A',
          type: updatedRow?.type || 'N/A',
          status: updatedRow?.status || 'N/A',
          schedule_at: updatedRow?.schedule_at
            ? formatDate(updatedRow?.schedule_at, 'dd-MMM-yyyy HH:mm')
            : 'N/A',
          processed_count: updatedRow?.processed_count || 0,
          failed_count: updatedRow?.failed_count || 0,
          created_at: updatedRow?.created_at
            ? formatDate(updatedRow?.created_at, 'dd-MMM-yyyy HH:mm')
            : 'N/A',
        };
      }

      if (fileName?.includes('notifications')) {
        return {
          id: updatedRow?.id || 'N/A',
          receiver: updatedRow?.user?.name || 'N/A',
          title: updatedRow?.title || 'N/A',
          message: updatedRow?.message || 'N/A',
          created_at: updatedRow?.created_at
            ? formatDate(updatedRow?.created_at, 'dd-MMM-yyyy HH:mm')
            : 'N/A',
          is_read: updatedRow?.is_read ? 'Yes' : 'No',
        };
      }

      return updatedRow;
    }).map((row) => {
      // Final pass for every export: drop secret-looking columns and neutralise formulas
      const safeRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (SECRET_COLUMN_PATTERN.test(key)) return;
        safeRow[key] = guardCell(value);
      });
      return safeRow;
    });

    // Convert JSON → worksheet
    const worksheet = XLSX.utils.json_to_sheet(updatedData);

    // --- ADDED: Bold Headers ---
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'; // Row 1 is the header
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };
    }

    // --- ADDED: Control Column Widths ---
    if (updatedData.length > 0) {
      const colWidths = Object.keys(updatedData[0]!).map((key) => {
        // Calculate the maximum length in each column
        const maxColumnLength = updatedData.reduce((max, row) => {
          const cellValue = row[key] ? String(row[key]) : '';
          return Math.max(max, cellValue.length);
        }, key.length); // Start with header length
        return { wch: maxColumnLength + 2 }; // Add a little padding
      });
      worksheet['!cols'] = colWidths;
    }

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write workbook as binary
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create Blob
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    // Trigger download
    saveAs(blob, fileName);
    setIsExportingData(false);
  }
  return (
    <div>
      <Button
        onClick={exportToExcelHandler}
        disabled={isExporting || isFetchingData}
        className="flex items-center gap-x-2"
      >
        <Download size={16} />
        {isExporting
          ? 'Exporting...'
          : isFetchingData
          ? 'Loading...'
          : 'Export to Excel'}
      </Button>
    </div>
  );
};

export default ExportToExcel