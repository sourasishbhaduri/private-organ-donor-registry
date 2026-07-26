import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { VerificationResult } from '../types';

interface PrivateVerificationModalProps {
  onVerify: (secretId: string, age: number, bloodType: number, clearanceSeed: string) => Promise<VerificationResult>;
  isVerifying: boolean;
}

export const PrivateVerificationModal: React.FC<PrivateVerificationModalProps> = ({ onVerify, isVerifying }) => {
  const [secretId, setSecretId] = useState('');
  const [age, setAge] = useState<number>(24);
  const [bloodType, setBloodType] = useState<number>(1);
  const [clearanceSeed, setClearanceSeed] = useState('HOSP-METRO-CLEARANCE-99482');
  
  const [verificationOutput, setVerificationOutput] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationOutput(null);
    if (!secretId.trim()) return;

    const res = await onVerify(secretId, age, bloodType, clearanceSeed);
    setVerificationOutput(res);
  };

  return (
    <div className="saas-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '10px', color: '#8b5cf6' }}>
          <KeyRound size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Private Donor Eligibility Verification</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Prove you are a registered, eligible donor without revealing your identity or exact age on-chain.
          </p>
        </div>
      </div>

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div className="form-group">
          <label className="form-label">Secret Donor ID / Passphrase</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your secret donor passphrase"
            value={secretId}
            onChange={(e) => setSecretId(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              min={18}
              className="form-input"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group Code [1-8]</label>
            <select
              className="form-input"
              value={bloodType}
              onChange={(e) => setBloodType(parseInt(e.target.value, 10))}
            >
              <option value={1} style={{ background: '#1e293b' }}>O-</option>
              <option value={2} style={{ background: '#1e293b' }}>O+</option>
              <option value={3} style={{ background: '#1e293b' }}>A-</option>
              <option value={4} style={{ background: '#1e293b' }}>A+</option>
              <option value={5} style={{ background: '#1e293b' }}>B-</option>
              <option value={6} style={{ background: '#1e293b' }}>B+</option>
              <option value={7} style={{ background: '#1e293b' }}>AB-</option>
              <option value={8} style={{ background: '#1e293b' }}>AB+</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Medical Clearance Token Seed</label>
          <input
            type="text"
            className="form-input font-mono"
            value={clearanceSeed}
            onChange={(e) => setClearanceSeed(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-saas-primary" disabled={isVerifying || !secretId} style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}>
          {isVerifying ? (
            <>
              <Cpu size={16} className="animate-spin" /> Verifying ZK Proof...
            </>
          ) : (
            <>
              <ShieldCheck size={16} color="#8b5cf6" /> Verify Eligibility Privately
            </>
          )}
        </button>

      </form>

      {/* Verification Output Box */}
      {verificationOutput && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: verificationOutput.eligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${verificationOutput.eligible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {verificationOutput.eligible ? (
            <CheckCircle2 size={24} color="#10b981" />
          ) : (
            <XCircle size={24} color="#f43f5e" />
          )}
          <div>
            <h4 style={{ color: verificationOutput.eligible ? '#34d399' : '#fb7185', fontWeight: 600, fontSize: '0.95rem' }}>
              {verificationOutput.eligible ? 'ZK Verification Succeeded! Eligible & Registered' : 'ZK Verification Failed / Not Found'}
            </h4>
            <p className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Commitment: {verificationOutput.commitment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
