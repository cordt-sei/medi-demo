// App.jsx

import React, { useState, useEffect } from "react";
import LicenseMenu from "./components/LicenseMenu";
import WalletConnect from "./components/WalletConnect";
import { MakeTx } from "./components/MakeTx";
import { FaSun, FaMoon } from "react-icons/fa";
import { ErrorBoundary } from "./utils/error";
import "./App.css";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [publicClient, setPublicClient] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState("");
  const [metadataCID, setMetadataCID] = useState("");
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  // Debugging Logs
  useEffect(() => {
    console.log("App state updated:");
    console.log("walletAddress:", walletAddress);
    console.log("publicClient:", publicClient);
    console.log("walletClient:", walletClient);
    console.log("selectedLicense:", selectedLicense);
    console.log("metadataCID:", metadataCID);
  }, [walletAddress, publicClient, walletClient, selectedLicense, metadataCID]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleLicenseSelect = (license) => {
    setSelectedLicense(license);
    console.log("Selected License:", license);
  };

  const isTransactionReady = Boolean(
    walletAddress && publicClient && selectedLicense && metadataCID && walletClient
  );

  return (
    <div className="app">
      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
      </div>

      <h1>IPFS License Demo</h1>
      <div className="container">
        <ErrorBoundary>
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
                  />

                ) : (
                  <button disabled className="disabled-btn">
                    Submit
                  </button>
                )}
              </div>
            </>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;
