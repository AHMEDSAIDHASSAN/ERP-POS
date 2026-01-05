import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAllOrdersApp, updateOrder } from "../../services/apis";

import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";

export default function OrdersPhone() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [switcher, setSwitcher] = useState(1); // Added filter state
  const [currentPage, setCurrentPage] = useState(1); // Renamed for clarity
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const token = useSelector((store) => store.user.token);

  // Fetch all orders when component mounts or when search changes
  const {
    data: orderResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-orders-phone-complete", activeSearch, switcher],
    queryFn: async () => {
      // Fetch first page to get total pages
      const firstPage = await getAllOrdersApp(1, token, 1, activeSearch);
      const totalPages = firstPage.data.pagination.totalPages;

      // Fetch all pages
      const allPagesPromises = [];
      for (let page = 1; page <= totalPages; page++) {
        allPagesPromises.push(getAllOrdersApp(page, token, 1, activeSearch));
      }

      const allPagesData = await Promise.all(allPagesPromises);
      const allOrdersData = allPagesData.flatMap(
        (pageData) => pageData.data.data
      );

      return {
        data: allOrdersData,
        pagination: firstPage.data.pagination,
      };
    },
    enabled: !!token,
  });

  // Update all orders when data changes
  useEffect(() => {
    if (orderResponse?.data) {
      setAllOrders(orderResponse.data);
    }
  }, [orderResponse]);

  // Update pagination info
  useEffect(() => {
    if (orderResponse?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: orderResponse.pagination.total,
        limit: orderResponse.pagination.limit,
        totalPages: orderResponse.pagination.totalPages,
      }));
    }
  }, [orderResponse]);

  // Filter orders based on switcher
  const filteredOrders = allOrders.filter((order) => {
    if (!order.status) return switcher === 1;

    const status = order.status.toLowerCase();
    switch (switcher) {
      case 1:
        return true; // All orders
      case 2:
        return status === "pending";
      case 3:
        return status === "preparing" || status === "prepering";
      case 4:
        return status === "completed";
      case 5:
        return status === "cancelled" || status === "canceled";
      default:
        return true;
    }
  });

  // Pagination for filtered orders
  const itemsPerPage = 10;
  const totalFilteredPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["update-status"],
    mutationFn: (payload) => updateOrder(payload.id, payload.data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all-orders-phone-complete"],
      });
    },
  });

  // Handle filter change
  const handleSwitcherChange = (newSwitcher) => {
    setSwitcher(newSwitcher);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalFilteredPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount);
  };

  // Function to convert image to Base64
  const convertImageToBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  };

  // Print bill functionality with logo
  const handlePrintBill = async (order) => {
    // Convert logo to Base64
    let logoBase64 = "";
    try {
      logoBase64 = await convertImageToBase64(logo);
    } catch (error) {
      console.error("Error converting logo:", error);
    }

    const printContent = `
      <html>
        <head>
          <title>Bill - Order #${order.OrderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              font-size: 12px;
              line-height: 1.4;
              max-width: 300px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 10px;
              display: block;
            }
            .restaurant-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .order-info {
              margin-bottom: 15px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .order-info div {
              margin-bottom: 3px;
            }
            .items {
              margin-bottom: 15px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              padding: 3px 0;
            }
            .item-name {
              flex: 1;
              text-align: left;
            }
            .item-qty {
              width: 50px;
              text-align: center;
            }
            .item-price {
              width: 80px;
              text-align: right;
            }
            .extras {
              margin-left: 10px;
              font-size: 11px;
              color: #555;
              margin-top: 2px;
            }
            .extra-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1px;
            }
            .total-section {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 15px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
              font-size: 10px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${
              logoBase64
                ? `<img src="${logoBase64}" alt="Restaurant Logo" class="logo" />`
                : ""
            }
            <div class="restaurant-name">PATRIA</div>
            <div>123 Main Street</div>
            <div>City, State 12345</div>
            <div>Phone: (555) 123-4567</div>
          </div>
          
          <div class="order-info">
            <div><strong>Address: </strong> ${order.location}</div>
            <div><strong>Order #:</strong> ${order.OrderNumber}</div>
            <div><strong>Date:</strong> ${formatDate(order.createdAt)}</div>
          </div>
<div class="items">
  <div style="display: flex; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px;">
    <span style="width: 50%;">Item</span>
    <span style="width: 25%; text-align: center;">Qty</span>
    <span style="width: 25%; text-align: right;">Price</span>
  </div>
</div>
            
            ${order.items
              .map((item) => {
                // Calculate base price
                const basePrice = +item?.product?.price || 0;

                // Calculate extras price
                let extrasPrice = 0;
                const extrasWithPrices =
                  item?.customizations?.extrasWithPrices || [];
                if (extrasWithPrices && Array.isArray(extrasWithPrices)) {
                  extrasPrice = extrasWithPrices.reduce((total, extra) => {
                    return total + (+extra.price || 0);
                  }, 0);
                }

                // Total item price (base + extras) * quantity
                const totalItemPrice =
                  (basePrice + extrasPrice) * +item.quantity;

                return `
                    <div class="item">
                      <div class="item-name">
                        ${
                          item?.productType == "custom product"
                            ? item.productType
                            : item?.productType == "offer"
                            ? item?.product?.title + " (offer)"
                            : item?.product?.title || "Unknown Item"
                        }
                        ${
                          extrasWithPrices.length > 0
                            ? `
                          <div class="extras">
                            ${extrasWithPrices
                              .map(
                                (extra) => `
                              <div class="extra-item">
                                <span>+ ${extra.name || "Extra"}</span>
                              </div>
                            `
                              )
                              .join("")}
                          </div>
                        `
                            : ""
                        }
                      </div>
                      <div class="item-qty">${item.quantity}</div>
                      <div class="item-price">${
                        totalItemPrice ||
                        parseFloat(
                          order.totalPrice / order.items[0].quantity
                        ).toFixed(2)
                      } </div>
                    </div>
                  `;
              })
              .join("")}
          </div>
          
          <div class="total-section">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${
                order.items[0].productType != "custom product"
                  ? formatCurrency(+order.totalPrice)
                  : parseFloat(order.totalPrice).toFixed(2)
              }</span>
            </div>
            <div class="total-line">
              <span>Tax:</span>
              <span>${formatCurrency(0)}</span>
            </div>
            <div class="total-line grand-total">
              <span>Total:</span>
              <span>${
                order.items[0].productType != "custom product"
                  ? formatCurrency(+order.totalPrice)
                  : parseFloat(order.totalPrice).toFixed(2)
              }</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>Please come again</div>
            <div style="margin-top: 10px;">
              Total Items: ${order.items.length} | 
              Total Qty: ${order.items.reduce(
                (total, item) => total + item.quantity,
                0
              )}
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Filter Buttons and Search */}
      <div className="flex justify-between">
        <div className="px-6">
          <div className="flex items-center border-[1px] rounded-md overflow-x-auto hide-scrollbar border-popular w-full sm:w-fit max-w-full">
            <button
              onClick={() => handleSwitcherChange(1)}
              className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
                switcher == 1 ? "bg-popular text-white" : ""
              }`}
            >
              <span>All</span>
            </button>

            <button
              onClick={() => handleSwitcherChange(2)}
              className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
                switcher == 2 ? "bg-popular text-white" : ""
              }`}
            >
              <span>Pending</span>
            </button>
            <button
              onClick={() => handleSwitcherChange(3)}
              className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
                switcher == 3 ? "bg-popular text-white" : ""
              }`}
            >
              <span>Preparing</span>
            </button>
            <button
              onClick={() => handleSwitcherChange(4)}
              className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
                switcher == 4 ? "bg-popular text-white" : ""
              }`}
            >
              <span>Completed</span>
            </button>
            <button
              onClick={() => handleSwitcherChange(5)}
              className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
                switcher == 5 ? "bg-popular text-white" : ""
              }`}
            >
              <span>Canceled</span>
            </button>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === "") {
              setActiveSearch("");
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setActiveSearch(search);
            }
          }}
          className="px-3 block border-[1px] border-[#FFBC0F] mb-10 py-2 rounded-md focus:outline-none bg-black"
          placeholder="Search here"
        />
      </div>

      {/* Table */}
      <div className="bg-secondary rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {paginatedOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={`transition-colors ${
                    index % 2 == 0 ? "bg-secondary" : "bg-primary"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      #{order.OrderNumber}
                    </div>
                    <div className="text-sm text-white capitalize">
                      {order.orderType.replace("-", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {order?.customer?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {
                        <div>
                          <span>
                            {order.status === "completed" &&
                              (() => {
                                const createdAt = new Date(order?.createdAt);
                                const updatedAt = new Date(order?.updatedAt);
                                const timeDiff = updatedAt - createdAt;

                                const hours = Math.floor(
                                  timeDiff / (1000 * 60 * 60)
                                );
                                const minutes = Math.floor(
                                  (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
                                );

                                if (hours > 0) {
                                  return `${hours}h ${"  "}  ${minutes}m`;
                                } else {
                                  return `${minutes}m`;
                                }
                              })()}
                          </span>
                        </div>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {order?.table?.title?.replace("_", " ").toUpperCase() ||
                        ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {order.items.length} items
                    </div>
                    <div className="text-sm text-white">
                      Qty:{" "}
                      {order.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {order.items[0].productType == "custom product"
                        ? parseFloat(order?.totalPrice).toFixed(2)
                        : order?.totalPrice}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {order?.customer?.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-popular font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="text-green-500 font-medium"
                      >
                        Print
                      </button>
                      {order.status != "cancelled" && (
                        <button
                          onClick={() =>
                            mutate({
                              id: order._id,
                              data: { status: "cancelled" },
                            })
                          }
                          className="text-red-500 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No orders found</div>
            <div className="text-gray-400 text-sm mt-2">
              {switcher === 5
                ? "No canceled orders found"
                : "Orders will appear here once they are created"}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalFilteredPages > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-popular text-white hover:bg-opacity-90"
              }`}
            >
              Previous
            </button>

            <span className="text-white font-medium">
              Page {currentPage} of {totalFilteredPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalFilteredPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalFilteredPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-popular text-white hover:bg-opacity-90"
              }`}
            >
              Next
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Showing {paginatedOrders.length} of {filteredOrders.length} orders
            {switcher !== 1 && (
              <span className="ml-2 text-popular">
                (
                {switcher === 2
                  ? "Pending"
                  : switcher === 3
                  ? "Preparing"
                  : switcher === 4
                  ? "Completed"
                  : "Canceled"}{" "}
                orders)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Order Details - #{selectedOrder.OrderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedOrder.customer.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Table
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedOrder?.table?.title
                      ?.replace("_", " ")
                      .toUpperCase() || ""}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">Item #{index + 1}</p>
                        <p className="text-sm text-gray-600">
                          {item?.product?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {item.innerStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">
                  Total: {formatCurrency(selectedOrder.totalPrice)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePrintBill(selectedOrder)}
                    className="bg-popular text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Print Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
