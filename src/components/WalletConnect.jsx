// WalletCOnnect.jsx

import React, { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";

const SEI_CHAIN = {
  id: 1328,
  name: "Sei Atlantic-2 Testnet",
  rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
  nativeCurrency: {
    name: "Sei",
    symbol: "SEI",
    decimals: 18,
  },
};

const WalletConnect = ({ setWalletAddress, setPublicClient, children }) => {
  const [internalWalletAddress, setInternalWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setInternalWalletAddress(accounts[0]);
        initializeClient();
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("No wallet found. Please install MetaMask.");
    }
  };

  const initializeClient = () => {
    try {
      const client = createPublicClient({
        chain: SEI_CHAIN,
        transport: http(SEI_CHAIN.rpcUrls[0]),
      });
      setPublicClient(client);
      console.log("Blockchain client initialized:", client);
    } catch (error) {
      console.error("Error initializing client:", error);
    }
  };

  useEffect(() => {
    if (internalWalletAddress) {
      initializeClient();
    }
  }, [internalWalletAddress]);

  return (
    <div className="wallet-container">
      {!internalWalletAddress ? (
        <button className="connect-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected Wallet: {internalWalletAddress}</p>
          {children}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
