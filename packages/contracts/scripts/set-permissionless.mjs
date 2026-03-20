import { ethers } from "ethers";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "../../agent/.env") });

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
const factory  = new ethers.Contract(
  process.env.MARKET_FACTORY_ADDRESS,
  ["function setPermissionless(bool value) external", "function permissionless() view returns (bool)"],
  deployer
);

console.log("Setting MarketFactory to permissionless…");
const tx = await factory.setPermissionless(true);
await tx.wait();
const val = await factory.permissionless();
console.log("permissionless:", val);
console.log("Done — any address can now create markets.");
