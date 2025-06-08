// MAIN ENTRY POINT FOR REACT APPLICATION
// This file is responsible for rendering the main App component into the root element of the HTML.
// It imports React, ReactDOM, the App component, and the main styles.
// It also includes the main.scss stylesheet for global styles.
import React from 'react'
import ReactDom from 'react-dom/client' 
import App from './App'
import './styles/main.scss'

// Render the App component into the root element
// This is the entry point for the React application.
// It uses ReactDOM.createRoot for better performance and concurrent features in React 18+.
ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
