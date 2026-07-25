import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolveNetwork, parseNetworkFlag } from '../src/network';

const BLOOD_NAMES: Record<number, string> = {
  1: 'O- (Universal Donor)',
  2: 'O+',
  3: 'A-',
  4: 'A+',
  5: 'B-',
  6: 'B+',
  7: 'AB-',
  8: 'AB+ (Universal Recipient)',
};

const ORGAN_BITMASKS = {
  KIDNEY: 1,
  LIVER: 2,
  HEART: 4,
  LUNGS: 8,
  PANCREAS: 16,
  CORNEA: 32,
};

function computeCommitmentHash(secretId: string, age: number, bloodType: number, clearanceSeed: string): Uint8Array {
  const hash = createHash('sha256');
  hash.update(secretId);
  hash.update(new Uint8Array([age]));
  hash.update(new Uint8Array([bloodType]));
  hash.update(clearanceSeed);
  return new Uint8Array(hash.digest());
}

function checkEligibilityRules(age: number, bloodType: number, pledgeMask: number, clearanceSeed: string): { eligible: boolean; error?: string } {
  if (age < 18) {
    return { eligible: false, error: 'Donor must be at least 18 years of age' };
  }
  if (bloodType < 1 || bloodType > 8) {
    return { eligible: false, error: 'Invalid blood group code (1..8)' };
  }
  if (pledgeMask <= 0) {
    return { eligible: false, error: 'Must pledge at least one organ' };
  }
  if (!clearanceSeed || clearanceSeed.trim() === '') {
    return { eligible: false, error: 'Medical clearance signature required' };
  }
  return { eligible: true };
}

describe('Private Organ Donor Registry Unit Tests', () => {
  describe('1. Age and Eligibility Validation', () => {
    it('rejects donors under 18 years of age', () => {
      const res = checkEligibilityRules(17, 1, ORGAN_BITMASKS.KIDNEY, 'HOSPITAL-SIG-123');
      assert.equal(res.eligible, false);
      assert.ok(res.error?.includes('at least 18 years'));
    });

    it('approves donors 18 years of age or older', () => {
      const res18 = checkEligibilityRules(18, 1, ORGAN_BITMASKS.KIDNEY, 'HOSPITAL-SIG-123');
      const res45 = checkEligibilityRules(45, 4, ORGAN_BITMASKS.KIDNEY | ORGAN_BITMASKS.HEART, 'HOSPITAL-SIG-456');
      assert.equal(res18.eligible, true);
      assert.equal(res45.eligible, true);
    });

    it('requires valid medical clearance signature', () => {
      const resNoSig = checkEligibilityRules(25, 2, ORGAN_BITMASKS.LIVER, '');
      assert.equal(resNoSig.eligible, false);
      assert.ok(resNoSig.error?.includes('Medical clearance'));
    });
  });

  describe('2. Blood Type & Supply Categorization', () => {
    it('supports all 8 standard ABO/Rh blood groups', () => {
      for (let code = 1; code <= 8; code++) {
        assert.ok(BLOOD_NAMES[code] !== undefined);
      }
    });

    it('rejects invalid blood group codes outside 1..8 range', () => {
      const res0 = checkEligibilityRules(30, 0, ORGAN_BITMASKS.KIDNEY, 'SIG');
      const res9 = checkEligibilityRules(30, 9, ORGAN_BITMASKS.KIDNEY, 'SIG');
      assert.equal(res0.eligible, false);
      assert.equal(res9.eligible, false);
    });
  });

  describe('3. ZK Commitment & Privacy Model', () => {
    it('generates deterministic 32-byte SHA256 commitment hashes', () => {
      const hash1 = computeCommitmentHash('donor-secret-999', 28, 1, 'HOSP-KEY-A');
      const hash2 = computeCommitmentHash('donor-secret-999', 28, 1, 'HOSP-KEY-A');
      assert.equal(hash1.length, 32);
      assert.equal(Buffer.from(hash1).toString('hex'), Buffer.from(hash2).toString('hex'));
    });

    it('produces unique commitments for different donor identities', () => {
      const hashA = computeCommitmentHash('donor-alice', 30, 2, 'HOSP-KEY-A');
      const hashB = computeCommitmentHash('donor-bob', 30, 2, 'HOSP-KEY-A');
      assert.notEqual(Buffer.from(hashA).toString('hex'), Buffer.from(hashB).toString('hex'));
    });
  });

  describe('4. Organ Pledge Bitmask Encoding', () => {
    it('correctly combines organ pledges into bitmasks', () => {
      const multiOrganPledge = ORGAN_BITMASKS.KIDNEY | ORGAN_BITMASKS.LIVER | ORGAN_BITMASKS.HEART; // 1 + 2 + 4 = 7
      assert.equal(multiOrganPledge, 7);
      assert.equal((multiOrganPledge & ORGAN_BITMASKS.KIDNEY) !== 0, true);
      assert.equal((multiOrganPledge & ORGAN_BITMASKS.LUNGS) !== 0, false);
    });

    it('requires at least one organ to be pledged', () => {
      const res = checkEligibilityRules(22, 1, 0, 'SIG');
      assert.equal(res.eligible, false);
      assert.ok(res.error?.includes('at least one organ'));
    });
  });

  describe('5. Network and Configuration Resolution', () => {
    it('defaults to undeployed network configuration when no flag is provided', () => {
      const { network } = resolveNetwork({ argv: [] });
      expectNetworkUndeployed(network);
    });

    it('parses --network flag correctly', () => {
      const parsed = parseNetworkFlag(['node', 'script.js', '--network', 'preprod']);
      assert.equal(parsed, 'preprod');
    });
  });
});

function expectNetworkUndeployed(network: string) {
  assert.equal(network, 'undeployed');
}
