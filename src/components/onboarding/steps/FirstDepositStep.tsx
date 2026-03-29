'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface FirstDepositStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

const presetAmounts = [50, 100, 250, 500, 1000];

const assets = [
  { id: 'xlm', name: 'Stellar (XLM)', symbol: 'XLM', balance: 1250.50, icon: '🌟' },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', balance: 2500.00, icon: '💵' },
  { id: 'eurc', name: 'Euro Coin', symbol: 'EURC', balance: 1800.75, icon: '💶' }
];

export default function FirstDepositStep({ onNext, onSkip, onBack }: FirstDepositStepProps) {
  const [selectedAsset, setSelectedAsset] = useState('xlm');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');

  const selectedAssetData = assets.find(asset => asset.id === selectedAsset);
  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setDepositError('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    setDepositError('');
  };

  const validateAmount = (): boolean => {
    if (!finalAmount || finalAmount <= 0) {
      setDepositError('Please enter a valid amount');
      return false;
    }
    
    if (selectedAssetData && finalAmount > selectedAssetData.balance) {
      setDepositError('Insufficient balance');
      return false;
    }
    
    if (finalAmount < 10) {
      setDepositError('Minimum deposit is 10');
      return false;
    }
    
    return true;
  };

  const handleDeposit = async () => {
    if (!validateAmount()) return;

    setIsDepositing(true);
    setDepositError('');

    try {
      // Simulate deposit process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure (95% success rate)
      if (Math.random() > 0.05) {
        // Save deposit record
        const depositRecord = {
          amount: finalAmount,
          asset: selectedAsset,
          timestamp: Date.now(),
          isFirstDeposit: true
        };
        localStorage.setItem('first-deposit', JSON.stringify(depositRecord));
        
        onNext();
      } else {
        throw new Error('Transaction failed. Please try again.');
      }
    } catch (error) {
      setDepositError(error instanceof Error ? error.message : 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Make Your First Deposit</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Start your investment journey by depositing funds into your NeuroWealth account.
        </p>
      </div>

      {/* Asset Selection */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-3">Select Asset</h3>
        <div className="grid gap-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`
                border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                ${selectedAsset === asset.id 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
                }
              `}
              onClick={() => setSelectedAsset(asset.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl">
                    {asset.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{asset.name}</h4>
                    <p className="text-sm text-slate-400">
                      Balance: {asset.balance.toLocaleString()} {asset.symbol}
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center">
                  {selectedAsset === asset.id && (
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Selection */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-3">Deposit Amount</h3>
        
        {/* Preset Amounts */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePresetAmount(amount)}
              className={`
                py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200
                ${selectedAmount === amount 
                  ? 'border-green-500 bg-green-500/20 text-green-400' 
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                }
              `}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {selectedAssetData?.symbol}
          </div>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full pl-16 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            min="10"
            step="0.01"
          />
        </div>

        {/* Amount Display */}
        {finalAmount > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Total to Deposit:</span>
              <span className="text-2xl font-bold text-green-400">
                {finalAmount.toLocaleString()} {selectedAssetData?.symbol}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {depositError && (
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{depositError}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fee Information */}
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-white mb-1">Fee Information</h4>
              <p className="text-sm text-slate-300">
                Network fees: 0.00001 XLM per operation. No NeuroWealth deposit fees. 
                Your deposit should arrive within 5-10 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button
          onClick={handleDeposit}
          disabled={!finalAmount || finalAmount < 10 || isDepositing}
          className="flex-1 sm:flex-initial min-w-[140px]"
        >
          {isDepositing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Depositing...
            </span>
          ) : (
            'Deposit Funds'
          )}
        </Button>
        
        <Button variant="secondary" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>

      {/* Help Links */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm text-slate-400">
          Questions about deposits?{' '}
          <button className="text-green-400 hover:text-green-300 underline">
            View deposit guide
          </button>
        </p>
      </div>
    </div>
  );
}
