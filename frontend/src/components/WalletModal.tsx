import React, { useState, useEffect } from 'react';
import { X, Wallet, ShieldCheck, Download, Key, AlertTriangle, Cpu, CheckCircle2 } from 'lucide-react';
import { detectMidnightWallets, connectLaceWallet, connectSeedWallet, DetectedWallet } from '../utils/midnightWallet';
import { WalletState } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (state: Partial<WalletState>) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onWalletConnected }) => {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'lace' | 'seed'>('lace');
  const [seedInput, setSeedInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const wallets = detectMidnightWallets();
      setDetectedWallets(wallets);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectLace = async (walletId?: string) => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await connectLaceWallet(walletId);
      onWalletConnected({
        connected: true,
        address: res.address,
        walletName: res.walletName,
        tNightBalance: res.tNightBalance,
        dustBalance: res.dustBalance,
        providerType: 'lace',
        error: null,
      });
      onClose();
    } catch (err: any) {
      console.error('Lace connection error:', err);
      setErrorMessage(err.message || 'Failed to connect to Lace Wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedInput.trim()) return;

    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const res = await connectSeedWallet(seedInput.trim());
      onWalletConnected({
        connected: true,
        address: res.address,
        walletName: 'Devnet Seed Wallet',
        tNightBalance: res.tNightBalance,
        dustBalance: res.dustBalance,
        providerType: 'seed',
        error: null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize seed wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="saas-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px', color: '#10b981' }}>
            <Wallet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Connect Midnight Wallet</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select a wallet provider to interact with the ZK Organ Donor Registry
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('lace')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'lace' ? 'var(--primary-glow, rgba(16, 185, 129, 0.2))' : 'transparent',
              color: activeTab === 'lace' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={16} /> Lace / Extension Wallet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seed')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'seed' ? 'var(--primary-glow, rgba(16, 185, 129, 0.2))' : 'transparent',
              color: activeTab === 'seed' ? '#34d399' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Key size={16} /> Devnet Seed Key
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Lace Extension Tab */}
        {activeTab === 'lace' && (
          <div>
            {detectedWallets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {detectedWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnectLace(wallet.id)}
                    disabled={isConnecting}
                    className="saas-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      background: 'rgba(16, 185, 129, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={20} color="#10b981" />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{wallet.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#34d399' }}>● Extension Installed & Ready</span>
                      </div>
                    </div>
                    {isConnecting ? (
                      <Cpu size={20} className="animate-spin" color="#10b981" />
                    ) : (
                      <CheckCircle2 size={20} color="#10b981" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertTriangle size={24} color="#eab308" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
                  Lace Extension Not Detected
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  We couldn't detect the Midnight Lace Wallet extension in your browser window. Install Lace Wallet to experience full ZK privacy features.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href="https://www.lace.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-saas-primary"
                    style={{ justifyContent: 'center', textDecoration: 'none', padding: '12px' }}
                  >
                    <Download size={18} /> Install Midnight Lace Wallet
                  </a>
                  <button
                    type="button"
                    onClick={() => handleConnectLace()}
                    disabled={isConnecting}
                    className="btn-saas-secondary"
                    style={{ justifyContent: 'center', padding: '12px' }}
                  >
                    {isConnecting ? 'Attempting Connection...' : 'Retry Extension Detection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Devnet Seed Tab */}
        {activeTab === 'seed' && (
          <form onSubmit={handleConnectSeed} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} color="#10b981" /> Seed Phrase / Key Passphrase
              </label>
              <input
                type="password"
                className="form-input font-mono"
                placeholder="Enter secret seed for local devnet testing"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Generates a deterministic Midnight wallet address for testing without browser extensions.
              </span>
            </div>

            <button
              type="submit"
              className="btn-saas-primary"
              disabled={isConnecting || !seedInput.trim()}
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              {isConnecting ? 'Initializing Seed Wallet...' : 'Connect Devnet Wallet'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
