import React from 'react';
import { Database, RefreshCw, Activity, Heart, Users } from 'lucide-react';
import { PublicLedgerData } from '../types';

interface PublicLedgerStateProps {
  data: PublicLedgerData;
  onRefresh: () => void;
  isLoading: boolean;
}

const BLOOD_LABELS: Record<number, { name: string; tag: string }> = {
  1: { name: 'O-', tag: 'Universal Donor' },
  2: { name: 'O+', tag: 'Common Positive' },
  3: { name: 'A-', tag: 'Rare Negative' },
  4: { name: 'A+', tag: 'Common Positive' },
  5: { name: 'B-', tag: 'Rare Negative' },
  6: { name: 'B+', tag: 'Common Positive' },
  7: { name: 'AB-', tag: 'Extremely Rare' },
  8: { name: 'AB+', tag: 'Universal Recipient' },
};

export const PublicLedgerState: React.FC<PublicLedgerStateProps> = ({ data, onRefresh, isLoading }) => {
  return (
    <div className="saas-card" style={{ padding: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '10px', color: '#3b82f6' }}>
            <Database size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Public Anonymous Ledger State</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time on-chain tally of registered donors & anonymized blood supply.
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn-saas-secondary"
          disabled={isLoading}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Updating...' : 'Refresh State'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Total Donors Counter */}
        <div className="saas-card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Registered Donors</span>
            <Users size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }} className="font-mono">
            {data.totalDonors.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            🔒 Identities 100% Zero-Knowledge Protected
          </div>
        </div>

        {/* Ledger Status */}
        <div className="saas-card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Contract Status</span>
            <Activity size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} /> Active & Indexed
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            {data.lastUpdated ? `Last Sync: ${data.lastUpdated.toLocaleTimeString()}` : 'Connected to Midnight'}
          </div>
        </div>

      </div>

      {/* Anonymized Blood Group Supply Distribution */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={16} color="#f43f5e" /> Anonymized Blood Availability Tally
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {Object.entries(BLOOD_LABELS).map(([codeStr, meta]) => {
            const code = parseInt(codeStr, 10);
            const count = data.bloodGroupCounts[code] || 0;
            return (
              <div
                key={code}
                className="saas-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  background: count > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: count > 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>
                    Type {meta.name}
                  </span>
                  <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: count > 0 ? '#34d399' : 'var(--text-tertiary)' }}>
                    {count}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {meta.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
