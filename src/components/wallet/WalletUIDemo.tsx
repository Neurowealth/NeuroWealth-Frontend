"use client";

import { useState } from "react";
import {
  WalletConnectionStates,
  WalletRequiredGuard,
} from "./WalletConnectionStates";
import { WalletStatusBadge } from "./WalletStatusBadge";

/**
 * WalletUIDemo
 *
 * Showcases all wallet connection UI states for design and development
 * Mock-only component for demonstrating UI patterns without real wallet interaction
 */

interface DemoStateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function DemoState({ title, description, children }: DemoStateProps) {
  return (
    <section className="space-y-2 pb-8 border-b border-gray-200 last:border-0">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        {children}
      </div>
    </section>
  );
}

export function WalletUIDemo() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-8">
      <div className="space-y-2 pb-8 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900">
          Wallet Connection UI States
        </h1>
        <p className="text-gray-600">
          Mock-only design states for wallet connection, disconnection, and
          network status.
        </p>
      </div>

      {/* State Examples */}
      <div className="space-y-12">
        <DemoState
          title="Disconnected State"
          description="Initial state when wallet is not connected. Shows call-to-action and benefits."
        >
          <div className="max-w-md">
            <WalletConnectionStates showDetails compact={false} />
          </div>
        </DemoState>

        <DemoState
          title="Connected State"
          description="When wallet is successfully connected. Shows address, wallet name, and network status."
        >
          <div className="max-w-md space-y-4">
            <WalletStatusBadge size="md" showNetwork />
            <WalletStatusBadge size="md" compact showNetwork={false} />
          </div>
        </DemoState>

        <DemoState
          title="Restoring State"
          description="Loading state during wallet auto-reconnect on page load."
        >
          <div className="max-w-md animate-pulse">
            <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-300 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full w-1/3 bg-blue-500" />
              </div>
            </div>
          </div>
        </DemoState>

        <DemoState
          title="Wallet Required Guard"
          description="Used to gate sensitive actions behind wallet connection check."
        >
          <div className="max-w-md">
            <WalletRequiredGuard>
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-semibold text-green-900">
                  ✓ Wallet Connected
                </p>
                <p className="text-sm text-green-800 mt-2">
                  You can now execute portfolio transactions and strategy
                  adjustments.
                </p>
              </div>
            </WalletRequiredGuard>
          </div>
        </DemoState>

        <DemoState
          title="Size Variants"
          description="Wallet status badge available in different sizes."
        >
          <div className="flex flex-col gap-4">
            <WalletStatusBadge size="sm" compact showNetwork={false} />
            <WalletStatusBadge size="md" compact showNetwork={false} />
            <WalletStatusBadge size="lg" compact showNetwork={false} />
          </div>
        </DemoState>

        <DemoState
          title="Network Mismatch Warning"
          description="Alert when wallet is connected to different network than app."
        >
          <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  Network Mismatch Detected
                </h4>
                <p className="text-sm text-amber-800 mt-1">
                  Your wallet is connected to <strong>Mainnet</strong> but
                  NeuroWealth is configured for <strong>Testnet</strong>.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  Please switch your wallet to the correct network to proceed.
                </p>
              </div>
            </div>
          </div>
        </DemoState>

        <DemoState
          title="Usage in Transactions"
          description="How to gate transaction actions behind wallet connection."
        >
          <div className="space-y-3 max-w-md">
            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Portfolio Actions
              </h4>
              <button
                disabled
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
              >
                Execute Strategy
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Disabled: Wallet not connected
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Portfolio Actions
              </h4>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Execute Strategy
              </button>
              <p className="text-xs text-green-600 mt-2 text-center">
                Enabled: Wallet connected ✓
              </p>
            </div>
          </div>
        </DemoState>
      </div>

      {/* Implementation Notes */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 space-y-3">
        <h3 className="font-semibold text-blue-900">Implementation Notes</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            ✓ <strong>WalletStatusBadge</strong>: Display connected wallet
            address and network status
          </li>
          <li>
            ✓ <strong>WalletConnectionStates</strong>: Comprehensive state
            management for all UI scenarios
          </li>
          <li>
            ✓ <strong>WalletRequiredGuard</strong>: Gate sensitive actions
            behind wallet connection check
          </li>
          <li>
            ✓ <strong>Mock Only</strong>: Uses WalletProvider context; no real
            blockchain interaction
          </li>
          <li>
            ✓ <strong>Accessible</strong>: Proper ARIA labels and semantic HTML
          </li>
          <li>
            ✓ <strong>Responsive</strong>: Works across mobile, tablet, and
            desktop
          </li>
        </ul>
      </div>
    </div>
  );
}
