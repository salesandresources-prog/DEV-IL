import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

createRoot(document).render(
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>
);
