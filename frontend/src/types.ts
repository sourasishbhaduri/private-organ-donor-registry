export type NetworkId = 'undeployed' | 'preprod' | 'preview';

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: NetworkId;
  tNightBalance: bigint;
  dustBalance: bigint;
  syncing: boolean;
  walletName?: string;
  providerType?: 'lace' | 'seed' | 'other';
  error?: string | null;
}

export interface DonorFormData {
  secretId: string;
  age: number;
  bloodType: number;
  organPledgeMask: number;
  clearanceSeed: string;
}

export interface PublicLedgerData {
  totalDonors: number;
  bloodGroupCounts: Record<number, number>;
  lastUpdated: Date | null;
}

export interface VerificationResult {
  commitment: string;
  eligible: boolean;
  timestamp: Date;
}
