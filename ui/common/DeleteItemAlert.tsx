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
import { Input } from './input';




interface DeleteItemAlertProps {
  itemName: string;
  /** Receives the typed password when `requirePassword` is set */
  onDelete: (password?: string) => void;
  /** Ask the admin to re-enter their own password (step-up) before deleting */
  requirePassword?: boolean;
  isDeleting?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerButton?: React.ReactNode;
}
const DeleteItemAlert = ({ itemName, onDelete, isDeleting,  isOpen, setIsOpen, triggerButton, requirePassword }: DeleteItemAlertProps) => {
  const [password, setPassword] = useState('');
  // Never keep the password around once the dialog closes
  useEffect(() => {
    if (!isOpen) setPassword('');
  }, [isOpen]);

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
            {requirePassword && (
              <div className="space-y-2">
                <label htmlFor="confirm-admin-password" className="text-sm font-medium">
                  Enter your password to confirm
                </label>
                <Input
                  id="confirm-admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              disabled={isDeleting || (requirePassword && !password)}
              onClick={() => {
                onDelete(requirePassword ? password : undefined);
                setPassword('');
              }}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 text-white" /> : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DeleteItemAlert