import { createRoot } from "react-dom/client";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource-variable/manrope";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
