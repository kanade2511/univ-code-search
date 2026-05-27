"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-sm text-red-600">
          <p className="font-medium mb-1">エラーが発生しました</p>
          <p className="text-gray-500 text-xs mb-4">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-md bg-[#4a6fa5] text-white text-xs cursor-pointer"
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
