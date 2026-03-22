import type { ChangeEventHandler } from "react";

type TextAreaProps = {
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
};

const TextArea = ({ placeholder, value, onChange, rows = 3 }: TextAreaProps) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-4 py-2.5 border border-[#B9C2CA] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 f text-sm resize-none"
    />
  );
};

export default TextArea;
