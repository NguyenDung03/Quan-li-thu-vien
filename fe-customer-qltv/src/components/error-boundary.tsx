import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Đã xảy ra lỗi hiển thị
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Vui lòng tải lại trang. Nếu lỗi còn lặp lại, hãy liên hệ bộ phận hỗ
            trợ thư viện.
          </p>
          <Button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.assign("/");
            }}
          >
            Về trang chủ
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
