import { useEffect, useRef, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Loader2, FileWarning } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";



export type EbookReaderProps = {
  
  sourceUrl: string;
  className?: string;
  
  fetchInit?: RequestInit;
  
  variant?: "default" | "fullscreen";
};

type Phase = "idle" | "loading" | "ready" | "error";

export function EbookReader({
  sourceUrl,
  className,
  fetchInit,
  variant = "default",
}: Readonly<EbookReaderProps>) {
  const [phase, setPhase] = useState<Phase>(() =>
    sourceUrl.trim() ? "loading" : "idle",
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fetchInitRef = useRef(fetchInit);
  fetchInitRef.current = fetchInit;

  
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (!sourceUrl.trim()) {
      setBlobUrl(null);
      setPhase("idle");
      setErrorMessage(null);
      return;
    }

    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        setPhase("loading");
        setErrorMessage(null);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });

        const res = await fetch(sourceUrl, {
          ...fetchInitRef.current,
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error(`Lỗi máy chủ (${res.status})`);
        }

        const blob = await res.blob();
        if (cancelled || ac.signal.aborted) return;

        if (!blob.size) {
          throw new Error("File rỗng");
        }

        const u = URL.createObjectURL(blob);
        if (cancelled || ac.signal.aborted) {
          URL.revokeObjectURL(u);
          return;
        }

        setBlobUrl(u);
        setPhase("ready");
      } catch (e: unknown) {
        if (cancelled || ac.signal.aborted) return;
        let msg = "Đã xảy ra lỗi không xác định";
        if (e instanceof TypeError) {
          msg =
            "Không tải được file (mạng hoặc CORS từ CDN). Nếu là Cloudinary, bật CORS cho domain app hoặc tải file qua API nội bộ.";
        } else if (e instanceof Error) {
          msg = e.message;
        }
        setErrorMessage(msg);
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [sourceUrl]);

  if (!sourceUrl.trim()) {
    return null;
  }

  const fullscreenShell =
    variant === "fullscreen" ? "h-full min-h-0 rounded-none" : "";

  if (phase === "loading") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 py-20 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 ${fullscreenShell} ${className ?? ""}`}
      >
        <Loader2 className="h-10 w-10 animate-spin text-[#18AD5B]" />
        <p className="text-sm font-medium">Đang tải sách…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-6 py-16 text-center dark:border-red-900/50 dark:bg-red-950/30 ${fullscreenShell} ${className ?? ""}`}
      >
        <FileWarning className="h-12 w-12 text-red-500" />
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          Không mở được file PDF
        </p>
        {errorMessage && (
          <p className="max-w-md text-xs leading-relaxed text-red-700/90 dark:text-red-300/90">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  if (!blobUrl) {
    return null;
  }

  const viewerHeightClass =
    variant === "fullscreen"
      ? "h-full min-h-0 flex-1"
      : "h-[min(78vh,900px)] min-h-[480px]";

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 ${variant === "fullscreen" ? "flex h-full min-h-0 flex-col" : ""} ${className ?? ""}`}
    >
      <div className={viewerHeightClass}>
        <Viewer
          key={blobUrl}
          fileUrl={blobUrl}
          plugins={[defaultLayoutPluginInstance]}
        />
      </div>
    </div>
  );
}
