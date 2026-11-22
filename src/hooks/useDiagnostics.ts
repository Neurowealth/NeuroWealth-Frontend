import { useState, useEffect } from "react";
import { LogEntry, subscribeToLogs } from "@/lib/logger";
import { AnalyticsEvent, subscribeToEvents } from "@/lib/analytics";
import {
  getRedactedDiagnosticsEnv,
  redactDiagnosticLog,
} from "@/components/diagnostics/diagnostics-config";

export function useDiagnostics() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    const unsubscribeLogs = subscribeToLogs((entry) => {
      setLogs((prev) => [redactDiagnosticLog(entry), ...prev].slice(0, 50)); // Keep last 50
    });

    const unsubscribeEvents = subscribeToEvents((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep last 50
    });

    return () => {
      unsubscribeLogs();
      unsubscribeEvents();
    };
  }, []);

  const clearLogs = () => setLogs([]);
  const clearEvents = () => setEvents([]);

  return {
    logs,
    events,
    clearLogs,
    clearEvents,
    env: getRedactedDiagnosticsEnv(),
  };
}
