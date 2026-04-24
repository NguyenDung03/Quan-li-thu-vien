import { createRoot } from "react-dom/client";
import { GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import "./index.css";
import "@/i18n";
import App from "./App.tsx";
import { ThemeProvider } from "@/providers/ThemeProvider";


GlobalWorkerOptions.workerSrc = pdfWorkerUrl;


createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
