/**
 * Deploy AgentPassportRegistry and register the NeuronFi agent.
 *
 * Usage:
 *   npx tsx scripts/deploy-passport.ts
 */
import { ethers, ContractFactory, type InterfaceAbi } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import { config as loadEnv } from "dotenv";

loadEnv();

interface Artifact { abi: InterfaceAbi; bytecode: string; }

function artifact(name: string): Artifact {
  const p = join(process.cwd(), "artifacts", "contracts", `${name}.sol`, `${name}.json`);
  return JSON.parse(readFileSync(p, "utf8")) as Artifact;
}

async function main() {
  const rpcUrl     = process.env["KITE_RPC_URL"]!;
  const deployKey  = (process.env["DEPLOYER_PRIVATE_KEY"] ?? process.env["AGENT_PRIVATE_KEY"])!;
  const agentKey   = process.env["AGENT_PRIVATE_KEY"];

  const provider  = new ethers.JsonRpcProvider(rpcUrl);
  const deployer  = new ethers.Wallet(deployKey, provider);
  const agentAddr = agentKey ? new ethers.Wallet(agentKey).address : deployer.address;

  console.log("Deploying AgentPassportRegistry...");
  const art     = artifact("AgentPassportRegistry");
  const factory = new ContractFactory(art.abi, art.bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const registryAddress = await contract.getAddress();
  console.log("✓ AgentPassportRegistry:", registryAddress);

  // Register NeuronFi agent
  console.log("\nRegistering NeuronFi agent passport...");
  const registry = new ethers.Contract(registryAddress, art.abi, deployer);
  const capabilities = ["trade", "attest", "subscribe", "resolve", "bridge"];
  const tx = await registry.getFunction("register")(
    "NeuronFi Autonomous DeFi Agent",
    capabilities,
    agentAddr,
  ) as ethers.ContractTransactionResponse;
  const receipt = await tx.wait();

  // Parse PassportRegistered event
  const iface = new ethers.Interface([
    "event PassportRegistered(bytes32 indexed passportId, address indexed owner, address indexed agentWallet, string name)",
  ]);
  let passportId = "";
  for (const log of receipt!.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "PassportRegistered") {
        passportId = parsed.args[0] as string;
        break;
      }
    } catch { /* skip */ }
  }

  console.log("✓ Agent registered");
  console.log("  Passport ID:", passportId);
  console.log("  Owner:      ", deployer.address);
  console.log("  Agent wallet:", agentAddr);
  console.log("  Capabilities:", capabilities.join(", "));

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add to your .env:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`KITE_AGENT_PASSPORT_ADDRESS=${registryAddress}`);
  console.log(`KITE_AGENT_PASSPORT_ID=${passportId}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(e => { console.error("✗", (e as Error).message); process.exit(1); });
