// LicenseMenu.jsx

import React from "react";
import PropTypes from "prop-types";

const licenses = [
  { type: "", label: "Select a license" }, // Placeholder option
  { type: "CC-BY-4.0", label: "CC-BY-4.0" },
];

const LicenseMenu = ({ onSelect }) => {
  return (
    <div>
      <label htmlFor="license-select">Select License:</label>
      <select
        id="license-select"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        {licenses.map((license) => (
          <option key={license.type} value={license.type} disabled={!license.type}>
            {license.label}
          </option>
        ))}
      </select>
    </div>
  );
};

LicenseMenu.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default LicenseMenu;
