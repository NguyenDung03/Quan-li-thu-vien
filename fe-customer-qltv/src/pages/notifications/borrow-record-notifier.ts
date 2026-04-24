import { AUTH_KEYS } from "@/constants/auth";
import { getResolvedApiBaseUrl } from "@/lib/resolve-api-base-url";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

type BorrowRecordCreatedEvent = {
  type: "borrow_record_created";
  message: string;
  borrowRecordId: string;
  dueDate: string;
};

type UseBorrowRecordNotifierOptions = {
  onCreated?: (payload: BorrowRecordCreatedEvent) => void;
};

export function useBorrowRecordNotifier(options?: UseBorrowRecordNotifierOptions) {
  const queryClient = useQueryClient();
  const onCreated = options?.onCreated;

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
    if (!token) return;

    const baseUrl = getResolvedApiBaseUrl();
    const streamUrl = `${baseUrl}/borrow-records/notifications/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as
          | BorrowRecordCreatedEvent
          | { type: "ping" };

        if (payload.type !== "borrow_record_created") return;

        onCreated?.(payload);
        void queryClient.invalidateQueries({ queryKey: ["borrow-records"] });
      } catch {
        void 0
      }
    };

    eventSource.onerror = () => {
      void 0
    };

    return () => {
      eventSource.close();
    };
  }, [onCreated, queryClient]);
}
