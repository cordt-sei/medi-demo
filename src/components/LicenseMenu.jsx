import PropTypes from 'prop-types';

const licenses = [
  { type: "CC-BY-4.0", url: "https://example.com/licenses/cc-by-4.0", content: "Full license text here" },
  { type: "MIT", url: "https://example.com/licenses/mit", content: "MIT license text here" },
];

const LicenseMenu = ({ onSelect }) => {
  const handleChange = (e) => {
    const selectedLicense = licenses.find((license) => license.type === e.target.value);
    onSelect(selectedLicense);
  };

  LicenseMenu.propTypes = {
    onSelect: PropTypes.func.isRequired,
  };

  return (
    <div>
      <label htmlFor="license">Select License:</label>
      <select id="license" onChange={handleChange}>
        <option value="">Select</option>
        {licenses.map((license) => (
          <option key={license.type} value={license.type}>
            {license.type}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LicenseMenu;
