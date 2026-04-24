import { useState } from "react";
import { DeepChat } from "deep-chat-react";
import { useAuth } from "@/contexts/auth-context";
import { AUTH_KEYS } from "@/constants/auth";
import { getResolvedApiBaseUrl } from "@/lib/resolve-api-base-url";
import type { RequestDetails } from "deep-chat/dist/types/interceptors";
import { motion, AnimatePresence } from "framer-motion";
import { premiumEasing } from "@/lib/animation";

function resolveChatApiUrl(): string {
  const fromEnv = import.meta.env.VITE_CHAT_API_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/+$/, "");
  }
  return `${getResolvedApiBaseUrl()}/chat`;
}

const BotAvatar = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    
    <div className="absolute inset-0 rounded-full bg-[var(--primary)] animate-ping opacity-20"></div>
    <div className="relative w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg">
      <svg
        className="w-6 h-6 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        <circle cx="8" cy="13" r="1.5" fill="white" />
        <circle cx="16" cy="13" r="1.5" fill="white" />
        <path d="M9 16.5h6" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
);

export default function LibraryChatbot() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const chatApiUrl = resolveChatApiUrl();

  const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) || "";

  
  if (!isAuthenticated || !token) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-[var(--primary)] hover:opacity-90 hover:scale-105 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-2 border-white/30"
        >
          <BotAvatar />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: premiumEasing }}
              className="absolute bottom-20 right-0 w-[360px] h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
              
              <div className="bg-[var(--primary)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BotAvatar />
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      Trợ lý AI
                    </h3>
                    <p className="text-white/70 text-xs">Vui lòng đăng nhập</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-7 h-7 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gray-700 font-medium mb-1">
                    Cần đăng nhập
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Vui lòng đăng nhập để sử dụng trợ lý AI thư viện
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: premiumEasing }}
            className="absolute bottom-20 right-0 w-[360px] h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            
            <div className="bg-[var(--primary)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BotAvatar />
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Trợ lý AI
                  </h3>
                  <p className="text-white/70 text-xs">Hỏi đáp thư viện</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            
            <div className="flex-1 relative min-h-0">
              <DeepChat
                
                connect={{
                  url: chatApiUrl,
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  
                  stream: true,
                }}
                
                mixedFiles={{
                  files: {
                    acceptedFormats: ".pdf,.txt,.docx",
                    maxNumberOfFiles: 1,
                  },
                }}
                
                
                requestInterceptor={(details: RequestDetails): RequestDetails => {
                  let userText = "";

                  if (details.body instanceof FormData) {
                    const raw = details.body.get("messages");
                    const messagesStr =
                      typeof raw === "string" ? raw : undefined;
                    if (messagesStr) {
                      try {
                        const messages = JSON.parse(messagesStr) as {
                          text?: string;
                        }[];
                        userText =
                          messages[messages.length - 1]?.text || "";
                      } catch {
                        userText = "";
                      }
                    }

                    details.body.delete("messages");
                    details.body.append("message", userText);

                    if (details.headers) {
                      delete details.headers["Content-Type"];
                    }
                  } else {
                    const messages =
                      (details.body?.messages as { text?: string }[]) || [];
                    userText = messages[messages.length - 1]?.text || "";
                    details.body = { message: userText };

                    if (!details.headers) details.headers = {};
                    details.headers["Content-Type"] = "application/json";
                  }

                  return details;
                }}
                
                chatStyle={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "0",
                  display: "flex",
                  flexDirection: "column",
                }}
                messageStyles={{
                  default: {
                    user: {
                      bubble: { backgroundColor: "#00b760", color: "white" },
                    },
                    ai: {
                      bubble: { backgroundColor: "#f1f5f9", color: "#1e293b" },
                    },
                  },
                }}
                textInput={{
                  placeholder: {
                    text: "Nhập câu hỏi hoặc đính kèm tài liệu...",
                  },
                }}
                
                introMessage={{
                  text: "Xin chào! Tôi là trợ lý AI của thư viện. Bạn có thể hỏi tôi về quy định, hoặc đính kèm tài liệu của bạn (PDF, DOCX) để tôi phân tích nhé!",
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-[var(--primary)] hover:opacity-90 hover:scale-105 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-2 border-white/30"
          >
            <BotAvatar />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
