import React from "react";
import { LogEntry } from "@/lib/logger";

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function LogViewer({ logs, onClear }: LogViewerProps) {
  const levelColors = {
    info: "text-sky-400",
    warn: "text-amber-400",
    error: "text-red-400",
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <div className="p-2 border-b border-slate-700 flex justify-between bg-slate-800">
        <span className="text-[10px] uppercase font-bold text-slate-500">System Logs</span>
        <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-b border-slate-800 pb-1">
              <div className="flex gap-2">
                <span className="text-slate-500">[{log.timestamp.split("T")[1].split(".")[0]}]</span>
                <span className={`font-bold uppercase ${levelColors[log.level]}`}>{log.level}</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
              {log.context != null && (
                <pre className="text-slate-500 mt-1 overflow-x-auto">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
