/**
 * Deploy all NeuronFi contracts to Kite testnet.
 *
 * Usage (runs as a plain Node script — no Hardhat runner needed):
 *   npx tsx scripts/deploy.ts
 *
 * Requires in .env:
 *   DEPLOYER_PRIVATE_KEY or AGENT_PRIVATE_KEY
 *   KITE_RPC_URL
 *   USDC_CONTRACT_ADDRESS
 */
import { ethers, ContractFactory, type InterfaceAbi } from "ethers";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config as loadEnv } from "dotenv";

loadEnv();

// ── Types ──────────────────────────────────────────────────────────────────
interface Artifact {
  abi: InterfaceAbi;
  bytecode: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function artifact(name: string): Artifact {
  const path = join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`);
  if (!existsSync(path)) throw new Error(`Artifact not found: ${path}\nRun: npx hardhat compile`);
  return JSON.parse(readFileSync(path, "utf8")) as Artifact;
}

async function deploy(
  factory: ContractFactory,
  args: unknown[],
  label: string,
): Promise<{ address: string; contract: ethers.BaseContract }> {
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`     ✓ ${label}: ${address}`);
  return { address, contract };
}

async function send(
  contract: ethers.BaseContract,
  method: string,
  args: unknown[],
) {
  const fn = contract.getFunction(method);
  const tx = await fn(...args) as ethers.ContractTransactionResponse;
  await tx.wait();
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const rpcUrl = process.env["KITE_RPC_URL"];
  if (!rpcUrl) throw new Error("KITE_RPC_URL not set");

  const deployerKey = (
    process.env["DEPLOYER_PRIVATE_KEY"] ??
    process.env["AGENT_PRIVATE_KEY"]
  );
  if (!deployerKey) throw new Error("DEPLOYER_PRIVATE_KEY or AGENT_PRIVATE_KEY not set");

  const usdcAddress = process.env["USDC_CONTRACT_ADDRESS"];
  if (!usdcAddress) throw new Error("USDC_CONTRACT_ADDRESS not set");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(deployerKey, provider);
  const balance  = await provider.getBalance(deployer.address);
  const network  = await provider.getNetwork();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("NeuronFi — Contract Deployment");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deployer:", deployer.address);
  console.log("Balance: ", ethers.formatEther(balance), "ETH");
  console.log("Chain ID:", network.chainId.toString());
  console.log("RPC:     ", rpcUrl);
  console.log("USDC:    ", usdcAddress, "\n");

  const treasury = deployer.address;
  const agentKey = process.env["AGENT_PRIVATE_KEY"];
  const agentAddr = agentKey
    ? new ethers.Wallet(agentKey).address
    : deployer.address;

  // 1. KiteAttestationRegistry
  console.log("1/6  KiteAttestationRegistry...");
  const regArt = artifact("KiteAttestationRegistry");
  const { address: registryAddress, contract: registry } =
    await deploy(new ContractFactory(regArt.abi, regArt.bytecode, deployer), [], "KiteAttestationRegistry");

  // 2. ConditionalPayment
  console.log("2/6  ConditionalPayment...");
  const cpArt = artifact("ConditionalPayment");
  const { address: cpAddress, contract: cp } =
    await deploy(new ContractFactory(cpArt.abi, cpArt.bytecode, deployer), [usdcAddress, treasury], "ConditionalPayment");

  // 3. AgentVault
  console.log("3/6  AgentVault...");
  const vaultArt = artifact("AgentVault");
  const { address: vaultAddress } = await deploy(
    new ContractFactory(vaultArt.abi, vaultArt.bytecode, deployer),
    [usdcAddress, agentAddr, 10_000n * 1_000_000n, 50n * 1_000_000n, 500n * 1_000_000n],
    "AgentVault",
  );
  console.log("     Agent wallet:", agentAddr);

  // 4. MarketResolver
  console.log("4/6  MarketResolver...");
  const resolverArt = artifact("MarketResolver");
  const { address: resolverAddress, contract: resolver } =
    await deploy(new ContractFactory(resolverArt.abi, resolverArt.bytecode, deployer), [registryAddress], "MarketResolver");

  await send(resolver, "setAgent", [agentAddr]);
  await send(registry, "setAgentAuthorization", [resolverAddress, true]);
  console.log("     Agent & resolver authorised ✓");

  // 5. MarketFactory
  console.log("5/6  MarketFactory...");
  const factoryArt = artifact("MarketFactory");
  const { address: factoryAddress, contract: marketFactory } =
    await deploy(new ContractFactory(factoryArt.abi, factoryArt.bytecode, deployer), [usdcAddress, cpAddress, resolverAddress], "MarketFactory");

  await send(marketFactory, "setAgent", [agentAddr]);
  console.log("     Agent authorised ✓");

  // 6. SubscriptionManager
  console.log("6/6  SubscriptionManager...");
  const smArt = artifact("SubscriptionManager");
  const { address: smAddress } =
    await deploy(new ContractFactory(smArt.abi, smArt.bytecode, deployer), [usdcAddress, treasury], "SubscriptionManager");

  // Wire ConditionalPayment → resolver
  await send(cp, "setResolver", [resolverAddress]);
  console.log("\nConditionalPayment → resolver wired ✓");

  // ── Print env block ──────────────────────────────────────────────────────
  const envBlock = `
KITE_ATTESTATION_REGISTRY=${registryAddress}
AGENT_VAULT_ADDRESS=${vaultAddress}
MARKET_FACTORY_ADDRESS=${factoryAddress}
MARKET_RESOLVER_ADDRESS=${resolverAddress}
CONDITIONAL_PAYMENT_ADDRESS=${cpAddress}
SUBSCRIPTION_MANAGER_ADDRESS=${smAddress}
TREASURY_ADDRESS=${treasury}
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=${smAddress}`;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Paste these into your .env:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(envBlock);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✓ All contracts deployed!\n");
}

main().catch(err => {
  console.error("✗ Deployment failed:", (err as Error).message ?? err);
  process.exit(1);
});
