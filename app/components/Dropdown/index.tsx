"use client"

import  { FC, useState } from "react";
import { DropDownProps } from "./types";
import Loader from "../Loader";


const Dropdown:FC<DropDownProps> = ({
  objectOptions,
  options,
  keySelector,
  className,
  value,
  isError,
  errorCondition,
  onChange,
  disabled,
  isFetching = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectItem = (item: any) => {
    onChange && onChange(item);
    setIsOpen(false);
  };

  return (
    <div className={`relative`}>
      <div
        onClick={(e) => {
          e.stopPropagation()
          !disabled && setIsOpen(!isOpen)}}
        className={`flex  p-2 px-4 text-base border border-[#60666B] rounded-[10px] w-full justify-between items-center text-[#60666B] capitalize ${isError && errorCondition ? 'border-2 border-red-500': '' } ${disabled ? "cursor-not-allowed": ""} ${className}`}
      >
        {value || "Select"}
        <span className="">
          {isOpen ? (
            <svg
              className="w-6 h-6 scale-[0.4] xl:scale-[0.5] text-[#60666B]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"
              />
            </svg>
          ) : (
            isFetching ? <Loader /> : 
              <svg
              className="w-6 h-6 scale-[0.4] xl:scale-[0.5] text-[#60666B]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
              />
            </svg>
          )}
        </span>
      </div>
      {isOpen && (
        <div className="absolute top-full bg-white mt-1 rounded-md shadow-[0px_2px_3px_2px_rgba(16,24,40,0.1)] w-full z-50 max-h-[200px] overflow-scroll">
          {objectOptions && keySelector
            ? objectOptions?.map((optionObj: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleSelectItem(optionObj)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 capitalize"
                >
                  {Array.isArray(keySelector)
                    ? getDisplayValue(optionObj, keySelector)
                    : getNestedValue(optionObj, keySelector)}
                </div>
              ))
            : options?.map((option: any) => (
                <div
                  key={option}
                  onClick={() => handleSelectItem(option)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 capitalize"
                >
                  {option}
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

const getNestedValue = (obj: any, path: string) => {
  if (!path.includes('.')) {
    return obj[path];
  }
  return path.split('.').reduce((value, key) => (value && value[key] !== undefined) ? value[key] : null, obj);
};

const getDisplayValue = (item: any, keys: string[]) => {
  if (keys.length === 1) {
    return item[keys[0]];
  }
  return keys.map(key => item[key]).join(' '); 
};

export default Dropdown;
