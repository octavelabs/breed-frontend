import { ChangeEvent, FC, useState } from "react";
import Loader from "../Loader";
import {Search, X} from "lucide-react";
import Input from "../Input";


type DropdownWithMultipleSelectProps = {
  objectOptions?: any;
  options?: any;
  keySelector?: string[] | string;
  className?: string;
  value: any[];
  onChange?: (item: any) => void;
  isFetching?: boolean;
  errorCondition?: any;
  isError?: boolean;
  disabled?: boolean;
  searchValue: string;
  placeholder: string;
  setSearchValue: (val: string) => void;
  handleRemove: (item: any) => void;
  // Configuration for dynamic field access
  displayFields: string[]; // Fields to display as name (e.g., ["user.firstName", "user.lastName"])

  additionalInfoField?: string; // Additional info to display (e.g., "role")
  getItemKey?: (item: any, index: number) => string; // Function to generate unique keys
};

const DropdownWithMultipleSelect: FC<DropdownWithMultipleSelectProps> = ({
  keySelector,
  className,
  value,
  searchValue,
  onChange,
  disabled,
  objectOptions,
  setSearchValue,
  isFetching,
  placeholder,
  handleRemove,
  displayFields,
  additionalInfoField,
  getItemKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectItem = (item: any) => {
    onChange && onChange(item);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full`}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          !disabled && setIsOpen(!isOpen);
        }}
        className={`flex bg-white border border-[#B9C2CA] p-2 px-4 text-sm rounded-full w-full justify-between items-center text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] capitalize ${
          disabled ? "cursor-not-allowed" : ""
        } ${className}`}
      >
        {
         value.length > 0 ?
        <div className='flex gap-2 flex-wrap'>
          {      value
              .filter((v) => v && displayFields.some(field => getNestedValue(v, field)))
              .map((v, idx) => {
                const displayName = displayFields
                  .map(field => getNestedValue(v, field))
                  .filter(Boolean)
                  .join(" ");
            
                const itemKey = getItemKey ? getItemKey(v, idx) : `${displayName}-${idx}`;
                
                return (
                  <span
                    key={itemKey}
                    className='flex items-center bg-white text-semibold text-sm text-gray-700 px-3 py-1 rounded-xl flex-nowrap border-[1.2px] border-black/30'
                  >
                   
                    <span className='whitespace-nowrap'>
                      {displayName}
                    </span>

                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove?.(v);
                      }}
                      className='ml-2 text-gray-500 hover:text-brand focus:outline-none text-bold'
                    >
                      <X strokeWidth={3} size={15} />
                    </button>
                  </span>
                );
              })}
        </div> : 
        'Select'
}
        <span className=''>
          {isOpen ? (
            <svg
              className='w-6 h-6 scale-[0.4] xl:scale-[0.5]'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 14 8'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7'
              />
            </svg>
          ) : isFetching ? (
            <Loader />
          ) : (
            <svg
              className='w-6 h-6 scale-[0.4] xl:scale-[0.5] text-gray-800'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 14 8'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1'
              />
            </svg>
          )}
        </span>
      </div>
      {isOpen && (
        <div className='flex flex-col space-y-2 absolute top-full bg-white mt-1 rounded-md shadow-[0px_2px_3px_2px_rgba(16,24,40,0.1)] w-full z-50 max-h-[200px] p-2'>
          <Input
            type='text'
            id='search'
            placeholder='Search by name'
            value={searchValue}
            className='relative pl-10 rounded-full  font-medium text-2xl md:text-[15px] border border-white/60 border-[1.5px]'
            icon={
              <Search className='absolute left-4 top-1/2 -translate-y-1/2  w-5 h-5 opacity-50' />
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
          />
            <div className='overflow-y-auto max-h-[250px] gap-[6px]'>
            {objectOptions?.map((optionObj: any, index: number) => {
              const displayName = displayFields
                .map(field => getNestedValue(optionObj, field))
                .filter(Boolean)
                .join(" ");
          
              const additionalInfo = additionalInfoField ? getNestedValue(optionObj, additionalInfoField) : null;

              return (
                <div
                  key={index}
                  onClick={() => handleSelectItem(optionObj)}
                  className='flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all duration-150 rounded-lg'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium text-[rgba(56,57,64,0.69)]'>
                      {displayName}
                    </span>
                  </div>
               
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const getNestedValue = (obj: any, path: string) => {
  if (!path.includes(".")) {
    return obj[path];
  }
  return path
    .split(".")
    .reduce(
      (value, key) => (value && value[key] !== undefined ? value[key] : null),
      obj
    );
};

const getDisplayValue = (obj: any, keys: string[]) => {
  return keys
    .map((key) =>
      !key.includes(".")
        ? obj[key]
        : key
          .split(".")
          .reduce(
            (value, key) =>
              value && value[key] !== undefined ? value[key] : null,
            obj
          )
    )
    .join(" ");
};

export default DropdownWithMultipleSelect;
