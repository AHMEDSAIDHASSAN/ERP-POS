import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { getSessionHistory, getRegisters } from "../services/apis";

export default function SessionHistory() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  const [filters, setFilters] = useState({
    register_id: "",
    state: "",
    date_from: "",
    date_to: "",
    all: "true",
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch registers for filter dropdown
  const { data: registersData } = useQuery({
    queryKey: ["registers"],
    queryFn: () => getRegisters(token),
  });
  const registers = registersData?.data || [];

  // Fetch session history
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["session-history", filters, page],
    queryFn: () =>
      getSessionHistory(token, {
        ...filters,
        limit,
        offset: (page - 1) * limit,
      }),
    keepPreviousData: true,
  });

  const sessions = sessionsData?.data || [];
  const pagination = sessionsData?.pagination || { total: 0 };
  const totalPages = Math.ceil(pagination.total / limit);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDuration = (hours) => {
    if (!hours) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVarianceIcon = (status) => {
    switch (status) {
      case "over":
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case "short":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-green-400" />;
    }
  };

  const getVarianceColor = (status) => {
    switch (status) {
      case "over":
        return "text-blue-400";
      case "short":
        return "text-red-400";
      default:
        return "text-green-400";
    }
  };

  // Calculate summary stats
  const summaryStats = {
    totalSessions: pagination.total || sessions.length,
    openSessions: sessions.filter((s) => s.state === "open").length,
    closedSessions: sessions.filter((s) => s.state === "closed").length,
    totalSales: sessions.reduce((sum, s) => sum + (s.summary?.totalSales || 0), 0),
    totalVariance: sessions.reduce((sum, s) => sum + (s.variance || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
          Session History
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Total Sessions
          </div>
          <div className="text-2xl font-bold">{summaryStats.totalSessions}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Clock className="w-4 h-4 text-green-400" />
            Open
          </div>
          <div className="text-2xl font-bold text-green-400">
            {summaryStats.openSessions}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            Closed
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {summaryStats.closedSessions}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            Total Sales
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {summaryStats.totalSales.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            {summaryStats.totalVariance >= 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            Total Variance
          </div>
          <div
            className={`text-2xl font-bold ${
              summaryStats.totalVariance >= 0 ? "text-blue-400" : "text-red-400"
            }`}
          >
            {summaryStats.totalVariance >= 0 ? "+" : ""}
            {summaryStats.totalVariance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Register</label>
            <select
              value={filters.register_id}
              onChange={(e) => handleFilterChange("register_id", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Registers</option>
              {registers.map((reg) => (
                <option key={reg._id} value={reg._id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange("state", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No sessions found
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Session
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Register
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Cashier
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Opened
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                      Sales
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                      Variance
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sessions.map((session) => (
                    <tr
                      key={session._id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{session.name}</div>
                        <div className="text-xs text-gray-400">
                          {session.summary?.transactionCount || 0} transactions
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {session.register?.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {session.cashier?.name || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatDateTime(session.openedAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-yellow-400 font-medium">
                          {(session.summary?.totalSales || 0).toFixed(2)} EG
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className={`flex items-center justify-end gap-1 ${getVarianceColor(
                            session.varianceStatus
                          )}`}
                        >
                          {getVarianceIcon(session.varianceStatus)}
                          <span className="font-medium">
                            {session.variance >= 0 ? "+" : ""}
                            {(session.variance || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {session.state === "open" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            <Clock className="w-3 h-3" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/session/${session._id}`)}
                          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-700">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="p-4 hover:bg-gray-700/50 transition-colors"
                  onClick={() => navigate(`/session/${session._id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">{session.name}</div>
                    {session.state === "open" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">
                      Register: {session.register?.name || "-"}
                    </div>
                    <div className="text-gray-400">
                      Cashier: {session.cashier?.name || "-"}
                    </div>
                    <div className="text-gray-400">
                      Opened: {formatDateTime(session.openedAt)}
                    </div>
                    <div className="text-gray-400">
                      Duration: {formatDuration(session.duration)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                    <div className="text-yellow-400 font-medium">
                      {(session.summary?.totalSales || 0).toFixed(2)} EG
                    </div>
                    <div
                      className={`flex items-center gap-1 ${getVarianceColor(
                        session.varianceStatus
                      )}`}
                    >
                      {getVarianceIcon(session.varianceStatus)}
                      <span>
                        {session.variance >= 0 ? "+" : ""}
                        {(session.variance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-700">
            <div className="text-sm text-gray-400">
              Page {page} of {totalPages} ({pagination.total} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
