import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSupplierStatus } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function SupplierCard({ item }) {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["chnage_status_supplier"],
    mutationFn: (payload) => updateSupplierStatus(token, payload, item._id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier_list"],
      });
    },
    onError: (e) => {
      toast.error(e.response.data.message);
    },
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-400 bg-green-400/10 border border-green-400/20";
      case "inActive":
        return "text-red-400 bg-red-400/10 border border-red-400/20";

      default:
        return "text-gray-400 bg-gray-400/10 border border-gray-400/20";
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "company":
        return "🏭";
      case "distributor":
        return "📦";
      case "individual":
        return "🏪";

      default:
        return "🏢";
    }
  };

  return (
    <div className="group relative bg-black overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:border-slate-600/60">
      <div className="relative p-6 space-y-4">
        {/* Header with name and type */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(item?.type)}</span>
            <div>
              <h3 className="text-xl font-semibold text-white truncate max-w-48">
                {item?.name || "Unnamed Supplier"}
              </h3>
              <p className="text-sm text-white capitalize">
                {item?.type || "Unknown Type"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
              item?.status
            )}`}
          >
            {item?.status || "Unknown"}
          </div>
        </div>
        {/* Information grid */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 group/item hover:bg-slate-800/30 rounded-lg p-2 -m-2 transition-colors">
            <span className="text-white text-sm font-medium min-w-16 mt-0.5">
              Email:
            </span>
            <span className=" text-sm break-all group-hover/item:text-blue-300 transition-colors">
              {item?.email || "Not provided"}
            </span>
          </div>

          <div className="flex items-center gap-3 group/item hover:bg-slate-800/30 rounded-lg p-2 -m-2 transition-colors">
            <span className="text-white text-sm font-medium min-w-16">
              Code:
            </span>
            <span className=" text-sm font-mono bg-slate-800/50 px-2 py-1 rounded border">
              {item?.code || "N/A"}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 group/item hover:bg-slate-800/30 rounded-lg p-2 -m-2 transition-colors">
          <span className="text-white text-sm font-medium min-w-16 mt-0.5">
            Address:
          </span>
          <span className=" text-sm leading-relaxed">
            {item?.address.split("").splice(0, 20).join("") || "Not provided"}
          </span>
        </div>
        {/* Bottom accent line */}
        <div className="flex items-center gap-x-3">
          <button
            onClick={() => {
              if (item?.status === "active") {
                mutate({ status: "inActive" });
              } else {
                mutate({ status: "active" });
              }
            }}
            className={`${
              item?.status === "active" ? "bg-red-500" : " bg-green-500"
            } px-3 py-1 rounded-sm`}
          >
            {item?.status === "active" ? "de-activate" : "activate"}
          </button>
          <button
            className="bg-blue-500 px-3 py-1 rounded-sm"
            onClick={() => navigate(`/update-supplier/${item._id}`)}
          >
            update
          </button>
         
          
          <button
            className="text-green-400 hover:bg-green-400 hover:text-white rounded-md px-3 py-1  transition-colors duration-500 "
            onClick={() => navigate(`/purchase/${item._id}`)}
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
