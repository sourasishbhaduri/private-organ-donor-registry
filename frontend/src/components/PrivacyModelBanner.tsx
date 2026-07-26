import React from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export const PrivacyModelBanner: React.FC = () => {
  return (
    <div className="saas-card" style={{ padding: '24px', background: '#ffffff' }}>
      <h3 className="" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldIcon /> Zero-Knowledge Privacy Architecture
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* What Observers CANNOT Learn */}
        <div className="saas-card" style={{ borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb7185', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
            <EyeOff size={16} /> What Observers CANNOT Learn
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li>• Donor real identity, SSN, or secret passphrase</li>
            <li>• Exact age or date of birth (proven age ≥ 18 only)</li>
            <li>• Patient medical history or hospital records</li>
            <li>• Link between wallet address & donor identity</li>
          </ul>
        </div>

        {/* What Observers CAN Learn */}
        <div className="saas-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
            <Eye size={16} /> What Observers CAN Learn
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li>• Total number of registered donors on-chain</li>
            <li>• Anonymous blood group supply totals (ABO/Rh)</li>
            <li>• Public commitment hash (0x...)</li>
            <li>• Validity of the ZK proof submitted</li>
          </ul>
        </div>

        {/* Deliberate Disclosures */}
        <div className="saas-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>
            <CheckCircle size={16} /> Deliberate ZK Disclosures
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <li>• <code className="font-mono">disclose(commitment)</code>: Public donor hash</li>
            <li>• <code className="font-mono">disclose(bloodType)</code>: Anonymous blood category</li>
            <li>• <code className="font-mono">totalDonors.increment(1)</code>: Global tally update</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
