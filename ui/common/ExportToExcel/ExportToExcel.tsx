import React, { useState } from 'react'
import * as XLSX from 'xlsx';
import saveAs  from 'file-saver';
import { Button } from '../button';
import { UserRank } from 'core/types/user.types';
import { formatDate } from 'date-fns';
import { Download } from 'lucide-react';


interface ExportToExcelProps {
    data: any[];
  fileName?: string;
  excludedCols?:string[]
}
const ExportToExcel = ({ data, fileName,excludedCols }: ExportToExcelProps) => {

  const [isLoading, setIsLoading] = useState(false)

   function exportToExcelHandler() {
    setIsLoading(true)
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
       if (fileName?.includes("users")) {
     
         return {...updatedRow, rank: UserRank[updatedRow.rank] || "N/A", birthdate: updatedRow?.birthdate ? formatDate(updatedRow?.birthdate, 'dd-MMM-yyyy') : "N/A", created_at: updatedRow?.created_at ? formatDate(updatedRow?.created_at, 'dd-MMM-yyyy') : "N/A"};
        }
        return updatedRow
     });
     
    // Convert JSON → worksheet
    const worksheet = XLSX.utils.json_to_sheet(updatedData);

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
    setIsLoading(false)
  }
  return (
    <div>
      <Button onClick={exportToExcelHandler} disabled={isLoading} className='flex items-center gap-x-2'>
        <Download size={16}/>
        {isLoading ? 'Exporting...' : 'Export to Excel'}
      </Button>
    </div>
  );
}

export default ExportToExcel