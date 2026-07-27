import React from 'react';
import { ShieldCheck, HeartPulse, Wallet, Network } from 'lucide-react';
import { WalletState, NetworkId } from '../types';

interface NavbarProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  onNetworkChange: (network: NetworkId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onConnect,
  onDisconnect,
  onNetworkChange,
}) => {
  return (
    <header className="saas-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <HeartPulse size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Private Organ Donor Registry
              </h1>
              <span className="badge-pill badge-green">
                <ShieldCheck size={12} /> ZK Protected
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Confidential Organ Donor & Eligibility Gate on Midnight Network
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Network Selector */}
          <div className="saas-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={16} color="var(--primary)" />
            <select
              value={wallet.network}
              onChange={(e) => onNetworkChange(e.target.value as NetworkId)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="undeployed" style={{ background: '#1e293b' }}>Local Devnet (Undeployed)</option>
              <option value="preprod" style={{ background: '#1e293b' }}>Midnight Preprod</option>
              <option value="preview" style={{ background: '#1e293b' }}>Midnight Preview</option>
            </select>
          </div>

          {/* Wallet Action Button */}
          {wallet.connected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="saas-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} className="animate-pulse-glow" />
                <span className="badge-pill badge-green" style={{ fontSize: '0.75rem' }}>
                  {wallet.walletName || 'Lace Wallet'}
                </span>
                <span className="font-mono" style={{ fontSize: '0.85rem' }}>
                  {wallet.address ? `${wallet.address.slice(0, 12)}...${wallet.address.slice(-6)}` : 'Connected'}
                </span>
                <span className="badge-pill badge-blue" style={{ fontSize: '0.75rem' }}>
                  {wallet.tNightBalance ? `${(Number(wallet.tNightBalance) / 1e6).toFixed(2)} tNIGHT` : '0 tNIGHT'}
                </span>
              </div>
              <button onClick={onDisconnect} className="btn-saas-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onConnect} className="btn-saas-primary">
              <Wallet size={18} /> Connect Wallet
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
