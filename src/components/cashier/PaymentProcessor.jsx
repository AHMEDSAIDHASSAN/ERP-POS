import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processCheckout } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CreditCard, Banknote, Shuffle } from "lucide-react";

export default function PaymentProcessor({ order, session, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [visaAmount, setVisaAmount] = useState("");
  const [visaLastFour, setVisaLastFour] = useState("");
  const [hybridCash, setHybridCash] = useState("");
  const [hybridVisa, setHybridVisa] = useState("");
  const [hybridVisaLastFour, setHybridVisaLastFour] = useState("");

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  const totalPrice = order?.totalAmount || 0;

  // Pre-fill amounts when order changes
  useEffect(() => {
    if (order) {
      setCashAmount(totalPrice.toFixed(2));
      setVisaAmount(totalPrice.toFixed(2));
      setHybridCash("");
      setHybridVisa("");
    }
  }, [order, totalPrice]);

  const checkoutMutation = useMutation({
    mutationFn: (data) => processCheckout(order._id, data, token),
    onSuccess: (data) => {
      toast.success("Payment processed successfully!");
      queryClient.invalidateQueries(["orders-ready"]);
      queryClient.invalidateQueries(["current-session"]);
      if (onPaymentComplete) onPaymentComplete(data.data);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to process payment");
    },
  });

  const resetForm = () => {
    setPaymentMethod("cash");
    setCashAmount("");
    setVisaAmount("");
    setVisaLastFour("");
    setHybridCash("");
    setHybridVisa("");
    setHybridVisaLastFour("");
  };

  const calculateChange = () => {
    if (paymentMethod === "cash") {
      const received = parseFloat(cashAmount) || 0;
      return Math.max(0, received - totalPrice);
    }
    return 0;
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === "cash") {
      setCashAmount(totalPrice.toFixed(2));
    } else if (method === "visa") {
      setVisaAmount(totalPrice.toFixed(2));
    }
  };

  const validatePayment = () => {
    if (!session) {
      toast.error("No active session. Please open a session first.");
      return false;
    }

    switch (paymentMethod) {
      case "cash": {
        const amount = parseFloat(cashAmount);
        if (!amount || amount < totalPrice) {
          toast.error(`Cash amount must be at least ${totalPrice.toFixed(2)} EG`);
          return false;
        }
        return true;
      }
      case "visa": {
        const amount = parseFloat(visaAmount);
        if (!amount || amount < totalPrice) {
          toast.error(`Visa amount must be at least ${totalPrice.toFixed(2)} EG`);
          return false;
        }
        if (!visaLastFour || visaLastFour.length !== 4) {
          toast.error("Please enter the last 4 digits of the card");
          return false;
        }
        return true;
      }
      case "hybrid": {
        const cash = parseFloat(hybridCash) || 0;
        const visa = parseFloat(hybridVisa) || 0;
        if (cash + visa < totalPrice) {
          toast.error(`Total payment must be at least ${totalPrice.toFixed(2)} EG`);
          return false;
        }
        if (visa > 0 && (!hybridVisaLastFour || hybridVisaLastFour.length !== 4)) {
          toast.error("Please enter the last 4 digits of the card");
          return false;
        }
        return true;
      }
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!validatePayment()) return;

    let payload = {
      paymentMethod: paymentMethod,
    };

    switch (paymentMethod) {
      case "cash":
        payload.cashAmount = parseFloat(cashAmount);
        payload.cashReceived = parseFloat(cashAmount);
        break;
      case "visa":
        payload.visaAmount = parseFloat(visaAmount);
        payload.visaLastFour = visaLastFour;
        break;
      case "hybrid":
        payload.cashAmount = parseFloat(hybridCash) || 0;
        payload.cashReceived = parseFloat(hybridCash) || 0;
        payload.visaAmount = parseFloat(hybridVisa) || 0;
        payload.visaLastFour = hybridVisaLastFour;
        break;
    }

    checkoutMutation.mutate(payload);
  };

  if (!order) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-center text-gray-400">
        <CreditCard className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Select an order to process payment</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
      {/* Order Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Order #{order.orderNumber}</h3>
          <span className="text-sm text-gray-400">
            {order.table?.name || order.orderType}
          </span>
        </div>

        {/* Items List */}
        <div className="bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto mb-4">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between py-1 text-sm">
              <span className="text-gray-300">
                {item.quantity}x {item.name}
              </span>
              <span className="text-white">
                {(item.subtotal || 0).toFixed(2)} EG
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-3">
          <span className="text-white">Total:</span>
          <span className="text-yellow-400">{totalPrice.toFixed(2)} EG</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Payment Method</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handlePaymentMethodChange("cash")}
            disabled={checkoutMutation.isPending}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              paymentMethod === "cash"
                ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                : "bg-gray-700 border-2 border-transparent text-gray-400 hover:bg-gray-600"
            }`}
          >
            <Banknote className="w-6 h-6 mb-1" />
            <span className="text-sm">Cash</span>
          </button>
          <button
            onClick={() => handlePaymentMethodChange("visa")}
            disabled={checkoutMutation.isPending}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              paymentMethod === "visa"
                ? "bg-blue-500/20 border-2 border-blue-500 text-blue-400"
                : "bg-gray-700 border-2 border-transparent text-gray-400 hover:bg-gray-600"
            }`}
          >
            <CreditCard className="w-6 h-6 mb-1" />
            <span className="text-sm">Visa</span>
          </button>
          <button
            onClick={() => handlePaymentMethodChange("hybrid")}
            disabled={checkoutMutation.isPending}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              paymentMethod === "hybrid"
                ? "bg-purple-500/20 border-2 border-purple-500 text-purple-400"
                : "bg-gray-700 border-2 border-transparent text-gray-400 hover:bg-gray-600"
            }`}
          >
            <Shuffle className="w-6 h-6 mb-1" />
            <span className="text-sm">Hybrid</span>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="flex-1 space-y-4">
        {paymentMethod === "cash" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cash Received (EG)
            </label>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              step="0.01"
              min="0"
              disabled={checkoutMutation.isPending}
            />
            {parseFloat(cashAmount) >= totalPrice && (
              <div className="mt-2 p-3 bg-green-500/10 rounded-lg">
                <span className="text-gray-400">Change:</span>
                <span className="ml-2 text-green-400 text-xl font-bold">
                  {calculateChange().toFixed(2)} EG
                </span>
              </div>
            )}
          </div>
        )}

        {paymentMethod === "visa" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (EG)
              </label>
              <input
                type="number"
                value={visaAmount}
                onChange={(e) => setVisaAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
                min="0"
                disabled={checkoutMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Card Last 4 Digits
              </label>
              <input
                type="text"
                value={visaLastFour}
                onChange={(e) => setVisaLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={checkoutMutation.isPending}
              />
            </div>
          </div>
        )}

        {paymentMethod === "hybrid" && (
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cash Amount (EG)
              </label>
              <input
                type="number"
                value={hybridCash}
                onChange={(e) => {
                  setHybridCash(e.target.value);
                  const remaining = totalPrice - (parseFloat(e.target.value) || 0);
                  setHybridVisa(remaining > 0 ? remaining.toFixed(2) : "0");
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                step="0.01"
                min="0"
                disabled={checkoutMutation.isPending}
              />
            </div>
            <div className="border-l-4 border-blue-500 pl-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visa Amount (EG)
                </label>
                <input
                  type="number"
                  value={hybridVisa}
                  onChange={(e) => setHybridVisa(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                  disabled={checkoutMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Card Last 4 Digits
                </label>
                <input
                  type="text"
                  value={hybridVisaLastFour}
                  onChange={(e) => setHybridVisaLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={checkoutMutation.isPending}
                />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Total: {((parseFloat(hybridCash) || 0) + (parseFloat(hybridVisa) || 0)).toFixed(2)} EG
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={checkoutMutation.isPending || !session}
        className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all text-lg"
      >
        {checkoutMutation.isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          `Process Payment - ${totalPrice.toFixed(2)} EG`
        )}
      </button>

      {!session && (
        <p className="text-yellow-400 text-sm text-center mt-2">
          Open a session to process payments
        </p>
      )}
    </div>
  );
}
