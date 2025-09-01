import React from "react";

const FilterSelect = ({ label, value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-2 rounded bg-[var(--secondary-color)] border border-[var(--border-color)] text-sm"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default FilterSelect;