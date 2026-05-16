import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const RPC_URL     = process.env["KITE_RPC_URL"]        ?? "https://rpc-testnet.gokite.ai/";
const PRIVATE_KEY = process.env["DEPLOYER_PRIVATE_KEY"] ?? "";
const MINT_TO     = process.env["TREASURY_ADDRESS"]     ?? "";
// Mint 1,000,000 USDC (6 decimals)
const MINT_AMOUNT = 1_000_000n * 1_000_000n;

async function main() {
  if (!PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY not set");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer   = new ethers.Wallet(PRIVATE_KEY.trim(), provider);
  const address  = await signer.getAddress();

  const balance = await provider.getBalance(address);
  console.log(`Deployer: ${address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log(`RPC:      ${RPC_URL}`);
  console.log();

  // Load compiled artifact (Hardhat puts it here after compile)
  const artifactPath = path.join(
    process.cwd(), "artifacts", "contracts", "MockUSDC.sol", "MockUSDC.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Artifact not found at ${artifactPath}.\nRun: npx hardhat compile`
    );
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8")) as {
    abi: unknown[];
    bytecode: string;
  };

  console.log("Deploying MockUSDC…");
  const factory  = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✓ MockUSDC deployed: ${contractAddress}`);
  console.log(`  Explorer: https://testnet.kitescan.ai/address/${contractAddress}`);

  const mintTarget = MINT_TO || address;
  console.log(`\nMinting 1,000,000 USDC to ${mintTarget}…`);
  const tx = await (contract as any).mint(mintTarget, MINT_AMOUNT);
  await tx.wait();
  console.log(`✓ Minted. TX: ${tx.hash}`);

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Add to your .env files:`);
  console.log(`USDC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${contractAddress}`);
  console.log(`─────────────────────────────────────────`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
