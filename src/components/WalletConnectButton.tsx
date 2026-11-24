"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/contexts";
import { NetworkMismatchWarning } from "@/components/wallet/NetworkMismatchWarning";
import { useToast } from "@/components/notifications/ToastProvider";
import { useI18n } from "@/contexts/I18nContext";
import { logger } from "@/lib/logger";
import { truncateWalletAddress } from "@/lib/user";

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

/**
 * Boilerplate copy rendered by the third-party Stellar Wallets Kit modal that
 * we hide. These match the *vendor's* strings, not ours: the kit renders its
 * modal in English regardless of the app locale, so these deliberately stay
 * out of the i18n dictionaries. If the kit gains localized copy, add the
 * translated variants here.
 */
export const SWK_BOILERPLATE_TEXT: readonly string[] = [
  "Learn more",
  "What is a Wallet",
  "What is Stellar",
  "Wallets are used to send",
  "Stellar is a decentralized",
];

export function isSwkBoilerplateText(text: string): boolean {
  return SWK_BOILERPLATE_TEXT.some((fragment) => text.includes(fragment));
}
export function findSwkModal(node: HTMLElement): Element | null {
  if (
    node.matches &&
    (node.matches('[class*="swk"]') || node.matches('[class*="modal"]'))
  ) {
    return node;
  }
  return (
    node.querySelector('[class*="swk"]') ||
    node.querySelector('[class*="modal"]')
  );
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
    available,
  } = useWallet();
  const { pushToast } = useToast();
  const { messages } = useI18n();
  const t = messages.walletConnection.button;
  // Outside <WalletProvider> connect/disconnect are no-ops, so say so instead of spinning.
  const unavailable = available === false;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A ref, not state: this observer is an imperative DOM handle, not
  // render-driven data. Storing it in state made the effect depend on a
  // value it set itself, so every modal detection re-ran the whole effect
  // (tearing down and recreating the document-wide root observer) and the
  // cleanup closed over the previous render's (stale) observer instead of
  // the one just created, leaking it instead of disconnecting it.
  const modalObserverRef = useRef<MutationObserver | null>(null);
  // The modal observer is set up once (empty deps), so read the injected
  // copy through a ref to pick up locale changes without re-subscribing.
  const modalMessageRef = useRef(t.modalMessage);
  modalMessageRef.current = t.modalMessage;

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
        if (isSwkBoilerplateText(text)) {
          const parent = textNode.parentElement;
          if (parent) {
            parent.style.display = "none";
          }
        }
      });

      const existingMessage = modal.querySelector(
        ".custom-neurowealth-message > div",
      );
      if (existingMessage) {
        if (existingMessage.textContent !== modalMessageRef.current) {
          existingMessage.textContent = modalMessageRef.current;
        }
      } else {
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
        messageContainer.textContent = modalMessageRef.current;
        customMessage.appendChild(messageContainer);
        modal.appendChild(customMessage);
      }
    };

    const rootObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              // Check if the node itself or any descendant matches the modal selector
              const modalElement = findSwkModal(node);
              if (modalElement) {
                handleModalMutations(modalElement);
                const newModalObserver = new MutationObserver(() =>
                  handleModalMutations(modalElement),
                );
                newModalObserver.observe(modalElement, {
                  childList: true,
                  subtree: true,
                });
                modalObserverRef.current = newModalObserver;
                observer.disconnect(); // Disconnect the root observer once the modal is found
                return;
              }
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
    if (unavailable) {
      return;
    }
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
        err instanceof Error
          ? err.message
          : connected
            ? t.disconnectFailedFallback
            : t.connectFailedFallback;
      logger.error(`Wallet ${action} failed`, err);
      setError(message);
      pushToast({
        variant: "error",
        title: connected ? t.disconnectFailedTitle : t.connectFailedTitle,
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return connected ? t.disconnecting : t.connecting;
    if (connected && publicKey) {
      const truncated = truncateWalletAddress(publicKey);
      return `${truncated} (${walletName})`;
    }
    return t.connect;
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
          disabled={isLoading || unavailable}
          title={unavailable ? t.unavailable : undefined}
          aria-label={unavailable ? `${t.connect}. ${t.unavailable}` : undefined}
          data-wallet-unavailable={unavailable ? "true" : undefined}
          data-qa="wallet-connect-button"
          className={`px-6 py-2.5 text-sm font-medium rounded-full transition-colors ${
            theme === "light"
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white text-black hover:bg-gray-200"
          } ${isLoading || unavailable ? "opacity-75 cursor-not-allowed" : ""}`}
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
