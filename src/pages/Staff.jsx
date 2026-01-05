import { useQuery } from "@tanstack/react-query";
import { getStaff } from "../services/apis";
import StaffTable from "../components/Staff/StaffTable";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Staff() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const { data: staffList, isLoading } = useQuery({
    queryKey: ["get_staff"],
    queryFn: () => getStaff(token),
  });

  return (
    <div className="py-4">
      <h3 className="text-2xl tracking-wider font-semibold mb-10">
        Staff Management
      </h3>

      <div className="flex items-center justify-between">
        <p className="text-xl tracking-wider  font-semibold">
          staff ({staffList?.length})
        </p>
        <div>
          <button
            onClick={() => navigate("/add-staff")}
            className="font-semibold py-3 px-5 focus:outline-none bg-popular text-white rounded-xl"
          >
            Add Staff
          </button>
        </div>
      </div>
      <div className="mt-10">
        <StaffTable list={staffList || []} />
      </div>
    </div>
  );
}
