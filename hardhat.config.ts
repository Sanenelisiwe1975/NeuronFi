import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const DEPLOYER_KEY = `0x${(
  process.env["DEPLOYER_PRIVATE_KEY"] ??
  process.env["AGENT_PRIVATE_KEY"] ??
  "0".repeat(64)
).replace(/^0x/, "")}`;

export default defineConfig({
  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    },
  },
  paths: {
    sources:   "./contracts",
    artifacts: "./artifacts",
    cache:     "./cache",
  },
  networks: {
    kite_testnet: {
      type:     "http" as const,
      url:      "https://rpc-testnet.gokite.ai/",
      chainId:  2368,
      accounts: [DEPLOYER_KEY],
    },
    kite_mainnet: {
      type:     "http" as const,
      url:      "https://rpc.kite.core",
      chainId:  2370,
      accounts: [DEPLOYER_KEY],
    },
  },
});
