"use client";

import { FC, useState } from "react";
import TableLoader from "./TableLoader";
import { CustomTableProps } from "./types";
import EmptyStateIcon from "./EmptyState";

const getNestedValue = (obj: any, path: string) => {
  if (!path.includes('.')) {
    return obj[path];
  }
  return path.split('.').reduce((value, key) => (value && value[key] !== undefined) ? value[key] : null, obj);
};

const CustomTable: FC<CustomTableProps> = ({
  columns,
  data,
  tableStyles,
  headerStyles,
  checkboxes,
  rowStyles,
  rowClick,
  isFetching
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleHeaderCheckboxChange = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_: any, index: number) => index));
    }
  };
  const handleRowCheckboxChange = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  function handleColumnWidths() {
    // Desktop column widths
    if (window.innerWidth >= 1024) {
      let result = checkboxes ? "50px" : "";
      columns.forEach((column) => {
        if (column.bigWidth) {
          result = result + ` ${column.bigWidth}`;
        } else {
          result = result + " 1fr";
        }
      });
      return result;
    }
    // Mobile column widths
    else {
      let result = checkboxes ? "50px" : "";
      columns.forEach((column) => {
        if (column.isMobileVisible && column.mobileWidth) {
          result = result + ` ${column.mobileWidth}`;
        } else if (column.isMobileVisible && !column.mobileWidth) {
          result = result + " 1fr";
        }
      });
      return result;
    }
  }

  return (
    <>
      {data && data.length > 0 ? (
        <section className={`relative bg-white w-full ${tableStyles}`}>
          {/* table head */}
          <div
            className={`h-[44px] border-t border-b border-[#E3E8EF] grid gap-x-1 lg:gap-x-3 items-center sticky top-0 z-10 bg-[#F8FAFC] font-semibold ${
              !checkboxes ? "pl-7" : ""
            } ${headerStyles}`}
            style={{ gridTemplateColumns: handleColumnWidths() }}
          >
            {checkboxes && (
              <span className="text-xs md:text-sm justify-self-center">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleHeaderCheckboxChange}
                ></input>
              </span>
            )}
            {columns.map((column: any, index: number) => (
              <span
                key={index}
                className={`text-xs text-[#60666B] truncate capitalize ${
                  column.colStyles
                } ${column.isMobileVisible ? "block" : "hidden lg:block"}`}
              >
                {column.title}
              </span>
            ))}
          </div>
          {/* table body */}
          {data.map((row: any, rowIndex: number) => (
            <div
              key={rowIndex}
              className={`h-[72px] grid gap-x-1 lg:gap-x-3 border-b border-[#E3E8EF] items-center pr-5 sm:pr-0 ${
                !checkboxes ? "pl-7" : ""
              } ${rowClick ? "hover:underline" : ""} ${rowStyles}`}
              style={{ gridTemplateColumns: handleColumnWidths() }}
            >
              {checkboxes && (
                <span className="text-xs md:text-sm justify-self-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => handleRowCheckboxChange(rowIndex)}
                  ></input>
                </span>
              )}
              {columns.map((col, itemIndex) => {
                return (
                  <span
                    key={itemIndex}
                    className={`text-xs md:text-sm truncate ${
                      rowClick ? "cursor-pointer" : ""
                    } ${col.colStyles} ${
                      col.isMobileVisible ? "block" : "hidden lg:block"
                    }`}
                    onClick={
                      rowClick
                        ? () => {
                            rowClick(row);
                          }
                        : () => {}
                    }
                  >
                    {
                      isFetching ? <TableLoader /> :
                      col.render
                        ? col.render(rowIndex, row[col.dataIndex!], row)
                        : getNestedValue(row, col.dataIndex! )
                    }
                   
                  </span>
                );
              })}
            </div>
          ))}
        </section>
      ) : (
        <section className={`relative w-full h-[220px] md:h-[300px] ${tableStyles}`}>
          <div
          className={`absolute -top-7 md:top-0 bottom-0 flex flex-col justify-center items-center w-full pb-2 lg:pb-5 ${tableStyles}`}
          >
            <EmptyStateIcon />
            <div className="max-w-[90%] font-bold text-sm md:text-base lg:text-lg md:translate-y-2 text-[#bababa] flex justify-center items-center gap-x-4">
              <hr className="w-5 lg:w-7 border border-[#e3e3e3]" />
              <div className="truncate">No data found</div>
              <hr className="w-5 lg:w-7 border border-[#e3e3e3]" />
            </div>
          </div>
        </section>
      )}
    </>
  );
};
export default CustomTable;
