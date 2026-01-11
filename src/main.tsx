import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./lib/sentry";
import "./index.css";
import { initSwUpdateMonitor } from "./lib/sw-update";

// Initialize Service Worker update monitoring
// This ensures users always get fresh content without manual cache clear
initSwUpdateMonitor();

createRoot(document.getElementById("root")!).render(<App />);
