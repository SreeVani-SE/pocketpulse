
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { HashRouter } from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

console.log("MAIN.JSX LOADED");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <HashRouter>

          <App />
       </HashRouter>

      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
