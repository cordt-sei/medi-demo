import { defineChain } from 'viem'

export const seiTestnet = defineChain({
  id: 1328,
  name: 'Sei Atlantic-2 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sei',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Sei Explorer', url: 'https://explorer.sei.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11', // Example address; adjust if Sei has its own Multicall contract
      blockCreated: 1, // Adjust to the block this contract was created at
    },
  },
})
