import * as React from 'react';
import { cn } from '@utils/cn';
import { Badge } from '@ui/common/badge';
import { Button } from '@ui/common/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@ui/common/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@ui/common/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';

export type MultiSelectOption = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectInput({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleValue = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((item) => item !== v));
    } else {
      onChange([...value, v]);
    }
  };

  const removeValue = (v: string) => {
    onChange(value.filter((item) => item !== v));
  };

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              value?.length > 0 && 'h-auto py-2'
            )}
          >
            {value?.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {value?.map((val) => {
                  const item = options?.find((o) => o?.value === val);

                  if (!item || !item.label) {
                    return null;
                  }
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {item?.label ?? val}
                      {!disabled && (
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(val);
                          }}
                        />
                      )}
                    </Badge>
                  );
                })}
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandGroup>
                {options?.length > 0 ? (
                  options?.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => toggleValue(opt.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value.includes(opt.value)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem>No results found.</CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
