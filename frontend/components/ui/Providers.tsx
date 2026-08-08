"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111");

const supportedChains = {
  1: mainnet,
  11155111: sepolia,
  31337: hardhat,
} as const;

const activeChain = supportedChains[chainId as keyof typeof supportedChains] ?? sepolia;

const config = getDefaultConfig({
  appName:   process.env.NEXT_PUBLIC_APP_NAME ?? "TrustID",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains:    [activeChain],
  transports: {
    [activeChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? undefined),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
