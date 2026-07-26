import React, { useState } from 'react';
import { UserCheck, Shield, Lock, FileCheck, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DonorFormData } from '../types';

interface DonorRegistrationFormProps {
  onRegister: (data: DonorFormData) => Promise<{ success: boolean; txHash?: string; commitment?: string; error?: string }>;
  isSubmitting: boolean;
}

const BLOOD_TYPES = [
  { code: 1, label: 'O- (Universal Donor)' },
  { code: 2, label: 'O+' },
  { code: 3, label: 'A-' },
  { code: 4, label: 'A+' },
  { code: 5, label: 'B-' },
  { code: 6, label: 'B+' },
  { code: 7, label: 'AB-' },
  { code: 8, label: 'AB+ (Universal Recipient)' },
];

const ORGANS = [
  { bit: 1, label: 'Kidney' },
  { bit: 2, label: 'Liver' },
  { bit: 4, label: 'Heart' },
  { bit: 8, label: 'Lungs' },
  { bit: 16, label: 'Pancreas' },
  { bit: 32, label: 'Cornea' },
];

export const DonorRegistrationForm: React.FC<DonorRegistrationFormProps> = ({ onRegister, isSubmitting }) => {
  const [secretId, setSecretId] = useState('');
  const [age, setAge] = useState<number>(24);
  const [bloodType, setBloodType] = useState<number>(1);
  const [pledgedOrgans, setPledgedOrgans] = useState<number[]>([1, 2]); // Default Kidney + Liver
  const [clearanceSeed, setClearanceSeed] = useState('HOSP-METRO-CLEARANCE-99482');
  
  const [resultStatus, setResultStatus] = useState<{ success?: boolean; txHash?: string; commitment?: string; error?: string } | null>(null);

  const toggleOrgan = (bit: number) => {
    if (pledgedOrgans.includes(bit)) {
      if (pledgedOrgans.length > 1) {
        setPledgedOrgans(pledgedOrgans.filter((b) => b !== bit));
      }
    } else {
      setPledgedOrgans([...pledgedOrgans, bit]);
    }
  };

  const organPledgeMask = pledgedOrgans.reduce((acc, curr) => acc | curr, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultStatus(null);
    if (!secretId.trim()) return;

    const res = await onRegister({
      secretId,
      age,
      bloodType,
      organPledgeMask,
      clearanceSeed,
    });
    setResultStatus(res);
  };

  return (
    <div className="saas-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '10px', color: '#10b981' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Anonymous Donor Registration</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Generates a Zero-Knowledge Proof verifying age & eligibility without exposing identity.
            </p>
          </div>
        </div>
        <span className="badge-pill badge-green">
          <Shield size={12} /> ZK Circuit Active
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Secret Donor Identity */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} color="#10b981" /> Secret Donor Identity / Passphrase (Off-Chain Private Input)
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="e.g. secret-donor-passphrase-88392"
            value={secretId}
            onChange={(e) => setSecretId(e.target.value)}
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            🔒 Never uploaded or stored on-chain. Only used locally to prove ownership of donor commitment.
          </span>
        </div>

        {/* Age & Blood Type Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Donor Age (Verified in ZK, min 18)</label>
            <input
              type="number"
              min={18}
              max={120}
              className="form-input"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Proves age ≥ 18 inside ZK proof without disclosing exact age.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">ABO/Rh Blood Group</label>
            <select
              className="form-input"
              value={bloodType}
              onChange={(e) => setBloodType(parseInt(e.target.value, 10))}
            >
              {BLOOD_TYPES.map((b) => (
                <option key={b.code} value={b.code} style={{ background: '#1e293b' }}>
                  {b.label}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Updates anonymous supply tally for hospitals without linking donor identity.
            </span>
          </div>
        </div>

        {/* Organ Pledges Selection */}
        <div className="form-group">
          <label className="form-label">Pledged Organs (Select at least one)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '6px' }}>
            {ORGANS.map((organ) => {
              const selected = pledgedOrgans.includes(organ.bit);
              return (
                <button
                  type="button"
                  key={organ.bit}
                  onClick={() => toggleOrgan(organ.bit)}
                  style={{
                    background: selected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${selected ? '#10b981' : 'var(--border-glass)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: selected ? '#34d399' : 'var(--text-secondary)',
                    fontWeight: selected ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{organ.label}</span>
                  {selected && <CheckCircle2 size={14} color="#10b981" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hospital Medical Clearance */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCheck size={14} color="#3b82f6" /> Medical Clearance Signature / Token Seed
          </label>
          <input
            type="text"
            className="form-input font-mono"
            value={clearanceSeed}
            onChange={(e) => setClearanceSeed(e.target.value)}
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Cryptographic proof from an authorized medical board or hospital node.
          </span>
        </div>

        {/* Submit Action */}
        <div style={{ marginTop: '8px' }}>
          <button type="submit" className="btn-saas-primary" disabled={isSubmitting || !secretId} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            {isSubmitting ? (
              <>
                <Cpu size={18} className="animate-spin" /> Generating ZK Proof & Submitting to Midnight...
              </>
            ) : (
              <>
                <Shield size={18} /> Generate ZK Proof & Register Anonymously
              </>
            )}
          </button>
        </div>
      </form>

      {/* Transaction Result Status */}
      {resultStatus && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: resultStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${resultStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          {resultStatus.success ? (
            <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={22} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ width: '100%' }}>
            <h4 style={{ color: resultStatus.success ? '#34d399' : '#fb7185', fontWeight: 600, fontSize: '0.95rem' }}>
              {resultStatus.success ? 'Registration Successfully Proven & On-Chain!' : 'Registration Error'}
            </h4>
            {resultStatus.success ? (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Public Commitment: </span>
                  <span className="font-mono" style={{ color: '#34d399', wordBreak: 'break-all' }}>
                    {resultStatus.commitment}
                  </span>
                </div>
                {resultStatus.txHash && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Tx Hash: </span>
                    <span className="font-mono" style={{ color: '#60a5fa', wordBreak: 'break-all' }}>
                      {resultStatus.txHash}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '4px' }}>
                {resultStatus.error || 'Failed to generate ZK proof or register commitment on Midnight.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
