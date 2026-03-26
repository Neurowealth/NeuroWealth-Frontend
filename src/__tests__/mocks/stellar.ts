import { vi } from 'vitest';

export const mockStellarAccount = {
    id: 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D',
    balances: [
        {
            balance: '1000.0000000',
            asset_type: 'native',
        },
        {
            balance: '500.0000000',
            asset_type: 'credit_alphanum4',
            asset_code: 'USDC',
            asset_issuer: 'GBBD47UZQ5CUMBV4KSRWC6CCHVQJ2Z5QX2RJLKEAEV5OME7IBCYL45V',
        },
    ],
};

export const mockWalletAddress = 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D';
export const mockWalletName = 'Freighter';

export const mockStellarKit = {
    openModal: vi.fn(),
    setWallet: vi.fn(),
    getAddress: vi.fn().mockResolvedValue({ address: mockWalletAddress }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signTransaction: vi.fn(),
};

export const mockHorizonServer = {
    accounts: vi.fn().mockReturnValue({
        accountId: vi.fn().mockReturnValue({
            call: vi.fn().mockResolvedValue(mockStellarAccount),
        }),
    }),
    loadAccount: vi.fn().mockResolvedValue({
        id: mockWalletAddress,
        sequence: '1',
    }),
    submitTransaction: vi.fn().mockResolvedValue({
        id: 'test-tx-id',
        hash: 'test-hash',
    }),
};
