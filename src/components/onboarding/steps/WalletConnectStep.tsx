'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface WalletConnectStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

const walletOptions = [
  {
    id: 'freighter',
    name: 'Freighter',
    description: 'Popular browser wallet for Stellar',
    icon: '🚢',
    recommended: true
  },
  {
    id: 'albedo',
    name: 'Albedo',
    description: 'Secure web-based wallet',
    icon: '🔐'
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Hardware wallet for maximum security',
    icon: '🔒'
  }
];

export default function WalletConnectStep({ onNext, onSkip, onBack }: WalletConnectStepProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setConnectionError('');

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure (90% success rate)
      if (Math.random() > 0.1) {
        // Connection successful
        onNext();
      } else {
        throw new Error('Connection failed. Please try again.');
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Choose a wallet to secure your NeuroWealth account. Your wallet will be used to sign transactions and manage your assets.
        </p>
      </div>

      {/* Wallet Options */}
      <div className="grid gap-4 max-w-2xl mx-auto">
        {walletOptions.map((wallet) => (
          <div
            key={wallet.id}
            className={`
              relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
              ${selectedWallet === wallet.id 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }
            `}
            onClick={() => !isConnecting && setSelectedWallet(wallet.id)}
          >
            {wallet.recommended && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                {wallet.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{wallet.name}</h3>
                <p className="text-sm text-slate-400">{wallet.description}</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center">
                {selectedWallet === wallet.id && (
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {connectionError && (
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{connectionError}</span>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-white mb-1">Security Notice</h4>
              <p className="text-sm text-slate-300">
                Never share your private keys or seed phrase with anyone. NeuroWealth will never ask for your wallet credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button
          onClick={() => selectedWallet && handleConnect(selectedWallet)}
          disabled={!selectedWallet || isConnecting}
          className="flex-1 sm:flex-initial min-w-[140px]"
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </Button>
        
        <Button variant="secondary" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>

      {/* Help Links */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm text-slate-400">
          Don&apos;t have a wallet?{' '}
          <button className="text-green-400 hover:text-green-300 underline">
            Learn more
          </button>
        </p>
      </div>
    </div>
  );
}
