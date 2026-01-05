import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getRegisters,
  getCurrentSession,
  getOrdersReadyForCheckout,
  getReceipt,
} from "../services/apis";

import SessionManager from "../components/cashier/SessionManager";
import OrderQueue from "../components/cashier/OrderQueue";
import PaymentProcessor from "../components/cashier/PaymentProcessor";
import QuickStats from "../components/cashier/QuickStats";
import ReceiptPreview from "../components/cashier/ReceiptPreview";

export default function CashierDashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const token = useSelector((store) => store.user.token);

  // Fetch registers
  const { data: registersData } = useQuery({
    queryKey: ["registers"],
    queryFn: () => getRegisters(token),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch current session
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ["current-session"],
    queryFn: () => getCurrentSession(token),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch orders ready for checkout
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-ready"],
    queryFn: () => getOrdersReadyForCheckout(token),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!sessionData?.data, // Only fetch if session is active
  });

  const registers = registersData?.data || [];
  const currentSession = sessionData?.data;
  const orders = ordersData?.data || [];

  const handleSessionChange = (session) => {
    refetchSession();
    if (!session) {
      setSelectedOrder(null);
    }
  };

  const handlePaymentComplete = async (transactionData) => {
    // Show receipt after successful payment
    if (transactionData?.id) {
      try {
        const receiptResponse = await getReceipt(transactionData.id, token);
        setReceiptData(receiptResponse.data);
        setShowReceipt(true);
      } catch (err) {
        console.error("Failed to fetch receipt:", err);
      }
    }
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 p-6 pb-0">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
          Cashier Dashboard
        </h2>
      </div>

      <div className="px-6">
        {/* Session Manager */}
        <SessionManager
          registers={registers}
          currentSession={currentSession}
          onSessionChange={handleSessionChange}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Queue */}
          <div className="h-[500px]">
            <OrderQueue
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              isLoading={ordersLoading}
            />
          </div>

          {/* Payment Processor */}
          <div className="h-[500px]">
            <PaymentProcessor
              order={selectedOrder}
              session={currentSession}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats session={currentSession} />
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
    </div>
  );
}
