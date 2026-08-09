import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { getRouter } from "./router";

const router = getRouter();

createRoot(document.body).render(
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>
);
