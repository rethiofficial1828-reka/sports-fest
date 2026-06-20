"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Shield, RefreshCw } from "lucide-react";
import dayjs from "dayjs";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setFilteredLogs(data);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load audit logs.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          (log.user?.email || "").toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          (log.ipAddress || "").includes(q) ||
          (log.deviceInfo || "").toLowerCase().includes(q)
      );
    }

    if (actionFilter !== "all") {
      result = result.filter((log) => {
        if (actionFilter === "auth") {
          return log.action.toLowerCase().includes("login") || log.action.toLowerCase().includes("logout") || log.action.toLowerCase().includes("register");
        }
        if (actionFilter === "event") {
          return log.action.toLowerCase().includes("event");
        }
        if (actionFilter === "user") {
          return log.action.toLowerCase().includes("role") || log.action.toLowerCase().includes("blocked") || log.action.toLowerCase().includes("user");
        }
        return true;
      });
    }

    setFilteredLogs(result);
  }, [searchQuery, actionFilter, logs]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Security & Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor and audit all sensitive enterprise system activities and user operations.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="btn-secondary self-start md:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Logs
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, action, IP, or browser..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Actions</option>
            <option value="auth">Authentication (Login, Register)</option>
            <option value="event">Event Actions (Create, Approve)</option>
            <option value="user">User & Roles</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 font-medium max-w-xl mx-auto">
          {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 text-slate-400">
          No audit logs found matching the filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-sm">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Device Information</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {dayjs(log.timestamp).format("DD MMM YYYY, hh:mm A")}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {log.user?.email || <span className="text-slate-400 font-normal">Anonymous</span>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          log.action.includes("Failed") || log.action.includes("Blocked")
                            ? "bg-red-50 text-red-700"
                            : log.action.includes("Successful")
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate" title={log.deviceInfo}>
                      {log.deviceInfo || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
