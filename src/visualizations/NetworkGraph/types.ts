// TYPES
// defines TypeScript types for the data used by your network graph
// these types help ensure your graph component receives the correct data shape
// making the code safer and easier to understand

export interface TransactionNode {
  id: string;
  group: number;
  x?: number;
  y?: number;
}
export interface TransactionLink {
  source: string;
  target: string;
}
// The props expected by the NewtworkGraph component
export interface NetworkGraphProps {
  transactions: Transaction [];
}
// A single transaction object 
// (customize as needed)
export interface Transaction {
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
// Node in the D3 graph 
// Needs id and group
export interface D3Node extends TransactionNode {
    vx?: number;
    vy?: number;
    index?: number;
}
// Link in the D3 graph (connects two nodes)
export interface D3Link {
    source: D3Node | string;
    target: D3Node | string;
}