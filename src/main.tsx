import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { migrateSeeds } from "./features/weeklyResponse/storage";

// Auto-migrate stale action seeds before anything renders (so seedIfEmpty
// re-generates canonical data for browsers seeded by an older build).
migrateSeeds();

createRoot(document.getElementById("root")!).render(<App />);
