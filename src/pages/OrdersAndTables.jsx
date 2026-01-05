import { useNavigate } from "react-router-dom";
import AllOrders from "../components/order/AllOrders";
import MakeOrder from "../components/order/MakeOrder";
import { useState } from "react";
import OrdersPhone from "../components/order/OrdersPhone";
import { TableOfContents } from "lucide-react";

export default function OrdersAndTables() {
  const navigate = useNavigate();
  const [switcher, setSwitcher] = useState(1);
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 lg:mb-8 p-6">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4 flex  items-center justify-between w-full">
          <div>Orders Items</div>
          <button
            onClick={() => navigate("/follow-order")}
            className="text-base font-semibold bg-popular text-white rounded-md px-4 py-2 transition-colors"
          >
            Create Order
          </button>
        </h2>
      </div>
      <div className="px-6">
        <div className="flex items-center border-[1px] rounded-md overflow-x-auto hide-scrollbar border-popular w-full sm:w-fit max-w-full">
          <button
            onClick={() => setSwitcher(1)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              switcher == 1 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Site Orders</span>
          </button>

          <button
            onClick={() => setSwitcher(2)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              switcher == 2 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>App Orders</span>
          </button>
        </div>
      </div>
      {switcher == 1 && <AllOrders />}
      {switcher == 2 && <OrdersPhone />}
    </div>
  );
}
