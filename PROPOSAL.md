# Proposal: Confidential Age & Medical Clearance Verification in Private Organ Donor Registry

## 1. Executive Summary & Problem Statement

### Background
Organ donation saves thousands of lives annually, yet registry participation remains drastically below target thresholds worldwide. A primary barrier to registration is **privacy concern**: potential donors fear that registering with public or legacy databases exposes sensitive Personal Health Information (PHI), medical clearance records, exact age, and personally identifiable information (PII) to insurance companies, employers, and malicious actors.

Traditional public blockchains solve trust issues through transparency, but public ledgers expose all transaction parameters. Recording organ donation commitments on transparency-first blockchains links wallet addresses to donor identities and health attributes.

### Problem Definition
1. **Public Identity Exposure**: Donors must reveal their real-world identity or wallet address when interacting with traditional registries.
2. **Data Exploitation Risk**: Centralized databases and transparent ledgers are vulnerable to data breaches, unauthorized profiling, and commercial exploitation of health status.
3. **Lack of Verifiable Eligibility**: Registries struggle to verify donor age (>= 18) and medical clearance without taking custody of private identity credentials.

### Solution Overview
The **Private Organ Donor Registry** leverages the **Midnight Network** and **Compact** zero-knowledge smart contracts to provide a privacy-preserving organ donation platform. By utilizing client-side Zero-Knowledge (ZK) proof generation and Midnight's private state model, donors can prove their eligibility and pledge organs anonymously. Observers on the blockchain learn only aggregate statistical tallies, while sensitive donor attributes remain confidential within client-side ZK witnesses.

---

## 2. Midnight Zero-Knowledge Architecture & Privacy Model

### Dual-State Data Architecture
Midnight divides state management into **Private State** (witness execution domain on the user's local machine) and **Public State** (on-chain immutable ledger):

| State Domain | Location | Stored Data & Operations | Exposure Level |
| --- | --- | --- | --- |
| **Private State** | Local Client / Lace Wallet | Raw donor age, secret donor passphrase, medical clearance signature, individual organ selections | **Strictly Confidential** (Never leaves client) |
| **Public State** | Midnight Preprod Ledger | Aggregate donor counter, anonymized blood type counts (e.g. Type O-, A+), 32-byte cryptographic commitments | **Publicly Verifiable** |

### Zero-Knowledge Proof Circuits
The Compact smart contract (`contracts/organ-donor-registry.compact`) enforces four primary ZK circuit constraints:

1. **Confidential Age Gate**: Proves `donor_age >= 18` in local circuit constraints without transmitting numerical age on-chain.
2. **Cryptographic Commitment Hashing**: Computes `SHA256(donor_passphrase + secret_salt)` inside local witness code. Only the resulting 32-byte hash commitment is recorded on-chain, preventing double-registration while preserving donor anonymity.
3. **Medical Clearance Attestation**: Verifies that the donor possesses a valid cryptographic clearance signature issued by an authorized medical entity without revealing provider details.
4. **Organ Pledge Bitmasking**: Encodes organ selection (Kidney, Liver, Heart, Lungs, Cornea, Pancreas) into a bitmask, verifying validity (> 0 organs selected) in ZK before updating aggregate counts.

### Observer Visibility Breakdown

#### ❌ What an Observer CANNOT Learn:
- **Donor Wallet & Identity**: No connection between unshielded/shielded wallet address and donor commitment.
- **Raw Donor Passphrase**: Preserved entirely inside client ZK witnesses.
- **Exact Age & PII**: Verified privately; never recorded on-chain.
- **Individual Organ Pledges**: Specific organ choices per user remain undisclosed.

#### ✅ What an Observer CAN Learn:
- **Total Registered Donors**: Global public aggregate counter (`totalDonors`).
- **Blood Group Tallies**: Anonymized public distribution (e.g., total count of O- donors available for emergency medical queries).
- **On-Chain Commitment Hash**: Immutable 32-byte hash confirming registration validity.

---

## 3. Technical Implementation & Smart Contract Design

### Core Components & Tech Stack
- **Smart Contract Language**: Compact v0.16.0 (Midnight ZK Domain Specific Language).
- **Blockchain Framework**: `@midnight-ntwrk/midnight-js-*` (v4.1.1 SDK).
- **Wallet Connection**: Midnight Lace Browser Extension (`window.midnight.mnLace` / `window.midnight.lace`).
- **Proof Server**: `midnightntwrk/proof-server:8.1.0` (Dockerized local witness execution).
- **Frontend Dashboard**: Vite + React 18 + TypeScript + Glassmorphism Vanilla CSS.
- **Testing & CI/CD**: Vitest unit test suite (11/11 tests passing) and GitHub Actions automation.

### System Workflow Sequence

```
  ┌────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐         ┌───────────────────┐
  │  Donor Browser │         │  Midnight Lace Wallet│         │  Local Proof Server │         │  Midnight Preprod │
  └───────┬────────┘         └──────────┬───────────┘         └──────────┬──────────┘         └─────────┬─────────┘
          │                             │                                │                              │
          │  1. Enter Age & Passphrase  │                                │                              │
          ├────────────────────────────>│                                │                              │
          │                             │  2. Compute ZK Witness         │                              │
          │                             ├───────────────────────────────>│                              │
          │                             │                                │  3. Generate ZK Proof        │
          │                             │                                ├─────────────────────────────>│
          │                             │  4. Sign & Broadcast Tx        │                              │
          │                             ├──────────────────────────────────────────────────────────────>│
          │                             │                                │                              │  5. Update Public
          │  6. Confirmation & Hash     │                                │                              │     State Ledger
          │<────────────────────────────┴────────────────────────────────┴──────────────────────────────┤
```

### Deployed Contract & Explorer Verification
- **Network**: Midnight Preprod Testnet
- **Contract Address**: `0x1e3a57110a038d73d0d8e23777ced0e087e75d3f9185add9c967d26daf28cab3`
- **Explorer Link**: [Verify Contract on Midnight Preprod Explorer](https://explorer.preprod.midnight.network/?search=0x1e3a57110a038d73d0d8e23777ced0e087e75d3f9185add9c967d26daf28cab3)
- **Live Demo Web App**: [https://private-organ-donor-registry.vercel.app/](https://private-organ-donor-registry.vercel.app/)

---

## 4. Roadmap, Impact & Future Scope

### Implementation Roadmap

#### Phase 1: Core Privacy Architecture & MVP (Completed)
- [x] Write and compile Compact smart contract for anonymous donor registration.
- [x] Build local unit test suite covering age gating, blood group validation, and commitment hashing.
- [x] Integrate Midnight Lace Wallet extension for browser-based session lifecycle management.
- [x] Deploy smart contract to Midnight Preprod testnet and publish live web application.

#### Phase 2: Decentralized Identity (DID) & Verifiable Credentials (Q4 2026)
- Integrate W3C Verifiable Credentials (VCs) and Decentralized Identifiers (DIDs) for automated hospital attestations.
- Enable accredited medical providers to issue ZK-compatible medical clearance credentials directly to user Lace Wallets.

#### Phase 3: ZK Matching Engine for Hospitals & Transplant Centers (Q1 2027)
- Develop a privacy-preserving matching protocol allowing transplant centers to query organ availability (HLA typing, blood compatibility) using zero-knowledge range queries.
- Ensure recipient locations and donor identities remain undisclosed until a confirmed organ match occurs.

#### Phase 4: Mainnet Deployment & DAO Governance (Q2 2027)
- Transition smart contracts from Midnight Preprod to Midnight Mainnet.
- Establish a multi-stakeholder DAO comprising medical bioethicists, healthcare institutions, and privacy rights organizations to govern protocol updates.

### Social Impact & Healthcare Vision
By removing the risk of public exposure and data surveillance, the **Private Organ Donor Registry** empowers individuals to register as donors with complete confidence in their privacy. Utilizing Midnight's zero-knowledge technology bridges the gap between public medical utility and personal data sovereignty, setting a new paradigm for privacy-first healthcare infrastructure.
