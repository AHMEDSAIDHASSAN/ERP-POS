import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { add_staff, getSections } from "../../services/apis";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
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
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
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
  sections: Yup.array().min(1, "At least one access level must be selected"),
});

export default function AddStaff() {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
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
      mutate(values);
    },
  });

  const handleSections = (option) => {
    const currentAccess = formik.values.sections || [];
    const optionId = option._id?.toString();

    // Check if the option ID is already selected
    const isSelected = currentAccess.some(id => id?.toString() === optionId);

    if (isSelected) {
      // Remove the option ID from the array
      formik.setFieldValue(
        "sections",
        currentAccess.filter((id) => id?.toString() !== optionId)
      );
    } else {
      // Add the option ID to the array
      formik.setFieldValue("sections", [...currentAccess, optionId]);
    }
  };

  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const { mutate } = useMutation({
    mutationKey: ["add-staff"],
    mutationFn: (payload) => add_staff(payload, token),
    onSuccess: () => {
      toast.success("user added sucessfully");
      navigate("/staff");
    },
  });

  const { data: sections } = useQuery({
    queryKey: ["get-sections"],
    queryFn: () => getSections(token),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-secondary rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Add New Staff Member
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
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <div>
              <label
                htmlFor="password"
                className="block text-white font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

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
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

            {/* Section Permissions */}
            <div>
              <label className="block text-white font-medium mb-3">
                Section Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sections?.data?.map((option) => {
                  const isSelected = (formik.values.sections || []).some(
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
                className="w-full bg-popular hover:bg-opacity-90 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
