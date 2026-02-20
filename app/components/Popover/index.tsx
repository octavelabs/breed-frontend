import React, { RefObject, useEffect, useRef } from 'react';


interface CustomPopoverProp {
  parentRef: RefObject<HTMLDivElement | null>
  buttonRef: RefObject<HTMLButtonElement | null>;
  content: {item: string, icon?: React.ReactNode, onClick: () => void}[];
  handleClose: () => void;
  hasIcon?: boolean;
  topOffset?: number;
  leftOffset?: number;
}

const CustomPopover: React.FC<CustomPopoverProp> = ({ buttonRef, content, handleClose, hasIcon, parentRef, topOffset = 8, leftOffset = 8 }) => {
  const rect = buttonRef?.current?.getBoundingClientRect();
  const parentRect = parentRef?.current?.getBoundingClientRect();
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const path = e.composedPath();
          if (
          parentRef.current &&
          !path.includes(buttonRef.current as Node) &&
          !path.some((el) => (el as HTMLElement).classList?.contains('popover'))
        ) {
          handleClose();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      }
  }, [buttonRef,parentRef, handleClose])


  return (
    <div
    ref={popoverRef}
      className="popover absolute flex flex-col w-auto h-auto z-20 bg-white font-bold
      shadow-[0px_0px_3.2px_1.5px_rgba(100,132,230,0.20)] rounded-[6px] text-xs md:text-sm "
      style={{
        top: `${rect!.bottom - parentRect!.top + topOffset}px`,
        left: `${rect!.left - parentRect!.left - leftOffset}px`
      }}
    >
      {content.map((el: any, idx: number) => (
        <React.Fragment key={idx}>
          <div className="flex  px-4 py-2 gap-x-3 items-center cursor-pointer " onClick={() => {
            el.onClick()
            handleClose()
            }}>
            {hasIcon && el.icon}
            <p className="text-xs md:text-sm font-medium whitespace-nowrap">{el.item}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default CustomPopover;

