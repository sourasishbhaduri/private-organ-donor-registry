# Private Organ Donor Registry (Midnight Network dApp)

> **Level 3 Category**: Confidential Credentials / Age & Eligibility Gate  
> **Blockchain**: Midnight Network (Zero-Knowledge Smart Contracts)  
> **Local Deployment Status**: ✅ Deployed & Verified (`1e3a57110a038d73d0d8e23777ced0e087e75d3f9185add9c967d26daf28cab3`)

---

## 1. System Environment Verification Report

- **OS & Shell**: Linux WSL2 Ubuntu 22.04 LTS (`6.18.33.2-microsoft-standard-WSL2 x86_64`)
- **Node.js**: `v22.23.1` (`/home/sayan/.nvm/versions/node/v22.23.1/bin/node`)
- **npm**: `10.9.8` (`/home/sayan/.nvm/versions/node/v22.23.1/bin/npm`)
- **Docker**: Docker Engine 28.0+ via Docker Desktop WSL integration (`docker.exe compose`)
- **Compact Compiler**: `compact 0.5.1` (circuit compiler `0.31.1`) at `/home/sayan/.local/bin/compact`
- **Project Directory**: `/home/sayan/midnight-projects/private-organ-donor-registry` (Native WSL path)
- **Proof Server**: Running locally on port `6300` (`http://127.0.0.1:6300`)

---

## 2. Product Proposal & Architecture

Organ donation requires strict eligibility verification (age ≥ 18, valid voluntary consent, ABO/Rh blood group matching, authorized medical clearance). Traditional public registries expose sensitive personal identity and health records, deterring potential donors due to privacy concerns.

**Private Organ Donor Registry** leverages Midnight's Zero-Knowledge (ZK) smart contracts in Compact to establish an anonymous, privacy-preserving organ donor network:

1. **Eligibility Gate (`age >= 18`)**: Donors prove they satisfy legal age requirements inside a ZK proof without revealing their exact age or date of birth.
2. **Confidential Credentials**: Hospital medical clearance signatures and secret donor identity keys are verified off-chain via private witnesses.
3. **Anonymized Supply Tallies**: ABO/Rh blood availability counts are updated publicly to assist transplant authorities without linking donor identities to blood groups.

---

## 3. Privacy Model

| Dimension | Visibility | Description |
| :--- | :--- | :--- |
| **Donor Identity & Secret Key** | 🔒 Private Witness | Kept strictly off-chain. Observers cannot derive donor identity or SSN. |
| **Exact Age** | 🔒 Private Witness | Proved `age >= 18` in ZK; exact age is never exposed on-chain. |
| **Medical Clearance Signature** | 🔒 Private Witness | Verified inside ZK circuit; raw signature token remains off-chain. |
| **Public Commitment Hash** | 🌐 Disclosed On-Chain | `disclose(commitment)` — `0x...` SHA256 commitment hash. |
| **Anonymized Blood Supply** | 🌐 Disclosed On-Chain | `disclose(bloodType)` — Anonymous category count increment. |
| **Total Registered Donors** | 🌐 Disclosed On-Chain | `totalDonors` incremented publicly. |

---

## 4. Quick Start & Execution Commands

### Prerequisites
Ensure Docker is running and Node 22+ is available in WSL.

### 1. Compile Compact Contract
```bash
npm run compile
```
Compiles `contracts/organ-donor-registry.compact` into `contracts/managed/organ-donor-registry`.

### 2. Local Stack Setup & Deployment
```bash
npm run setup -- --network undeployed
```
Starts local devnet containers (node, indexer, proof server), compiles contract, funds wallet, registers DUST UTXOs, and deploys contract to local chain.

### 3. Run Interactive CLI
```bash
npm run cli
```
Interactive CLI options:
1. Register as Anonymous Organ Donor (Generates ZK proof).
2. Query Public Anonymous Ledger State (Tally & Supply).
3. Privately Verify Donor Eligibility.
4. Check Wallet Balances.

### 4. Run Unit Tests
```bash
npm test
```
Runs 11 automated unit tests covering age gating, blood group validation, ZK commitment hashing, bitmask organ pledge encoding, and configuration parsers.

### 5. Run End-to-End Smoke Test
```bash
npm run test:e2e
```
Connects to deployed contract on network and queries indexed ledger state.

### 6. Start Web Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Launches Vite React dashboard at `http://localhost:3000`.

---

## 5. Deployment Status

- **Undeployed (Local Devnet)**: ✅ **Deployed & Operational**
  - Contract Address: `1e3a57110a038d73d0d8e23777ced0e087e75d3f9185add9c967d26daf28cab3`
  - Seed preserved in `.midnight-state.json`.

- **Preprod Network Setup**:
  - Endpoint: `https://rpc.preprod.midnight.network`
  - Indexer: `https://indexer.preprod.midnight.network/api/v4/graphql`
  - If Preprod wallet sync blocks due to indexer rate limits, setup script safely preserves seed state and logs wallet address for faucet funding.

---

## 6. Submission Checklists

### Level 1 Checklist
- [x] Compact contract with public ledger state (`totalDonors`, `registeredCommitments`, `bloodGroupCounts`) and private witnesses.
- [x] Explicit `disclose()` used deliberately only for public commitments and anonymized tallies.
- [x] `contracts/managed/` generated artifacts present.
- [x] Local deployment via `npm run setup -- --network undeployed`.
- [x] Interactive CLI script (`npm run cli`).
- [x] Comprehensive README with setup and privacy model.

### Level 2 Checklist
- [x] Frontend application built with Vite + React + TypeScript + Glassmorphism CSS.
- [x] Lace Wallet connect / disconnect and status display.
- [x] Contract integration loading environment variables (`VITE_CONTRACT_ADDRESS`, `VITE_NETWORK`, `VITE_PROOF_SERVER_URL`).
- [x] ZK proof submission without displaying private inputs.
- [x] Prepared for Vercel/Netlify deployment with `.env.example`.

### Level 3 Checklist
- [x] 11+ automated unit tests (`npm test`).
- [x] GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`).
- [x] Product Proposal for Confidential Credentials / Age Gate.
- [x] Polished UX with loading, error, success, and disconnected states.
- [x] 10+ clean, structured git commits.

---

## License
MIT License
