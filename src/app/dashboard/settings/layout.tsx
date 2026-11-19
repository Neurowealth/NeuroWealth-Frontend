"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { messages } = useI18n();
  const t = messages.settings;
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="settings-layout">
        <aside className="settings-sidebar" aria-label={t.nav.sidebarLabel}>
          <nav className="settings-nav" aria-label={t.nav.navigationLabel}>
            <h2 className="settings-nav-title">{t.nav.title}</h2>
            <ul className="settings-nav-list">
              <li>
                <Link href="/dashboard/settings/preferences" className="settings-nav-link">
                  {t.nav.preferences}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings/security" className="settings-nav-link">
                  {t.nav.security}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings/notifications" className="settings-nav-link">
                  {t.nav.notifications}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings/privacy" className="settings-nav-link">
                  {t.nav.privacy}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <div className="settings-main">{children}</div>
      </div>

      <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
          min-height: calc(100vh - 80px);
        }

        .settings-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-nav-title {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          padding: 0 12px;
        }

        .settings-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-nav-link {
          display: block;
          padding: 10px 12px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          border-radius: 8px;
          transition: all 0.2s;
          border-left: 2px solid transparent;
        }

        .settings-nav-link:hover {
          color: #e2e8f0;
          background: rgba(56, 189, 248, 0.08);
        }

        .settings-nav-link.active {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border-left-color: #38bdf8;
        }

        .settings-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 20px 16px;
          }

          .settings-sidebar {
            position: static;
          }

          .settings-nav {
            flex-direction: row;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .settings-nav-title {
            display: none;
          }

          .settings-nav-list {
            flex-direction: row;
            gap: 8px;
          }

          .settings-nav-link {
            white-space: nowrap;
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
