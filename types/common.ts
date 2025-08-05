// types/common.ts
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export interface ComboboxProps {
  value: string;
  options: (string | SelectOption)[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  allowCustom?: boolean;
  allowFiltering?: boolean;
}
