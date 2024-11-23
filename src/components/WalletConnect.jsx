import React, { useState } from "react";
import PropTypes from "prop-types";
import { createWalletClient, createPublicClient, http } from "viem";

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

const WalletConnect = ({ setWalletAddress, setPublicClient, setWalletClient, children }) => {
  const [connectedWallet, setConnectedWallet] = useState(null); // Internal state for wallet connection

  // Function to connect the wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts[0]) {
          const walletAddress = accounts[0];
          setWalletAddress(walletAddress);
          setConnectedWallet(walletAddress);

          // Create blockchain clients
          const publicClient = createPublicClient({
            chain: SEI_CHAIN,
            transport: http(SEI_CHAIN.rpcUrls[0]),
          });

          const walletClient = createWalletClient({
            chain: SEI_CHAIN,
            transport: window.ethereum,
          });

          // Set the clients in the parent component's state
          setPublicClient(publicClient);
          setWalletClient(walletClient);

          console.log("Wallet connected:", walletAddress);
          console.log("Public client initialized:", publicClient);
          console.log("Wallet client initialized:", walletClient);
        } else {
          console.error("No accounts found.");
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("No wallet found. Please install MetaMask or Leap Wallet.");
    }
  };

  return (
    <div className="wallet-container">
      {connectedWallet ? (
        <div>
          <p>Connected Wallet: {connectedWallet}</p>
          {children}
        </div>
      ) : (
        <button className="connect-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

WalletConnect.propTypes = {
  setWalletAddress: PropTypes.func.isRequired,
  setPublicClient: PropTypes.func.isRequired,
  setWalletClient: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default WalletConnect;
