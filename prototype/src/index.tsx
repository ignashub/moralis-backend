import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MoralisProvider } from "react-moralis";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MoralisProvider serverUrl="https://57d0tnsw7vwx.usemoralis.com:2053/server" appId="SOBedjSTVTz5eiaJFRj1DsHUpE9bfbpyUCpZO2ZW">
      <App />
    </MoralisProvider>
  </React.StrictMode>
);
