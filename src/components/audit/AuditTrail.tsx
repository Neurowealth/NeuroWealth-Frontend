"use client";

import React, { Fragment, useState, useEffect, useMemo } from "react";
import { AuditEvent, getAuditService } from "@/lib/audit-service";
import { Download, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditTableSkeleton } from "@/components/ui/Skeleton";
import { formatTimestamp } from "@/lib/formatters";
import { useI18n } from "@/contexts/I18nContext";

type EventTypeFilter = "all" | AuditEvent["eventType"];

const PAGE_SIZE = 20;

export function AuditTrail() {
  const { messages } = useI18n();
  const t = messages.audit;
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventTypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    
    async function loadEvents() {
      try {
        const data = await getAuditService().getEvents();
        if (!controller.signal.aborted) {
          setEvents(data);
          setLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    
    const timer = setTimeout(() => loadEvents(), 800);
    
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => filter === "all" || e.eventType === filter)
      .sort((a, b) => {
        const diff = b.timestamp.getTime() - a.timestamp.getTime();
        return sortOrder === "desc" ? diff : -diff;
      });
  }, [events, filter, sortOrder]);

  if (loading) {
    return <AuditTableSkeleton rows={6} />;
  }

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedEvents = filteredEvents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = async () => {
    const csv = await getAuditService().exportAsCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventTypeLabels: Record<AuditEvent["eventType"], string> = {
    login: t.eventTypes.login,
    logout: t.eventTypes.logout,
    signup: t.eventTypes.signup,
    profile_update: t.eventTypes.profile_update,
    password_change: t.eventTypes.password_change,
    settings_change: t.eventTypes.settings_change,
    transaction: t.eventTypes.transaction,
    export: t.eventTypes.export,
  };

  const eventTypeColors: Record<AuditEvent["eventType"], string> = {
    login: "bg-green-500/10 text-green-400 border-green-500/20",
    logout: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    signup: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    profile_update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    password_change: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    settings_change: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    transaction: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    export: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  return (
    <div className="audit-trail-container">
      {/* Header */}
      <div className="audit-header">
        <div>
          <h1 className="audit-title">{t.title}</h1>
          <p className="audit-subtitle">{t.subtitle}</p>
        </div>
        <Button
          onClick={handleExport}
          variant="secondary"
          size="md"
          className="audit-export-btn"
        >
          <Download size={16} />
          {t.exportCsv}
        </Button>
      </div>

      {/* Controls */}
      <div className="audit-controls">
        <div className="audit-filter-group">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as EventTypeFilter); setPage(1); }}
            className="audit-select"
            aria-label={t.filterAriaLabel}
          >
            <option value="all">{t.allEvents}</option>
            <option value="login">{t.eventTypes.login}</option>
            <option value="logout">{t.eventTypes.logout}</option>
            <option value="signup">{t.eventTypes.signup}</option>
            <option value="profile_update">{t.eventTypes.profile_update}</option>
            <option value="password_change">{t.eventTypes.password_change}</option>
            <option value="settings_change">{t.eventTypes.settings_change}</option>
            <option value="transaction">{t.eventTypes.transaction}</option>
            <option value="export">{t.eventTypes.export}</option>
          </select>
        </div>

        <div className="audit-sort-group">
          <button
            onClick={() => { setSortOrder(sortOrder === "desc" ? "asc" : "desc"); setPage(1); }}
            className="audit-sort-btn"
            aria-label={sortOrder === "desc" ? t.sortAscending : t.sortDescending}
          >
            <ChevronDown size={16} className={sortOrder === "asc" ? "rotate-180" : ""} />
            {sortOrder === "desc" ? t.newest : t.oldest}
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>{t.columns.eventType}</th>
              <th>{t.columns.timestamp}</th>
              <th>{t.columns.actor}</th>
              <th>{t.columns.ipAddress}</th>
              <th>{t.columns.details}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="audit-empty">
                  {t.noEvents}
                </td>
              </tr>
            ) : (
              pagedEvents.map((event) => {
                const isExpanded = expandedId === event.id;
                const detailId = `audit-details-${event.id}`;

                return (
                  <Fragment key={event.id}>
                    <tr key={event.id} className="audit-row">
                      <td>
                        <span className={`audit-badge ${eventTypeColors[event.eventType]}`}>
                          {eventTypeLabels[event.eventType]}
                        </span>
                      </td>
                      <td className="audit-timestamp">
                        {formatTimestamp(event.timestamp.toISOString())}
                      </td>
                      <td>{event.actor}</td>
                      <td className="audit-ip">{event.ipAddress || t.notAvailable}</td>
                      <td>
                        <button
                          onClick={() =>
                            setExpandedId((current) => (current === event.id ? null : event.id))
                          }
                          className="audit-expand-btn"
                          aria-expanded={isExpanded}
                          aria-controls={detailId}
                          aria-label={isExpanded ? t.collapseDetails : t.expandDetails}
                        >
                          {isExpanded ? t.hide : t.show}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${event.id}-details`}>
                        <td colSpan={5}>
                          <div id={detailId} className="audit-detail-panel" role="region" aria-label={t.expandedDetailsLabel}>
                            <div className="audit-metadata">
                              <p className="audit-metadata-label">{t.metadata}</p>
                              <pre className="audit-metadata-content">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="audit-cards-wrapper">
        {filteredEvents.length === 0 ? (
          <div className="audit-empty-mobile">{t.noEvents}</div>
        ) : (
          pagedEvents.map((event) => (
            <div key={event.id} className="audit-card">
              <div className="audit-card-header">
                <span className={`audit-badge ${eventTypeColors[event.eventType]}`}>
                  {eventTypeLabels[event.eventType]}
                </span>
                <button
                  onClick={() =>
                    setExpandedId((current) => (current === event.id ? null : event.id))
                  }
                  className="audit-card-toggle"
                  aria-expanded={expandedId === event.id}
                  aria-label={expandedId === event.id ? t.collapseDetails : t.expandDetails}
                >
                  <ChevronDown
                    size={16}
                    className={expandedId === event.id ? "rotate-180" : ""}
                  />
                </button>
              </div>
              <div className="audit-card-body">
                <div className="audit-card-row">
                  <span className="audit-card-label">{t.columns.timestamp}</span>
                  <span className="audit-card-value">
                    {formatTimestamp(event.timestamp.toISOString())}
                  </span>
                </div>
                <div className="audit-card-row">
                  <span className="audit-card-label">{t.columns.actor}</span>
                  <span className="audit-card-value">{event.actor}</span>
                </div>
                <div className="audit-card-row">
                  <span className="audit-card-label">{t.columns.ipAddress}</span>
                  <span className="audit-card-value">{event.ipAddress || t.notAvailable}</span>
                </div>
              </div>
              {expandedId === event.id && (
                <div className="audit-card-details">
                  <div className="audit-metadata">
                    <p className="audit-metadata-label">{t.metadata}</p>
                    <pre className="audit-metadata-content">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="audit-pagination" role="navigation" aria-label={t.paginationLabel}>
          <div className="audit-page-info">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredEvents.length)} {t.of} <span className="audit-page-total">{filteredEvents.length}</span>
          </div>
          <div className="audit-page-buttons">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label={t.previousPage}
              className="audit-page-btn"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-label={t.pageLabel.replace("{page}", String(n))}
                aria-current={n === safePage ? "page" : undefined}
                className={`audit-page-num ${n === safePage ? "audit-page-num-active" : ""}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label={t.nextPage}
              className="audit-page-btn"
            >
              ›
            </button>
          </div>
        </div>
      )}

      <style>{`
        .audit-trail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .audit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .audit-title {
          font-size: 28px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 4px;
        }

        .audit-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .audit-export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .audit-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .audit-filter-group,
        .audit-sort-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .audit-filter-group:focus-within,
        .audit-sort-group:focus-within {
          border-color: rgba(56, 189, 248, 0.6);
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }

        .audit-select {
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          padding-right: 4px;
        }

        .audit-select:focus-visible {
          color: #f8fafc;
        }

        .audit-select option {
          background: #0f172a;
          color: #e2e8f0;
        }

        .audit-sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .audit-sort-btn:hover {
          color: #e2e8f0;
        }

        .audit-sort-btn svg {
          transition: transform 0.2s;
        }

        /* Desktop Table */
        .audit-table-wrapper {
          display: none;
          overflow-x: auto;
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.5);
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .audit-table thead {
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        }

        .audit-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }

        .audit-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08);
          color: #cbd5e1;
        }

        .audit-row:hover {
          background: rgba(56, 189, 248, 0.05);
        }

        .audit-timestamp {
          font-family: "Monaco", "Courier New", monospace;
          font-size: 13px;
          color: #94a3b8;
        }

        .audit-ip {
          font-family: "Monaco", "Courier New", monospace;
          font-size: 12px;
          color: #e2e8f0;
        }

        .audit-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
        }

        .audit-expand-btn {
          background: transparent;
          border: none;
          color: #38bdf8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .audit-expand-btn:hover {
          color: #0ea5e9;
        }

        .audit-expand-btn:focus-visible,
        .audit-card-toggle:focus-visible {
          outline: 2px solid rgba(56, 189, 248, 0.8);
          outline-offset: 2px;
          border-radius: 4px;
        }

        .audit-empty {
          text-align: center;
          padding: 32px 16px;
          color: #e2e8f0;
        }

        /* Mobile Cards */
        .audit-cards-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .audit-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          overflow: hidden;
        }

        .audit-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .audit-card-toggle {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          border-radius: 4px;
        }

        .audit-card-toggle:hover {
          color: #e2e8f0;
        }

        .audit-card-body {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .audit-card-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
        }

        .audit-card-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .audit-card-value {
          color: #cbd5e1;
          text-align: right;
          word-break: break-word;
        }

        .audit-card-details {
          padding: 12px 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(56, 189, 248, 0.05);
        }

        .audit-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .audit-metadata-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          margin: 0;
        }

        .audit-metadata-content {
          margin: 0;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 6px;
          font-size: 11px;
          color: #cbd5e1;
          font-family: "Monaco", "Courier New", monospace;
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }

        .audit-detail-panel {
          padding: 8px 0 4px;
        }

        .audit-empty-mobile {
          text-align: center;
          padding: 32px 16px;
          color: #e2e8f0;
          font-size: 14px;
        }

        .audit-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0 4px;
          flex-wrap: wrap;
        }

        .audit-page-info {
          font-size: 13px;
          color: #94a3b8;
        }

        .audit-page-total {
          color: #e2e8f0;
        }

        .audit-page-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .audit-page-btn {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #94a3b8;
          width: 36px;
          height: 36px;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .audit-page-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }

        .audit-page-btn:not(:disabled):hover {
          color: #e2e8f0;
          border-color: rgba(148, 163, 184, 0.4);
        }

        .audit-page-num {
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #94a3b8;
          width: 36px;
          height: 36px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .audit-page-num:hover {
          color: #e2e8f0;
          border-color: rgba(148, 163, 184, 0.4);
        }

        .audit-page-num-active {
          background: #0ea5e9;
          color: #fff;
          border-color: #0ea5e9;
        }

        .audit-page-num-active:hover {
          background: #0284c7;
          color: #fff;
          border-color: #0284c7;
        }

        /* Responsive */
        @media (min-width: 768px) {
          .audit-table-wrapper {
            display: block;
          }

          .audit-cards-wrapper {
            display: none;
          }
        }

        @media (max-width: 520px) {
          .audit-trail-container {
            padding: 20px 16px;
          }

          .audit-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .audit-export-btn {
            width: 100%;
            justify-content: center;
          }

          .audit-controls {
            width: 100%;
            flex-direction: column;
          }

          .audit-filter-group,
          .audit-sort-group {
            width: 100%;
          }

          .audit-select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
