import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  cancellOrder,
  getAllOrders,
  updateOrder,
} from "../../services/apis";

import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";
import { TableOfContents } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AllOrders() {
  const [search, setSearch] = useState();
  const [searchInstance, setSearchInstance] = useState();
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const token = useSelector((store) => store.user.token);
  const {
    data: orderResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-orders", pagination.page, search, filter],
    queryFn: () => getAllOrders(pagination.page, token, 2, search, filter),
    refetchInterval: 120000,
  });

  const orderList = orderResponse?.data?.data || [];

  // Fix: Update pagination whenever orderResponse changes (not just on mount)
  useEffect(() => {
    if (orderResponse?.data?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: orderResponse.data.pagination.total,
        limit: orderResponse.data.pagination.limit,
        totalPages: orderResponse.data.pagination.totalPages,
      }));
    }
  }, [orderResponse]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [search, filter]);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["update-status"],
    mutationFn: (payload) => updateOrder(payload.id, payload.data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all-orders"],
      });
    },
  });
  const { mutate: mutateCancel } = useMutation({
    mutationKey: ["can-order"],
    mutationFn: (payload) => cancellOrder(payload.id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all-orders"],
      });
    },
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
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
          .table-header {
            display: flex;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          .header-item {
            flex: 1;
            text-align: left;
          }
          .header-qty {
            width: 50px;
            text-align: center;
          }
          .header-price {
            width: 80px;
            text-align: right;
          }
          .item {
            display: flex;
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
          <div class="restaurant-name">PATIRA</div>
          <div>123 Main Street</div>
          <div>City, State 12345</div>
          <div>Phone: (555) 123-4567</div>
        </div>

        <div class="order-info">
          <div><strong>Order #:</strong> ${order.OrderNumber}</div>
          <div><strong>Date:</strong> ${formatDate(order.createdAt)}</div>
        </div>

        <div class="items">
          <div class="table-header">
            <span class="header-item">Item</span>
            <span class="header-qty">Qty</span>
            <span class="header-price">Price</span>
          </div>

          ${order.items
            .map((item) => {
              const basePrice = +item?.product?.price || 0;
              let extrasPrice = 0;
              const extrasWithPrices =
                item?.customizations?.extrasWithPrices || [];
              if (extrasWithPrices && Array.isArray(extrasWithPrices)) {
                extrasPrice = extrasWithPrices.reduce((total, extra) => {
                  return total + (+extra.price || 0);
                }, 0);
              }

              const totalItemPrice = (basePrice + extrasPrice) * +item.quantity;

              return `
                  <div class="item">
                    <div class="item-name">
                      ${item?.product?.title || "Unknown Item"}
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
                    <div class="item-price">${basePrice}</div>
                  </div>
                `;
            })
            .join("")}
        </div>

        <div class="total-section">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(+order.totalPrice)}</span>
          </div>
          <div class="total-line">
            <span>Tax:</span>
            <span>${formatCurrency(0)}</span>
          </div>
          <div class="total-line grand-total">
            <span>Total:</span>
            <span>${formatCurrency(+order.totalPrice)}</span>
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

    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between my-10 flex-col md:flex-row gap-y-3">
        <div className="flex items-center  border-[1px] rounded-md overflow-x-auto hide-scrollbar border-popular w-full md:w-fit">
          <button
            onClick={() => setFilter("all")}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              filter == "all" ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>All</span>
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              filter == "pending" ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Pending</span>
          </button>

          <button
            onClick={() => setFilter("preparing")}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              filter == "preparing" ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Preparing</span>
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              filter == "completed" ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Completed</span>
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              filter == "cancelled" ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Cancelled</span>
          </button>
        </div>
        <div className="w-full md:w-fit">
          <input
            type="text"
            value={searchInstance}
            onChange={(e) => setSearchInstance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                setSearch(searchInstance);
              }
            }}
            className="px-3 block w-full  border-[1px] border-[#FFBC0F]  bg-black   py-2 rounded-md focus:outline-none "
            placeholder="Search here"
          />
        </div>
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
                  Waiter
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
                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {orderList.map((order, index) => (
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
                      {order?.orderType?.replace("-", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {order?.customer?.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {order?.table?.title?.replace("_", " ")?.toUpperCase() ||
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
                      {formatCurrency(order?.totalPrice)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/orders-tables/edit/${order._id}`)}
                        className="text-popular font-medium hover:underline"
                      >
                        {order.checkout || order.status === "cancelled" ? "View" : "Edit"}
                      </button>
                      <button
                        onClick={() => handlePrintBill(order)}
                        className="text-green-500 font-medium hover:underline"
                      >
                        Print
                      </button>
                      {order.status != "cancelled" &&
                        order.status != "checkout" && (
                          <button
                            onClick={() =>
                              mutateCancel({
                                id: order._id,
                              })
                            }
                            className="text-red-500 font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      {order.status != "cancelled" &&
                        order.status != "checkout" && (
                          <button
                            onClick={() => {
                              navigate("/merge-order", {
                                state: { order: order },
                              });
                            }}
                            className="text-blue-500 font-medium hover:underline"
                          >
                            Merge
                          </button>
                        )}

                      {order.status == "completed" && (
                        <button
                          onClick={() => {
                            navigate("/checkout", {
                              state: { order: order },
                            });
                          }}
                          className="text-green-400 font-medium hover:underline"
                        >
                          checkout
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
        {orderList.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No orders found</div>
            <div className="text-gray-400 text-sm mt-2">
              Orders will appear here once they are created
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pagination.page === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-popular text-white hover:bg-opacity-90"
            }`}
          >
            Previous
          </button>

          <span className="text-white font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pagination.page === pagination.totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-popular text-white hover:bg-opacity-90"
            }`}
          >
            Next
          </button>
        </div>

        <div className="text-sm text-gray-400">
          Showing {orderList.length} of {pagination.total} orders
        </div>
      </div>
    </div>
  );
}
