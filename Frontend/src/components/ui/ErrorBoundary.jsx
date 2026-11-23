// src/components/ui/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Something went wrong while rendering.",
    };
  }

  componentDidCatch(error, info) {
    console.error("App ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
            >
              Reload FlashXpress+
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}