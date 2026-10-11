"use client";

import { useState } from "react";

type Props = {
  title?: string;
  description?: string;
  url?: string;
};

const DEFAULT_TITLE = "進研模試 大学コード検索";
const DEFAULT_TEXT = "大学名・コード番号から10桁の大学学部学科コードを即座に検索できるWebツール";
const CANONICAL_URL = "https://univ-code-search.vercel.app/";

export function ShareButtons({
  title = DEFAULT_TITLE,
  description = DEFAULT_TEXT,
  url,
}: Props) {
  const [copied, setCopied] = useState(false);

  // Always use the canonical production URL (avoid localhost)
  const currentUrl = url || CANONICAL_URL;

  const shareText = `${title} - ${description}`;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(currentUrl)}&hashtags=${encodeURIComponent(
    "大学コード,進研模試,大学受験"
  )}`;

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    currentUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: currentUrl,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          await handleCopyLink();
        }
      }
    } else {
      await handleCopyLink();
    }
  };

  return (
    <section aria-label="ソーシャルシェア" className="mt-10 mb-6 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3">
        <span>このツールをシェア</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* X (FontAwesome fa-x-twitter) */}
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-popover hover:border-foreground/40 hover:bg-muted/30 text-xs font-medium text-foreground transition-colors cursor-pointer select-none active:scale-[0.98]"
          title="Xでポスト"
        >
          <svg viewBox="0 0 512 512" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
          </svg>
          <span>X</span>
        </a>

        {/* LINE (FontAwesome fa-line) */}
        <a
          href={lineShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer select-none active:scale-[0.98]"
          title="LINEで送る"
        >
          <svg viewBox="0 0 512 512" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
            <path d="M311 196.8l0 81.3c0 2.1-1.6 3.7-3.7 3.7l-13 0c-1.3 0-2.4-.7-3-1.5L254 230 254 278.2c0 2.1-1.6 3.7-3.7 3.7l-13 0c-2.1 0-3.7-1.6-3.7-3.7l0-81.3c0-2.1 1.6-3.7 3.7-3.7l12.9 0c1.1 0 2.4 .6 3 1.6l37.3 50.3 0-48.2c0-2.1 1.6-3.7 3.7-3.7l13 0c2.1-.1 3.8 1.6 3.8 3.5l0 .1zm-93.7-3.7l-13 0c-2.1 0-3.7 1.6-3.7 3.7l0 81.3c0 2.1 1.6 3.7 3.7 3.7l13 0c2.1 0 3.7-1.6 3.7-3.7l0-81.3c0-1.9-1.6-3.7-3.7-3.7zm-31.4 68.1l-35.6 0 0-64.4c0-2.1-1.6-3.7-3.7-3.7l-13 0c-2.1 0-3.7 1.6-3.7 3.7l0 81.3c0 1 .3 1.8 1 2.5 .7 .6 1.5 1 2.5 1l52.2 0c2.1 0 3.7-1.6 3.7-3.7l0-13c0-1.9-1.6-3.7-3.5-3.7l.1 0zm193.7-68.1l-52.3 0c-1.9 0-3.7 1.6-3.7 3.7l0 81.3c0 1.9 1.6 3.7 3.7 3.7l52.2 0c2.1 0 3.7-1.6 3.7-3.7l0-13.1c0-2.1-1.6-3.7-3.7-3.7l-35.5 0 0-13.6 35.5 0c2.1 0 3.7-1.6 3.7-3.7l0-13.1c0-2.1-1.6-3.7-3.7-3.7l-35.5 0 0-13.7 35.5 0c2.1 0 3.7-1.6 3.7-3.7l0-13c-.1-1.9-1.7-3.7-3.7-3.7l.1 0zM512 93.4l0 326c-.1 51.2-42.1 92.7-93.4 92.6l-326 0C41.4 511.9-.1 469.8 0 418.6l0-326C.1 41.4 42.2-.1 93.4 0l326 0c51.2 .1 92.7 42.1 92.6 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3S68.8 150.1 68.8 233.5c0 74.7 66.3 137.4 155.9 149.3 21.8 4.7 19.3 12.7 14.4 42.1-.8 4.7-3.8 18.4 16.1 10.1s107.3-63.2 146.5-108.2c27-29.7 39.9-59.8 39.9-93.1l0-.2z" />
          </svg>
          <span>LINE</span>
        </a>

        {/* Copy (FontAwesome fa-copy / fa-check) */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer select-none active:scale-[0.98] ${
            copied
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-border bg-popover hover:border-foreground/40 hover:bg-muted/30 text-foreground"
          }`}
          title="URLをコピー"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 448 512" className="w-3.5 h-3.5 fill-current text-emerald-600" aria-hidden="true">
                <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 448 512" className="w-3.5 h-3.5 fill-current text-muted-foreground" aria-hidden="true">
                <path d="M192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-200.6c0-17.4-7.1-34.1-19.7-46.2L370.6 17.8C358.7 6.4 342.8 0 326.3 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Share (FontAwesome fa-share-nodes) */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-popover hover:border-foreground/40 hover:bg-muted/30 text-xs font-medium text-foreground transition-colors cursor-pointer select-none active:scale-[0.98]"
          title="共有メニューを開く"
        >
          <svg viewBox="0 0 512 512" className="w-3.5 h-3.5 fill-current text-muted-foreground" aria-hidden="true">
            <path d="M384 192c53 0 96-43 96-96s-43-96-96-96-96 43-96 96c0 5.4 .5 10.8 1.3 16L159.6 184.1c-16.9-15-39.2-24.1-63.6-24.1-53 0-96 43-96 96s43 96 96 96c24.4 0 46.6-9.1 63.6-24.1L289.3 400c-.9 5.2-1.3 10.5-1.3 16 0 53 43 96 96 96s96-43 96-96-43-96-96-96c-24.4 0-46.6 9.1-63.6 24.1L190.7 272c.9-5.2 1.3-10.5 1.3-16s-.5-10.8-1.3-16l129.7-72.1c16.9 15 39.2 24.1 63.6 24.1z" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </section>
  );
}
