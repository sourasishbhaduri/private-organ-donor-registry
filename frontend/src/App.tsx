import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DonorRegistrationForm } from './components/DonorRegistrationForm';
import { PublicLedgerState } from './components/PublicLedgerState';
import { PrivateVerificationModal } from './components/PrivateVerificationModal';
import { PrivacyModelBanner } from './components/PrivacyModelBanner';
import { WalletModal } from './components/WalletModal';
import { WalletState, NetworkId, DonorFormData, PublicLedgerData, VerificationResult } from './types';
import { HeartPulse, UserPlus, Database, ShieldCheck, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'undeployed',
    tNightBalance: 0n,
    dustBalance: 0n,
    syncing: false,
    walletName: undefined,
    providerType: undefined,
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'register' | 'ledger' | 'verify' | 'privacy'>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [ledgerData, setLedgerData] = useState<PublicLedgerData>({
    totalDonors: 14,
    bloodGroupCounts: {
      1: 4, // O-
      2: 3, // O+
      3: 1, // A-
      4: 3, // A+
      5: 1, // B-
      6: 1, // B+
      7: 0, // AB-
      8: 1, // AB+
    },
    lastUpdated: new Date(),
  });

  const handleOpenConnectModal = () => {
    setIsWalletModalOpen(true);
  };

  const handleWalletConnected = (newState: Partial<WalletState>) => {
    setWallet((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleDisconnect = () => {
    setWallet((prev) => ({
      ...prev,
      connected: false,
      address: null,
      tNightBalance: 0n,
      dustBalance: 0n,
      walletName: undefined,
      providerType: undefined,
    }));
  };

  const handleNetworkChange = (net: NetworkId) => {
    setWallet((prev) => ({ ...prev, network: net }));
  };

  const handleRegister = async (data: DonorFormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000)); // Simulate ZK proof generation

    // Compute commitment hash SHA256(secretId + age + bloodType + clearanceSeed)
    const encoder = new TextEncoder();
    const payload = encoder.encode(data.secretId + data.age + data.bloodType + data.clearanceSeed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', payload);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const commitmentHex = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    const mockTxHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join('');

    // Update public ledger state
    setLedgerData((prev) => ({
      ...prev,
      totalDonors: prev.totalDonors + 1,
      bloodGroupCounts: {
        ...prev.bloodGroupCounts,
        [data.bloodType]: (prev.bloodGroupCounts[data.bloodType] || 0) + 1,
      },
      lastUpdated: new Date(),
    }));

    setIsSubmitting(false);

    return {
      success: true,
      commitment: commitmentHex,
      txHash: mockTxHash,
    };
  };

  const handleVerify = async (secretId: string, age: number, bloodType: number, clearanceSeed: string): Promise<VerificationResult> => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));

    const encoder = new TextEncoder();
    const payload = encoder.encode(secretId + age + bloodType + clearanceSeed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', payload);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const commitmentHex = '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    setIsVerifying(false);

    return {
      commitment: commitmentHex,
      eligible: age >= 18 && bloodType >= 1 && bloodType <= 8,
      timestamp: new Date(),
    };
  };

  const handleRefreshLedger = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLedgerData((prev) => ({ ...prev, lastUpdated: new Date() }));
    setIsRefreshing(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Navbar
        wallet={wallet}
        onConnect={handleOpenConnectModal}
        onDisconnect={handleDisconnect}
        onNetworkChange={handleNetworkChange}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('register')}
            className={activeTab === 'register' ? 'tab-btn active' : 'tab-btn'}
          >
            <UserPlus size={18} /> Register as Anonymous Donor
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={activeTab === 'ledger' ? 'tab-btn active' : 'tab-btn'}
          >
            <Database size={18} /> Public Ledger Tally ({ledgerData.totalDonors})
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={activeTab === 'verify' ? 'tab-btn active' : 'tab-btn'}
          >
            <ShieldCheck size={18} /> Private Eligibility Check
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={activeTab === 'privacy' ? 'tab-btn active' : 'tab-btn'}
          >
            <Info size={18} /> ZK Privacy Model
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'register' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <DonorRegistrationForm onRegister={handleRegister} isSubmitting={isSubmitting} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <PublicLedgerState data={ledgerData} onRefresh={handleRefreshLedger} isLoading={isRefreshing} />
              <PrivacyModelBanner />
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PublicLedgerState data={ledgerData} onRefresh={handleRefreshLedger} isLoading={isRefreshing} />
            <PrivacyModelBanner />
          </div>
        )}

        {activeTab === 'verify' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <PrivateVerificationModal onVerify={handleVerify} isVerifying={isVerifying} />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
            <PrivacyModelBanner />
          </div>
        )}

      </main>

      {/* Wallet Selector Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnected={handleWalletConnected}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <p>
          Private Organ Donor Registry — Built on <strong style={{ color: '#10b981' }}>Midnight Network</strong> ZK Smart Contracts.
        </p>
      </footer>

    </div>
  );
};
