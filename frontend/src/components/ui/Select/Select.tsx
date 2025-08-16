import { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string; // Custom label
  options: { key: string; value: string | number }[]; // Array of options
  isRequired?: boolean; // Optional prop to indicate if the field is required
}

export const SelectOptions = ({
  label,
  options,
  isRequired,
  ...rest
}: SelectProps) => {
  return (
    <div>
      {/* Label */}
      <label htmlFor={rest.id} className="mb-1 block text-sm text-neutral-700">
        {label}
        {isRequired && (
          <span
            className="fa-regular fa-circle-question ml-1 text-red"
            title="required"
          >
            *
          </span>
        )}
      </label>
      {/* Select Dropdown */}
      <select
        {...rest}
        className="w-full rounded-md border border-neutral-300 px-4 py-2"
      >
        {/* Default option */}
        <option value="">Select {label.toLowerCase()}</option>

        {/* Mapping options dynamically */}
        {options.map((option) => (
          <option key={option.key} value={option.value}>
            {option.key}
          </option>
        ))}
      </select>
    </div>
  );
};
