"use client"

import React, { forwardRef } from "react";
import { InputProps } from "./types";

const Input: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    type,
    onChange,
    onBlur,
    isError,
    errorCondition,
    className,
    placeholder,
    id,
    name,
    value,
    maxLength,
    icon,
    min,
    variant = "primary",
    isDisabled
  },
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const timeLikeInputs = ["time", "date", "datetime-local"];

  return (
    <div className={`relative w-full`}>
      {icon && icon}
      <input
        type={type}
        min={min}  
        required
        className={`input block w-full text-[#60666B] rounded-[10px] outline-none h-[48px] box-border
  ${
    icon 
      ? "px-3 py-1 sm:p-4 pl-12 sm:pl-12"
      : "px-3 py-1 sm:p-4" 
  } 

  ${variant === "primary" && "bg-[#d9d9d93d] text-gray-900"}
  ${variant === "outlined" && "border border-[#60666B]"}
  ${className} 
  ${
    isError && errorCondition
      ? "border-2 border-red-500 focus:border-red-500"
      : ""
  } `}
        placeholder={placeholder}
        id={id}
        name={name}
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e);
          if (timeLikeInputs.includes(type)) {
            e.target.blur();
          }
        }}
        onBlur={onBlur}
        maxLength={maxLength}
        disabled={isDisabled}
      />
    </div>
  );
};

export default forwardRef(Input);