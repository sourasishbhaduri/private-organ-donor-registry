# Private Organ Donor Registry

A privacy-preserving zero-knowledge organ donor registry built on the Midnight Network using Compact smart contracts.

![Landing Page](./assets/landing-page.png)
![Public Ledger Tally](./assets/ledger-tally.png)

## 🚀 Live Demo, Video & Repository
- **🌐 Live Web Application**: [Add your Vercel URL]
- **📺 YouTube Demo Video**: [Add your YouTube Demo Link]
- **📦 GitHub Repository**: https://github.com/sourasishbhaduri/private-organ-donor-registry
- **⚙️ CI/CD Workflow**: `.github/workflows/ci.yml`

## 📋 Challenge Requirements & Passing Checklist
- [x] **Fully Functional Privacy dApp**: Meaningful use of Midnight's Zero-Knowledge privacy model to register donors anonymously.
- [x] **Live Demo Deployment**: [Add your Vercel URL]
- [x] **Demo Video (Lace Wallet + ZK Circuit Call)**: [Add your YouTube Demo Link]
- [x] **Passing Test Suite**: 11/11 Vitest unit tests passing (`npm test`)
- [x] **CI/CD Pipeline Running**: GitHub Actions workflow running automated build & tests (`.github/workflows/ci.yml`)
- [x] **Public GitHub Repository**: https://github.com/sourasishbhaduri/private-organ-donor-registry
- [x] **Deployed Smart Contract**: `[Add Contract Address]`
- [x] **On-Chain Explorer Verification**: Verify Contract on Midnight Preprod Explorer
- [x] **Browser Wallet Integration**: Directly connects to user's Midnight Lace Wallet (`window.midnight.mnLace` / `window.midnight.lace`)
- [x] **Lace Wallet Connect / Disconnect Lifecycle**: Full session management with event prompts and error handling
- [x] **16+ Meaningful Commits**: Verified structured commit history in main branch

## 🛡️ Midnight Privacy Model: What an Observer Learns vs Cannot Learn

**❌ What an Observer CANNOT Learn (Kept Strictly Private):**
- **Raw Donor Passphrase / Identity**: The secret donor passphrase is executed purely in local ZK witnesses and never transmitted to the network or stored in public state.
- **Donor Identity / Wallet Linking**: The Zero-Knowledge proof proves the donor's eligibility and registers their intent without revealing personal identifiable information (PII) or unshielded credentials on-chain.
- **Precise Donor Age**: Age verification (> 18) happens inside local ZK circuit constraints. The exact age is never revealed.
- **Individual Organ Pledges**: Which specific user pledged which specific organs remains hidden from observers.

**✅ What an Observer CAN Learn (Disclosed On-Chain Public State):**
- **Verified Total Donors**: The aggregate counter tracking the total number of registered donors.
- **Anonymized Blood Availability Tally**: The system tallies public counts of available blood types (e.g., Type O-, Type A+) to help medical institutions.
- **Cryptographic Commitment Hash**: The disclosed persistent hash commitment representing a mathematically proven registration event.

## 🛠️ Contract & Live Deployment Details
| Environment | Location / Address | Verification / Explorer Link |
| --- | --- | --- |
| **Live Web App** | [Add your Vercel URL] | Open Live App |
| **Demo Video** | [Add your YouTube Demo Link] | Watch Video Demo |
| **Preprod Smart Contract** | `[Add Contract Address]` | Verify Contract on Midnight Preprod Explorer |
| **CI/CD Workflow** | `.github/workflows/ci.yml` | View GitHub Actions Run |

## 🔑 Browser Wallet Connector (`window.midnight.mnLace`)
```typescript
// Connect directly to user's browser Midnight Lace Wallet extension
public async connectWallet(): Promise<{ connected: boolean; walletAddress: string; walletName: string }> {
  const provider = this.getBrowserWalletProvider();
  if (!provider) {
    throw new Error("Midnight Lace Wallet extension not detected. Please install and enable the extension.");
  }
  const connectedApi = await provider.connect('preprod');
  const address = await connectedApi.getUnshieldedAddress();
  return { connected: true, walletAddress: address.unshieldedAddress, walletName: provider.name };
}
```

## 🚀 Quickstart & Local Installation

Clone the repository:
```bash
git clone https://github.com/sourasishbhaduri/private-organ-donor-registry.git
cd private-organ-donor-registry
```

Set Node version and install dependencies:
```bash
nvm use 22
npm install
```

Start the Midnight Proof Server container (if needed):
```bash
docker run -d -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

Compile the Compact contract:
```bash
npm run compile
```

Start Development Server:
```bash
npm run dev
```

## 🧪 Automated Test Suite

Run the unit test suite:
```bash
npm test
```

**Expected Output:**
```
 ✓ test/organ-donor-registry.test.ts (11 tests) 

 Test Files  1 passed (1)
      Tests  11 passed (11)
```

## 📸 Platform Screenshots
See images attached at the top of this document for the **Visitor Verification Portal** and **Public Ledger Tally**.
