// BACKEND SERVER SETUP
// Simple Express server setup for an API with basic security and logging.
// Express is the main web server framework.  Handles HTTP requests and routing.
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // For resolving __dirname in ES modules
import helmet from 'helmet'; // Adds security headers to HTTP responses to protect against common vulnerabilities
import cors from 'cors'; // Allows frontend to talk to backend
import morgan from 'morgan'; // Logs HTTP requests for debugging and monitoring
import dotenv from 'dotenv'; // Loads environment variables from a .env file

// SETUP
dotenv.config(); // Load environment variables from .env file


const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Gets current directory path of this module (needed for serving static files)
const app = express(); // Creates Express web server instance

// Security middleware
app.use(helmet()); // Adds security headers to HTTP responses
app.use(cors()); // Lets frontend make requests to backend API
app.use(morgan('dev')); // Logs each request to the console for debugging

// API test route
// Creates test API endpoint at /api/test to check if server is running
// If you visit http://localhost:3000/api/test, you get a JSON response confirming the API is connected
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ status: 'API connected' });
});

// Catch-all API 404 handler 
// If an API endpoint is requested that doesn't exist, return a 404 error
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend in production
// when app is deployed, this serves your built frontend files from the 'dist' directory
// any route not starting with /api will return the index.html file for React router
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Catch-all for non-API routes in development (optional, for clarity)
// In development, if a route is requested that doesn't match an API or static file,
// return a 404 error instead of serving the React app
// This helps avoid confusion if the frontend is not set up to handle all routes
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.status(404).send('Not found');
  });
}

// Start the server
// Starts your server on the port from .env or defaults to 3000
// Logs the server status to the console for monitoring
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});