import React from "react";
import { createRoot } from "react-dom/client";
import DressingApp from "../DressingApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DressingApp />
  </React.StrictMode>,
);
