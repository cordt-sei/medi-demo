// client.js

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";

const SEI_CHAIN = {
  id: 1328,
  name: "Sei Atlantic-2 Testnet",
  rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
};

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [publicClient, setPublicClient] = useState(() =>
    createPublicClient({
      chain: SEI_CHAIN,
      transport: http(SEI_CHAIN.rpcUrls[0]),
    })
  );

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request wallet connection and fetch accounts
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]); // Set the connected account
        } else {
          console.error("No accounts found.");
        }
      } else {
        console.error("No wallet found. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null); // Reset account if none are available
        }
      });

      // Listen for wallet disconnection
      window.ethereum.on("disconnect", () => {
        console.error("MetaMask disconnected.");
        setAccount(null);
      });

      // Attempt to connect on page load
      connectWallet();

      // Cleanup listeners on component unmount
      return () => {
        window.ethereum.removeListener("accountsChanged", connectWallet);
        window.ethereum.removeListener("disconnect", () => setAccount(null));
      };
    }
  }, []);

  return { account, publicClient, connectWallet };
};
