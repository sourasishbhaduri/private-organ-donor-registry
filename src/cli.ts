/**
 * Interactive CLI for Private Organ Donor Registry on Midnight Network
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { createHash } from 'node:crypto';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Enable WebSocket for GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'organDonorRegistryPrivateState';

export interface OrganDonorPrivateState {
  secretDonorKey: Uint8Array;
  secretDonorAge: number;
  secretBloodType: number;
  secretOrganPledge: number;
  secretClearanceHash: Uint8Array;
}

const witnesses = {
  secretDonorKey: (context: any) => context.privateState.secretDonorKey,
  secretDonorAge: (context: any) => context.privateState.secretDonorAge,
  secretBloodType: (context: any) => context.privateState.secretBloodType,
  secretOrganPledge: (context: any) => context.privateState.secretOrganPledge,
  secretClearanceHash: (context: any) => context.privateState.secretClearanceHash,
};

const initialPrivateState: OrganDonorPrivateState = {
  secretDonorKey: new Uint8Array(32),
  secretDonorAge: 18,
  secretBloodType: 1,
  secretOrganPledge: 1,
  secretClearanceHash: new Uint8Array(32).fill(1),
};

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'organ-donor-registry');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('❌ Contract not compiled. Run `npm run compile` first.');
  process.exit(1);
}

const OrganDonorModule = await import(pathToFileURL(contractPath).href);
const compiledContract: any = (CompiledContract as any).make('organ-donor-registry', OrganDonorModule.Contract).pipe(
  (CompiledContract as any).withWitnesses(witnesses),
  (CompiledContract as any).withCompiledFileAssets(zkConfigPath),
);

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

function computeCommitmentHash(secretId: string, age: number, bloodType: number, clearanceSeed: string): Uint8Array {
  const hash = createHash('sha256');
  hash.update(secretId);
  hash.update(new Uint8Array([age]));
  hash.update(new Uint8Array([bloodType]));
  hash.update(clearanceSeed);
  return new Uint8Array(hash.digest());
}

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'organ-donor-registry-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        PRIVATE ORGAN DONOR REGISTRY (MIDNIGHT ZK dAPP)       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rl = createInterface({ input: stdin, output: stdout });
  const deployment = getDeployment(network);

  if (!deployment) {
    console.error(`No deployment found for network ${network}. Run \`npm run setup\` first.`);
    process.exit(1);
  }

  console.log(`  Contract Address: ${deployment.address}`);
  console.log(`  Network Target:   ${network}\n`);

  try {
    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    const state = await walletCtx.wallet.waitForSyncedState();
    console.log('  ✓ Synced with Midnight network.');

    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNIGHT\n`);

    console.log('  Connecting to contract circuit handle...');
    const providers = await createProviders(walletCtx);

    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
    });

    console.log('  ✅ Connected to Organ Donor Registry!\n');

    let running = true;
    while (running) {
      console.log('─── Main Menu ──────────────────────────────────────────────────');
      console.log('  1. Register as Anonymous Organ Donor (ZK Proof)');
      console.log('  2. Query Public Anonymous Ledger State (Tally & Supply)');
      console.log('  3. Privately Verify Donor Eligibility');
      console.log('  4. Check Wallet Balances');
      console.log('  5. Exit\n');

      const choice = await rl.question('  Select option [1-5]: ');

      switch (choice.trim()) {
        case '1': {
          console.log('\n─── Anonymous Organ Donor Registration ────────────────────────');
          const secretId = await rl.question('  Enter secret Donor ID / Passphrase: ');
          const ageStr = await rl.question('  Enter Age (years, min 18): ');
          const age = parseInt(ageStr.trim() || '25', 10);

          if (age < 18) {
            console.error('  ❌ Registration rejected: Donor must be at least 18 years of age.');
            break;
          }

          console.log('\n  Blood Groups:');
          Object.entries(BLOOD_NAMES).forEach(([k, v]) => console.log(`   ${k}. ${v}`));
          const bloodStr = await rl.question('  Select Blood Group Code [1-8]: ');
          const bloodType = parseInt(bloodStr.trim() || '1', 10);

          console.log('\n  Organ Pledges Bitmask:');
          console.log('   1: Kidney | 2: Liver | 4: Heart | 8: Lungs | 16: Pancreas | 32: Cornea');
          const pledgeStr = await rl.question('  Enter Organ Pledge Mask (e.g., 7 for Kidney+Liver+Heart): ');
          const organPledgeMask = parseInt(pledgeStr.trim() || '1', 10);

          const clearanceSeed = await rl.question('  Enter Hospital Clearance Signature / Seed: ');

          const secretKeyBytes = new Uint8Array(createHash('sha256').update(secretId).digest());
          const clearanceBytes = new Uint8Array(createHash('sha256').update(clearanceSeed).digest());
          const commitmentHash = computeCommitmentHash(secretId, age, bloodType, clearanceSeed);

          console.log('\n  🔒 Private Witness Data (NOT exposed to blockchain):');
          console.log(`     Secret Identity: [PROTECTED BY ZK PROOF]`);
          console.log(`     Exact Age:       ${age} (Only proving >= 18)`);
          console.log(`     Blood Code:      ${bloodType} (${BLOOD_NAMES[bloodType] || 'Unknown'})`);
          console.log('\n  🌐 Public Ledger Disclosure:');
          console.log(`     Public Commitment: 0x${Buffer.from(commitmentHash).toString('hex')}`);

          console.log('\n  Generating ZK Proof & submitting transaction (30-60s)...');
          try {
            // Update private state witnesses before calling circuit
            await providers.privateStateProvider.set(PRIVATE_STATE_ID, {
              secretDonorKey: secretKeyBytes,
              secretDonorAge: age,
              secretBloodType: bloodType,
              secretOrganPledge: organPledgeMask,
              secretClearanceHash: clearanceBytes,
            });

            const tx = await deployed.callTx.registerDonor(commitmentHash);
            console.log(`\n  ✅ Registration Successful!`);
            console.log(`  Transaction ID: ${tx.public.txId}`);
            console.log(`  Block Height:   ${tx.public.blockHeight}`);
            console.log(`  Disclosed Commitment: 0x${Buffer.from(tx.public.result || commitmentHash).toString('hex')}\n`);
          } catch (err: any) {
            console.error('\n  ❌ Registration Failed:', err?.message || err);
          }
          break;
        }

        case '2': {
          console.log('\n─── Public Anonymous Ledger Query ──────────────────────────────');
          try {
            const contractState = await providers.publicDataProvider.queryContractState(deployment.address);
            if (contractState) {
              const ledger = OrganDonorModule.ledger(contractState.data);
              console.log(`\n  📊 Total Registered Donors: ${ledger.totalDonors}`);
              console.log('\n  🩸 Anonymous Blood Supply Distribution:');
              for (let b = 1; b <= 8; b++) {
                const count = ledger.bloodGroupCounts.has(b) ? ledger.bloodGroupCounts.get(b) : 0;
                console.log(`     ${BLOOD_NAMES[b] || `Type ${b}`}: ${count}`);
              }
              console.log('\n');
            } else {
              console.log('\n  📋 Contract ledger state empty or not indexed yet.\n');
            }
          } catch (err: any) {
            console.error('\n  ❌ Ledger query failed:', err?.message || err);
          }
          break;
        }

        case '3': {
          console.log('\n─── Private Eligibility Verification ───────────────────────────');
          const secretId = await rl.question('  Enter secret Donor ID / Passphrase: ');
          const ageStr = await rl.question('  Enter Age: ');
          const age = parseInt(ageStr.trim() || '25', 10);
          const bloodStr = await rl.question('  Enter Blood Group Code [1-8]: ');
          const bloodType = parseInt(bloodStr.trim() || '1', 10);
          const clearanceSeed = await rl.question('  Enter Hospital Clearance Signature / Seed: ');

          const secretKeyBytes = new Uint8Array(createHash('sha256').update(secretId).digest());
          const clearanceBytes = new Uint8Array(createHash('sha256').update(clearanceSeed).digest());
          const commitmentHash = computeCommitmentHash(secretId, age, bloodType, clearanceSeed);

          console.log('\n  Verifying ZK proof for commitment 0x' + Buffer.from(commitmentHash).toString('hex') + '...');
          try {
            await providers.privateStateProvider.set(PRIVATE_STATE_ID, {
              secretDonorKey: secretKeyBytes,
              secretDonorAge: age,
              secretBloodType: bloodType,
              secretOrganPledge: 1,
              secretClearanceHash: clearanceBytes,
            });

            const tx = await deployed.callTx.verifyEligibility(commitmentHash);
            console.log(`\n  ✅ Verification Result: ${tx.public.result ? 'ELIGIBLE & REGISTERED' : 'INELIGIBLE / UNREGISTERED'}\n`);
          } catch (err: any) {
            console.error('\n  ❌ Verification error:', err?.message || err);
          }
          break;
        }

        case '4': {
          console.log('\n─── Wallet Balances ────────────────────────────────────────────');
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`  tNIGHT: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST:   ${dustBalance.toLocaleString()}\n`);
          break;
        }

        case '5':
          running = false;
          console.log('\n  👋 Exiting Private Organ Donor Registry CLI.\n');
          break;

        default:
          console.log('\n  ❌ Invalid choice. Please enter a number between 1 and 5.\n');
      }
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (err: any) {
    console.error('\n❌ Fatal CLI Error:', err?.message || err);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
