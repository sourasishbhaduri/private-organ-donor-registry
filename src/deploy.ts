/**
 * Deploy private-organ-donor-registry contract to a Midnight network (undeployed by default; use --network preview|preprod for public networks).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

// Midnight SDK imports
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

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

async function waitForProofServer(url: string = networkConfig.proofServer, timeoutMs = 30_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' }).catch(() => null);
      if (res) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
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
  console.log('\n─── Private Organ Donor Registry Deploy ─────────────────────────────────\n');
  console.log(`  Network: ${network}`);
  console.log(`  Indexer: ${networkConfig.indexer}`);
  console.log(`  Node:    ${networkConfig.node}`);
  console.log(`  Proof:   ${networkConfig.proofServer}\n`);

  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Compiled contract missing. Please run `npm run compile` first.');
    process.exit(1);
  }

  const OrganDonorModule = await import(pathToFileURL(contractPath).href);
  const compiledContract: any = (CompiledContract as any).make('organ-donor-registry', OrganDonorModule.Contract).pipe(
    (CompiledContract as any).withWitnesses(witnesses),
    (CompiledContract as any).withCompiledFileAssets(zkConfigPath),
  );

  console.log('─── Wallet Initialization ───────────────────────────────────────\n');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  const address = walletCtx.unshieldedKeystore.getBech32Address();
  console.log(`  Address: ${address}\n`);

  console.log('─── Syncing Wallet ──────────────────────────────────────────────\n');
  const syncStart = Date.now();
  const syncInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    process.stdout.write(`\r  ⏳ Syncing... (${elapsed}s elapsed)   `);
  }, 5000);
  const initialSyncState = await walletCtx.wallet.waitForSyncedState();
  clearInterval(syncInterval);
  process.stdout.write('\r  ✓ Wallet synced!                                             \n\n');

  const initialBalance = initialSyncState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  tNIGHT balance: ${initialBalance.toLocaleString()}\n`);

  if (initialBalance === 0n && networkConfig.faucet) {
    console.log('  ⚠ Wallet has 0 tNIGHT. Please fund address at faucet:');
    console.log(`     ${networkConfig.faucet}`);
    console.log(`     Address: ${address}\n`);
    console.log('  Waiting for funding...');
    const timeoutMs = 15 * 60_000;
    const start = Date.now();
    while (true) {
      await new Promise((r) => setTimeout(r, 10_000));
      const s = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((x) => x.isSynced)));
      const tn = s.unshielded.balances[unshieldedToken().raw] ?? 0n;
      if (tn > 0n) {
        console.log(`\n  Funded! tNIGHT balance: ${tn.toLocaleString()}\n`);
        break;
      }
      if (Date.now() - start > timeoutMs) {
        console.log(`\n  ❌ Funding timeout on network ${network}. Saved wallet state.`);
        await walletCtx.wallet.stop();
        process.exit(1);
      }
    }
  }

  console.log('─── DUST Setup ──────────────────────────────────────────────────\n');
  const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const unregisteredUtxos = dustState.unshielded.availableCoins.filter(
    (c: any) => !c.meta?.registeredForDustGeneration,
  );
  if (unregisteredUtxos.length > 0) {
    console.log(`  Registering ${unregisteredUtxos.length} NIGHT UTXOs for DUST generation...`);
    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      walletCtx.unshieldedKeystore.getPublicKey(),
      (payload) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);
  }

  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('  Waiting for DUST tokens...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('  DUST tokens ready!\n');

  console.log('─── Deploying Contract ──────────────────────────────────────────\n');
  const proofServerReady = await waitForProofServer();
  if (!proofServerReady) {
    console.log('\n  ❌ Proof server unreachable. Ensure proof server docker container is running.\n');
    await walletCtx.wallet.stop();
    process.exit(1);
  }

  const providers = await createProviders(walletCtx);
  await new Promise((r) => setTimeout(r, 6000));

  const MAX_RETRIES = 20;
  const RETRY_DELAY_MS = 5000;
  let deployed: Awaited<ReturnType<typeof deployContract>> | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      deployed = await deployContract(providers, {
        compiledContract: compiledContract as any,
        args: [],
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState,
      });
      break;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || '';
      console.error(`  Attempt ${attempt} error: ${errMsg}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw err;
      }
    }
  }

  if (!deployed) throw new Error('Deployment failed');

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('  ✅ Private Organ Donor Registry deployed successfully!\n');
  console.log(`  Contract Address: ${contractAddress}\n`);

  recordDeployment(network, contractAddress, address.toString());
  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  console.log('─── Deployment Complete ────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
