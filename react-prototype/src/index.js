import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { MoralisProvider } from "react-moralis";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MoralisProvider
      serverUrl="https://tnetks9a81s5.usemoralis.com:2053/server"
      appId="jVerbvE0WJtBWDeK8TVmIKZM58Tt8FT7rtKfuJFF"
    >
      <App />
    </MoralisProvider>
  </React.StrictMode>
);
