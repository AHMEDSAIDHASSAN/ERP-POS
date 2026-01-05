import { useQuery } from "@tanstack/react-query";
import { getSuppliers } from "../services/apis";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SupplierCard from "../components/supplier/SupplierCard";
export default function Supplier() {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const { data: supplierList } = useQuery({
    queryKey: ["supplier_list"],
    queryFn: () => getSuppliers(token),
  });

  return (
    <div className="">
      <div className="flex  justify-between items-center">
        <div className="flex items-center gap-3 mb-6 lg:mb-8 p-6">
          <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4 flex items-center justify-between w-full">
            <div>suppliers</div>
          </h2>
        </div>

        <button
          onClick={() => navigate("/add-supplier")}
          className="bg-popular px-3 py-2 font-semibold rounded-md mb-6 lg:mb-8 p-6 "
        >
          add supplier
        </button>
      </div>

      <did className="grid lg:grid-cols-3 md:grid-cols-2 gap-3">
        {supplierList?.data?.map((ele, index) => (
          <SupplierCard key={index} item={ele} />
        ))}
      </did>
    </div>
  );
}
