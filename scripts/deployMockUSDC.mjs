import { ethers } from "ethers";
import solc from "solc";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

config();

const __dir    = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dir, "..");
const SOL_PATH = join(ROOT, "contracts", "MockUSDC.sol");

const RPC_URL     = process.env.KITE_RPC_URL        ?? "https://rpc-testnet.gokite.ai/";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const MINT_TO     = process.env.TREASURY_ADDRESS     ?? "";
const MINT_AMOUNT = 1_000_000n * 1_000_000n; // 1,000,000 USDC (6 decimals)

function compile(source) {
  const input = {
    language: "Solidity",
    sources: { "MockUSDC.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors?.some(e => e.severity === "error")) {
    output.errors.filter(e => e.severity === "error").forEach(e => console.error(e.formattedMessage));
    throw new Error("Compilation failed");
  }

  const contract = output.contracts["MockUSDC.sol"]["MockUSDC"];
  return { abi: contract.abi, bytecode: "0x" + contract.evm.bytecode.object };
}

async function main() {
  if (!PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set in .env");

  const source   = readFileSync(SOL_PATH, "utf8");
  console.log("Compiling MockUSDC.sol…");
  const { abi, bytecode } = compile(source);
  console.log("✓ Compiled");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer   = new ethers.Wallet(PRIVATE_KEY.trim(), provider);
  const address  = signer.address;
  const balance  = await provider.getBalance(address);

  console.log(`\nDeployer: ${address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log(`Network:  Kite testnet (chain 2368)`);

  if (balance === 0n) throw new Error("Deployer has no ETH — fund it first");

  console.log("\nDeploying MockUSDC…");
  const factory  = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✓ MockUSDC deployed: ${contractAddress}`);
  console.log(`  Explorer: https://testnet.kitescan.ai/address/${contractAddress}`);

  const mintTarget = MINT_TO || address;
  console.log(`\nMinting 1,000,000 USDC to ${mintTarget}…`);
  const tx = await contract.mint(mintTarget, MINT_AMOUNT);
  await tx.wait();
  console.log(`✓ Minted. TX: ${tx.hash}`);
  console.log(`  Explorer: https://testnet.kitescan.ai/tx/${tx.hash}`);

  console.log(`
─────────────────────────────────────────
Add to your .env files:

USDC_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_USDC_ADDRESS=${contractAddress}
─────────────────────────────────────────`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
