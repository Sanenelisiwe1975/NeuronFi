import { ethers } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dir   = dirname(fileURLToPath(import.meta.url));
const require  = createRequire(import.meta.url);

const envPath = resolve(__dir, "../.env");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const RPC_URL         = envVars["RPC_URL"];
const PRIVATE_KEY     = envVars["DEPLOYER_PRIVATE_KEY"];
const USDT_ADDRESS    = envVars["USDT_CONTRACT_ADDRESS"];
const TREASURY        = envVars["TREASURY_ADDRESS"] ?? "0xF60ab179Fe7ECdc1320b375b7185302ee23c4888";

if (!RPC_URL || !PRIVATE_KEY || !USDT_ADDRESS) {
  console.error("Missing RPC_URL, DEPLOYER_PRIVATE_KEY, or USDT_CONTRACT_ADDRESS in .env");
  process.exit(1);
}

const SUBSCRIPTION_ABI = [
  "constructor(address _owner, address _treasury, address _collateralToken)",
  "function subscribe(uint8 plan) external",
  "function isActive(address account) external view returns (bool)",
  "function activeSubscribers() external view returns (uint256)",
  "function totalRevenue() external view returns (uint256)",
  "function plans(uint8 plan) external view returns (uint256 pricePerPeriod, uint256 period, uint256 gracePeriod, bool active)",
];

const SUBSCRIPTION_BYTECODE = readFileSync(
  resolve(__dir, "../artifacts/contracts/SubscriptionManager.sol/SubscriptionManager.json"),
  "utf8"
);
const { bytecode } = JSON.parse(SUBSCRIPTION_BYTECODE);

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`Deployer: ${wallet.address}\n`);

  console.log("Deploying SubscriptionManager…");
  const factory = new ethers.ContractFactory(SUBSCRIPTION_ABI, bytecode, wallet);
  const contract = await factory.deploy(wallet.address, TREASURY, USDT_ADDRESS);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`✓ SubscriptionManager deployed: ${address}`);
  console.log(`  Owner:    ${wallet.address}`);
  console.log(`  Treasury: ${TREASURY}`);
  console.log(`  Token:    ${USDT_ADDRESS} (USDT)`);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║          SubscriptionManager Deployment Complete        ║
╚══════════════════════════════════════════════════════════╝
SUBSCRIPTION_MANAGER_ADDRESS=${address}

Plans (configured at deploy):
  FREE:          $0 / 30 days
  BASIC:         $29 / 30 days
  PRO:           $99 / 30 days
  INSTITUTIONAL: $499 / 30 days

Add to packages/agent/.env and apps/web/.env.local:
SUBSCRIPTION_MANAGER_ADDRESS=${address}
`);
}

main().catch((e) => { console.error(e); process.exit(1); });
