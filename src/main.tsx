import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { EmbedHero } from "@/embed/EmbedHero";
import "@/styles/global.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

/** ?embed=hero renders only the cable scene, for embedding elsewhere */
const embed = new URLSearchParams(window.location.search).get("embed") === "hero";

createRoot(container).render(
  <StrictMode>{embed ? <EmbedHero /> : <App />}</StrictMode>,
);
