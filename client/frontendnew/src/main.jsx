import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import "../css/variables.css";
import "../css/reset.css";
import "../css/global.css";
import "../css/components.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/forms.css";
import "../css/pages.css";
import "../css/responsive.css";
import "../css/home.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
);
