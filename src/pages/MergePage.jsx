import React, { useState } from "react";
import { Check, X, MapPin, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getTables, imageBase, mergeOrderFunction } from "../services/apis";

export default function MergePage() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate("");
  const token = useSelector((store) => store.user.token);
  const { data: tableList } = useQuery({
    queryKey: ["get-tables"],
    queryFn: () => getTables(token),
  });

  const location = useLocation();
  const { state } = location;

  const order = state.order;

  const handleCancelOrder = () => {
    setSelectedTable(null);
    setOrderConfirmed(false);
    navigate("/orders-tables");
  };

  const handleTableClick = (table) => {
    setSelectedTable(table._id);
  };

  const { mutate: merging } = useMutation({
    mutationKey: ["merging"],
    mutationFn: (payload) => mergeOrderFunction(payload.data, token),
    onSuccess: () => {
      navigate("/orders-tables");
      toast("merged successfully");
    },
  });

  return (
    <div className="min-h-screen bg-secondary">
      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Select Table
            </h1>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {/* Table Selection */}
            <div className="bg-secondary border border-popular rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                Choose Your Table
              </h2>

              {/* Restaurant Layout */}
              <div className="relative bg-secondary rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
                <div className="text-center text-white text-xs sm:text-sm mb-4 font-medium">
                  Restaurant Floor Plan
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {tableList?.data?.map(
                    (table, index) =>
                      table.status == "Occupied" &&
                      order &&
                      table?._id != order?.table?._id && (
                        <div
                          key={index}
                          onClick={() => handleTableClick(table)}
                          className={`relative aspect-square transition-all duration-300 ${
                            selectedTable === table._id
                              ? "transform scale-105 z-10"
                              : "hover:scale-102"
                          } border-green-500 cursor-pointer hover:border-green-400 border-2 sm:border-4 rounded-lg overflow-hidden 
                        
                          
                         
                      `}
                        >
                          <img
                            src={`${imageBase}/${table.image}`}
                            alt={`Table ${table.title}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 sm:p-2">
                            <p className="text-center font-semibold text-xs sm:text-sm truncate">
                              {table.title}
                            </p>
                          </div>
                          {selectedTable === table._id && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 bg-white rounded-full p-1" />
                            </div>
                          )}
                        </div>
                      )
                  )}
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
              <span>Cancel Merge</span>
            </button>

            <button
              onClick={() => {
                if (!selectedTable) {
                  return toast.warn("please select table");
                }

                merging({
                  data: {
                    tableId: selectedTable,
                    orderId: order._id,
                  },
                });
                console.log(selectedTable, order._id);
              }}
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
                <span>Confirm Table</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
