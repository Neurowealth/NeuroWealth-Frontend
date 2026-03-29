"use client";

import { useState, useEffect } from "react";
import { AuditEvent, mockAudit } from "@/lib/mock-audit";
import { Download, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditTableSkeleton } from "@/components/ui/Skeleton";

type EventTypeFilter = "all" | AuditEvent["eventType"];

export function AuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventTypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate async fetch of audit events
    const timer = setTimeout(() => {
      setEvents(mockAudit.getEvents());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AuditTableSkeleton rows={6} />;
  }

  const filteredEvents = events
    .filter((e) => filter === "all" || e.eventType === filter)
    .sort((a, b) => {
      const diff = b.timestamp.getTime() - a.timestamp.getTime();
      return sortOrder === "desc" ? diff : -diff;
    });

  const handleExport = () => {
    const csv = mockAudit.exportAsCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventTypeLabels: Record<AuditEvent["eventType"], string> = {
    login: "Login",
    logout: "Logout",
    signup: "Sign Up",
    profile_update: "Profile Updated",
    password_change: "Password Changed",
    settings_change: "Settings Changed",
    transaction: "Transaction",
    export: "Export",
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
          <h1 className="audit-title">Account Audit Trail</h1>
          <p className="audit-subtitle">View all account activity and events</p>
        </div>
        <Button
          onClick={handleExport}
          variant="secondary"
          size="md"
          className="audit-export-btn"
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Controls */}
      <div className="audit-controls">
        <div className="audit-filter-group">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as EventTypeFilter)}
            className="audit-select"
            aria-label="Filter events by type"
          >
            <option value="all">All Events</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="signup">Sign Up</option>
            <option value="profile_update">Profile Updated</option>
            <option value="password_change">Password Changed</option>
            <option value="settings_change">Settings Changed</option>
            <option value="transaction">Transaction</option>
            <option value="export">Export</option>
          </select>
        </div>

        <div className="audit-sort-group">
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="audit-sort-btn"
            aria-label={`Sort by date ${sortOrder === "desc" ? "ascending" : "descending"}`}
          >
            <ChevronDown size={16} className={sortOrder === "asc" ? "rotate-180" : ""} />
            {sortOrder === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="audit-table-wrapper">
        <table className="audit-table" role="grid">
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="audit-empty">
                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className="audit-row">
                  <td>
                    <span className={`audit-badge ${eventTypeColors[event.eventType]}`}>
                      {eventTypeLabels[event.eventType]}
                    </span>
                  </td>
                  <td className="audit-timestamp">
                    {event.timestamp.toLocaleString()}
                  </td>
                  <td>{event.actor}</td>
                  <td className="audit-ip">{event.ipAddress || "N/A"}</td>
                  <td>
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === event.id ? null : event.id)
                      }
                      className="audit-expand-btn"
                      aria-label={`${expandedId === event.id ? "Collapse" : "Expand"} details`}
                    >
                      {expandedId === event.id ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="audit-cards-wrapper">
        {filteredEvents.length === 0 ? (
          <div className="audit-empty-mobile">No events found</div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="audit-card">
              <div className="audit-card-header">
                <span className={`audit-badge ${eventTypeColors[event.eventType]}`}>
                  {eventTypeLabels[event.eventType]}
                </span>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === event.id ? null : event.id)
                  }
                  className="audit-card-toggle"
                  aria-label={`${expandedId === event.id ? "Collapse" : "Expand"} details`}
                >
                  <ChevronDown
                    size={16}
                    className={expandedId === event.id ? "rotate-180" : ""}
                  />
                </button>
              </div>
              <div className="audit-card-body">
                <div className="audit-card-row">
                  <span className="audit-card-label">Timestamp</span>
                  <span className="audit-card-value">
                    {event.timestamp.toLocaleString()}
                  </span>
                </div>
                <div className="audit-card-row">
                  <span className="audit-card-label">Actor</span>
                  <span className="audit-card-value">{event.actor}</span>
                </div>
                <div className="audit-card-row">
                  <span className="audit-card-label">IP Address</span>
                  <span className="audit-card-value">{event.ipAddress || "N/A"}</span>
                </div>
              </div>
              {expandedId === event.id && (
                <div className="audit-card-details">
                  <div className="audit-metadata">
                    <p className="audit-metadata-label">Metadata</p>
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
        }

        .audit-select {
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 14px;
          cursor: pointer;
          outline: none;
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
          color: #64748b;
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

        .audit-empty {
          text-align: center;
          padding: 32px 16px;
          color: #64748b;
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

        .audit-empty-mobile {
          text-align: center;
          padding: 32px 16px;
          color: #64748b;
          font-size: 14px;
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
