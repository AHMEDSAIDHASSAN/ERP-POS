import React, { useState } from "react";
import {
  Check,
  X,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTables, imageBase } from "../../services/apis";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const OrderTracking = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isLoading] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [tempTableId, setTempTableId] = useState(null);

  const navigate = useNavigate("");
  const token = useSelector((store) => store.user.token);
  const { data: tableList } = useQuery({
    queryKey: ["get-tables"],
    queryFn: () => getTables(token),
  });

  // const location = useLocation();
  // // const { state } = location;
  // let { data } = state;

  const handleCancelOrder = () => {
    setSelectedTable(null);
    setOrderConfirmed(false);
    navigate("/make-order");
  };

  const handleTableClick = (table) => {
    if (table.status !== "available") {
      toast.error(`Table is ${table.status}`);
      return;
    }
    setTempTableId(table._id);
    setShowGuestPopup(true);
  };

  const handleGuestConfirm = () => {
    setSelectedTable(tempTableId);
    setShowGuestPopup(false);
    setTempTableId(null);
  };

  const handleGuestCancel = () => {
    setShowGuestPopup(false);
    setTempTableId(null);
    setGuestCount(1);
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
            Order Confirmed!
          </h2>
          <p className="text-sm sm:text-base text-white mb-2">
            Your order has been placed successfully
          </p>
          <p className="text-base sm:text-lg font-semibold text-green-600 mb-3 sm:mb-4">
            Table #{selectedTable}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Estimated preparation time: 15 min : 20 min
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 text-white py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base"
          >
            Place New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Guest Count Popup */}
      {showGuestPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Number of Guests
              </h3>
              <p className="text-gray-600 text-sm">
                How many people will be dining at this table?
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-lg font-bold">-</span>
                </button>
                <div className="text-3xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {guestCount}
                </div>
                <button
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleGuestCancel}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGuestConfirm}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Confirm Order & Select Table
            </h1>
            <p className="text-sm sm:text-base text-white">
              Review your order and choose an available table
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Table Selection */}
            <div className="order-1 xl:order-2 bg-secondary border border-popular rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                Select Table
                {selectedTable && (
                  <span className="ml-auto text-sm bg-green-500 text-white px-3 py-1 rounded-full flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {guestCount} guest{guestCount !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>

              {/* Legend */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-white">available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-white">occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-white">Reserved</span>
                  </div>
                </div>
              </div>

              {/* Restaurant Layout */}
              <div className="relative bg-secondary rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
                <div className="text-center text-white text-xs sm:text-sm mb-4 font-medium">
                  Restaurant Floor Plan
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {tableList?.data?.map((table, index) => (
                    <div
                      key={index}
                      onClick={() => handleTableClick(table)}
                      className={`relative aspect-square transition-all duration-300 ${
                        selectedTable === table._id
                          ? "transform scale-105 z-10"
                          : "hover:scale-102"
                      } border-2 sm:border-4 rounded-lg overflow-hidden ${
                        table.status === "available"
                          ? "border-green-500 cursor-pointer hover:border-green-400"
                          : table.status === "occupied"
                          ? "border-red-500 cursor-not-allowed opacity-75"
                          : "border-yellow-500 cursor-not-allowed opacity-75"
                      }`}
                    >
                      <img
                        src={`${imageBase}/${table.image}`}
                        alt={`Table ${table.name}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 sm:p-2">
                        <p className="text-center font-semibold text-xs sm:text-sm truncate">
                          {table.name}
                        </p>
                      </div>
                      {selectedTable === table._id && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 bg-white rounded-full p-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={handleCancelOrder}
              className="order-2 sm:order-1 px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Cancel Order</span>
            </button>

            <button
              onClick={() => {
                if (!selectedTable) {
                  return toast.warn("please select table");
                }
                if (!guestCount) {
                  return toast.warn("please select count of guests");
                }
                navigate("/make-order", {
                  state: {
                    table: selectedTable,
                    guestCount: guestCount,
                  },
                });
              }}
              // disabled={!selectedTable}
              className={`order-1 sm:order-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                selectedTable
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Confirming...</span>
                </>
              ) : (
                <span>Confirm Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
