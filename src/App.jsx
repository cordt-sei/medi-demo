// App.jsx

import React, { useState, useEffect } from "react";
import LicenseMenu from "./components/LicenseMenu";
import WalletConnect from "./components/WalletConnect";
import { MakeTx } from "./components/MakeTx";
import { FaSun, FaMoon } from "react-icons/fa";
import "./App.css";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [metadataCID, setMetadataCID] = useState("");
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const handleLicenseSelect = (license) => {
    setSelectedLicense(license);
    console.log("Selected License:", license);
  };

  return (
    <div className="app">
      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
      </div>
      <h1>IPFS License Demo</h1>
      <div className="container">
        <WalletConnect setWalletAddress={setWalletAddress}>
          <div className="license-menu">
            <LicenseMenu onSelect={handleLicenseSelect} />
          </div>
          <div className="metadata-container">
            <label htmlFor="metadataCID">Metadata CID:</label>
            <input
              id="metadataCID"
              type="text"
              placeholder="Enter Metadata CID"
              value={metadataCID}
              onChange={(e) => setMetadataCID(e.target.value)}
            />
          </div>
          {selectedLicense && metadataCID && walletAddress && (
            <div className="transaction-container">
              <MakeTx metadataCID={metadataCID} walletAddress={walletAddress} />
            </div>
          )}
        </WalletConnect>
      </div>
    </div>
  );
};

export default App;
