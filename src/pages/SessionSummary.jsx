import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  CreditCard,
  Banknote,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import { getSession, getReceipt } from "../services/apis";
import ReceiptPreview from "../components/cashier/ReceiptPreview";

export default function SessionSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Fetch session details
  const { data: sessionData, isLoading, error, refetch } = useQuery({
    queryKey: ["session", id],
    queryFn: () => getSession(id, token),
    enabled: !!id && !!token,
  });

  const session = sessionData?.data;

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} minutes`;
    return `${h} hours ${m} minutes`;
  };

  const getVarianceStatus = (variance, status) => {
    if (status === "exact" || variance === 0) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        label: "Balanced",
      };
    } else if (status === "over" || variance > 0) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        label: "Over",
      };
    } else {
      return {
        icon: <TrendingDown className="w-5 h-5 text-red-400" />,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        label: "Short",
      };
    }
  };

  const handleViewReceipt = async (transactionId) => {
    try {
      const response = await getReceipt(transactionId, token);
      setReceiptData(response.data);
      setShowReceipt(true);
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-400">Loading session details...</div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-gray-400 mb-4">Failed to load session</div>
          <button
            onClick={() => navigate("/sessions")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const varianceInfo = getVarianceStatus(session.variance, session.varianceStatus);
  const summary = session.summary || {};
  const transactions = session.transactions || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/sessions")}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {session.name}
          </h2>
          <div className="text-gray-400 text-sm">
            {session.register?.name} • {session.cashier?.name}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {session.state === "open" ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
              <Clock className="w-4 h-4" />
              Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              <CheckCircle className="w-4 h-4" />
              Closed
            </span>
          )}
        </div>
      </div>

      {/* Session Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            Opened At
          </div>
          <div className="text-white font-medium">
            {formatDateTime(session.openedAt)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            {session.state === "open" ? "Duration (ongoing)" : "Closed At"}
          </div>
          <div className="text-white font-medium">
            {session.state === "open"
              ? formatDuration(session.duration)
              : formatDateTime(session.closedAt)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <User className="w-4 h-4" />
            Cashier
          </div>
          <div className="text-white font-medium">{session.cashier?.name || "-"}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Receipt className="w-4 h-4" />
            Transactions
          </div>
          <div className="text-white font-medium text-2xl">
            {summary.transactionCount || 0}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Sales Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Banknote className="w-4 h-4 text-green-400" />
                Cash Sales
              </div>
              <div className="text-white font-medium">
                {(summary.cashSales || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Card Sales
              </div>
              <div className="text-white font-medium">
                {(summary.visaSales || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Hybrid Sales
              </div>
              <div className="text-white font-medium">
                {(summary.hybridSales || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2 text-red-400">
                <TrendingDown className="w-4 h-4" />
                Refunds
              </div>
              <div className="text-red-400 font-medium">
                -{(summary.totalRefunds || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-3 bg-gray-700/50 rounded-lg px-3">
              <div className="text-yellow-400 font-semibold">Total Sales</div>
              <div className="text-yellow-400 font-bold text-xl">
                {(summary.totalSales || 0).toFixed(2)} EG
              </div>
            </div>
          </div>
        </div>

        {/* Cash Reconciliation */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-400" />
            Cash Reconciliation
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="text-gray-300">Opening Balance</div>
              <div className="text-white font-medium">
                {(session.openingBalance || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="text-gray-300">+ Cash Sales</div>
              <div className="text-green-400 font-medium">
                +{(summary.cashSales || 0).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="text-gray-300">- Cash Refunds</div>
              <div className="text-red-400 font-medium">
                -{((summary.totalRefunds || 0) * (summary.cashSales / (summary.totalSales || 1))).toFixed(2)} EG
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700 bg-gray-700/30 px-3 rounded">
              <div className="text-gray-300 font-medium">Expected Closing</div>
              <div className="text-white font-bold">
                {(session.expectedClosing || 0).toFixed(2)} EG
              </div>
            </div>
            {session.state === "closed" && (
              <>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="text-gray-300">Actual Closing</div>
                  <div className="text-white font-medium">
                    {(session.actualClosing || 0).toFixed(2)} EG
                  </div>
                </div>
                <div
                  className={`flex items-center justify-between py-3 ${varianceInfo.bgColor} rounded-lg px-3`}
                >
                  <div className="flex items-center gap-2">
                    {varianceInfo.icon}
                    <span className={`font-semibold ${varianceInfo.color}`}>
                      Variance ({varianceInfo.label})
                    </span>
                  </div>
                  <div className={`font-bold text-xl ${varianceInfo.color}`}>
                    {session.variance >= 0 ? "+" : ""}
                    {(session.variance || 0).toFixed(2)} EG
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          {(session.notes || session.closingNotes) && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Notes</div>
              <div className="text-gray-300 bg-gray-700/50 rounded-lg p-3">
                {session.closingNotes || session.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-yellow-400" />
            Transactions ({transactions.length})
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No transactions in this session
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Receipt #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                      Time
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        {tx.receiptNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">{tx.order?.orderNumber}</div>
                        <div className="text-xs text-gray-400">
                          {tx.order?.table || tx.order?.orderType}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tx.transactionType === "sale" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                            <DollarSign className="w-3 h-3" />
                            Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                            <TrendingDown className="w-3 h-3" />
                            Refund
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-300">
                          {tx.paymentMethod === "cash" && (
                            <Banknote className="w-4 h-4 text-green-400" />
                          )}
                          {tx.paymentMethod === "visa" && (
                            <CreditCard className="w-4 h-4 text-blue-400" />
                          )}
                          {tx.paymentMethod === "hybrid" && (
                            <DollarSign className="w-4 h-4 text-purple-400" />
                          )}
                          <span className="capitalize">{tx.paymentMethod}</span>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          tx.transactionType === "refund"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {tx.transactionType === "refund" ? "-" : ""}
                        {(tx.amount || 0).toFixed(2)} EG
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {tx.processedAt
                          ? new Date(tx.processedAt).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewReceipt(tx._id)}
                          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-700">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-sm text-white">
                      {tx.receiptNumber}
                    </div>
                    {tx.transactionType === "sale" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        Sale
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                        Refund
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      {tx.order?.orderNumber} • {tx.paymentMethod}
                    </div>
                    <div
                      className={`font-medium ${
                        tx.transactionType === "refund"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {tx.transactionType === "refund" ? "-" : ""}
                      {(tx.amount || 0).toFixed(2)} EG
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      {tx.processedAt
                        ? new Date(tx.processedAt).toLocaleTimeString()
                        : "-"}
                    </div>
                    <button
                      onClick={() => handleViewReceipt(tx._id)}
                      className="text-yellow-400 text-sm"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <ReceiptPreview
          receipt={receiptData}
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
          }}
        />
      )}
    </div>
  );
}
