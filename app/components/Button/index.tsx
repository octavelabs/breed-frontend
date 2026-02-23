import React, {ForwardedRef, forwardRef } from "react";
import Loader from "../Loader";


type Props = {
    children: React.ReactNode;
    buttonType?: "primary" | "bordered" | "custom";
    customClass?: string;
    loading?: boolean;
    onClick?: (e?: any) => void;
    disabled?: boolean;
    ref?: ForwardedRef<HTMLButtonElement>;
    title?: string;
    type?: 'reset' | 'submit' | 'button'
};

const Button: React.ForwardRefRenderFunction<HTMLButtonElement, Props> = (
  {
    buttonType = "primary",
    customClass,
    children,
    loading,
    onClick,
    disabled,
    title,
    type
  },
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  let buttonStyleClass = "";
  if (buttonType === "primary") {
    buttonStyleClass = "bg-gradient-to-b from-[#A967F1] to-[#5B26B1]";
  } else if (buttonType === "bordered") {
    buttonStyleClass = "border border-purple-700 bg-transparent";
  }

  const customClasses = customClass ? customClass : "";

  const loaderClass =
    buttonType === "primary" ? "button-loader black" : "button-loader yellow";

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
      {loading ? <Loader  /> : children}
    </button>
  );
};


export default forwardRef(Button);
