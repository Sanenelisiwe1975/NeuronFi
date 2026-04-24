import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const DEPLOYER_KEY = process.env["DEPLOYER_PRIVATE_KEY"] ?? "0x" + "0".repeat(64);
const KITE_RPC_URL = process.env["KITE_RPC_URL"] ?? "https://rpc-testnet.gokite.ai/";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    kite: {
      url: KITE_RPC_URL,
      chainId: 2368,
      accounts: [DEPLOYER_KEY],
      gasPrice: "auto",
    },
    hardhat: {
      forking: {
        url: KITE_RPC_URL,
        enabled: process.env["FORK"] === "true",
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
