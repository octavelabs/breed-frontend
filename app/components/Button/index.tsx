import React, { ForwardedRef, forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  buttonType?: "primary" | "bordered" | "custom";
  customClass?: string;
  loading?: boolean;
  onClick?: (e?: any) => void;
  disabled?: boolean;
  ref?: ForwardedRef<HTMLButtonElement>;
  title?: string;
  type?: "reset" | "submit" | "button";
};

const Button: React.ForwardRefRenderFunction<HTMLButtonElement, Props> = (
  { buttonType = "primary", customClass, children, loading, onClick, disabled, title, type },
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  let buttonStyleClass = "";
  if (buttonType === "primary") {
    buttonStyleClass = "bg-gradient-to-b from-[#A967F1] to-[#5B26B1]";
  } else if (buttonType === "bordered") {
    buttonStyleClass = "border border-purple-700 bg-transparent";
  }

  const customClasses = customClass ?? "";

  return (
    <button
      title={title}
      ref={ref}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${buttonStyleClass} ${
        loading && !disabled
          ? "!cursor-not-allowed opacity-[0.5]"
          : !loading && disabled
            ? "!cursor-not-allowed !bg-[rgba(217,217,217,0.48)]"
            : ""
      } flex gap-1 relative justify-center cursor-pointer items-center rounded-full text-base h-10 w-auto  text-sm font-semibold  ${customClasses}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin flex-shrink-0" />
          {children}
        </span>
      ) : children}
    </button>
  );
};


export default forwardRef(Button);
