// App.jsx

import React, { useState, useEffect } from "react";
import LicenseMenu from "./components/LicenseMenu";
import WalletConnect from "./components/WalletConnect";
import { MakeTx } from "./components/MakeTx";
import { FaSun, FaMoon } from "react-icons/fa";
import { ErrorBoundary } from "./utils/error";
import "./App.css";

// Utility function to fetch license text
const fetchLicenseText = async (licensePath) => {
  try {
    // Check if the licensePath is local
    if (licensePath.startsWith("/src/assets")) {
      const response = await fetch(licensePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch local license text from ${licensePath}`);
      }
      return await response.text();
    } else {
      // Fallback to remote URL
      const response = await fetch(licensePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote license text from ${licensePath}`);
      }
      return await response.text();
    }
  } catch (error) {
    console.error("Error fetching license text:", error);
    return null;
  }
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [publicClient, setPublicClient] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState("");
  const [metadataCID, setMetadataCID] = useState("");
  const [licenseRepo, setLicenseRepo] = useState("");
  const [licenseText, setLicenseText] = useState("");
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  // Fetch license text when licenseRepo changes
  useEffect(() => {
    if (licenseRepo) {
      fetchLicenseText(licenseRepo).then(setLicenseText);
    }
  }, [licenseRepo]);

  // Manage theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    const handleThemeChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLicenseSelect = (license) => {
    setSelectedLicense(license);
  
    // Use the local file path as the primary license source
    setLicenseRepo("/src/assets/license.js");
  
    console.log("Selected License:", license);
  };
  
  useEffect(() => {
    if (licenseRepo) {
      fetchLicenseText(licenseRepo).then(setLicenseText);
    }
  }, [licenseRepo]);

  const isTransactionReady = Boolean(
    walletAddress &&
      publicClient &&
      selectedLicense &&
      metadataCID &&
      walletClient &&
      licenseText
  );

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
        </div>

        <h1>IPFS License Demo</h1>
        <div className="container">
          <WalletConnect
            setWalletAddress={(address) => {
              setWalletAddress(address);
              console.log("Wallet connected:", address);
            }}
            setPublicClient={(client) => {
              setPublicClient(client);
              console.log("Public client initialized:", client);
            }}
            setWalletClient={(client) => {
              setWalletClient(client);
              console.log("Wallet client initialized:", client);
            }}
          />

          {walletAddress && (
            <>
              <div className="license-menu">
                <LicenseMenu
                  onSelect={handleLicenseSelect}
                  defaultOption="Select a license"
                />
              </div>

              <div className="metadata-container">
                <label htmlFor="metadataCID">Enter Metadata CID:</label>
                <input
                  id="metadataCID"
                  type="text"
                  placeholder="Enter Metadata CID"
                  value={metadataCID}
                  onChange={(e) => setMetadataCID(e.target.value)}
                />
              </div>

              <div className="transaction-container">
                {isTransactionReady ? (
                  <MakeTx
                    metadataCID={metadataCID}
                    walletAddress={walletAddress}
                    walletClient={walletClient}
                    publicClient={publicClient}
                    selectedLicense={selectedLicense}
                    licenseRepo={licenseRepo}
                  />
                ) : (
                  <button disabled className="disabled-btn">
                    Submit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
