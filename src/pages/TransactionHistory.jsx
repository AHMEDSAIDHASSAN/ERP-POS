import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getTransactions, getReceipt } from "../services/apis";
import { Search, Filter, Printer, RotateCcw, Receipt, Calendar } from "lucide-react";
import ReceiptPreview from "../components/cashier/ReceiptPreview";
import RefundModal from "../components/cashier/RefundModal";

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    payment_method: "",
    transaction_type: "",
    date_from: "",
    date_to: "",
  });
  const [page, setPage] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const token = useSelector((store) => store.user.token);

  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ["transactions", filters, page],
    queryFn: () => getTransactions(token, { ...filters, page, limit: 20 }),
  });

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination || {};

  const handleViewReceipt = async (transaction) => {
    try {
      const response = await getReceipt(transaction.id, token);
      setReceiptData(response.data);
      setShowReceipt(true);
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
    }
  };

  const handleRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundModal(true);
  };

  const handleRefundComplete = () => {
    refetch();
    setShowRefundModal(false);
    setSelectedTransaction(null);
  };

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case "cash":
        return "bg-green-500/20 text-green-400";
      case "visa":
        return "bg-blue-500/20 text-blue-400";
      case "hybrid":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTransactionTypeBadge = (type) => {
    return type === "refund"
      ? "bg-red-500/20 text-red-400"
      : "bg-green-500/20 text-green-400";
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tx.receipt_number?.toLowerCase().includes(search) ||
      tx.order_number?.toLowerCase().includes(search) ||
      tx.cashier_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-6 pb-0">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
          Transaction History
        </h2>
      </div>

      <div className="px-6">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search receipt or order number..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={filters.payment_method}
                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="visa">Visa</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <select
                value={filters.transaction_type}
                onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Types</option>
                <option value="sale">Sales</option>
                <option value="refund">Refunds</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Receipt #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Cashier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-white font-mono">
                        {tx.receipt_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {tx.order_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(tx.created_at || tx.create_date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {tx.cashier_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${getPaymentMethodBadge(tx.payment_method)}`}>
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${getTransactionTypeBadge(tx.transaction_type)}`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${
                        tx.transaction_type === "refund" ? "text-red-400" : "text-green-400"
                      }`}>
                        {tx.transaction_type === "refund" ? "-" : ""}{tx.amount?.toFixed(2)} EG
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(tx)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                            title="View Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {tx.transaction_type === "sale" && (
                            <button
                              onClick={() => handleRefund(tx)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
                              title="Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Receipt className="w-12 h-12 mb-2 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.total_pages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showReceipt && receiptData && (
        <ReceiptPreview
          receipt={receiptData}
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
          }}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <RefundModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedTransaction(null);
          }}
          onRefundComplete={handleRefundComplete}
        />
      )}
    </div>
  );
}
