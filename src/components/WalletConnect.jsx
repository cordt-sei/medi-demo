import { createPublicClient, http } from 'viem';
import { useState } from 'react';

// Replace this with your actual chain information
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

export const WalletConnect = ({ children }) => {
  const [publicClient, setPublicClient] = useState(null);

  // Initialize Viem Public Client
  const initializeClient = () => {
    const client = createPublicClient({
      chain: SEI_CHAIN,
      transport: http(SEI_CHAIN.rpcUrls[0]),
    });
    setPublicClient(client);
    console.log("Viem Client Initialized:", client);
  };

  return (
    <div>
      <button onClick={initializeClient}>Connect Wallet</button>
      {publicClient && (
        <div>
          <p>Connected to: {SEI_CHAIN.name}</p>
          {children}
        </div>
      )}
    </div>
  );
};