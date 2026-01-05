import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Eye,
  Power,
  PowerOff,
  X,
  Upload,
  Trash2,
  Gift,
  Grid3X3,
  Loader2,
  TableOfContents,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Tag,
  ShoppingCart,
  Package,
  CalendarOff,
} from "lucide-react";

import {
  getOffers,
  getproducts,
  createOffer,
  getSpecificOffer,
  deActiveOffer,
  activeOffer,
  updateOffer,
  deleteOffer,
  imageBase,
} from "../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// Offer Types Constants
const OFFER_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  BUY_X_GET_Y: "buyXGetY",
  BULK_PRICING: "bulkPricing",
};

// Helper function to calculate discounted price
const calculateDiscountedPrice = (originalPrice, discountType, discountValue) => {
  if (!originalPrice || !discountValue) return originalPrice;

  switch (discountType) {
    case OFFER_TYPES.PERCENTAGE:
      return originalPrice - (originalPrice * discountValue / 100);
    case OFFER_TYPES.FIXED:
      return Math.max(0, originalPrice - discountValue);
    default:
      return originalPrice;
  }
};

// Helper function to format offer type display
const getOfferTypeLabel = (type) => {
  switch (type) {
    case OFFER_TYPES.PERCENTAGE:
      return "Percentage Discount";
    case OFFER_TYPES.FIXED:
      return "Fixed Amount Off";
    case OFFER_TYPES.BUY_X_GET_Y:
      return "Buy X Get Y Free";
    case OFFER_TYPES.BULK_PRICING:
      return "Bulk Pricing";
    default:
      return "Standard Discount";
  }
};

// Helper function to check if offer is expired
const isOfferExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "No Expiry";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Offer Details Modal Component
const OfferDetailsModal = ({
  offerId,
  isOpen,
  onClose,
  token,
  allProducts,
}) => {
  const [offerDetails, setOfferDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchOfferDetails();
    }
  }, [isOpen, offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await getSpecificOffer(offerId, token);
      let offerData = response.data || response;
      setOfferDetails(offerData);
    } catch (error) {
      console.error("Error fetching offer details:", error);
      toast.error("Error loading offer details");
    } finally {
      setLoading(false);
    }
  };

  const calculateOriginalTotal = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0;
    return items.reduce((total, item) => {
      let displayItem = item;
      if (typeof item === "string" && allProducts && Array.isArray(allProducts)) {
        displayItem = allProducts.find((product) => String(product._id) === String(item));
      }
      return total + parseFloat(displayItem?.price || 0);
    }, 0);
  };

  const getDiscountedTotal = () => {
    if (!offerDetails) return 0;
    const originalTotal = calculateOriginalTotal(offerDetails.items);

    // If legacy priceAfterDiscount exists, use it
    if (offerDetails.priceAfterDiscount) {
      return parseFloat(offerDetails.priceAfterDiscount);
    }

    // Otherwise calculate based on discount type
    if (offerDetails.offerType === OFFER_TYPES.BUY_X_GET_Y || offerDetails.offerType === OFFER_TYPES.BULK_PRICING) {
      // These are handled differently - show original for now
      return originalTotal;
    }

    return calculateDiscountedPrice(originalTotal, offerDetails.offerType, offerDetails.discountValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Offer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-popular" />
            </div>
          ) : offerDetails ? (
            <div className="space-y-6">
              {/* Image */}
              {offerDetails.image && (
                <div className="text-center">
                  <img
                    src={`${imageBase}${offerDetails.image}`}
                    alt={offerDetails.title}
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Title</label>
                  <p className="text-white font-semibold">{offerDetails.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${offerDetails.isActive ? "text-green-400" : "text-red-400"}`}>
                      {offerDetails.isActive ? "Active" : "Inactive"}
                    </span>
                    {isOfferExpired(offerDetails.expiryDate) && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Expired</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Offer Type</label>
                  <p className="text-white font-semibold flex items-center gap-2">
                    {offerDetails.offerType === OFFER_TYPES.PERCENTAGE && <Percent size={16} className="text-popular" />}
                    {offerDetails.offerType === OFFER_TYPES.FIXED && <DollarSign size={16} className="text-popular" />}
                    {offerDetails.offerType === OFFER_TYPES.BUY_X_GET_Y && <Gift size={16} className="text-popular" />}
                    {offerDetails.offerType === OFFER_TYPES.BULK_PRICING && <Package size={16} className="text-popular" />}
                    {getOfferTypeLabel(offerDetails.offerType)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Discount</label>
                  <p className="text-popular font-bold text-lg">
                    {offerDetails.offerType === OFFER_TYPES.PERCENTAGE && `${offerDetails.discountValue}% OFF`}
                    {offerDetails.offerType === OFFER_TYPES.FIXED && `${offerDetails.discountValue} EG OFF`}
                    {offerDetails.offerType === OFFER_TYPES.BUY_X_GET_Y &&
                      `Buy ${offerDetails.buyQuantity} Get ${offerDetails.getQuantity} Free`}
                    {offerDetails.offerType === OFFER_TYPES.BULK_PRICING &&
                      `Buy ${offerDetails.bulkQuantity} for ${offerDetails.bulkPrice} EG`}
                    {!offerDetails.offerType && offerDetails.priceAfterDiscount &&
                      `${parseFloat(offerDetails.priceAfterDiscount).toFixed(2)} EG`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Expiry Date</label>
                  <p className={`font-semibold flex items-center gap-2 ${
                    isOfferExpired(offerDetails.expiryDate) ? "text-red-400" : "text-white"
                  }`}>
                    {offerDetails.expiryDate ? <Calendar size={16} /> : <CalendarOff size={16} />}
                    {formatDate(offerDetails.expiryDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Total Items</label>
                  <p className="text-white font-semibold">
                    {Array.isArray(offerDetails.items) ? offerDetails.items.length : 0}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-400">Description</label>
                <p className="text-white mt-1">{offerDetails.description}</p>
              </div>

              {/* Items */}
              {Array.isArray(offerDetails.items) && offerDetails.items.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">
                    Included Items ({offerDetails.items.length} products)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offerDetails.items.map((item, index) => {
                      let displayItem = item;
                      if (typeof item === "string" && allProducts && Array.isArray(allProducts)) {
                        displayItem = allProducts.find((product) => String(product._id) === String(item)) || {
                          _id: item,
                          title: "Product not found",
                          price: 0,
                        };
                      }

                      return (
                        <div
                          key={displayItem?._id || displayItem?.id || index}
                          className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            {displayItem?.image && (
                              <img
                                src={`${imageBase}${displayItem.image}`}
                                alt={displayItem.title}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm">
                                {displayItem?.title || displayItem?.name || `Item ${index + 1}`}
                              </h4>
                              <p className="text-popular font-semibold">
                                {parseFloat(displayItem?.price || 0).toFixed(2)} EG
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Summary */}
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Original Total:</span>
                      <span className="text-white font-medium">
                        {calculateOriginalTotal(offerDetails.items).toFixed(2)} EG
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-400">After Discount:</span>
                      <span className="text-popular font-bold">
                        {getDiscountedTotal().toFixed(2)} EG
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1 pt-2 border-t border-gray-600">
                      <span className="text-green-400 font-medium">You Save:</span>
                      <span className="text-green-400 font-bold">
                        {(calculateOriginalTotal(offerDetails.items) - getDiscountedTotal()).toFixed(2)} EG
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No offer details available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, offerTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Delete Offer</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete "<span className="text-white">{offerTitle}</span>"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offer Card Component
const OfferCard = ({ data, onToggleStatus, onViewDetails, onEdit, onDelete, allProducts }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async () => {
    setIsToggling(true);
    if (onToggleStatus) {
      await onToggleStatus(data?._id);
    }
    setIsToggling(false);
  };

  const calculateOriginalPrice = (items) => {
    if (!Array.isArray(items) || items.length === 0) return 0;
    return items.reduce((total, item) => {
      if (typeof item === "string" && allProducts && Array.isArray(allProducts)) {
        const fullProduct = allProducts.find((product) => String(product._id) === String(item));
        return total + (parseFloat(fullProduct?.price) || 0);
      }
      return total + (parseFloat(item?.price) || 0);
    }, 0);
  };

  const getDiscountDisplay = () => {
    if (data?.offerType === OFFER_TYPES.PERCENTAGE) {
      return `${data.discountValue}% OFF`;
    }
    if (data?.offerType === OFFER_TYPES.FIXED) {
      return `${data.discountValue} EG OFF`;
    }
    if (data?.offerType === OFFER_TYPES.BUY_X_GET_Y) {
      return `Buy ${data.buyQuantity} Get ${data.getQuantity} Free`;
    }
    if (data?.offerType === OFFER_TYPES.BULK_PRICING) {
      return `${data.bulkQuantity} for ${data.bulkPrice} EG`;
    }
    return null;
  };

  const getCalculatedPrice = () => {
    const originalPrice = calculateOriginalPrice(data?.items);

    // Legacy support
    if (data?.priceAfterDiscount) {
      return parseFloat(data.priceAfterDiscount);
    }

    if (data?.offerType === OFFER_TYPES.PERCENTAGE || data?.offerType === OFFER_TYPES.FIXED) {
      return calculateDiscountedPrice(originalPrice, data.offerType, data.discountValue);
    }

    return originalPrice;
  };

  const expired = isOfferExpired(data?.expiryDate);

  return (
    <div className="group bg-secondary rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700/20 hover:border-popular/30">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-black">
        {data?.image ? (
          <img
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
            src={`${imageBase}${data.image}`}
            alt={data?.title}
          />
        ) : (
          <div className="w-full h-52 bg-gray-700 flex items-center justify-center">
            <Gift className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div
            className={`backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium ${
              data?.isActive && !expired ? "bg-green-500/90" : "bg-red-500/90"
            }`}
          >
            {expired ? "Expired" : data?.isActive ? "Active" : "Inactive"}
          </div>
          {data?.offerType && (
            <div className="backdrop-blur-sm bg-popular/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              {data.offerType === OFFER_TYPES.PERCENTAGE && <Percent size={10} />}
              {data.offerType === OFFER_TYPES.FIXED && <DollarSign size={10} />}
              {data.offerType === OFFER_TYPES.BUY_X_GET_Y && <Gift size={10} />}
              {data.offerType === OFFER_TYPES.BULK_PRICING && <Package size={10} />}
              {getDiscountDisplay()}
            </div>
          )}
        </div>

        {/* Expiry badge */}
        {data?.expiryDate && (
          <div className="absolute bottom-3 left-3 backdrop-blur-sm bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock size={10} />
            {formatDate(data.expiryDate)}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 space-y-4">
        <h3 className="text-xl font-bold text-white group-hover:text-popular transition-colors duration-300 leading-tight">
          {data?.title}
        </h3>

        <p className="text-gray-300 text-sm line-clamp-2">{data?.description}</p>

        <div className="space-y-3">
          {/* Items */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-popular/20 rounded-lg group-hover:bg-popular/30 transition-colors duration-300">
              <Grid3X3 className="w-4 h-4 text-popular" />
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-sm font-medium">Items</span>
              <p className="text-white font-semibold">
                {Array.isArray(data?.items) ? data.items.length : 0} products
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-popular/20 rounded-lg group-hover:bg-popular/30 transition-colors duration-300">
              <Tag className="w-4 h-4 text-popular" />
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-sm font-medium">Price</span>
              <div className="flex items-center gap-2">
                {calculateOriginalPrice(data?.items) > 0 && (
                  <span className="text-gray-400 text-sm line-through">
                    {calculateOriginalPrice(data?.items).toFixed(2)} EG
                  </span>
                )}
                <p className="text-popular font-bold text-lg">
                  {getCalculatedPrice().toFixed(2)} EG
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-1.5">
          <button
            onClick={() => onViewDetails && onViewDetails(data?._id)}
            className="w-full py-2 bg-popular/10 hover:bg-popular text-popular hover:text-white border border-popular/30 hover:border-popular rounded-lg font-medium text-sm transition-all duration-300"
          >
            View Offer Details
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit && onEdit(data)}
              className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-1 ${
                data?.isActive
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {data?.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  <span>{data?.isActive ? "Deactivate" : "Activate"}</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => onDelete && onDelete(data)}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete Offer
          </button>
        </div>
      </div>
    </div>
  );
};

const Offer = () => {
  const [state, setState] = useState(1); // 1: View Offers, 2: Create Offer, 3: Edit Offer
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, offer: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const offersLoaded = useRef(false);
  const token = useSelector((store) => store.user.token);

  // Form state with new fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: OFFER_TYPES.PERCENTAGE,
    discountValue: "",
    // Buy X Get Y fields
    buyQuantity: "",
    getQuantity: "",
    buyProduct: "",
    getProduct: "",
    // Bulk pricing fields
    bulkQuantity: "",
    bulkPrice: "",
    bulkProduct: "",
    // Common fields
    items: [],
    image: null,
    expiryDate: "",
    hasExpiry: false,
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (state === 1 && !offersLoaded.current) {
      loadOffers();
      offersLoaded.current = true;
    }
  }, [state]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getOffers(token);
      let offersData = [];
      if (response?.data && Array.isArray(response.data)) {
        offersData = response.data;
      } else if (Array.isArray(response)) {
        offersData = response;
      } else if (response?.offers && Array.isArray(response.offers)) {
        offersData = response.offers;
      }
      setOffers(offersData);
    } catch (error) {
      console.error("Error loading offers:", error);
      setOffers([]);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getproducts(token);
      let productsData = response?.data || response?.products || response || [];
      setProducts(productsData);
    } catch (error) {
      setProducts([]);
      toast.error("Failed to load products");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductSelection = (productId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.includes(productId)
        ? prev.items.filter((id) => id !== productId)
        : [...prev.items, productId],
    }));
  };

  const calculateSelectedPrice = () => {
    return getSelectedProducts().reduce(
      (total, product) => total + (parseFloat(product?.price) || 0),
      0
    );
  };

  const getCalculatedDiscountedPrice = () => {
    const originalPrice = calculateSelectedPrice();

    if (formData.offerType === OFFER_TYPES.PERCENTAGE && formData.discountValue) {
      return calculateDiscountedPrice(originalPrice, OFFER_TYPES.PERCENTAGE, parseFloat(formData.discountValue));
    }

    if (formData.offerType === OFFER_TYPES.FIXED && formData.discountValue) {
      return calculateDiscountedPrice(originalPrice, OFFER_TYPES.FIXED, parseFloat(formData.discountValue));
    }

    return originalPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description) {
      toast.error("Please fill in title and description");
      return;
    }

    // Validate based on offer type
    if (formData.offerType === OFFER_TYPES.PERCENTAGE || formData.offerType === OFFER_TYPES.FIXED) {
      if (!formData.discountValue || formData.items.length === 0) {
        toast.error("Please set discount value and select at least one product");
        return;
      }
      if (formData.offerType === OFFER_TYPES.PERCENTAGE && (parseFloat(formData.discountValue) <= 0 || parseFloat(formData.discountValue) > 100)) {
        toast.error("Percentage discount must be between 1 and 100");
        return;
      }
    }

    if (formData.offerType === OFFER_TYPES.BUY_X_GET_Y) {
      if (!formData.buyQuantity || !formData.getQuantity || !formData.buyProduct) {
        toast.error("Please fill in all Buy X Get Y fields");
        return;
      }
    }

    if (formData.offerType === OFFER_TYPES.BULK_PRICING) {
      if (!formData.bulkQuantity || !formData.bulkPrice || !formData.bulkProduct) {
        toast.error("Please fill in all bulk pricing fields");
        return;
      }
    }

    if (!editingOffer && !formData.image) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("offerType", formData.offerType);
      formDataObj.append("isActive", formData.isActive);

      // Add discount value for percentage/fixed types
      if (formData.offerType === OFFER_TYPES.PERCENTAGE || formData.offerType === OFFER_TYPES.FIXED) {
        formDataObj.append("discountValue", formData.discountValue);
        formDataObj.append("items", JSON.stringify(formData.items));
        // Calculate and send priceAfterDiscount for backward compatibility
        const calculatedPrice = getCalculatedDiscountedPrice();
        formDataObj.append("priceAfterDiscount", calculatedPrice.toString());
      }

      // Add Buy X Get Y fields
      if (formData.offerType === OFFER_TYPES.BUY_X_GET_Y) {
        formDataObj.append("buyQuantity", formData.buyQuantity);
        formDataObj.append("getQuantity", formData.getQuantity);
        formDataObj.append("buyProduct", formData.buyProduct);
        if (formData.getProduct) {
          formDataObj.append("getProduct", formData.getProduct);
        }
        formDataObj.append("items", JSON.stringify([formData.buyProduct, formData.getProduct || formData.buyProduct]));
      }

      // Add bulk pricing fields
      if (formData.offerType === OFFER_TYPES.BULK_PRICING) {
        formDataObj.append("bulkQuantity", formData.bulkQuantity);
        formDataObj.append("bulkPrice", formData.bulkPrice);
        formDataObj.append("bulkProduct", formData.bulkProduct);
        formDataObj.append("items", JSON.stringify([formData.bulkProduct]));
      }

      // Add expiry date
      if (formData.hasExpiry && formData.expiryDate) {
        formDataObj.append("expiryDate", formData.expiryDate);
      }

      // Add image
      if (formData.image) {
        formDataObj.append("image", formData.image);
      }

      if (editingOffer) {
        await updateOffer(editingOffer._id, formDataObj, token);
        toast.success("Offer updated successfully!");
      } else {
        await createOffer(formDataObj, token);
        toast.success("Offer created successfully!");
      }

      handleReset();
      setState(1);
      offersLoaded.current = false;
      loadOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error(
        `Error ${editingOffer ? "updating" : "creating"} offer: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      offerType: OFFER_TYPES.PERCENTAGE,
      discountValue: "",
      buyQuantity: "",
      getQuantity: "",
      buyProduct: "",
      getProduct: "",
      bulkQuantity: "",
      bulkPrice: "",
      bulkProduct: "",
      items: [],
      image: null,
      expiryDate: "",
      hasExpiry: false,
      isActive: true,
    });
    setImagePreview(null);
    setEditingOffer(null);
  };

  const getSelectedProducts = () => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) =>
      formData.items.some((id) => String(id) === String(product._id))
    );
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      offerType: offer.offerType || OFFER_TYPES.PERCENTAGE,
      discountValue: offer.discountValue?.toString() || "",
      buyQuantity: offer.buyQuantity?.toString() || "",
      getQuantity: offer.getQuantity?.toString() || "",
      buyProduct: offer.buyProduct || "",
      getProduct: offer.getProduct || "",
      bulkQuantity: offer.bulkQuantity?.toString() || "",
      bulkPrice: offer.bulkPrice?.toString() || "",
      bulkProduct: offer.bulkProduct || "",
      items: Array.isArray(offer.items)
        ? offer.items.map(item => typeof item === 'string' ? item : item._id)
        : [],
      image: null,
      expiryDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : "",
      hasExpiry: !!offer.expiryDate,
      isActive: offer.isActive !== false,
    });
    if (offer.image) {
      setImagePreview(`${imageBase}${offer.image}`);
    }
    setState(3);
  };

  const handleDeleteOffer = async () => {
    if (!deleteModal.offer) return;

    try {
      setDeleteLoading(true);
      await deleteOffer(deleteModal.offer._id, token);
      setOffers((prev) => prev.filter((o) => o._id !== deleteModal.offer._id));
      toast.success("Offer deleted successfully!");
      setDeleteModal({ isOpen: false, offer: null });
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Error deleting offer: " + (error.response?.data?.message || error.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleOfferStatus = async (id) => {
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const offer = offers.find((o) => String(o._id) === String(id));
      if (!offer) {
        toast.error("Offer not found");
        return;
      }

      if (offer.isActive) {
        await deActiveOffer(id, token);
      } else {
        await activeOffer(id, token);
      }

      setOffers((prevOffers) =>
        prevOffers.map((offerItem) => {
          if (String(offerItem._id) === String(id)) {
            return { ...offerItem, isActive: !offerItem.isActive };
          }
          return offerItem;
        })
      );

      toast.success(`Offer ${offer.isActive ? "deactivated" : "activated"} successfully!`);
    } catch (error) {
      console.error("Error toggling offer status:", error);
      let errorMessage = "Error updating offer status";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      }
      toast.error(errorMessage);
    }
  };

  const handleViewOfferDetails = (offerId) => {
    setSelectedOfferId(offerId);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const renderOfferTypeFields = () => {
    switch (formData.offerType) {
      case OFFER_TYPES.PERCENTAGE:
        return (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Discount Percentage *
            </label>
            <div className="relative">
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                min="1"
                max="100"
                className="w-full px-4 py-3 pr-12 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-popular font-bold">%</span>
            </div>
          </div>
        );

      case OFFER_TYPES.FIXED:
        return (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Discount Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                min="1"
                step="0.01"
                className="w-full px-4 py-3 pr-12 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-popular font-bold">EG</span>
            </div>
          </div>
        );

      case OFFER_TYPES.BUY_X_GET_Y:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Buy Quantity *
                </label>
                <input
                  type="number"
                  name="buyQuantity"
                  value={formData.buyQuantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                  min="1"
                  className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Get Free Quantity *
                </label>
                <input
                  type="number"
                  name="getQuantity"
                  value={formData.getQuantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  min="1"
                  className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Product to Buy *
              </label>
              <select
                name="buyProduct"
                value={formData.buyProduct}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title} - {product.price} EG
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Product to Get Free (Optional - defaults to same product)
              </label>
              <select
                name="getProduct"
                value={formData.getProduct}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
              >
                <option value="">Same as buy product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title} - {product.price} EG
                  </option>
                ))}
              </select>
            </div>
            {formData.buyQuantity && formData.getQuantity && formData.buyProduct && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium">
                  <Gift className="inline w-4 h-4 mr-2" />
                  Buy {formData.buyQuantity} and get {formData.getQuantity} FREE!
                </p>
              </div>
            )}
          </div>
        );

      case OFFER_TYPES.BULK_PRICING:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="bulkQuantity"
                  value={formData.bulkQuantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 3"
                  min="2"
                  className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bulk Price *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="bulkPrice"
                    value={formData.bulkPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 pr-12 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-popular font-bold">EG</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Product *
              </label>
              <select
                name="bulkProduct"
                value={formData.bulkProduct}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title} - {product.price} EG each
                  </option>
                ))}
              </select>
            </div>
            {formData.bulkQuantity && formData.bulkPrice && formData.bulkProduct && (
              <div className="p-3 bg-popular/10 border border-popular/30 rounded-lg">
                {(() => {
                  const selectedProduct = products.find(p => p._id === formData.bulkProduct);
                  const originalTotal = selectedProduct ? selectedProduct.price * parseInt(formData.bulkQuantity) : 0;
                  const savings = originalTotal - parseFloat(formData.bulkPrice);
                  return (
                    <div className="space-y-1">
                      <p className="text-popular font-medium">
                        <Package className="inline w-4 h-4 mr-2" />
                        Buy {formData.bulkQuantity} for {formData.bulkPrice} EG
                      </p>
                      {savings > 0 && (
                        <p className="text-green-400 text-sm">
                          Save {savings.toFixed(2)} EG (Original: {originalTotal.toFixed(2)} EG)
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center flex-wrap mb-8">
        <h3 className="font-semibold tracking-wider text-lg text-white">
          Offer Management
        </h3>
        <div className="flex items-center border-[1px] rounded-md overflow-x-auto hide-scrollbar border-popular w-full sm:w-fit max-w-full">
          <button
            onClick={() => {
              handleReset();
              setState(1);
            }}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state === 1 ? "bg-popular text-white" : ""
            }`}
          >
            <TableOfContents size={15} />
            <span>View Offers</span>
          </button>
          <button
            onClick={() => {
              handleReset();
              setState(2);
            }}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state === 2 || state === 3 ? "bg-popular text-white" : ""
            }`}
          >
            <Plus size={15} />
            <span>{state === 3 ? "Edit Offer" : "Create Offer"}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <OfferDetailsModal
        offerId={selectedOfferId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOfferId(null);
        }}
        token={token}
        allProducts={products}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, offer: null })}
        onConfirm={handleDeleteOffer}
        offerTitle={deleteModal.offer?.title}
        loading={deleteLoading}
      />

      {/* Tab Content */}
      {state === 1 ? (
        // View Offers
        <div className="space-y-8 mt-10">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 rounded-2xl border border-gray-200/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-popular/20 rounded-xl">
                  <Gift className="w-6 h-6 text-popular" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white tracking-wide">
                    Offers
                  </h1>
                  <p className="text-gray-300 mt-1">
                    Manage your special offers ({Array.isArray(offers) ? offers.length : 0} total)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setState(2)}
                className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Add Offer</span>
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-popular" />
                  <p className="text-gray-600 font-medium">Loading Offers...</p>
                </div>
              </div>
            ) : Array.isArray(offers) && offers.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-popular rounded-full"></div>
                    <h2 className="text-lg font-semibold text-white">All Offers</h2>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {offers.length} items
                  </div>
                </div>

                <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
                  {offers.map((offer, index) => (
                    <div
                      key={offer?._id || offer?.id || index}
                      className="transform hover:scale-[1.02] transition-transform duration-300"
                    >
                      <OfferCard
                        data={offer}
                        onToggleStatus={handleToggleOfferStatus}
                        onViewDetails={handleViewOfferDetails}
                        onEdit={handleEditOffer}
                        onDelete={(offer) => setDeleteModal({ isOpen: true, offer })}
                        allProducts={products}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Offers Found</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first special offer</p>
                    <button
                      onClick={() => setState(2)}
                      className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
                    >
                      <Plus size={20} />
                      <span>Create Offer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          {Array.isArray(offers) && offers.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-popular">{offers.length}</p>
                  <p className="text-sm text-gray-600">Total Offers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {offers.filter((offer) => offer?.isActive && !isOfferExpired(offer?.expiryDate)).length}
                  </p>
                  <p className="text-sm text-gray-600">Active Offers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {offers.filter((offer) => isOfferExpired(offer?.expiryDate)).length}
                  </p>
                  <p className="text-sm text-gray-600">Expired</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {offers.reduce((acc, offer) => acc + (Array.isArray(offer?.items) ? offer.items.length : 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {offers.filter((offer) => offer?.offerType === OFFER_TYPES.BUY_X_GET_Y).length}
                  </p>
                  <p className="text-sm text-gray-600">Buy X Get Y</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Create/Edit Offer Form
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
              <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-white">
                {editingOffer ? "Edit Offer" : "Add New Offer"}
              </h1>
              <p className="mt-1 text-sm sm:text-base">
                {editingOffer
                  ? "Update the offer details below"
                  : "Create a new special offer for your customers"}
              </p>
            </div>

            {/* Form */}
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Offer Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter offer title"
                      className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Offer Type *
                    </label>
                    <select
                      name="offerType"
                      value={formData.offerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
                    >
                      <option value={OFFER_TYPES.PERCENTAGE}>Percentage Discount (%)</option>
                      <option value={OFFER_TYPES.FIXED}>Fixed Amount Off (EG)</option>
                      <option value={OFFER_TYPES.BUY_X_GET_Y}>Buy X Get Y Free</option>
                      <option value={OFFER_TYPES.BULK_PRICING}>Bulk Pricing</option>
                    </select>
                  </div>
                </div>

                {/* Offer Type Specific Fields */}
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    {formData.offerType === OFFER_TYPES.PERCENTAGE && <Percent size={18} className="text-popular" />}
                    {formData.offerType === OFFER_TYPES.FIXED && <DollarSign size={18} className="text-popular" />}
                    {formData.offerType === OFFER_TYPES.BUY_X_GET_Y && <Gift size={18} className="text-popular" />}
                    {formData.offerType === OFFER_TYPES.BULK_PRICING && <Package size={18} className="text-popular" />}
                    {getOfferTypeLabel(formData.offerType)} Settings
                  </h4>
                  {renderOfferTypeFields()}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter offer description"
                    className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                    required
                  />
                </div>

                {/* Expiry Date & Active Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="hasExpiry"
                        name="hasExpiry"
                        checked={formData.hasExpiry}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded text-popular focus:ring-popular"
                      />
                      <label htmlFor="hasExpiry" className="text-sm font-medium text-white">
                        Set Expiry Date
                      </label>
                    </div>
                    {formData.hasExpiry && (
                      <div>
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
                          required={formData.hasExpiry}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-popular focus:ring-popular"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-white">
                      Active (offer is visible to customers)
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Offer Image {!editingOffer && "*"}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-popular/60 border-dashed rounded-lg hover:border-popular/80 transition-colors cursor-pointer">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                          />
                          <p className="text-sm text-gray-400 mt-2">
                            {formData.image?.name || "Current image"}
                          </p>
                        </div>
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image"
                          className="relative cursor-pointer bg-popular/20 rounded-md font-medium text-popular hover:text-popular/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-popular px-2 py-1"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1 text-gray-400">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Product Selection - Only for percentage and fixed discount types */}
                {(formData.offerType === OFFER_TYPES.PERCENTAGE || formData.offerType === OFFER_TYPES.FIXED) && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Select Products * ({formData.items.length} selected)
                    </label>
                    {formData.items.length > 0 && (
                      <div className="mb-4 p-3 bg-popular/10 rounded-lg border border-popular/20">
                        <div className="text-sm text-gray-300 mb-2">Selected Products:</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getSelectedProducts().map((product) => (
                            <span
                              key={product._id}
                              className="bg-popular/20 text-popular px-2 py-1 rounded text-sm flex items-center gap-1"
                            >
                              {product.title} ({product.price} EG)
                              <button
                                type="button"
                                onClick={() => toggleProductSelection(product._id)}
                                className="ml-1 text-popular hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="text-sm font-medium text-white space-y-1">
                          <div>Original Total: {calculateSelectedPrice().toFixed(2)} EG</div>
                          {formData.discountValue && (
                            <>
                              <div className="text-popular">
                                Discounted Price: {getCalculatedDiscountedPrice().toFixed(2)} EG
                              </div>
                              <div className="text-green-400">
                                Customer Saves: {(calculateSelectedPrice() - getCalculatedDiscountedPrice()).toFixed(2)} EG
                                {formData.offerType === OFFER_TYPES.PERCENTAGE && ` (${formData.discountValue}%)`}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                      {Array.isArray(products) &&
                        products.map((product) => (
                          <div
                            key={product._id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                              formData.items.includes(product._id)
                                ? "border-popular bg-popular/10"
                                : "border-gray-600 hover:border-popular/50"
                            }`}
                            onClick={() => toggleProductSelection(product._id)}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={formData.items.some((id) => String(id) === String(product._id))}
                                onChange={() => toggleProductSelection(product._id)}
                                className="rounded text-popular"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-sm text-white">{product.title}</h5>
                                <p className="text-xs text-gray-400">{product.price} EG</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {(!Array.isArray(products) || products.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No products available. Please add products first.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                  <button
                    className="bg-popular hover:bg-popular/90 py-2 px-4 rounded-md font-semibold w-full sm:w-fit text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : editingOffer ? "Update Offer" : "Create Offer"}
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-md font-semibold w-full sm:w-fit text-white transition-colors"
                    type="button"
                    onClick={() => {
                      handleReset();
                      setState(1);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-md font-semibold w-full sm:w-fit text-white transition-colors"
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-secondary rounded-lg p-4">
            <h3 className="text-sm font-medium text-popular mb-2">Offer Types Explained:</h3>
            <ul className="text-sm text-white space-y-2">
              <li className="flex items-start gap-2">
                <Percent size={16} className="text-popular mt-0.5 flex-shrink-0" />
                <span><strong>Percentage Discount:</strong> Apply a percentage off the total price (e.g., 20% off)</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign size={16} className="text-popular mt-0.5 flex-shrink-0" />
                <span><strong>Fixed Amount Off:</strong> Deduct a fixed amount from the total (e.g., 50 EG off)</span>
              </li>
              <li className="flex items-start gap-2">
                <Gift size={16} className="text-popular mt-0.5 flex-shrink-0" />
                <span><strong>Buy X Get Y Free:</strong> Buy a quantity and get additional items free (e.g., Buy 2 Get 1 Free)</span>
              </li>
              <li className="flex items-start gap-2">
                <Package size={16} className="text-popular mt-0.5 flex-shrink-0" />
                <span><strong>Bulk Pricing:</strong> Special price when buying in bulk (e.g., 3 items for 100 EG)</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offer;
