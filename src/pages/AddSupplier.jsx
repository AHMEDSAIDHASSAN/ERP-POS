import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createSupplier } from "../services/apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AddSupplier() {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationKey: ["create_supplier"],
    mutationFn: (payload) => createSupplier(token, payload),
    onSuccess: () => {
      toast.success("supplier added successfully");
      navigate("/supplier");
      setFormData({
        name: "",
        email: "",
        code: "",
        phone: "",
        address: "",
        type: "company",
      });
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    code: "",
    phone: "",
    address: "",
    type: "company",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Supplier Data:", formData);

      mutate({ ...formData });
      // Reset form
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#111315" }}>
      <div className="max-w-2xl mx-auto">
        <div
          className="p-8 rounded-xl shadow-2xl"
          style={{ backgroundColor: "#292C2D" }}
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Create New Supplier
          </h1>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-2"
              >
                Supplier Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: "#FFBC0F" }}
                placeholder="Enter supplier name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: "#FFBC0F" }}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Code and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Supplier Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ focusRingColor: "#FFBC0F" }}
                  placeholder="Enter supplier code"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-400">{errors.code}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ focusRingColor: "#FFBC0F" }}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-white mb-2"
              >
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                style={{ focusRingColor: "#FFBC0F" }}
                placeholder="Enter supplier address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">{errors.address}</p>
              )}
            </div>

            {/* Type Selection */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-white mb-2"
              >
                Supplier Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRingColor: "#FFBC0F" }}
              >
                <option value="company">Company</option>
                <option value="individual">Individual</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                type="submit"
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={{
                  backgroundColor: "#FFBC0F",
                  focusRingColor: "#FFBC0F",
                }}
              >
                Create Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #ffbc0f !important;
          box-shadow: 0 0 0 3px rgba(255, 188, 15, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
