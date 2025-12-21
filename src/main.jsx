// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
// App component is at src/App.jsx in your project — import from the correct path:
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
