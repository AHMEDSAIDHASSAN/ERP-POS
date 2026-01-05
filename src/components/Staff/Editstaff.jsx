import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  get_staff_by_id,
  getSections,
  update_staff_by_id,
} from "../../services/apis"; // Added update_staff
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react"; // Added useEffect
import { useSelector } from "react-redux";

const roleOptions = [
  { label: "staff", value: "staff" },
  { label: "operation", value: "operation" },
  { label: "waiter", value: "waiter" },
];

const staffSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(40, "Name must not exceed 40 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  age: Yup.number()
    .max(90, "Age must not exceed 90")
    .min(15, "Age must be at least 15")
    .required("Age is required"),
  salary: Yup.number()
    .required("Salary is required")
    .positive("Salary must be positive"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^[0-9+\-\s()]+$/, "Invalid phone number"),
  shiftFrom: Yup.string().required("Shift start time is required"),
  shiftTo: Yup.string().required("Shift end time is required"),
  access: Yup.array().min(1, "At least one access level must be selected"),
  role: Yup.string().required("Role is required"),
});

export default function EditStaff() {
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useParams();
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const isEdit = Boolean(id); // Determine if this is edit mode

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",

      age: "",
      salary: "",
      phone: "",
      shiftFrom: "",
      shiftTo: "",
      role: "",
      sections: [],
    },
    validationSchema: staffSchema,
    onSubmit: (values) => {
      updateMutation.mutate({ id, values });
    },
  });

  const { data: sections } = useQuery({
    queryKey: ["get-sections"],
    queryFn: () => getSections(token),
  });

  const handleSections = (option) => {
    const currentAccess = formik.values.sections || [];
    const optionId = option._id?.toString();

    const isSelected = currentAccess.some(id => id?.toString() === optionId);

    if (isSelected) {
      // Remove ID
      formik.setFieldValue(
        "sections",
        currentAccess.filter((id) => id?.toString() !== optionId)
      );
    } else {
      // Add ID
      formik.setFieldValue("sections", [...currentAccess, optionId]);
    }
  };

  // Fetch staff data for editing
  const {
    data: userData,
    isLoading: userLoading,
    error,
  } = useQuery({
    queryKey: ["get_staff_byId", id],
    queryFn: () => get_staff_by_id(id, token),
    enabled: isEdit, // Only fetch if we're in edit mode
  });

  // Populate form when staff data is loaded
  useEffect(() => {
    if (userData && isEdit) {
      // Convert section IDs to strings for proper comparison with option._id
      const sectionIds = (userData?.user?.sections || []).map(s =>
        typeof s === 'object' ? s._id?.toString() || s.toString() : s?.toString()
      );

      formik.setValues({
        name: userData?.user?.name || "",
        email: userData?.user?.email || "",

        age: userData?.user?.age || "",
        salary: userData?.user?.salary || "",
        phone: userData?.user?.phone || "",
        shiftFrom: userData?.user?.shiftFrom || "",
        shiftTo: userData?.user?.shiftTo || "",
        role: userData?.user?.role || "",
        sections: sectionIds,
      });
    }
  }, [userData, isEdit]);

  // Add staff mutation

  // Update staff mutation
  const updateMutation = useMutation({
    mutationKey: ["update-staff"],
    mutationFn: ({ id, ...payload }) => update_staff_by_id(id, payload, token),
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      navigate("/staff");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
  });

  // Loading state
  if (isEdit && userLoading) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading staff data...</div>
      </div>
    );
  }

  // Error state
  if (isEdit && error) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-red-400 text-lg">Failed to load staff data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-secondary rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            {isEdit ? "Edit Staff Member" : "Add New Staff Member"}
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-white font-medium mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter full name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-white font-medium mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Field with Eye Toggle */}

            {/* Age and Salary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="age"
                  className="block text-white font-medium mb-2"
                >
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.age}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formik.touched.age && formik.errors.age
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter age"
                />
                {formik.touched.age && formik.errors.age && (
                  <p className="text-red-400 text-sm mt-1">
                    {formik.errors.age}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="salary"
                  className="block text-white font-medium mb-2"
                >
                  Salary
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.salary}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formik.touched.salary && formik.errors.salary
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter salary"
                />
                {formik.touched.salary && formik.errors.salary && (
                  <p className="text-red-400 text-sm mt-1">
                    {formik.errors.salary}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-white font-medium mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.phone && formik.errors.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-white font-medium mb-2"
              >
                Role *
              </label>
              <select
                id="role"
                name="role"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.role}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.role && formik.errors.role
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Choose staff role
                </option>
                {roleOptions.map((role) => (
                  <option
                    className="text-secondary"
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.role}
                </p>
              )}
            </div>

            {/* Shift Times Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="shiftFrom"
                  className="block text-white font-medium mb-2"
                >
                  Shift From
                </label>
                <input
                  id="shiftFrom"
                  name="shiftFrom"
                  type="time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.shiftFrom}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formik.touched.shiftFrom && formik.errors.shiftFrom
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.shiftFrom && formik.errors.shiftFrom && (
                  <p className="text-red-400 text-sm mt-1">
                    {formik.errors.shiftFrom}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="shiftTo"
                  className="block text-white font-medium mb-2"
                >
                  Shift To
                </label>
                <input
                  id="shiftTo"
                  name="shiftTo"
                  type="time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.shiftTo}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formik.touched.shiftTo && formik.errors.shiftTo
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.shiftTo && formik.errors.shiftTo && (
                  <p className="text-red-400 text-sm mt-1">
                    {formik.errors.shiftTo}
                  </p>
                )}
              </div>
            </div>

            {/* Access Permissions */}
            <div>
              <label className="block text-white font-medium mb-3">
                Section Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sections?.data?.map((option) => {
                  const isSelected = formik?.values?.sections?.some(
                    id => id?.toString() === option._id?.toString()
                  );
                  return (
                    <label
                      key={option._id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-popular text-white"
                          : "bg-white text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSections(option)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium capitalize">{option?.name || option?.title}</span>
                    </label>
                  );
                })}
              </div>
              {formik.touched.sections && formik.errors.sections && (
                <p className="text-red-400 text-sm mt-2">
                  {formik.errors.sections}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                // disabled={ updateMutation.isPending}
                className="w-full bg-popular hover:bg-opacity-90 text-white tracking-widest font-semibold  py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-popular disabled:opacity-50 disabled:cursor-not-allowed"
              >
                update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
