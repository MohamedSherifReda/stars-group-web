import * as React from 'react';
import { cn } from '@utils/cn';
import { Upload } from 'lucide-react';

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  placeholder?: string;
  onChange?: (file: File | null) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      placeholder = 'No file chosen',
      onChange,
      accept,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [fileName, setFileName] = React.useState<string>('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(
      ref,
      () => inputRef.current as HTMLInputElement,
      []
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFileName(file ? file.name : '');
      onChange?.(file);
    };

    const handleContainerClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    return (
      <div className={cn('relative', className)}>
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
          {...props}
        />
        <div
          onClick={handleContainerClick}
          className={cn(
            'flex items-center gap-2 w-full h-9 px-3 rounded-md border border-input bg-background text-sm',
            'cursor-pointer transition-colors',
            'hover:border-primary focus-within:border-primary focus-within:ring-1 focus-within:ring-ring',
            disabled && 'opacity-50 cursor-not-allowed',
            'group'
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          <span
            className={cn(
              'flex-1 min-w-0 truncate',
              fileName
                ? 'text-foreground'
                : 'text-muted-foreground/70'
            )}
            title={fileName || placeholder}
          >
            {fileName || placeholder}
          </span>
        </div>
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput };

