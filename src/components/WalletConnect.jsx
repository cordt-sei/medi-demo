// WalletConnect.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { createWalletClient, createPublicClient, http, custom } from "viem";
import { seiTestnet } from "./chains";

const WalletConnect = ({ setWalletAddress, setPublicClient, setWalletClient, children }) => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const switchToSeiChain = async () => {
    try {
      console.log("Attempting to switch to Sei chain...");
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${seiTestnet.id.toString(16)}` }],
      });
      console.log(`Switched to ${seiTestnet.name}`);
    } catch (error) {
      if (error.code === 4902) {
        console.warn("Chain not found. Attempting to add Sei chain...");
        try {
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
          console.log("Sei chain added successfully.");
          await switchToSeiChain(); // Retry switching after adding the chain
        } catch (addError) {
          console.error("Failed to add Sei chain:", addError);
          alert("Could not add Sei chain. Please check your wallet settings.");
        }
      } else {
        console.error("Failed to switch to Sei chain:", error);
        alert("Could not switch to Sei chain. Please try again.");
      }
    }
  };

  const getBalance = async (address, client) => {
    if (!client) {
      console.error("Public client is not initialized.");
      return;
    }

    try {
      const balance = await client.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const formattedBalance = Number(balance) / 1e18; // Convert Wei to Ether
      setWalletBalance(formattedBalance);
      console.log(`Wallet balance: ${formattedBalance} SEI`);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      alert("Failed to fetch wallet balance. Check your connection.");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert("MetaMask is not installed or not active.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts[0]) {
        const account = accounts[0];
        console.log("Wallet connected:", account);
        setWalletAddress(account);
        setConnectedWallet(account);

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
        await getBalance(account, publicClient);
      } else {
        console.error("No accounts found.");
        alert("No wallet accounts detected. Please check your wallet.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(`Wallet connection error: ${error.message}`);
    }
  };

  return (
    <div className="wallet-container">
      {connectedWallet ? (
        <div>
          <p>Connected Wallet: {connectedWallet}</p>
          <p>Balance: {walletBalance !== null ? `${walletBalance} SEI` : "Loading..."}</p>
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
