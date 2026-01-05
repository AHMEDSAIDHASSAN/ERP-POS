import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processRefund } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X, AlertTriangle } from "lucide-react";

export default function RefundModal({ transaction, onClose, onRefundComplete }) {
  const [refundType, setRefundType] = useState("full");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  const totalAmount = transaction?.amount || 0;

  const refundMutation = useMutation({
    mutationFn: (data) => processRefund(transaction.id, data, token),
    onSuccess: (data) => {
      toast.success("Refund processed successfully!");
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["current-session"]);
      if (onRefundComplete) onRefundComplete(data.data);
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to process refund");
    },
  });

  const handleSubmit = () => {
    const amount = refundType === "full" ? totalAmount : parseFloat(refundAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (amount > totalAmount) {
      toast.error(`Refund amount cannot exceed ${totalAmount.toFixed(2)} EG`);
      return;
    }

    if (!refundReason.trim()) {
      toast.error("Please enter a reason for the refund");
      return;
    }

    refundMutation.mutate({
      refund_amount: amount,
      refund_reason: refundReason.trim(),
    });
  };

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Process Refund</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Transaction Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Receipt:</span>
                <span className="ml-2 text-white">{transaction.receipt_number}</span>
              </div>
              <div>
                <span className="text-gray-400">Order:</span>
                <span className="ml-2 text-white">{transaction.order_number}</span>
              </div>
              <div>
                <span className="text-gray-400">Amount:</span>
                <span className="ml-2 text-green-400 font-medium">{totalAmount.toFixed(2)} EG</span>
              </div>
              <div>
                <span className="text-gray-400">Method:</span>
                <span className="ml-2 text-white capitalize">{transaction.payment_method}</span>
              </div>
            </div>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRefundType("full")}
                className={`p-3 rounded-lg text-center transition-all ${
                  refundType === "full"
                    ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                    : "bg-gray-700 border-2 border-transparent text-gray-400"
                }`}
              >
                Full Refund
              </button>
              <button
                onClick={() => setRefundType("partial")}
                className={`p-3 rounded-lg text-center transition-all ${
                  refundType === "partial"
                    ? "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400"
                    : "bg-gray-700 border-2 border-transparent text-gray-400"
                }`}
              >
                Partial Refund
              </button>
            </div>
          </div>

          {/* Partial Amount */}
          {refundType === "partial" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Refund Amount (EG)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Max: ${totalAmount.toFixed(2)}`}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                step="0.01"
                min="0.01"
                max={totalAmount}
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refund Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter the reason for this refund..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Refund Summary */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Refund Amount:</span>
              <span className="text-red-400 text-xl font-bold">
                -{(refundType === "full" ? totalAmount : parseFloat(refundAmount) || 0).toFixed(2)} EG
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={refundMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {refundMutation.isPending ? "Processing..." : "Process Refund"}
          </button>
          <button
            onClick={onClose}
            disabled={refundMutation.isPending}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
