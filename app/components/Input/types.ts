import { ForwardedRef, ReactNode } from "react";

export interface InputProps {
  type: string;
  ref?: ForwardedRef<HTMLInputElement>;
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
  isError?: boolean;
  errorCondition?: any;
  className?: string;
  id: string;
  name?: string;
  placeholder?: string;
  value?: string;
  maxLength?: number;
  icon?: ReactNode;
  min?: string;
  variant?: "primary" | "outlined";
  isDisabled?: boolean;
}