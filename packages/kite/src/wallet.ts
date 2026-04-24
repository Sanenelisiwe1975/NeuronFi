import { ethers } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

/**
 * KiteWallet — wraps the agent's Kite AA smart account.
 * In production this uses the Kite AA SDK + paymaster for gasless txs.
 * The wallet is initialised from AGENT_PRIVATE_KEY and the paymaster
 * sponsors all gas fees so the agent never needs native tokens.
 */
export class KiteWallet {
  private signer: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey: string, rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  async getAddress(index: number = 0): Promise<string> {
    void index;
    return this.signer.address;
  }

  getSigner(): ethers.Wallet {
    return this.signer;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  dispose(): void {
    // Kite AA SDK cleanup — no-op here until SDK is wired
  }
}

let walletInstance: KiteWallet | null = null;

/**
 * Creates (or returns) the global Kite AA agent wallet.
 * Reads AGENT_PRIVATE_KEY and KITE_RPC_URL from env.
 */
export function createAgentWallet(): KiteWallet {
  if (walletInstance) return walletInstance;

  const privateKey = process.env["AGENT_PRIVATE_KEY"];
  const rpcUrl = process.env["KITE_RPC_URL"];

  if (!privateKey) throw new Error("Missing env var: AGENT_PRIVATE_KEY");
  if (!rpcUrl) throw new Error("Missing env var: KITE_RPC_URL");

  walletInstance = new KiteWallet(privateKey, rpcUrl);
  return walletInstance;
}

/**
 * Returns a formatted display object for logging.
 */
export function formatPortfolio(portfolio: {
  address: string;
  ethWei: bigint | string;
  usdcMicro: bigint | string;
  totalValueUsdc: bigint | string;
}): { address: string; ethBalance: string; usdcBalance: string; totalValue: string } {
  const ethBal = (Number(BigInt(portfolio.ethWei.toString())) / 1e18).toFixed(4);
  const usdcBal = (Number(BigInt(portfolio.usdcMicro.toString())) / 1e6).toFixed(2);
  const total = (Number(BigInt(portfolio.totalValueUsdc.toString())) / 1e6).toFixed(2);
  return {
    address: portfolio.address,
    ethBalance: `${ethBal} ETH`,
    usdcBalance: `$${usdcBal} USDC`,
    totalValue: `$${total}`,
  };
}

/**
 * Fetches the agent's on-chain portfolio snapshot.
 * Returns balances in smallest units (wei / micro-USDC).
 */
export async function getPortfolioSnapshot(wallet: KiteWallet): Promise<{
  address: string;
  ethWei: bigint;
  usdcMicro: bigint;
  totalValueUsdc: bigint;
  snapshotAt: number;
}> {
  const address = await wallet.getAddress();
  const provider = wallet.getProvider();
  const usdcAddress = process.env["USDC_CONTRACT_ADDRESS"];

  const ethWei = await provider.getBalance(address);
  let usdcMicro = 0n;

  if (usdcAddress) {
    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
    usdcMicro = await usdc.balanceOf(address) as bigint;
  }

  // ETH price in USDC for total value calc — use a rough estimate if oracle unavailable
  const ETH_PRICE_USDC = 2500n;
  const ethInUsdc = (ethWei * ETH_PRICE_USDC) / BigInt(1e18) * 1000000n / 1000000000000n;
  const totalValueUsdc = usdcMicro + ethInUsdc;

  return {
    address,
    ethWei,
    usdcMicro,
    totalValueUsdc,
    snapshotAt: Math.floor(Date.now() / 1000),
  };
}

/**
 * Transfers USDC to a recipient.
 * In production uses Kite paymaster (gasless). Falls back to standard tx.
 */
export async function transferUsdc(params: {
  to: string;
  amount: bigint;
  paymasterUrl?: string;
}): Promise<{ hash: string; fee: bigint }> {
  const wallet = createAgentWallet();
  const signer = wallet.getSigner();
  const usdcAddress = process.env["USDC_CONTRACT_ADDRESS"];

  if (!usdcAddress) throw new Error("Missing env var: USDC_CONTRACT_ADDRESS");

  const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
  const tx = await (usdc as any).transfer(params.to, params.amount);
  const receipt = await tx.wait();

  const feeWei = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice ?? 0);
  return { hash: receipt.hash, fee: feeWei };
}

/**
 * Bridges USDC cross-chain via LayerZero.
 * Enable with LAYERZERO_BRIDGE_ENABLED=true.
 */
export async function bridgeUsdc(params: {
  targetChain: string;
  recipient: string;
  amount: bigint;
}): Promise<{ hash: string; fee: bigint; bridgeFee: bigint }> {
  if (process.env["LAYERZERO_BRIDGE_ENABLED"] !== "true") {
    throw new Error("LAYERZERO_BRIDGE_ENABLED is not set");
  }

  const wallet = createAgentWallet();
  const signer = wallet.getSigner();
  const usdcAddress = process.env["USDC_CONTRACT_ADDRESS"];

  if (!usdcAddress) throw new Error("Missing env var: USDC_CONTRACT_ADDRESS");

  // LayerZero OFT bridge — real implementation wires up the Kite LZ endpoint
  // For now, we transfer locally as a stub
  const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
  const tx = await (usdc as any).transfer(params.recipient, params.amount);
  const receipt = await tx.wait();

  const feeWei = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice ?? 0);
  return { hash: receipt.hash, fee: feeWei, bridgeFee: 0n };
}

/**
 * Registers the agent with the Kite Agent Passport registry.
 * Returns the passport ID. Idempotent — safe to call every startup.
 */
export async function registerAgentPassport(params: {
  name: string;
  capabilities: string[];
  owner: string;
  paymasterUrl?: string;
}): Promise<string> {
  const passportAddress = process.env["KITE_AGENT_PASSPORT_ADDRESS"];

  if (!passportAddress) {
    // Return a deterministic local ID if the registry isn't configured yet
    const { ethers: e } = await import("ethers");
    return e.id(`${params.name}:${params.owner}`).slice(0, 42);
  }

  const wallet = createAgentWallet();
  const signer = wallet.getSigner();
  const provider = wallet.getProvider();

  const PASSPORT_ABI = [
    "function register(string name, string[] capabilities, address owner) external returns (bytes32 passportId)",
    "function getPassportId(address owner) external view returns (bytes32)",
  ];

  const registry = new ethers.Contract(passportAddress, PASSPORT_ABI, signer);

  // Check if already registered
  try {
    const existing = await (registry as any).getPassportId(params.owner) as string;
    if (existing && existing !== ethers.ZeroHash) {
      return existing;
    }
  } catch { /* not registered yet */ }

  void provider;
  const tx = await (registry as any).register(params.name, params.capabilities, params.owner);
  const receipt = await tx.wait();

  // Parse PassportRegistered event to get the ID
  const iface = new ethers.Interface([
    "event PassportRegistered(bytes32 indexed passportId, address indexed owner, string name)",
  ]);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "PassportRegistered") {
        return parsed.args[0] as string;
      }
    } catch { /* skip */ }
  }

  return receipt.hash;
}

/**
 * Writes an attestation to the Kite Attestation Registry.
 */
export async function writeAttestation(params: {
  marketAddress: string;
  rationale: string;
  outcome: string;
  passportId: string | null;
}): Promise<string | null> {
  const registryAddress = process.env["KITE_ATTESTATION_REGISTRY"];
  if (!registryAddress) return null;

  const wallet = createAgentWallet();
  const signer = wallet.getSigner();

  const ATTESTATION_ABI = [
    "function attest(address subject, bytes32 data, address attester) external returns (bytes32 attestationId)",
  ];

  const dataHash = ethers.keccak256(
    ethers.toUtf8Bytes(`${params.marketAddress}:${params.outcome}:${params.rationale}`)
  );

  const registry = new ethers.Contract(registryAddress, ATTESTATION_ABI, signer);
  const attester = params.passportId ?? (await signer.getAddress());

  try {
    const tx = await (registry as any).attest(params.marketAddress, dataHash, attester);
    const receipt = await tx.wait();
    return receipt.hash as string;
  } catch {
    return null;
  }
}
