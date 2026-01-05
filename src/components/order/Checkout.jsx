import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { checkoutOrder } from "../../services/apis";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Checkout() {
  const [way, setWay] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [visaAmount, setVisaAmount] = useState("");
  const [hybridCashAmount, setHybridCashAmount] = useState("");
  const [hybridVisaAmount, setHybridVisaAmount] = useState("");
  const [hybridVisaNumber, setHybridVisaNumber] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const { state } = location;
  const { order } = state || {};
  const token = useSelector((store) => store.user.token);

  console.log(order.totalPrice);
  // Check if order exists on mount and pre-fill cash amount
  useEffect(() => {
    if (!order) {
      toast.error("No order found. Redirecting...");
      navigate(-1);
    } else if (order.total) {
      // Pre-fill cash amount with order total
      setCashAmount(order.total.toString());
    }
  }, [order, navigate]);

  const handlePaymentMethodChange = (method) => {
    setWay(method);
    // Reset form fields when switching payment methods
    if (method === "cash") {
      setCashAmount(order?.totalPrice ? order.totalPrice.toString() : "");
      setVisaNumber("");
      setVisaAmount("");
    } else if (method === "visa") {
      setCashAmount("");
      setVisaNumber("");
      setVisaAmount(order?.totalPrice ? order.totalPrice.toString() : "");
    } else {
      setCashAmount("");
      setVisaNumber("");
      setVisaAmount("");
    }
    setHybridCashAmount("");
    setHybridVisaAmount("");
    setHybridVisaNumber("");
  };

  // Format card number with spaces

  // Handle card number input
  const handleCardNumberChange = (value, setter) => {
    // 16 digits + 3 spaces
    setter(value);
  };

  useEffect(() => {
    setWay("cash");
    setCashAmount(order?.totalPrice ? order.totalPrice.toString() : "");
  }, []);
  // Validation functions
  const validateCashPayment = () => {
    const amount = parseFloat(cashAmount);
    if (!cashAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid cash amount");
      return false;
    }
    if (order && order.total && amount < order.total) {
      toast.error(`Amount must be at least $${order.total}`);
      return false;
    }
    return true;
  };

  const validateVisaPayment = () => {
    const amount = parseFloat(visaAmount);
    if (!visaAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid visa amount");
      return false;
    }
    if (!visaNumber) {
      toast.error("Please enter a valid card number");
      return false;
    }
    if (order && order.total && amount < order.total) {
      toast.error(`Amount must be at least $${order.total}`);
      return false;
    }
    return true;
  };

  const validateHybridPayment = () => {
    const cashAmt = parseFloat(hybridCashAmount);
    const visaAmt = parseFloat(hybridVisaAmount);

    if (!hybridCashAmount || isNaN(cashAmt) || cashAmt <= 0) {
      toast.error("Please enter a valid cash amount");
      return false;
    }
    if (!hybridVisaAmount || isNaN(visaAmt) || visaAmt <= 0) {
      toast.error("Please enter a valid visa amount");
      return false;
    }
    if (!hybridVisaNumber) {
      toast.error("Please enter a valid card number ");
      return false;
    }

    const totalAmount = cashAmt + visaAmt;
    if (order && order.total && totalAmount < order.total) {
      toast.error(`Total amount must be at least $${order.total}`);
      return false;
    }

    return true;
  };

  // Calculate total amount
  const getTotalAmount = () => {
    switch (way) {
      case "cash":
        return parseFloat(cashAmount) || 0;
      case "visa":
        return parseFloat(visaAmount) || 0;
      case "hybrid":
        return (
          (parseFloat(hybridCashAmount) || 0) +
          (parseFloat(hybridVisaAmount) || 0)
        );
      default:
        return 0;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["checkout-order", order?._id],
    mutationFn: (payload) => checkoutOrder(payload, token, order._id),
    onError: (err) => {
      const errorMessage =
        err?.response?.data?.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      toast.success("Payment completed successfully!");

      navigate(-1);
    },
  });

  const handleSubmit = () => {
    if (!order) {
      toast.error("No order found");
      return;
    }

    let data = {};
    let isValid = false;

    switch (way) {
      case "cash":
        isValid = validateCashPayment();
        if (isValid) {
          data = {
            cashAmount: parseFloat(cashAmount),
            paymentWay: way,
          };
        }
        break;

      case "visa":
        isValid = validateVisaPayment();
        if (isValid) {
          data = {
            visaAmount: parseFloat(visaAmount),
            visaNumber: visaNumber.replace(/\s/g, ""), // Remove spaces for API
            paymentWay: way,
          };
        }
        break;

      case "hybrid":
        isValid = validateHybridPayment();
        if (isValid) {
          data = {
            visaAmount: parseFloat(hybridVisaAmount),
            visaNumber: hybridVisaNumber.replace(/\s/g, ""), // Remove spaces for API
            cashAmount: parseFloat(hybridCashAmount),
            paymentWay: way,
          };
        }
        break;

      default:
        toast.error("Please select a payment method");
        return;
    }

    if (isValid) {
      mutate(data);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Don't render if no order
  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-3 mb-6 lg:mb-8 p-6">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4 flex items-center justify-between w-full">
          <div>Checkout</div>
        </h2>
      </div>

      <div className="px-6">
        {/* Order Summary */}

        <h4 className="text-lg font-semibold mb-4 text-gray-200">
          Payment Method
        </h4>

        <div className="grid grid-cols-3 gap-4 mt-4 mb-8">
          <button
            onClick={() => handlePaymentMethodChange("cash")}
            disabled={isPending}
            className={`bg-popular hover:bg-yellow-600 text-center py-5 px-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              way === "cash" ? "bg-yellow-500/90 ring-2 ring-yellow-800" : ""
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => handlePaymentMethodChange("visa")}
            disabled={isPending}
            className={`bg-popular hover:bg-yellow-600 text-center py-5 px-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              way === "visa" ? "bg-yellow-500/90 ring-2 ring-yellow-800" : ""
            }`}
          >
            Visa
          </button>
          <button
            onClick={() => handlePaymentMethodChange("hybrid")}
            disabled={isPending}
            className={`bg-popular hover:bg-yellow-600 text-center py-5 px-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              way === "hybrid" ? "bg-yellow-500/90 ring-2 ring-yellow-800" : ""
            }`}
          >
            Hybrid
          </button>
        </div>

        <div className="space-y-6">
          {way === "cash" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h5 className="text-lg font-semibold mb-4 text-green-400">
                Cash Payment
              </h5>
              <div>
                <label
                  htmlFor="cashAmount"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Amount ($){" "}
                  {order?.total && `(Minimum: $${order.total.toFixed(2)})`}
                </label>
                <input
                  type="number"
                  id="cashAmount"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                  step="0.01"
                  min="0"
                  disabled={isPending}
                  required
                />
              </div>
            </div>
          )}

          {way === "visa" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h5 className="text-lg font-semibold mb-4 text-blue-400">
                Visa Payment
              </h5>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="visaAmount"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Amount ($){" "}
                    {order?.total && `(Minimum: $${order.total.toFixed(2)})`}
                  </label>
                  <input
                    type="number"
                    id="visaAmount"
                    value={visaAmount}
                    onChange={(e) => setVisaAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    step="0.01"
                    min="0"
                    disabled={isPending}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="visaNumber"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Visa Card Number
                  </label>
                  <input
                    type="text"
                    id="visaNumber"
                    value={visaNumber}
                    onChange={(e) =>
                      handleCardNumberChange(e.target.value, setVisaNumber)
                    }
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    disabled={isPending}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {way === "hybrid" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h5 className="text-lg font-semibold mb-4 text-purple-400">
                Hybrid Payment{" "}
                {order?.total && `(Total Required: $${order.total.toFixed(2)})`}
              </h5>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h6 className="font-medium text-green-400 mb-3">
                    Cash Portion
                  </h6>
                  <div>
                    <label
                      htmlFor="hybridCashAmount"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Cash Amount ($)
                    </label>
                    <input
                      type="number"
                      id="hybridCashAmount"
                      value={hybridCashAmount}
                      onChange={(e) => setHybridCashAmount(e.target.value)}
                      placeholder="Enter cash amount"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                      step="0.01"
                      min="0"
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h6 className="font-medium text-blue-400 mb-3">
                    Visa Portion
                  </h6>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="hybridVisaAmount"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Visa Amount ($)
                      </label>
                      <input
                        type="number"
                        id="hybridVisaAmount"
                        value={
                          hybridVisaAmount ||
                          (order?.totalPrice - hybridCashAmount).toFixed(2)
                        }
                        onChange={(e) => setHybridVisaAmount(e.target.value)}
                        placeholder="Enter visa amount"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        step="0.01"
                        min="0"
                        disabled={isPending}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="hybridVisaNumber"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Visa Card Number
                      </label>
                      <input
                        type="text"
                        id="hybridVisaNumber"
                        value={hybridVisaNumber}
                        onChange={(e) =>
                          handleCardNumberChange(
                            e.target.value,
                            setHybridVisaNumber
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Complete Payment"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Total Display */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span
              className={`font-bold ${
                order?.total && getTotalAmount() >= order.total
                  ? "text-green-400"
                  : getTotalAmount() > 0
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              ${getTotalAmount().toFixed(2)}
            </span>
          </div>
          {order?.total &&
            getTotalAmount() > 0 &&
            getTotalAmount() < order.total && (
              <div className="text-sm text-yellow-400 mt-1">
                Need ${(order.total - getTotalAmount()).toFixed(2)} more
              </div>
            )}
          {way === "hybrid" && (
            <div className="text-sm text-gray-400 mt-2 space-y-1">
              <div>Cash: ${(parseFloat(hybridCashAmount) || 0).toFixed(2)}</div>
              <div>Visa: ${(parseFloat(hybridVisaAmount) || 0).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
