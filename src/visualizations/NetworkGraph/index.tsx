// INDEX FILE FOR NETWORK GRAPH VISUALIZATION
// This file sets up a D3-based network graph visualization for transaction data.
// It imports React, D3, and the types for the network graph.
// It defines a NetworkGraph component that takes an array of transactions and visualizes them as nodes and links.
import React from 'react'; // For building the React component
import * as d3 from 'd3'; // For D3 visualization library
import { NetworkGraphProps, D3Node, D3Link } from './types'; // For type definitions

// NETWORK GRAPH COMPONENT
// Main Component
// Expects a transactions prop which is an array of transaction objects.
// Each transaction should have a hash, from, to, value, asset, category, blockNumber, direction, and timestamp.
// This component visualizes the transaction network as a graph.
// It creates nodes for each transaction and links for each "to" address.
// The graph is rendered in an SVG element and updates dynamically based on the transactions prop.
// This component is responsible for rendering a network graph visualization of Ethereum transactions.
// It uses D3.js to create a force-directed graph that represents the relationships between transactions.
const NetworkGraph: React.FC<NetworkGraphProps> = ({ transactions = [] }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  // DRAWING THE GRAPH WITH D3
  // This effect runs whenever the transactions prop changes.
  // If no transactions are provided, it does nothing.
  // Clears the SVG before rendering to avoid overlaps and visual artifacts.
  React.useEffect(() => {
    if (!transactions.length || !svgRef.current) return;

  // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // PREPARE NODES AND LINKS
    // nodes: Each transaction becomes a node.
    // links: Each transaction with a "to" address creates a link to that address.
    const nodes: D3Node[] = transactions.map(t => ({ id: t.hash, group: 1 }));
    const links: D3Link[] = transactions
      .filter(t => t.to)
      .map(t => ({ source: t.hash, target: t.to! }));

    // SET UP D3 FORCE SIMULATION
    // Simulation: D3's way of making the graph "springy" and nicely spaced
    // Link: Connects nodes based on your links 
    // Charge: Makes nodes repel eachother to avoid overlap
    // Center: Centers the graph in the SVG canvas
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(300, 150));

    // DRAW LINKS AND NODES
    // Draws lines for links and circles for nodes
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5);

    // UPDATE POSITIONS ON EACH SIMULATION TICK
    // every time the simulation updates, we need to reposition the nodes and links
    simulation.on('tick', () => {
      link
        .attr('x1', d => (typeof d.source === 'string' ? 0 : d.source.x ?? 0))
        .attr('y1', d => (typeof d.source === 'string' ? 0 : d.source.y ?? 0))
        .attr('x2', d => (typeof d.target === 'string' ? 0 : d.target.x ?? 0))
        .attr('y2', d => (typeof d.target === 'string' ? 0 : d.target.y ?? 0));

      node
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0);
    });

    // CLEANUP
    // Stops the simulation if the component unmounts or transactions change
    return () => {
      simulation.stop();
    };
  }, [transactions]); // <-- Correct placement

  // RENDERING THE SVG
  // Renders the SVG element where D3 draws the graph
  return (
    <svg 
      ref={svgRef} 
      width="600" 
      height="300"
      style={{ border: '1px solid #ccc' }}
    />
  );
};
// END NETWORK GRAPH COMPONENT
export default NetworkGraph;