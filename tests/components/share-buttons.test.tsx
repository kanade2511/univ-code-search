import { describe, it, expect, beforeEach, mock } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShareButtons } from "../../src/components/share-buttons";

describe("ShareButtons component", () => {
  let copiedText = "";
  let sharedPayload: { title?: string; text?: string; url?: string } | null = null;

  beforeEach(() => {
    copiedText = "";
    sharedPayload = null;

    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          copiedText = text;
        },
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis.navigator, "share", {
      value: async (data: { title?: string; text?: string; url?: string }) => {
        sharedPayload = data;
      },
      configurable: true,
      writable: true,
    });

    // @ts-expect-error test mock
    globalThis.window.isSecureContext = true;
  });

  it("renders X and LINE share links targeting production url", () => {
    render(<ShareButtons />);

    const xLink = screen.getByTitle("Xでポスト");
    expect(xLink).toBeDefined();
    expect(xLink.getAttribute("href")).toContain("twitter.com/intent/tweet");
    expect(xLink.getAttribute("href")).toContain(encodeURIComponent("https://univ-code-search.vercel.app/"));
    expect(xLink.getAttribute("target")).toBe("_blank");

    const lineLink = screen.getByTitle("LINEで送る");
    expect(lineLink).toBeDefined();
    expect(lineLink.getAttribute("href")).toContain("social-plugins.line.me/lineit/share");
    expect(lineLink.getAttribute("href")).toContain(encodeURIComponent("https://univ-code-search.vercel.app/"));
    expect(lineLink.getAttribute("target")).toBe("_blank");

    // Pinterest must not be rendered
    expect(screen.queryByTitle("Pinterestでシェア")).toBeNull();
  });

  it("handles copy click and copies canonical URL", async () => {
    render(<ShareButtons />);

    const copyBtn = screen.getByTitle("URLをコピー");
    expect(copyBtn).toBeDefined();
    expect(screen.getByText("Copy")).toBeDefined();

    fireEvent.click(copyBtn);

    expect(copiedText).toBe("https://univ-code-search.vercel.app/");
    expect(await screen.findByText("Copied!")).toBeDefined();
  });

  it("handles native Share button click", () => {
    render(<ShareButtons />);

    const shareBtn = screen.getByTitle("共有メニューを開く");
    expect(shareBtn).toBeDefined();
    expect(screen.getByText("Share")).toBeDefined();

    fireEvent.click(shareBtn);

    expect(sharedPayload).not.toBeNull();
    expect(sharedPayload?.url).toBe("https://univ-code-search.vercel.app/");
  });
});
