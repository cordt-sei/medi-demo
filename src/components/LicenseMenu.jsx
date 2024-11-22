import React from "react";
import PropTypes from "prop-types";

const licenses = [
  { type: "CC-BY-4.0", url: "https://example.com/licenses/cc-by-4.0" },
  { type: "MIT", url: "https://example.com/licenses/mit" },
];

const LicenseMenu = ({ onSelect }) => {
  const handleChange = (e) => {
    const selectedLicense = licenses.find(
      (license) => license.type === e.target.value
    );
    onSelect(selectedLicense);
  };

  return (
    <div>
      <label htmlFor="license">Select License:</label>
      <select id="license" onChange={handleChange}>
        <option value="">Select a License</option>
        {licenses.map((license) => (
          <option key={license.type} value={license.type}>
            {license.type}
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
