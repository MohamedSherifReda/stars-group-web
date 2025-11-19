import { Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,

} from '../../app/components/ui/alert-dialog';
import { Button } from './button';




interface DeleteItemAlertProps {
  itemName: string;
  onDelete: () => void;
  isDeleting?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerButton?: React.ReactNode;
}
const DeleteItemAlert = ({ itemName, onDelete, isDeleting,  isOpen, setIsOpen, triggerButton }: DeleteItemAlertProps) => {
  
  
  return (
    <>
      {triggerButton}
      <AlertDialog open={isOpen} onOpenChange={(openValue) => setIsOpen(openValue)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center  gap-2">
              <Trash2 className="w-5 h-5 text-red-500" /> Delete {itemName} !
            </AlertDialogTitle>
            <p className="text-base">
              Are you sure you want to delete {itemName}?
            </p>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button disabled={isDeleting} onClick={onDelete}>
              {isDeleting ? <Loader2 className="w-4 h-4 text-white" /> : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DeleteItemAlert