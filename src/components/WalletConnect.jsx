import { createClient, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "@wagmi/core/providers/public";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const WalletConnect = ({ children }) => {
  const { chains, provider } = configureChains(
    [
      {
        id: 1328,
        name: "Sei Atlantic-2 Testnet",
        rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
        nativeCurrency: {
          name: "Sei",
          symbol: "SEI",
          decimals: 18,
        },
      },
    ],
    [publicProvider()]
  );

  const wagmiClient = createClient({
    autoConnect: true,
    provider,
  });

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletConnect;
