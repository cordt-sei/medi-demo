// WalletConnect.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { createWalletClient, createPublicClient, http, custom } from "viem";
import { seiTestnet } from "./chains"; // Import your defined chain

const WalletConnect = ({ setWalletAddress, setPublicClient, setWalletClient, children }) => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null); // New state for balance

  // Function to handle switching to Sei Chain
  const switchToSeiChain = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${seiTestnet.id.toString(16)}` }],
      });
      console.log(`Switched to ${seiTestnet.name}`);
    } catch (error) {
      console.error("Error switching chain:", error);
      if (error.code === 4902) {
        try {
          console.log("Attempting to add the chain...");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${seiTestnet.id.toString(16)}`,
                chainName: seiTestnet.name,
                rpcUrls: seiTestnet.rpcUrls.default.http,
                nativeCurrency: seiTestnet.nativeCurrency,
              },
            ],
          });
          await switchToSeiChain();
        } catch (addError) {
          console.error("Error adding chain:", addError);
          alert("Failed to add the Sei chain. Please try again.");
        }
      } else {
        alert("Failed to switch to Sei chain. Please try again.");
      }
    }
  };

  // Function to fetch wallet balance
  const getBalance = async (address, client) => {
    try {
      const balance = await client.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      setWalletBalance(parseFloat(balance) / 1e18); // Convert Wei to Ether
      console.log(`Wallet balance: ${walletBalance} SEI`);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  // Function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          setConnectedWallet(accounts[0]);

          const publicClient = createPublicClient({
            chain: seiTestnet,
            transport: http(seiTestnet.rpcUrls.default.http[0]),
          });

          const walletClient = createWalletClient({
            chain: seiTestnet,
            transport: custom(window.ethereum),
          });

          setPublicClient(publicClient);
          setWalletClient(walletClient);

          await switchToSeiChain();
          await getBalance(accounts[0], walletClient); // Fetch balance after connection

          console.log("Wallet connected:", accounts[0]);
        } else {
          console.error("No accounts found.");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        if (error.message.includes("Premature close")) {
          alert("Wallet connection lost. Please reconnect.");
        }
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
          <p>Balance: {walletBalance ? `${walletBalance} SEI` : "Loading..."}</p>
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
