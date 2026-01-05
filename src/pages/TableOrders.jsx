import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getOrdersByTableId } from "../services/apis";
import { useSelector } from "react-redux";

export default function TableOrders() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["table-orders", tableId],
    queryFn: () => getOrdersByTableId(tableId, token),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">
          Error loading orders: {error.message}
        </div>
      </div>
    );
  }

  const orders = ordersData?.data || [];

  const getStatusColor = (status) => {
    const statusColors = {
      checkout: "bg-blue-500",
      ready: "bg-green-500",
      preparing: "bg-yellow-500",
      pending: "bg-orange-500",
      cancelled: "bg-red-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  const getPaymentStatusColor = (status) => {
    return status === "paid" ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
          Table Orders
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-12">
          No orders found for this table.
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-300">
            Total Orders: {ordersData?.count || 0}
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-secondary rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Order #{order.OrderNumber}
                    </h3>
                    <div className="text-sm text-gray-400">
                      <p>Customer: {order.customer.name}</p>
                      <p>Phone: {order.customer.phone}</p>
                      <p>Guests: {order.guestCount}</p>
                      <p>Type: {order.orderType}</p>
                      {order.fromApp && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          From App
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-popular">
                      {order.totalPrice} EGP
                    </div>
                    {order.checkout && (
                      <div className="text-sm text-gray-400 mt-1">
                        Payment: {order.paymentWay}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Items:
                  </h4>
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-white font-medium">
                              {item.product?.name ||
                                item.customProduct?.name ||
                                item.offer?.name}
                            </h5>
                            <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                              {item.productType}
                            </span>
                            <span
                              className={`px-2 py-1 text-white text-xs rounded ${getStatusColor(
                                item.innerStatus
                              )}`}
                            >
                              {item.innerStatus}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            Quantity: {item.quantity}
                            {item.product?.price &&
                              ` × ${item.product.price} EGP`}
                          </p>
                        </div>
                      </div>

                      {/* Customizations */}
                      {(item.customizations?.extras?.length > 0 ||
                        item.customizations?.removals?.length > 0 ||
                        item.customizations?.extrasWithPrices?.length > 0) && (
                        <div className="mt-2 text-sm">
                          {item.customizations.extras?.length > 0 && (
                            <p className="text-green-400">
                              + Extras: {item.customizations.extras.join(", ")}
                            </p>
                          )}
                          {item.customizations.extrasWithPrices?.length > 0 && (
                            <p className="text-green-400">
                              + Paid Extras:{" "}
                              {item.customizations.extrasWithPrices
                                .map(
                                  (extra) =>
                                    `${extra.name} (+${extra.price} EGP)`
                                )
                                .join(", ")}
                            </p>
                          )}
                          {item.customizations.removals?.length > 0 && (
                            <p className="text-red-400">
                              - Remove:{" "}
                              {item.customizations.removals.join(", ")}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-gray-400 text-sm mt-2">
                          Note: {item.notes}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-yellow-400 text-sm mt-1">
                          Special: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                    <div>
                      <p>
                        Created:{" "}
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>
                        Updated:{" "}
                        {new Date(order.updatedAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.paymentWay && (
                        <>
                          {order.cashAmount > 0 && (
                            <p>Cash: {order.cashAmount} EGP</p>
                          )}
                          {order.visaAmount > 0 && (
                            <p>
                              Visa: {order.visaAmount} EGP
                              {order.visaNumber && ` (${order.visaNumber})`}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  {order.paymentStatus === "unpaid" && !order.checkout && (
                    <button
                      onClick={() =>
                        navigate("/checkout", {
                          state: {
                            order: {
                              ...order,
                              total: order.totalPrice,
                            },
                          },
                        })
                      }
                      className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
