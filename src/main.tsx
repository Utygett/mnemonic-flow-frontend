
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/globals.css";
  import "./styles/components.css";
  import 'katex/dist/katex.min.css';

  createRoot(document.getElementById("root")!).render(<App />);
  
