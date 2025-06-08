import express, { Request, Response } from 'express';
import { AssetTransfersCategory } from 'alchemy-sdk';
import alchemyService from '../services/alchemy.ts';

const { alchemy, getWalletBalance, getWalletTransactions } = alchemyService;
const router = express.Router();

// TypeScript interfaces
interface WalletAnalysisResponse {
  success: boolean;
  address: string;
  timestamp: string;
  data: {
    address: string;
    ethBalance: string;
    ethBalanceFormatted: string;
    transactionCount: number;
    tokenCount: number;
    tokens: TokenWithMetadata[];
    recentTransactionCount: number;
    transactions: ProcessedTransaction[];
    riskFactors: {
      highTransactionVolume: boolean;
      manyTokens: boolean;
      recentActivity: boolean;
      highValueTransactions: number;
      uniqueAddresses: number;
      suspiciousPatterns: string[];
    };
  };
}

interface TokenWithMetadata {
  contractAddress: string;
  balance: string;
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

interface ProcessedTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  blockNumber: string;
  direction: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// Validate Ethereum address
const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Wallet analysis endpoint - main feature
router.get('/:address/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    
    if (!address || !isValidAddress(address)) {
      res.status(400).json({
        error: 'Invalid wallet address format',
        message: 'Please provide a valid Ethereum address (0x...)'
      } as ErrorResponse);
      return;
    }

    console.log(`Analyzing wallet: ${address}`);

    // Get comprehensive wallet analysis in parallel
    const [balance, transactionCount, tokenBalances, transactions] = await Promise.all([
      getWalletBalance(address),
      alchemy.core.getTransactionCount(address, 'latest'),
      alchemy.core.getTokenBalances(address),
      alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155
        ],
        maxCount: 50
      })
    ]);

    // Process token balances
    const nonZeroTokens = tokenBalances.tokenBalances.filter(
      token => token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
    );

    // Get token metadata
    const tokensWithMetadata: TokenWithMetadata[] = await Promise.all(
      nonZeroTokens.slice(0, 20).map(async (token) => {
        try {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          return {
            contractAddress: token.contractAddress,
            balance: token.tokenBalance || '0',
            name: metadata.name || null,
            symbol: metadata.symbol || null,
            decimals: metadata.decimals || null,
            logo: metadata.logo || null
          };
        } catch (err) {
          console.error(`Error getting metadata for ${token.contractAddress}:`, err);
          return {
            contractAddress: token.contractAddress,
            balance: token.tokenBalance || '0',
            name: 'Unknown Token',
            symbol: 'UNKNOWN',
            decimals: 18,
            logo: null
          };
        }
      })
    );

    // Process transactions
    const processedTransactions: ProcessedTransaction[] = transactions.transfers.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || null,
      value: tx.value || null,
      asset: tx.asset || null,
      category: tx.category,
      blockNumber: tx.blockNum,
      direction: 'sent',
      timestamp: new Date().toISOString()
    }));

    // Calculate risk factors
    const highValueThreshold = 10; // ETH
    const uniqueAddresses = new Set<string>();
    let highValueTransactions = 0;
    const suspiciousPatterns: string[] = [];

    processedTransactions.forEach(tx => {
      const value = parseFloat(String(tx.value || 0));
      if (value > highValueThreshold) highValueTransactions++;
      uniqueAddresses.add(tx.from);
      if (tx.to) uniqueAddresses.add(tx.to);
    });

    if (highValueTransactions > 5) {
      suspiciousPatterns.push('High frequency of large transactions');
    }
    if (uniqueAddresses.size < processedTransactions.length * 0.3) {
      suspiciousPatterns.push('Limited address diversity');
    }

    const analysis: WalletAnalysisResponse = {
      success: true,
      address,
      timestamp: new Date().toISOString(),
      data: {
        address,
        ethBalance: balance,
        ethBalanceFormatted: (parseFloat(balance) / 1e18).toFixed(6),
        transactionCount,
        tokenCount: nonZeroTokens.length,
        tokens: tokensWithMetadata,
        recentTransactionCount: transactions.transfers.length,
        transactions: processedTransactions,
        riskFactors: {
          highTransactionVolume: transactionCount > 1000,
          manyTokens: nonZeroTokens.length > 50,
          recentActivity: transactions.transfers.length > 0,
          highValueTransactions,
          uniqueAddresses: uniqueAddresses.size,
          suspiciousPatterns
        }
      }
    };

    res.json(analysis);

  } catch (error) {
    console.error('Wallet analysis error:', error);
    handleErrorResponse(error, res);
  }
});

// Error handling utility
const handleErrorResponse = (error: unknown, res: Response): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  if (errorMessage.includes('Invalid API key')) {
    res.status(401).json({ error: 'Invalid API key configuration' } as ErrorResponse);
  } else if (errorMessage.includes('rate limit')) {
    res.status(429).json({ error: 'Rate limit exceeded' } as ErrorResponse);
  } else {
    res.status(500).json({
      error: 'Request failed',
      message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    } as ErrorResponse);
  }
};

// Get wallet balance only
router.get('/:address/balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    
    if (!isValidAddress(address)) {
      res.status(400).json({ error: 'Invalid wallet address format' } as ErrorResponse);
      return;
    }

    const balance = await getWalletBalance(address);
    const ethBalance = parseFloat(balance) / 1e18;
    
    res.json({
      success: true,
      address,
      balance: {
        wei: balance,
        eth: ethBalance.toFixed(6)
      }
    });
  } catch (error) {
    handleErrorResponse(error, res);
  }
});

// Get wallet transactions only
router.get('/:address/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const { limit = '50', page = '1' } = req.query;
    
    if (!isValidAddress(address)) {
      res.status(400).json({ error: 'Invalid wallet address format' } as ErrorResponse);
      return;
    }

    const transactions = await getWalletTransactions(address, parseInt(limit as string));
    
    res.json({
      success: true,
      address,
      transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    handleErrorResponse(error, res);
  }
});

// Health check
router.get('/health', (req: Request, res: Response): void => {
  res.json({
    success: true,
    service: 'Wallet Analysis API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;