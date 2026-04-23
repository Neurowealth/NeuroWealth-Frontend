"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
export interface CookiePreferences { necessary: boolean; analytics: boolean; marketing: boolean; personalization: boolean; }
export type ConsentStatus = "pending" | "accepted" | "rejected" | "custom";
export interface CookieConsentState { status: ConsentStatus; preferences: CookiePreferences; lastUpdated: string | null; }
interface CookieConsentContextValue { consentState: CookieConsentState; showBanner: boolean; showModal: boolean; openModal: () => void; closeModal: () => void; acceptAll: () => void; rejectAll: () => void; savePreferences: (prefs: Partial<CookiePreferences>) => void; resetConsent: () => void; }
const STORAGE_KEY = "nw_cookie_consent";
const defaultPreferences: CookiePreferences = { necessary: true, analytics: false, marketing: false, personalization: false };
const defaultState: CookieConsentState = { status: "pending", preferences: defaultPreferences, lastUpdated: null };
const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);
export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consentState, setConsentState] = useState<CookieConsentState>(defaultState);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { setConsentState(JSON.parse(stored)); setShowBanner(false); }
      else { setShowBanner(true); }
    } catch { setShowBanner(true); }
    setHydrated(true);
  }, []);
  const persist = useCallback((state: CookieConsentState) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} setConsentState(state); }, []);
  const acceptAll = useCallback(() => { persist({ status: "accepted", preferences: { necessary: true, analytics: true, marketing: true, personalization: true }, lastUpdated: new Date().toISOString() }); setShowBanner(false); setShowModal(false); }, [persist]);
  const rejectAll = useCallback(() => { persist({ status: "rejected", preferences: { ...defaultPreferences, necessary: true }, lastUpdated: new Date().toISOString() }); setShowBanner(false); setShowModal(false); }, [persist]);
  const savePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    const merged: CookiePreferences = { ...consentState.preferences, ...prefs, necessary: true };
    const allOn = merged.analytics && merged.marketing && merged.personalization;
    const allOff = !merged.analytics && !merged.marketing && !merged.personalization;
    persist({ status: allOn ? "accepted" : allOff ? "rejected" : "custom", preferences: merged, lastUpdated: new Date().toISOString() });
    setShowBanner(false); setShowModal(false);
  }, [consentState.preferences, persist]);
  const resetConsent = useCallback(() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} setConsentState(defaultState); setShowBanner(true); }, []);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  return (
    <CookieConsentContext.Provider value={{ consentState, showBanner: hydrated && showBanner, showModal, openModal, closeModal, acceptAll, rejectAll, savePreferences, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
export function useCookieConsent() { const ctx = useContext(CookieConsentContext); if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider"); return ctx; }
