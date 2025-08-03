"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 mt-4 appearance-none border-2 border-gray-800 rounded bg-white 
        checked:before:content-['✔'] checked:before:text-gray-800 
        checked:before:font-bold checked:before:block checked:before:text-center checked:before:leading-5"
    />
  );
}
