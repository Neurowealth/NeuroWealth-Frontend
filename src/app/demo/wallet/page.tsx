import { Metadata } from "next";
import { WalletProvider } from "@/contexts";
import { WalletUIDemo } from "@/components/wallet";

export const metadata: Metadata = {
  title: "Wallet Connection UI States | NeuroWealth",
  description: "Mock wallet connection UI states and patterns",
};

export default function WalletDemoPage() {
  return (
    <WalletProvider>
      <WalletUIDemo />
    </WalletProvider>
  );
}
