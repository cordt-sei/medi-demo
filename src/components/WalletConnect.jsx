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

const WalletConnect = ({ children, setWalletAddress }) => {
  const [publicClient, setPublicClient] = useState(null);
  const [walletAddress, setInternalWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        setInternalWalletAddress(accounts[0]);
        console.log("Wallet connected:", accounts[0]);
        initializeClient();
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("No wallet found. Please install MetaMask or Leap Wallet.");
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
    if (walletAddress && !publicClient) {
      initializeClient();
    }
  }, [walletAddress, publicClient]);

  return (
    <div className="wallet-container">
      {!walletAddress ? (
        <button className="connect-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <p>Connected Wallet: {walletAddress}</p>
          <p>Connected to: {SEI_CHAIN.name}</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default WalletConnect;
