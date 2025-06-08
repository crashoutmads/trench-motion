import { Alchemy, Network, AssetTransfersCategory } from 'alchemy-sdk';

// 1. Configuration
const config = {
  apiKey: process.env.ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};

// 2. Alchemy instance
const alchemy = new Alchemy(config);

// 3. Get wallet balance
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const balance = await alchemy.core.getBalance(address);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch wallet balance');
  }
};

// 4. Get wallet transactions
export const getWalletTransactions = async (
  address: string,
  limit: number = 50
): Promise<any> => {
  try {
    const transfers = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155
      ],
      maxCount: limit
    });
    return transfers;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// 5. Test Alchemy connection
export const testAlchemyConnection = async (): Promise<boolean> => {
  try {
    await alchemy.core.getBlockNumber();
    return true;
  } catch (error) {
    console.error('Alchemy connection test failed:', error);
    return false;
  }
};

// 6. Export everything
export default {
  alchemy,
  getWalletBalance,
  getWalletTransactions,
  testAlchemyConnection
};

// 7. Type definitions
interface AssetTransfersResponse {
  transfers: Array<{
    hash: string;
    from: string;
    to?: string;
    value?: number;
    asset?: string;
    category: string;
    blockNum: string;
  }>;
}