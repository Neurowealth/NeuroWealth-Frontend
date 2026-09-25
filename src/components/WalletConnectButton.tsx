"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/contexts";
import { NetworkMismatchWarning } from "@/components/wallet/NetworkMismatchWarning";
import { useToast } from "@/components/notifications/ToastProvider";
import { logger } from "@/lib/logger";

const WalletIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

interface WalletConnectButtonProps {
  theme?: "light" | "dark";
}
export default function WalletConnectButton({
  theme = "light",
}: WalletConnectButtonProps) {
  const {
    connected,
    isRestoring,
    connect,
    disconnect,
    walletName,
    publicKey,
    networkStatus,
  } = useWallet();
  const { pushToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A ref, not state: this observer is an imperative DOM handle, not
  // render-driven data. Storing it in state made the effect depend on a
  // value it set itself, so every modal detection re-ran the whole effect
  // (tearing down and recreating the document-wide root observer) and the
  // cleanup closed over the previous render's (stale) observer instead of
  // the one just created, leaking it instead of disconnecting it.
  const modalObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const handleModalMutations = (modal: Element) => {
      const walker = document.createTreeWalker(modal, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        if (
          text.includes("Learn more") ||
          text.includes("What is a Wallet") ||
          text.includes("What is Stellar") ||
          text.includes("Wallets are used to send") ||
          text.includes("Stellar is a decentralized")
        ) {
          const parent = textNode.parentElement;
          if (parent) {
            parent.style.display = "none";
          }
        }
      });

      if (!modal.querySelector(".custom-neurowealth-message")) {
        const customMessage = document.createElement("div");
        customMessage.className = "custom-neurowealth-message";
        const messageContainer = document.createElement("div");
        messageContainer.style.cssText = `
          padding: 16px;
          margin: 16px 0;
          background: var(--background, #fff);
          color: var(--foreground, #000);
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          border: 1px solid rgba(156, 163, 175, 0.3);
        `;
        messageContainer.textContent = "🧠 Connect your Stellar wallet to access NeuroWealth's AI-powered investment strategies and portfolio management tools.";
        customMessage.appendChild(messageContainer);
        modal.appendChild(customMessage);
      }
    };

    const rootObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement && (node.matches('[class*="swk"]') || node.matches('[class*="modal"]'))) {
              handleModalMutations(node);
              const newModalObserver = new MutationObserver(() => handleModalMutations(node));
              newModalObserver.observe(node, { childList: true, subtree: true });
              modalObserverRef.current = newModalObserver;
              observer.disconnect(); // Disconnect the root observer once the modal is found
              return;
            }
          }
        }
      }
    });

    rootObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      rootObserver.disconnect();
      modalObserverRef.current?.disconnect();
      modalObserverRef.current = null;
    };
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (err) {
      const action = connected ? "disconnect" : "connect";
      const message =
        err instanceof Error ? err.message : `Failed to ${action} wallet`;
      logger.error(`Wallet ${action} failed`, err);
      setError(message);
      pushToast({
        variant: "error",
        title: connected ? "Disconnect failed" : "Connect failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return connected ? "Disconnecting..." : "Connecting...";
    if (connected && publicKey) {
      const truncated = `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;
      return `${truncated} (${walletName})`;
    }
    return "Connect Wallet";
  };

  const getIcon = () => {
    if (isLoading) return <LoaderIcon />;
    return <WalletIcon />;
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {connected && networkStatus.hasMismatch && (
        <NetworkMismatchWarning status={networkStatus} compact />
      )}
      {isRestoring ? (
        <button
          disabled
          className="px-6 py-2.5 text-sm font-medium rounded-full bg-black text-white opacity-75 cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <LoaderIcon />
          </span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isLoading}
          data-qa="wallet-connect-button"
          className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
            theme === "light"
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white text-black hover:bg-gray-200"
          } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          <span className="flex items-center gap-2">
            {getIcon()}
            {getButtonText()}
          </span>
        </button>
      )}
      {error && (
        <p
          role="alert"
          className="max-w-[220px] text-right text-xs text-red-400 leading-snug"
        >
          {error}
        </p>
      )}
    </div>
  );
}
