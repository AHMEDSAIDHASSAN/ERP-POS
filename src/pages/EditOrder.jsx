import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Save,
  Search,
  X,
  ShoppingCart,
  Package,
  DollarSign,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  Percent,
  Tag,
} from "lucide-react";

// Offer Types Constants
const OFFER_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  BUY_X_GET_Y: "buyXGetY",
  BULK_PRICING: "bulkPricing",
};
import { toast } from "react-toastify";
import {
  getAllOrders,
  updateItems,
  getproducts,
  getOffers,
  getImageUrl,
} from "../services/apis";

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  const [orderData, setOrderData] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products"); // products or offers
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch order details
  const { data: ordersResponse, isLoading: orderLoading } = useQuery({
    queryKey: ["order-details", id],
    queryFn: () => getAllOrders(1, token, 2, "", "all"),
    onSuccess: (data) => {
      const order = data?.data?.data?.find((o) => o._id === id);
      if (order) {
        setOrderData(order);
      }
    },
  });

  // Find the specific order
  useEffect(() => {
    if (ordersResponse?.data?.data) {
      const order = ordersResponse.data.data.find((o) => o._id === id);
      if (order) {
        setOrderData(order);
      }
    }
  }, [ordersResponse, id]);

  // Fetch products for adding
  const { data: productsData } = useQuery({
    queryKey: ["products-for-order"],
    queryFn: () => getproducts(token),
    enabled: showAddItemModal,
  });

  // Fetch offers for adding
  const { data: offersData } = useQuery({
    queryKey: ["offers-for-order"],
    queryFn: () => getOffers(token),
    enabled: showAddItemModal,
  });

  // Update order mutation
  const { mutate: updateOrderMutation, isLoading: updateLoading } = useMutation(
    {
      mutationKey: ["update-order-items"],
      mutationFn: (payload) => updateItems(id, token, payload.items),
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update order");
      },
      onSuccess: (response) => {
        toast.success(response?.data?.message || "Order updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["all-orders"] });
        queryClient.invalidateQueries({ queryKey: ["order-details", id] });
        setHasChanges(false);
        navigate("/orders-tables");
      },
    }
  );

  const handleRemoveItem = (item) => {
    const filtered = orderData.items.filter((ele) => ele._id !== item._id);
    setOrderData((prev) => ({
      ...prev,
      items: filtered,
    }));
    setHasChanges(true);
  };

  const handleUpdateQuantity = (item, delta) => {
    const updatedItems = orderData.items.map((ele) => {
      if (ele._id === item._id) {
        const newQuantity = Math.max(1, ele.quantity + delta);
        return { ...ele, quantity: newQuantity };
      }
      return ele;
    });

    setOrderData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    setHasChanges(true);
  };

  const handleAddProduct = (product, isOffer = false) => {
    const newItem = {
      _id: `new_${Date.now()}`,
      productType: isOffer ? "offer" : "regular",
      quantity: 1,
      notes: "",
      customizations: {
        extras: [],
        removals: [],
        extrasWithPrices: [],
      },
      innerStatus: "pending",
    };

    // Store only the product/offer ID, not the full object
    if (isOffer) {
      newItem.offer = product._id;
    } else {
      newItem.product = product._id;
    }

    // Store the full product/offer object for display purposes only
    // This will not be sent to the backend
    newItem._displayData = product;

    setOrderData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setShowAddItemModal(false);
    setProductSearch("");
    setHasChanges(true);
    toast.success(`${product.title} added to order`);
  };

  const handleSaveOrder = () => {
    if (!orderData.items || orderData.items.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }

    // Transform items for backend: remove temporary _id from new items, format properly
    const itemsToSend = orderData.items.map(item => {
      const isNewItem = item._id && item._id.toString().startsWith("new_");

      // Base item structure
      const formattedItem = {
        productType: item.productType,
        quantity: item.quantity,
        notes: item.notes || "",
        customizations: item.customizations || {
          extras: [],
          removals: [],
          extrasWithPrices: [],
        },
        innerStatus: item.innerStatus || "pending",
      };

      // Add _id only for existing items (not new ones)
      if (!isNewItem) {
        formattedItem._id = item._id;
      }

      // Add product or offer reference (should already be just IDs)
      if (item.productType === "offer") {
        // Extract ID if it's an object, otherwise use as-is
        formattedItem.offer = typeof item.offer === 'object' ? item.offer._id : item.offer;
      } else {
        // Extract ID if it's an object, otherwise use as-is
        formattedItem.product = typeof item.product === 'object' ? item.product._id : item.product;
      }

      return formattedItem;
    });

    updateOrderMutation({ items: itemsToSend });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "checkout":
        return "bg-secondary text-gray-300 border-gray-300";
      default:
        return "bg-secondary text-gray-300 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "cancelled":
        return <X size={16} />;
      case "preparing":
      case "ready":
        return <Package size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-popular mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/orders-tables")}
            className="bg-popular text-primary px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const isEditable = !orderData.checkout && orderData.status !== "cancelled";

  return (
    <div className="min-h-screen bg-primary pb-8">
      {/* Header */}
      <div className="bg-secondary shadow-lg sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/orders-tables")}
                className="flex items-center gap-2 text-gray-400 hover:text-popular transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to Orders</span>
              </button>
              <div className="h-8 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Order #{orderData.OrderNumber}
                </h1>
                <p className="text-sm text-gray-400">
                  {isEditable ? "Edit Order Details" : "View Order (Read Only)"}
                </p>
              </div>
            </div>

            {isEditable && (
              <button
                onClick={handleSaveOrder}
                disabled={!hasChanges || updateLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasChanges && !updateLoading
                    ? "bg-popular text-primary hover:bg-opacity-90 shadow-lg shadow-popular/20"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-secondary rounded-xl shadow-lg border border-gray-700/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getStatusColor(
                  orderData.status
                )}`}
              >
                {getStatusIcon(orderData.status)}
                <span className="font-semibold capitalize">{orderData.status}</span>
              </div>
              {!isEditable && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertCircle size={16} />
                    This order cannot be edited
                  </p>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-secondary rounded-xl shadow-lg border border-gray-700/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Customer Name</p>
                    <p className="font-medium text-white capitalize">
                      {orderData.customer?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {orderData.table && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Table</p>
                      <p className="font-medium text-white">
                        {orderData.table?.title?.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Order Type</p>
                    <p className="font-medium text-white capitalize">
                      {orderData.orderType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Created At</p>
                    <p className="font-medium text-white">
                      {new Date(orderData.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-secondary rounded-xl shadow-lg border border-gray-700/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-400">Items Count</span>
                  <span className="font-semibold text-white">
                    {orderData.items?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-400">Total Quantity</span>
                  <span className="font-semibold text-white">
                    {orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                {orderData.guestCount && (
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-400">Guest Count</span>
                    <span className="font-semibold text-white">
                      {orderData.guestCount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-semibold text-white flex items-center gap-2">
                    <DollarSign size={20} />
                    Total Price
                  </span>
                  <span className="text-2xl font-bold text-popular">
                    {formatCurrency(orderData.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-xl shadow-lg border border-gray-700/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart size={24} className="text-popular" />
                  <h3 className="text-xl font-semibold text-white">Order Items</h3>
                </div>
                {isEditable && (
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
                  >
                    <Plus size={20} />
                    Add Item
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {orderData.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No items in this order</p>
                    {isEditable && (
                      <button
                        onClick={() => setShowAddItemModal(true)}
                        className="mt-4 text-popular hover:underline"
                      >
                        Add your first item
                      </button>
                    )}
                  </div>
                ) : (
                  orderData.items.map((item, index) => {
                    const isOfferItem = item.productType === "offer" || item.offer;
                    const offerData = item.offer || item._displayData;

                    return (
                    <div
                      key={item._id}
                      className={`border-2 rounded-lg p-4 hover:border-popular transition-all ${
                        isOfferItem ? 'border-popular/50 bg-popular/5' : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="bg-popular text-white text-xs font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            {isOfferItem && (
                              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <Gift size={12} />
                                Offer
                              </span>
                            )}
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              {item?._displayData?.title ||
                                item?.product?.title ||
                                item?.offer?.title ||
                                "Unknown Item"}
                            </h4>
                          </div>

                          {/* Offer Type and Discount Badge */}
                          {isOfferItem && offerData && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {offerData.offerType && (
                                <span className="bg-popular/20 text-popular text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  {offerData.offerType === OFFER_TYPES.PERCENTAGE && <><Percent size={12} /> {offerData.discountValue}% OFF</>}
                                  {offerData.offerType === OFFER_TYPES.FIXED && <><Tag size={12} /> {offerData.discountValue} EG OFF</>}
                                  {offerData.offerType === OFFER_TYPES.BUY_X_GET_Y && <><Gift size={12} /> Buy {offerData.buyQuantity} Get {offerData.getQuantity} Free</>}
                                  {offerData.offerType === OFFER_TYPES.BULK_PRICING && <><Package size={12} /> {offerData.bulkQuantity} for {offerData.bulkPrice} EG</>}
                                </span>
                              )}
                              {offerData.originalPrice && offerData.priceAfterDiscount && (
                                <div className="text-xs text-gray-400">
                                  <span className="line-through">{offerData.originalPrice?.toFixed(2)} EG</span>
                                  <span className="text-green-400 ml-2 font-semibold">→ {offerData.priceAfterDiscount?.toFixed(2)} EG</span>
                                </div>
                              )}
                            </div>
                          )}

                          {(item._displayData?.image || item.product?.image || item.offer?.image) && (
                            <img
                              src={getImageUrl(item._displayData?.image || item.product?.image || item.offer?.image)}
                              alt={item._displayData?.title || item.product?.title || item.offer?.title}
                              className="w-24 h-24 object-cover rounded-lg mb-3"
                            />
                          )}

                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Quantity:</span>
                              {isEditable ? (
                                <div className="flex items-center gap-2 bg-primary rounded-lg px-2 py-1">
                                  <button
                                    onClick={() => handleUpdateQuantity(item, -1)}
                                    disabled={item.quantity <= 1}
                                    className="p-1 hover:bg-secondary rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="font-bold text-lg w-12 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item, 1)}
                                    className="p-1 hover:bg-secondary rounded transition-colors"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-bold text-lg">{item.quantity}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">Status:</span>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusColor(
                                  item.innerStatus
                                )}`}
                              >
                                {item.innerStatus}
                              </span>
                            </div>
                          </div>

                          {item.notes && (
                            <p className="text-sm text-gray-400 mt-2">
                              <span className="font-medium">Notes:</span> {item.notes}
                            </p>
                          )}

                          {item.customizations?.extras?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-400">Extras:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.customizations.extras.map((extra, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-popular/20 text-popular px-2 py-1 rounded border border-popular/30"
                                  >
                                    {extra}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {isEditable && (
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );})
                )}
              </div>

              {hasChanges && (
                <div className="mt-6 p-4 bg-popular/10 border-2 border-popular/30 rounded-lg">
                  <p className="text-sm text-popular flex items-center gap-2">
                    <Info size={16} />
                    You have unsaved changes. Click "Save Changes" to update the order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-2xl shadow-2xl border-2 border-popular/30 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-popular to-yellow-600 text-primary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Add Item to Order</h3>
                  <p className="text-primary/80 text-sm mt-1">
                    Browse and select products or offers
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setProductSearch("");
                  }}
                  className="p-2 hover:bg-primary hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-primary">
              {/* Search Box */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search products or offers..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-secondary text-white border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-popular focus:border-popular transition-all placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b-2 border-gray-700">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === "products"
                      ? "text-popular border-b-2 border-popular -mb-0.5"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab("offers")}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === "offers"
                      ? "text-popular border-b-2 border-popular -mb-0.5"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Offers
                </button>
              </div>

              {/* Products/Offers Grid */}
              <div className="max-h-96 overflow-y-auto">
                {activeTab === "products" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productsData
                      ?.filter((product) =>
                        product.title
                          ?.toLowerCase()
                          .includes(productSearch.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleAddProduct(product, false)}
                          className="border-2 border-gray-600 rounded-lg p-4 hover:border-popular hover:shadow-lg cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-white group-hover:text-popular transition-colors">
                                {product.title}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                            <Plus
                              size={24}
                              className="text-green-500 group-hover:scale-110 transition-transform"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {activeTab === "offers" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(offersData?.data || offersData || [])
                      ?.filter((offer) =>
                        offer.isActive && offer.isValid &&
                        offer.title
                          ?.toLowerCase()
                          .includes(productSearch.toLowerCase())
                      )
                      .map((offer) => (
                        <div
                          key={offer._id}
                          onClick={() => handleAddProduct(offer, true)}
                          className="border-2 border-popular/30 rounded-lg p-4 hover:border-popular hover:shadow-lg hover:shadow-popular/10 cursor-pointer transition-all group bg-popular/5"
                        >
                          <div className="flex items-center gap-4">
                            {offer.image ? (
                              <img
                                src={getImageUrl(offer.image)}
                                alt={offer.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-popular/20 rounded-lg flex items-center justify-center">
                                <Gift size={32} className="text-popular" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Gift size={14} className="text-green-400" />
                                <p className="font-semibold text-white group-hover:text-popular transition-colors">
                                  {offer.title}
                                </p>
                              </div>
                              {/* Offer type badge */}
                              <div className="mt-1">
                                <span className="text-xs bg-popular/20 text-popular px-2 py-0.5 rounded-full">
                                  {offer.offerType === OFFER_TYPES.PERCENTAGE && `${offer.discountValue}% OFF`}
                                  {offer.offerType === OFFER_TYPES.FIXED && `${offer.discountValue} EG OFF`}
                                  {offer.offerType === OFFER_TYPES.BUY_X_GET_Y && `Buy ${offer.buyQuantity} Get ${offer.getQuantity} Free`}
                                  {offer.offerType === OFFER_TYPES.BULK_PRICING && `${offer.bulkQuantity} for ${offer.bulkPrice} EG`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {offer.originalPrice > 0 && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(offer.originalPrice)}
                                  </span>
                                )}
                                <span className="text-sm text-green-400 font-semibold">
                                  {formatCurrency(offer.priceAfterDiscount)}
                                </span>
                              </div>
                            </div>
                            <Plus
                              size={24}
                              className="text-popular group-hover:scale-110 transition-transform"
                            />
                          </div>
                        </div>
                      ))}
                    {(offersData?.data || offersData || [])?.filter(o => o.isActive && o.isValid).length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <Gift size={48} className="text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">No active offers available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
