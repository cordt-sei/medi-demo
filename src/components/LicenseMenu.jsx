// LicenseMenu.jsx

import React from "react";
import PropTypes from "prop-types";

const licenses = [
  { type: "CC-BY-4.0", url: "https://example.com/licenses/cc-by-4.0" },
  { type: "MIT", url: "https://example.com/licenses/mit" }, // Placeholder for other licenses
];

const LicenseMenu = ({ onSelect, selectedLicense }) => {
  const handleChange = (e) => {
    const selectedLicense = licenses.find(
      (license) => license.type === e.target.value
    );
    onSelect(selectedLicense);
  };

  return (
    <div>
      <label htmlFor="license-select">Select License:</label>
      <select
        id="license-select"
        onChange={handleChange}
        value={selectedLicense?.type || "CC-BY-4.0"}
      >
        <option value="CC-BY-4.0">CC-BY-4.0</option>
        <option value="MIT" disabled>
          MIT (Disabled)
        </option>
        <option value="Other-1" disabled>
          Other-1 (Disabled)
        </option>
        <option value="Other-2" disabled>
          Other-2 (Disabled)
        </option>
      </select>
    </div>
  );
};

LicenseMenu.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedLicense: PropTypes.object, // Allow passing the currently selected license
};

export default LicenseMenu;
