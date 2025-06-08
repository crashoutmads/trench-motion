// Simple Express server setup for an API with security and logging middleware.
// Express is the main web server framework. Handles HTTP requests and routing.
import React, { useEffect, useState } from 'react'; // React for UI components
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // React Router for routing
import './styles/main.scss'; // Main styles for the app
import NetworkGraph from './visualizations/NetworkGraph'; // Network graph visualization component

// Interfaces and Types
// Define the expected structure of the API response for testing connection
// This is a simple response with a status message to confirm API connectivity.
// You can expand this as needed based on your API's actual response structure.
interface ApiResponse {
  status: string;
}
type ApiError = string | null; // Used for error messages from API calls

// HOME COMPONENT
// This is the main component for the home page of the application.
// On load it fetches data from the API and updates the state accordingly.
// If successful, it shows the API response and a network graph of transactions.
// Shows loading, error, or success UI
const Home: React.FC = () => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null); // Holds the API response data
  const [loading, setLoading] = useState<boolean>(true); // Loading state for API call
  const [error, setError] = useState<ApiError>(null); // Error state for API call
  const [transactions, setTransactions] = useState([]); // Holds transaction data for the network graph

  // Effect to test API connection and fetch transactions
  // This runs once on component mount to check if the API is reachable and fetch transactions.
  // It updates the state with the API response or any errors encountered.
  // It also fetches transactions for the network graph visualization.
  // If the API is unreachable or returns an error, it sets the error state.
  // If successful, it sets the API data and fetches transactions for visualization.
  // This is a good place to handle any initial data fetching or setup needed for the app.
  // Note: In a real application, you would likely want to handle retries or more complex error handling.
  // You might also want to abstract the API calls into a separate service for better organization.
  // This effect will run once when the component mounts.
  useEffect(() => {
    const testApiConnection = async (): Promise<void> => {
      try {
        const response = await fetch('/api/test');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: ApiResponse = await response.json();
        setApiData(data);
        setError(null);
        
        // Fetch real transactions here
        const txResponse = await fetch('/api/wallet/0x123.../transactions'); // Replace with a valid address
        const txData = await txResponse.json(); // Adjust based on your API response structure
        setTransactions(txData.transactions || []); // Ensure transactions is an array
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    // Call the API test function to check connection and fetch transactions
    testApiConnection();
  }, []);

  // Render the home component UI
  // This includes a loading state, error message, or success message with API data and network graph.
  // If loading, show a loading message.
  // If there's an error, show the error message.
  // If successful, show the API data and the network graph visualization.
  // The network graph component will visualize the transactions fetched from the API.
  return (
    <div className="app-container">
      <h1>Trench Excavator</h1>
      
      <div className="api-test-section">
        {loading ? (
          <p>Testing API connection...</p>
        ) : error ? (
          <p className="error">API Error: {error}</p>
        ) : (
          <>
            <div className="success">
              <p>API Connected Successfully!</p>
              <pre>{JSON.stringify(apiData, null, 2)}</pre>
            </div>
            <div className="network-graph-container">
              <h2>Transaction Network</h2>
              <NetworkGraph transactions={transactions} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
// END HOME COMPONENT
// About Component
// This is a simple about page for the application.
// It provides information about the application and its purpose.
// You can expand this with more details, links, or any other relevant information.
const About: React.FC = () => (
  <div>
    <h1>About Trench Motion</h1>
    <p>This is the about page.</p>
  </div>
);

// APP COMPONENT
// This is the main application component that sets up routing for the app.
// It uses React Router to define routes for the home page and about page.
// It also handles 404 errors for any unmatched routes.
// The App component wraps the entire application in a BrowserRouter to enable routing.
// It defines the routes for the home and about pages.
// You can add more routes as needed for your application.
// The 404 route is a catch-all for any unmatched routes, providing a simple error message.
const App: React.FC = () => {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
      { /* Add more routes as needed */ }
    </Routes>
  </BrowserRouter>
  );
};
// END APP COMPONENT
// Export the App component for use in index.tsx
// This is the entry point for the application.
// It is imported and rendered in the main index.tsx file.
// This allows the App component to be used as the root component for the React application.
export default App;