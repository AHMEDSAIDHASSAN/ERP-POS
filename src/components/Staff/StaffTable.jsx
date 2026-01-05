import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Pencil,
  Trash,
  User,
  Mail,
  Phone,
  DollarSign,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { delete_staff_by_id } from "../../services/apis";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function StaffTable({ list }) {
  const headers = [
    { key: "name", label: "Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
    { key: "age", label: "Age", icon: User },
    { key: "salary", label: "Salary", icon: DollarSign },
    { key: "timings", label: "Timings", icon: Clock },
    { key: "actions", label: "Actions", icon: null },
  ];
  const token = useSelector((store) => store.user.token);

  const handleView = (staff) => {
    // Add your view logic here
  };

  const handleEdit = (staff) => {
    // Add your edit logic here
  };

  const handleDelete = (staff) => {
    // Add your delete logic here
  };

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["delete-user"],
    mutationFn: (id) => delete_staff_by_id(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_staff"],
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message);
    },
  });
  const navigate = useNavigate();
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-full border-collapse  shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-transparent text-white">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wider border-b border-popular"
                >
                  <div className="flex items-center space-x-2">
                    {header.icon && <header.icon size={16} />}
                    <span>{header.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-secondary divide-y divide-gray-200 ">
            {list?.map((staff, index) => (
              <tr
                key={staff._id}
                className={` transition-colors duration-200 text-white hover:bg-[#212323]  ${
                  index % 2 == 0 ? "" : "bg-[#0a0a0a]"
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">
                        {staff?.name || "N/A"}
                        <p className="text-popular text-xs">
                          {staff?.role || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {staff?.email || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {staff?.phone || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {staff?.age || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    ${staff?.salary || "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {staff?.shiftFrom && staff?.shiftTo
                      ? `${staff.shiftFrom} - ${staff.shiftTo}`
                      : "N/A"}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* <button
                      onClick={() => handleView(staff)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-full transition-all duration-200"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button> */}
                    <button
                      onClick={() => navigate(`/edit-staff/${staff?._id}`)}
                      className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 p-2 rounded-full transition-all duration-200"
                      title="Edit Staff"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => mutate(staff._id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-100 p-2 rounded-full transition-all duration-200"
                      title="Delete Staff"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {list?.map((staff, index) => (
          <div
            key={staff._id}
            className="bg-secondary rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header with Avatar and Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {staff?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500">Staff Member</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleView(staff)}
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-all duration-200"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleEdit(staff)}
                  className="text-yellow-600 hover:bg-yellow-100 p-2 rounded-full transition-all duration-200"
                  title="Edit Staff"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(staff)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-all duration-200"
                  title="Delete Staff"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            {/* Staff Details */}
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-white mr-3 flex-shrink-0" />
                <span className="text-white min-w-0 truncate">
                  {staff?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-white mr-3 flex-shrink-0" />
                <span className="text-white">{staff?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-white mr-3" />
                  <span className="text-white">Age: {staff?.age || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-semibold">
                    ${staff?.salary || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-white mr-3 flex-shrink-0" />
                <span className="text-white">
                  {staff?.shiftFrom && staff?.shiftTO
                    ? `${staff.shiftFrom} - ${staff.shiftTO}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!list || list.length === 0) && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Staff Members
          </h3>
          <p className="text-gray-500">No staff members have been added yet.</p>
        </div>
      )}
    </div>
  );
}
