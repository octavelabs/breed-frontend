export interface DropDownProps {
  objectOptions?: any;
  options?: any;
  keySelector?: string[] | string;
  className?: string;
  value: string | number | null;
  onChange?: (item: any) => void;
  isFetching?: boolean;
  errorCondition?: any;
  isError?: boolean;
  disabled?: boolean;
}