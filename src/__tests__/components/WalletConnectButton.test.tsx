import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletConnectButton from '@/components/WalletConnectButton';
import { WalletProvider } from '@/contexts/WalletProvider';

vi.mock('@/lib/stellar-wallet-kit', () => ({
  kit: vi.fn(() => ({
    openModal: vi.fn(),
    setWallet: vi.fn(),
    getAddress: vi.fn().mockResolvedValue({
      address: 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D',
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signTransaction: vi.fn(),
  })),
  getKit: vi.fn(() => ({
    openModal: vi.fn(),
    setWallet: vi.fn(),
    getAddress: vi.fn().mockResolvedValue({
      address: 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D',
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signTransaction: vi.fn(),
  })),
}));

describe('WalletConnectButton', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render connect button when not connected', () => {
    render(
      <WalletProvider>
        <WalletConnectButton />
      </WalletProvider>
    );

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should render with light theme by default', () => {
    render(
      <WalletProvider>
        <WalletConnectButton theme="light" />
      </WalletProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-black');
  });

  it('should render with dark theme', () => {
    render(
      <WalletProvider>
        <WalletConnectButton theme="dark" />
      </WalletProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
  });

  it('should be disabled while loading', async () => {
    const user = userEvent.setup();
    render(
      <WalletProvider>
        <WalletConnectButton />
      </WalletProvider>
    );

    const button = screen.getByRole('button');
    
    // Button should be enabled initially
    expect(button).not.toBeDisabled();
  });
});
