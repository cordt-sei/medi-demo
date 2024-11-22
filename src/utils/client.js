import { useState } from 'react';
import { createPublicClient, http } from 'viem';
import { ErrorBoundary } from './error';

const SEI_CHAIN = {
  id: 1328,
  name: "Sei Atlantic-2 Testnet",
  rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
};


export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [publicClient] = useState(() =>
    createPublicClient({
      chain: SEI_CHAIN,
      transport: http(SEI_CHAIN.rpcUrls[0]),
    })
  );

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      console.error('No wallet found. Please install MetaMask.');
    }
  };

  return { account, publicClient, connectWallet };
};
