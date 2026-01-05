import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, ChefHat, CheckCircle, Package } from "lucide-react";
import { updateStatusOrder } from "../../services/apis";
import { useSelector } from "react-redux";

// Mock API function for demo

export default function KitchenCard({ data = mockData }) {
  let bgGradient = "";
  let statusIcon = null;

  switch (data?.status) {
    case "pending":
      bgGradient = "from-red-500 to-red-600";
      statusIcon = <Clock className="w-4 h-4" />;
      break;
    case "preparing":
      bgGradient = "from-yellow-400 to-yellow-500";
      statusIcon = <ChefHat className="w-4 h-4" />;
      break;
    case "ready":
      bgGradient = "from-green-500 to-green-600";
      statusIcon = <Package className="w-4 h-4" />;
      break;
    case "completed":
      bgGradient = "from-gray-500 to-gray-600";
      statusIcon = <CheckCircle className="w-4 h-4" />;
      break;
    default:
      bgGradient = "from-black to-gray-800";
      statusIcon = <Clock className="w-4 h-4" />;
  }

  const queryClient = useQueryClient();
  const token = useSelector((store) => store.user.token);
  const { mutate, isPending } = useMutation(
    {
      mutationKey: ["update-order-status"],
      mutationFn: (payload) =>
        updateStatusOrder(
          {
            orderId: data._id,
            itemId: payload.data._id,
            status: payload.data.status,
          },
          token
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["each_kitchen"],
        });
      },
    },
   
  );

  if (!data.items.length) return null;

  const getButtonConfig = (innerStatus) => {
    switch (innerStatus) {
      case "pending":
        return {
          text: "Start Preparing",
          nextStatus: "preparing",
          className:
            "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25",
          icon: <ChefHat className="w-4 h-4" />,
        };
      case "preparing":
        return {
          text: "Mark Ready",
          nextStatus: "ready",
          className:
            "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 shadow-lg hover:shadow-green-500/25",
          icon: <Package className="w-4 h-4" />,
        };
      case "ready":
        return {
          text: "Complete Order",
          nextStatus: "completed",
          className:
            "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "completed":
        return {
          text: "Completed",
          nextStatus: null,
          className:
            "bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed opacity-75",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      default:
        return null;
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-secondary to-gray-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-700">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-white font-bold text-lg">
                Order #{data.OrderNumber}
              </p>
              <p className="text-gray-400 text-sm">{data.orderType}</p>
            </div>
          </div>

          <div
            className={`bg-gradient-to-r ${bgGradient} text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg`}
          >
            {statusIcon}
            <span className="capitalize">{data.status}</span>
          </div>
        </div>

        {data.status === "completed" && (
          <div className="bg-gradient-to-r mb-6 from-gray-500 to-gray-600 text-white py-2 px-4 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg mt-2">
            <Clock className="w-4 h-4" />
            <span>
              {(() => {
                const createdAt = new Date(data.createdAt);
                const updatedAt = new Date(data.updatedAt);
                const timeDiff = updatedAt - createdAt;

                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
                );

                if (hours > 0) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${minutes}m`;
                }
              })()}
            </span>
          </div>
        )}

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <ChefHat className="w-5 h-5 text-popular" />
            <h3 className="text-white font-bold text-lg">Kitchen Items</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-popular to-transparent"></div>
          </div>

          {data.items.map((ele, index) => {
            const buttonConfig = getButtonConfig(ele.innerStatus);

            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-popular/30 transition-all duration-300 group/item"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg group-hover/item:text-popular transition-colors duration-200">
                      {ele.product?.title || ele.customProduct?.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-popular/20 text-popular px-3 py-1 rounded-full text-sm font-medium">
                        Qty: {ele.quantity}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          ele.innerStatus === "pending"
                            ? "bg-red-500/20 text-red-400"
                            : ele.innerStatus === "preparing"
                            ? "bg-yellow-400/20 text-yellow-400"
                            : ele.innerStatus === "ready"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {ele.innerStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customizations */}
                <div className="space-y-3 mb-4">
                  {ele?.customizations?.extras?.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 font-semibold text-sm mb-1 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Extras
                      </p>
                      <p className="text-gray-300 text-sm">
                        {ele?.customizations?.extrasWithPrices
                          ?.map((extra) => extra.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {ele?.customizations?.removals?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 font-semibold text-sm mb-1 flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        Removals
                      </p>
                      <p className="text-gray-300 text-sm">
                        {ele.customizations.removals.join(", ")}
                      </p>
                    </div>
                  )}

                  {ele?.customProduct?.ingredients.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 font-semibold text-sm mb-1 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Ingredient
                      </p>
                      <p className="text-gray-300  rounded-full text-sm">
                        {ele?.customProduct?.ingredients
                          .map((ing) => ing.ingredient.name)
                          .join(" ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {buttonConfig && (
                  <button
                    onClick={() =>
                      buttonConfig.nextStatus &&
                      mutate({
                        data: { _id: ele._id, status: buttonConfig.nextStatus },
                      })
                    }
                    disabled={!buttonConfig.nextStatus || isPending}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                      buttonConfig.className
                    } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {buttonConfig.icon}
                        <span>{buttonConfig.text}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-popular/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
    </div>
  );
}

// Mock data for demonstration
const mockData = {
  _id: "order123",
  OrderNumber: "1001",
  status: "preparing",
  orderType: "Dine In",
  items: [
    {
      _id: "item1",
      innerStatus: "preparing",
      quantity: 2,
      product: {
        title: "Margherita Pizza",
      },
      customizations: {
        extras: ["Extra Cheese", "Olives"],
        removals: ["Tomatoes"],
      },
    },
    {
      _id: "item2",
      innerStatus: "pending",
      quantity: 1,
      product: {
        title: "Caesar Salad",
      },
      customizations: {
        extras: ["Grilled Chicken"],
        removals: [],
      },
    },
  ],
};
