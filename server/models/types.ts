// server/models/types.ts

export interface WalletAddress {
  address: string;
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum';
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue?: number;
  logo?: string;
}

export interface NFTBalance {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  collection: string;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
  methodId?: string;
  functionName?: string;
  tokenTransfers?: TokenTransfer[];
}

export interface TokenTransfer {
  from: string;
  to: string;
  value: string;
  token: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

export interface WalletAnalysis {
  address: string;
  network: string;
  totalBalance: {
    eth: string;
    usd: number;
  };
  tokenBalances: TokenBalance[];
  nftBalances: NFTBalance[];
  transactionCount: number;
  firstActivity: number;
  lastActivity: number;
  labels: string[];
  riskScore: number;
  activityScore: number;
  diversityScore: number;
  analysis: {
    isContract: boolean;
    isExchange: boolean;
    isDeFiUser: boolean;
    isNFTTrader: boolean;
    suspiciousActivity: boolean;
  };
}

export interface WalletLabel {
  address: string;
  labels: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}