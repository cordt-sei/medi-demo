// LicenseMenu.jsx

import React from "react";
import PropTypes from "prop-types";

const licenseOptions = [
  { label: "Select a license", value: "", disabled: true },
  { label: "CC-BY-4.0", value: "CC-BY-4.0", disabled: false },
  { label: "CC-BY-SA-4.0", value: "CC-BY-SA-4.0", disabled: true },
  { label: "CC-BY-NC-4.0", value: "CC-BY-NC-4.0", disabled: true },
];

const LicenseMenu = ({ onSelect, defaultOption = "Select a license" }) => {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    if (onSelect) {
      onSelect(selectedValue);
    }
  };

  return (
    <div>
      <label htmlFor="license-select">Select License:</label>
      <select id="license-select" onChange={handleChange} defaultValue="">
        {licenseOptions.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

LicenseMenu.propTypes = {
  onSelect: PropTypes.func.isRequired,
  defaultOption: PropTypes.string,
};

export default LicenseMenu;
