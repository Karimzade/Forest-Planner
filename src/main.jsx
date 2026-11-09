import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./Language";
import Welcome from "./Welcome";
import "./styles.css";
import "./luxury.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <Welcome>
          <App />
        </Welcome>
      </LanguageProvider>
    </HashRouter>
  </StrictMode>,
);
