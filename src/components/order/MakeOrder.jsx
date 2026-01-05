import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  X,
  Settings,
  Edit2,
  Check,
  Gift,
  Percent,
  DollarSign,
  Package,
  Tag,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getproducts,
  imageBase,
  getImageUrl,
  getAllExtras,
  createExtra,
  updateExtra,
  deleteExtra,
  createOrder,
  getOffers,
} from "../../services/apis";
import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";

// Offer Types Constants
const OFFER_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  BUY_X_GET_Y: "buyXGetY",
  BULK_PRICING: "bulkPricing",
};
import { toast } from "react-toastify";

export default function MakeOrder() {
  const [creatingExtra, setCreatingExtra] = useState(false);
  const [apiExtras, setApiExtras] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [myData, setMydata] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false); // For mobile cart toggle
  const [activeMenuTab, setActiveMenuTab] = useState("products"); // "products" or "offers"
  const [offersData, setOffersData] = useState([]);

  const [customizations, setCustomizations] = useState({
    extras: [],
    removals: [],
    size: "small",
    specialInstructions: "",
  });
  const [editingExtra, setEditingExtra] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExtra, setNewExtra] = useState({ name: "", price: "" });

  const token = useSelector((store) => store.user.token);

  // Recalculate total whenever cart changes to ensure accuracy
  const calculateCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => {
      return sum + (item.finalPrice || item.price) * item.quantity;
    }, 0);
  }, [cart]);

  // Sync total with cart state to prevent calculation drift
  useEffect(() => {
    const calculatedTotal = calculateCartTotal();
    if (Math.abs(calculatedTotal - total) > 0.01) {
      setTotal(calculatedTotal);
    }
  }, [cart, calculateCartTotal, total]);

  const location = useLocation();
  const { state } = location;

  const fetchExtras = async (productId) => {
    try {
      const response = await getAllExtras(productId, token);
      const transformedExtras = (response.data || []).map((extra) => ({
        ...extra,
        id: extra._id,
      }));
      setApiExtras(transformedExtras);
    } catch (error) {
      console.error("failed to fetch extras:", error);
      setApiExtras([]);
    }
  };

  const [customizationOptions, setCustomizationOptions] = useState({
    extras: [
      { id: "1", name: "Extra Cheese", price: 2.5 },
      { id: "2", name: "Extra Bacon", price: 3.0 },
      { id: "3", name: "Extra Mushrooms", price: 1.5 },
      { id: "4", name: "Extra Peppers", price: 1.0 },
      { id: "5", name: "Extra Onions", price: 1.0 },
    ],
    removals: [
      { id: "1", name: "No Tomato", price: 0 },
      { id: "2", name: "No Onions", price: 0 },
      { id: "3", name: "No Pickles", price: 0 },
      { id: "4", name: "No Lettuce", price: 0 },
      { id: "5", name: "No Sauce", price: 0 },
    ],
  });

  const { mutate } = useMutation({
    mutationKey: ["create-order"],
    mutationFn: (payload) => createOrder(payload.data, token),
    onSuccess: () => {
      navigate("/orders-tables");
      toast.success("order created successfully");
    },
    onError: (e) => {
      toast.error(e.response.data.message);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["get-all-products"],
    queryFn: async () => {
      const res = await getproducts(token);
      const uniqueSubCategories = (res || [])
        .filter(
          (product) =>
            product && product.subCategory && product.subCategory.title
        )
        .map((product) => product.subCategory)
        .filter(
          (subCat, index, arr) =>
            arr.findIndex((sc) => sc.title === subCat.title) === index
        );
      setFilterOptions(uniqueSubCategories);

      setMydata(res);
    },
    refetchOnWindowFocus: false, // ❌ don't refetch on window focus
    refetchOnReconnect: false, // ❌ don't refetch when reconnecting
    staleTime: 1000 * 60 * 60 * 3, // ✅ 3 hours fresh (3 * 60 * 60 * 1000)
    cacheTime: 1000 * 60 * 60 * 3, // ✅ keep unused data in cache for 3 hours
  });

  // Fetch offers
  const { isLoading: offersLoading } = useQuery({
    queryKey: ["get-all-offers"],
    queryFn: async () => {
      const res = await getOffers(token);
      const offers = res?.data || res || [];
      setOffersData(offers);
      return offers;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 60 * 3,
    cacheTime: 1000 * 60 * 60 * 3,
  });

  // Helper function to get offer discount display
  const getOfferDiscountDisplay = (offer) => {
    if (offer?.offerType === OFFER_TYPES.PERCENTAGE) {
      return `${offer.discountValue}% OFF`;
    }
    if (offer?.offerType === OFFER_TYPES.FIXED) {
      return `${offer.discountValue} EG OFF`;
    }
    if (offer?.offerType === OFFER_TYPES.BUY_X_GET_Y) {
      return `Buy ${offer.buyQuantity} Get ${offer.getQuantity} Free`;
    }
    if (offer?.offerType === OFFER_TYPES.BULK_PRICING) {
      return `${offer.bulkQuantity} for ${offer.bulkPrice} EG`;
    }
    return null;
  };

  // Add offer to cart
  const addOfferToCart = (offer) => {
    // Use unique ID prefix to distinguish offers from products
    const offerUniqueId = `offer_${offer._id}`;
    const existingItem = cart.find(
      (item) => item.uniqueId === offerUniqueId
    );

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.uniqueId === offerUniqueId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      const offerItem = {
        ...offer,
        _id: offer._id,
        uniqueId: offerUniqueId, // Unique identifier to prevent collision with products
        title: offer.title,
        price: offer.priceAfterDiscount || 0,
        quantity: 1,
        finalPrice: offer.priceAfterDiscount || 0,
        productType: "offer",
        offerDetails: {
          offerType: offer.offerType,
          discountValue: offer.discountValue,
          originalPrice: offer.originalPrice,
          items: offer.items,
          buyQuantity: offer.buyQuantity,
          getQuantity: offer.getQuantity,
          bulkQuantity: offer.bulkQuantity,
          bulkPrice: offer.bulkPrice,
        },
      };
      setCart([...cart, offerItem]);
    }

    setTotal(total + (offer.priceAfterDiscount || 0));
    toast.success(`${offer.title} added to order`);
  };

  // Reset customizations
  const resetCustomizations = () => {
    setCustomizations({
      extras: [],
      removals: [],
      size: "small",
      specialInstructions: "",
    });
  };

  // Open customization modal
  const openCustomization = async (product) => {
    setSelectedProduct(product);
    resetCustomizations();
    setShowCustomization(true);

    await fetchExtras(product._id);
  };

  // Close customization modal
  const closeCustomization = () => {
    setShowCustomization(false);
    setSelectedProduct(null);
    resetCustomizations();
  };

  // Handle customization changes
  const handleCustomizationChange = (type, itemId, checked = null) => {
    if (type === "size") {
      setCustomizations((prev) => ({ ...prev, size: itemId }));
    } else if (type === "specialInstructions") {
      setCustomizations((prev) => ({ ...prev, specialInstructions: itemId }));
    } else {
      setCustomizations((prev) => ({
        ...prev,
        [type]: checked
          ? [...prev[type], itemId]
          : prev[type].filter((id) => id !== itemId),
      }));
    }
  };

  const EditForm = ({ extra }) => {
    const [name, setName] = useState(extra.name);
    const [price, setPrice] = useState(extra.price.toString());

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
        <div className="flex items-center flex-1">
          <input
            type="checkbox"
            checked={customizations.extras.includes(extra._id)}
            onChange={(e) =>
              handleCustomizationChange("extras", extra._id, e.target.checked)
            }
            className="mr-3"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-medium bg-white text-black border rounded focus:border-[#ffbc0f] outline-none  px-2 py-1 mr-2 flex-1"
            placeholder="Extra name"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-white text-black border rounded focus:border-[#ffbc0f] outline-none px-2 py-1 w-20"
            placeholder="Price"
            step="0.01"
            min="0"
          />
          <span className="ml-1 text-gray-600 font-bold">EG</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => handleEditingExtra(extra._id, name, price)}
            className="text-blue-600 hover:text-blue-800 p-1"
            disabled={!name.trim() || !price}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingExtra(null)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Calculate customization price
  const calculateCustomizationPrice = () => {
    let price = 0;

    // Add size price

    // Add extras price
    customizations.extras.forEach((extraId) => {
      const extra = apiExtras.find((e) => e._id === extraId);
      if (extra) price += extra.price;
    });

    return price;
  };

  // handle Add Extras
  const handleAddExtra = async () => {
    if (!newExtra.name.trim() || !newExtra.price) {
      return;
    }
    try {
      setCreatingExtra(true);

      const response = await createExtra(
        selectedProduct._id,
        {
          title: newExtra.name.trim(),
          price: parseFloat(newExtra.price),
        },
        token
      );

      const newExtraData = {
        _id: response.data._id,
        name: response.data.name || response.data.title, // ✅ Correct
        price: response.data.price, // ✅ Correct
      };

      setApiExtras((prev) => [...prev, newExtraData]);

      setNewExtra({ name: "", price: "" });
      setShowAddForm(false);
      toast.success("Extra added successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create extra. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCreatingExtra(false);
    }
  };

  // handle Edit Extras
  const handleEditingExtra = async (extraId, newName, newPrice) => {
    if (!selectedProduct) return;
    try {
      setCreatingExtra(true);
      const response = await updateExtra(
        selectedProduct._id,
        extraId,
        {
          title: newName.trim(),
          price: parseFloat(newPrice),
        },
        token
      );

      setApiExtras((prev) =>
        prev.map((extra) =>
          extra._id === extraId
            ? {
                ...extra,
                _id: extra._id,
                name: response.data.title || response.data.name,
                price: response.data.price,
              }
            : extra
        )
      );

      setEditingExtra(null);
      toast.success("Extra updated successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update extra. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCreatingExtra(false);
    }
  };

  // handle Delete Extras
  const handleDeleteExtra = async (extraId) => {
    if (!selectedProduct) return;

    if (!window.confirm("Are you sure you want to delete this extra?")) {
      return;
    }

    try {
      setCreatingExtra(true); // Reuse loading state

      await deleteExtra(selectedProduct._id, extraId, token);

      setApiExtras((prev) => prev.filter((extra) => extra._id !== extraId));

      setCustomizations((prev) => ({
        ...prev,
        extras: prev.extras.filter(
          (selectedExtraId) => selectedExtraId !== extraId
        ),
      }));

      toast.success("Extra deleted successfully!");
    } catch (error) {
      console.error("Failed to delete extra:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete extra. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCreatingExtra(false);
    }
  };

  // Add to cart with customizations
  const addToCartWithCustomizations = () => {
    if (!selectedProduct) return;

    const customizationPrice = calculateCustomizationPrice();
    const itemPrice = selectedProduct.price + customizationPrice;

    // Get detailed extras with prices
    const extrasWithPrices = customizations.extras.map((extraId) => {
      const extra = apiExtras.find((e) => e._id === extraId);
      return {
        id: extra.id,
        name: extra.name,
        price: extra.price,
      };
    });

    // Get detailed removals
    const removalsWithDetails = customizations.removals.map((removalId) => {
      const removal = customizationOptions.removals.find(
        (r) => r.id === removalId
      );
      return {
        id: removal.id,
        name: removal.name,
        price: removal.price,
      };
    });

    const customizedProduct = {
      ...selectedProduct,
      customizations: {
        ...customizations,
        extrasWithPrices, // Add detailed extras with prices
        removalsWithDetails, // Add detailed removals
      },
      customizationPrice,
      finalPrice: itemPrice,
      uniqueId: `product_custom_${selectedProduct._id}_${Date.now()}_${Math.random()}`, // Unique ID for customized items
      productType: "regular", // Explicitly set product type
    };

    const existingItemIndex = cart.findIndex(
      (item) =>
        item._id === selectedProduct._id &&
        item.productType !== "offer" && // Ensure we don't match offers
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...customizedProduct, quantity: 1 }]);
    }

    setTotal(total + itemPrice);
    closeCustomization();
  };

  // Simple add to cart (without customization)
  const addToCart = (product) => {
    // Use unique ID prefix to distinguish regular products from offers
    const productUniqueId = `product_${product._id}`;
    const existingItem = cart.find(
      (item) => item.uniqueId === productUniqueId && !item.customizations
    );

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.uniqueId === productUniqueId && !item.customizations
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          uniqueId: productUniqueId, // Unique identifier to prevent collision with offers
          quantity: 1,
          finalPrice: product.price,
          productType: "regular", // Explicitly set product type
        },
      ]);
    }

    setTotal(total + product.price);
  };

  const updateQuantity = (uniqueId, change) => {
    const updatedCart = cart
      .map((item) => {
        const itemId = item.uniqueId || item._id;
        if (itemId === uniqueId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            setTotal(total - (item.finalPrice || item.price) * item.quantity);
            return null;
          }
          setTotal(total + (item.finalPrice || item.price) * change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
      .filter(Boolean);

    setCart(updatedCart);
  };

  const removeFromCart = (uniqueId) => {
    const itemId = uniqueId;
    const item = cart.find((item) => (item.uniqueId || item._id) === itemId);
    if (item) {
      setTotal(total - (item.finalPrice || item.price) * item.quantity);
      setCart(cart.filter((item) => (item.uniqueId || item._id) !== itemId));
    }
  };

  const clearCart = () => {
    setCart([]);
    setTotal(0);
  };

  let allData = [];

  if (filterValue) {
    allData = myData.filter(
      (ele) =>
        ele && ele.subCategory && ele.subCategory.title === filterValue.title
    );
  } else {
    allData = myData;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 w-full">
      {/* Mobile Cart Toggle Button */}
      <div className="xl:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 ms-auto  w-full">
        {/* Products Section */}
        <div className="flex-1  lg:max-w-4xl backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text ml-4 flex items-center justify-between  w-full">
              <div>{activeMenuTab === "products" ? "Menu Items" : "Special Offers"}</div>
              {activeMenuTab === "products" && (
                <button
                  onClick={() => setFilterValue("")}
                  className="text-base font-bold bg-popular rounded-md px-3 py-1"
                >
                  Clear
                </button>
              )}
            </h2>
          </div>

          {/* Products/Offers Tab Navigation */}
          <div className="flex mb-4 lg:mb-6 border-b border-gray-600">
            <button
              onClick={() => setActiveMenuTab("products")}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeMenuTab === "products"
                  ? "text-popular border-b-2 border-popular"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Products
            </button>
            <button
              onClick={() => setActiveMenuTab("offers")}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeMenuTab === "offers"
                  ? "text-popular border-b-2 border-popular"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4" />
              Offers
              {offersData?.filter(o => o.isActive && o.isValid)?.length > 0 && (
                <span className="bg-popular text-white text-xs px-2 py-0.5 rounded-full">
                  {offersData.filter(o => o.isActive && o.isValid).length}
                </span>
              )}
            </button>
          </div>

          {/* Category Filter - Only show for products tab */}
          {activeMenuTab === "products" && (
            <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 mb-4 lg:mb-6 hide-scrollbar-order">
              {filterOptions?.map((ele, index) => (
                <button
                  onClick={() => setFilterValue(ele)}
                  className="flex-shrink-0 hover:scale-105 transition-transform duration-200 my-2"
                  key={index}
                >
                  <img
                    className="w-[80px] h-[80px] sm:w-[80px] sm:h-[80px] lg:w-[100px] lg:h-[100px] rounded-full object-cover border-4 border-transparent hover:border-popular transition-colors duration-200"
                    src={`${imageBase}${ele?.image}`}
                    alt={ele?.title || "Category"}
                    onError={(e) => {
                      e.target.src = "";
                    }}
                  />
                  <p className="text-center text-xs sm:text-sm font-medium text-white mt-2 truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
                    {ele?.title || "Category"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Offers Grid */}
          {activeMenuTab === "offers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {offersLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-popular border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading offers...</p>
                </div>
              ) : offersData?.filter(o => o.isActive && o.isValid)?.length > 0 ? (
                offersData
                  .filter((offer) => offer.isActive && offer.isValid)
                  .map((offer) => (
                    <div
                      key={offer._id}
                      className="bg-secondary rounded-xl lg:rounded-2xl my-2 lg:my-3 pb-4 lg:pb-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-popular group min-h-[300px] sm:min-h-[320px] lg:min-h-[340px]"
                    >
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="relative w-full h-[120px] sm:h-[140px] lg:h-[150px] overflow-hidden mb-3 lg:mb-4 transition-transform duration-300">
                          {offer?.image ? (
                            <img
                              className="w-full h-full object-cover rounded-lg lg:rounded-xl rounded-b-none"
                              src={getImageUrl(offer.image)}
                              alt={offer?.title}
                              onError={(e) => {
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-popular/20 to-purple-600/20 flex items-center justify-center rounded-lg lg:rounded-xl rounded-b-none">
                              <Gift className="w-12 h-12 text-popular" />
                            </div>
                          )}
                          {/* Discount Badge */}
                          <div className="absolute top-2 right-2 bg-popular text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            {offer.offerType === OFFER_TYPES.PERCENTAGE && <Percent className="w-3 h-3" />}
                            {offer.offerType === OFFER_TYPES.FIXED && <DollarSign className="w-3 h-3" />}
                            {offer.offerType === OFFER_TYPES.BUY_X_GET_Y && <Gift className="w-3 h-3" />}
                            {offer.offerType === OFFER_TYPES.BULK_PRICING && <Package className="w-3 h-3" />}
                            {getOfferDiscountDisplay(offer)}
                          </div>
                        </div>

                        <div className="flex-grow flex flex-col justify-between w-full px-2">
                          <div>
                            <h3 className="font-bold text-white mb-2 text-xs sm:text-sm leading-tight min-h-[2.5rem] flex items-center justify-center">
                              {offer?.title}
                            </h3>
                            {offer.description && (
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{offer.description}</p>
                            )}
                            <div className="flex items-center justify-center gap-2 mb-3 lg:mb-4">
                              {offer.originalPrice > 0 && (
                                <span className="text-gray-400 line-through text-xs">
                                  {offer.originalPrice?.toFixed(2)} EG
                                </span>
                              )}
                              <span className="text-sm font-bold text-popular">
                                {offer.priceAfterDiscount?.toFixed(2) || "0.00"} EG
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 w-full mt-auto">
                            <button
                              onClick={() => addOfferToCart(offer)}
                              className="bg-gradient-to-r from-popular to-purple-600 hover:from-popular/90 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 w-full"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              Add Offer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No active offers available</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later for special deals</p>
                </div>
              )}
            </div>
          )}

          {/* Products Grid - Only show for products tab */}
          {activeMenuTab === "products" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {allData?.map((product) => (
              <div
                key={product._id}
                className="bg-secondary rounded-xl lg:rounded-2xl my-2 lg:my-3 pb-4 lg:pb-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-popular group min-h-[300px] sm:min-h-[320px] lg:min-h-[340px]"
              >
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-full h-[120px] sm:h-[140px] lg:h-[150px] overflow-hidden mb-3 lg:mb-4 transition-transform duration-300">
                    <img
                      className="w-full h-full object-cover rounded-lg lg:rounded-xl rounded-b-none"
                      src={`${imageBase}/${product?.image}`}
                      alt={product?.title}
                      onError={(e) => {
                        e.target.src = "";
                      }}
                    />
                  </div>

                  {/* Title with fixed height container */}
                  <div className="flex-grow flex flex-col justify-between w-full px-2">
                    <div>
                      <h3 className="font-bold text-white mb-2 text-xs sm:text-sm leading-tight min-h-[2.5rem] flex items-center justify-center">
                        {product?.title}
                      </h3>
                      <div className="text-xs sm:text-sm font-bold text-popular mb-3 lg:mb-4">
                        {product.price?.toFixed(2) || "0.00"} EG
                      </div>
                    </div>

                    {/* Action buttons - always at bottom */}
                    <div className="flex flex-col gap-2 w-full mt-auto">
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Quick Add
                      </button>
                      <button
                        onClick={() => openCustomization(product)}
                        className="bg-popular hover:bg-popular/50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Order Summary Section - Desktop - IMPROVED */}
        <div className="hidden xl:block w-full lg:w-96 xl:w-[320px] 2xl:w-[480px] bg-secondary text-white backdrop-blur-sm rounded-3xl p-6 lg:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 xl:w-7 xl:h-7" />
              Order Summary
            </h3>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 xl:w-6 xl:h-6" />
              </button>
            )}
          </div>

          <div className="space-y-4 mb-8 overflow-y-auto max-h-[50vh] xl:max-h-[55vh]">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 xl:w-20 xl:h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base xl:text-lg">
                  No items in order
                </p>
                <p className="text-sm xl:text-base text-gray-400 mt-2">
                  Click on menu items to add them
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const itemId = item.uniqueId || item._id;
                const isOffer = item.productType === "offer";
                return (
                  <div
                    key={itemId}
                    className={`bg-black text-white rounded-xl p-4 xl:p-5 ${isOffer ? 'border border-popular/30' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          {isOffer && <Gift className="w-4 h-4 text-popular" />}
                          <h4 className="font-semibold text-sm xl:text-base">
                            {item.title}
                          </h4>
                        </div>

                        {/* Show offer type badge */}
                        {isOffer && item.offerDetails && (
                          <div className="mt-1">
                            <span className="bg-popular/20 text-popular text-xs px-2 py-0.5 rounded-full">
                              {item.offerDetails.offerType === OFFER_TYPES.PERCENTAGE && `${item.offerDetails.discountValue}% OFF`}
                              {item.offerDetails.offerType === OFFER_TYPES.FIXED && `${item.offerDetails.discountValue} EG OFF`}
                              {item.offerDetails.offerType === OFFER_TYPES.BUY_X_GET_Y && `Buy ${item.offerDetails.buyQuantity} Get ${item.offerDetails.getQuantity} Free`}
                              {item.offerDetails.offerType === OFFER_TYPES.BULK_PRICING && `${item.offerDetails.bulkQuantity} for ${item.offerDetails.bulkPrice} EG`}
                            </span>
                          </div>
                        )}

                        {/* Show base price and extras separately */}
                        <div className="text-xs xl:text-sm mt-2 space-y-1">
                          {isOffer && item.offerDetails?.originalPrice > 0 && (
                            <div className="text-gray-400 line-through">
                              Original: {item.offerDetails.originalPrice?.toFixed(2)} EG
                            </div>
                          )}
                          <div className="text-gray-300">
                            <span className="font-medium">{isOffer ? 'Offer Price:' : 'Base Price:'}</span>
                            {item.price?.toFixed(2) || "0.00"} EG
                          </div>

                          {!isOffer && item.customizationPrice > 0 && (
                            <div className="text-yellow-400">
                              <span className="font-medium">Extras:</span> +EG
                              {item.customizationPrice?.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Show customizations with individual prices */}
                        {item.customizations && (
                          <div className="text-xs xl:text-sm mt-2 space-y-1">
                            {item.customizations.extrasWithPrices &&
                              item.customizations.extrasWithPrices.length >
                                0 && (
                                <div className="text-green-400">
                                  <span className="font-medium">Added:</span>
                                  <div className="ml-2 space-y-1">
                                    {item.customizations.extrasWithPrices.map(
                                      (extra, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between"
                                        >
                                          <span>• {extra.name}</span>
                                          <span>
                                            {extra.price.toFixed(2)} EG
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {item.customizations.removalsWithDetails &&
                              item.customizations.removalsWithDetails.length >
                                0 && (
                                <div className="text-orange-400">
                                  <span className="font-medium">Remove:</span>{" "}
                                  {item.customizations.removalsWithDetails
                                    .map((removal) => removal.name)
                                    .join(", ")}
                                </div>
                              )}
                            {item.customizations.specialInstructions && (
                              <div className="text-blue-400">
                                <span className="font-medium">Note:</span>{" "}
                                {item.customizations.specialInstructions}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-popular font-bold text-sm xl:text-base mt-2">
                          Total:
                          {(item.finalPrice || item.price)?.toFixed(2) ||
                            "0.00"}{" "}
                          EG
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(itemId);
                        }}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 xl:w-5 xl:h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(itemId, -1);
                          }}
                          className="w-9 h-9 xl:w-10 xl:h-10 bg-purple-100 hover:bg-purple-200 text-popular rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 xl:w-5 xl:h-5" />
                        </button>
                        <span className="font-bold text-lg xl:text-xl w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(itemId, 1);
                          }}
                          className="w-9 h-9 xl:w-10 xl:h-10 bg-purple-100 hover:bg-purple-200 text-popular rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs xl:text-sm text-gray-400">
                          {(
                            (item.finalPrice || item.price) * item.quantity
                          ).toFixed(2)}{" "}
                          EG
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-600 pt-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pt-3 border-gray-600">
                  <span className="text-base xl:text-lg font-bold">Total:</span>
                  <span className="text-lg xl:text-xl font-bold text-popular">
                    {total.toFixed(2)} EG
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  let newOrder = {
                    table: state.table,
                    guestCount: state.guestCount,
                    orderType: "dine-in",
                  };
                  newOrder.items = cart.map((ele) => {
                    const itemData = {
                      quantity: ele.quantity,
                      notes: ele.notes || "",
                      customizations: ele.customizations ?? {},
                      productType: ele.productType || "regular",
                    };

                    if (ele.productType === "offer") {
                      itemData.offer = ele._id;
                    } else {
                      itemData.product = ele._id;
                    }

                    return itemData;
                  });
                  mutate({ data: newOrder });
                  setShowCart(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 xl:py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base xl:text-lg"
              >
                Place Order ({cart.length}{" "}
                {cart.length === 1 ? "item" : "items"})
              </button>
            </div>
          )}
        </div>

        {/* Mobile Cart Sidebar */}
        <div
          className={`xl:hidden fixed inset-y-0 right-0 z-50 w-80 bg-secondary text-white transform transition-transform duration-300 ease-in-out ${
            showCart ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Order Summary
              </h3>
              <div className="flex gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items in order</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Click on menu items to add them
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const itemId = item.uniqueId || item._id;
                  const isOffer = item.productType === "offer";
                  return (
                    <div
                      key={itemId}
                      className={`bg-black text-white rounded-xl px-3 py-4 ${isOffer ? 'border border-popular/30' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {isOffer && <Gift className="w-3 h-3 text-popular" />}
                            <h4 className="font-semibold text-sm">
                              {item.title}
                            </h4>
                          </div>

                          {/* Show offer type badge */}
                          {isOffer && item.offerDetails && (
                            <div className="mt-1">
                              <span className="bg-popular/20 text-popular text-xs px-2 py-0.5 rounded-full">
                                {item.offerDetails.offerType === OFFER_TYPES.PERCENTAGE && `${item.offerDetails.discountValue}% OFF`}
                                {item.offerDetails.offerType === OFFER_TYPES.FIXED && `${item.offerDetails.discountValue} EG OFF`}
                                {item.offerDetails.offerType === OFFER_TYPES.BUY_X_GET_Y && `Buy ${item.offerDetails.buyQuantity} Get ${item.offerDetails.getQuantity}`}
                                {item.offerDetails.offerType === OFFER_TYPES.BULK_PRICING && `${item.offerDetails.bulkQuantity} for ${item.offerDetails.bulkPrice} EG`}
                              </span>
                            </div>
                          )}

                          {/* Show base price and extras separately */}
                          <div className="text-xs mt-1 space-y-1">
                            {isOffer && item.offerDetails?.originalPrice > 0 && (
                              <div className="text-gray-400 line-through">
                                Was: {item.offerDetails.originalPrice?.toFixed(2)} EG
                              </div>
                            )}
                            <div className="text-gray-300">
                              {isOffer ? 'Price' : 'Base'}: {item.price?.toFixed(2) || "0.00"} EG
                            </div>

                            {!isOffer && item.customizationPrice > 0 && (
                              <div className="text-yellow-400">
                                Extras: {item.customizationPrice?.toFixed(2)} EG
                              </div>
                            )}
                          </div>

                          {/* Show customizations with individual prices */}
                          {!isOffer && item.customizations && (
                            <div className="text-xs mt-1">
                              {item.customizations.extrasWithPrices &&
                                item.customizations.extrasWithPrices.length >
                                  0 && (
                                  <div>
                                    <span className="text-green-400 font-medium">
                                      Added:
                                    </span>
                                    <div className="ml-2 space-y-1">
                                      {item.customizations.extrasWithPrices.map(
                                        (extra, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between text-xs"
                                          >
                                            <span>• {extra.name}</span>
                                            <span className="text-yellow-400">
                                              {extra.price.toFixed(2)} EG
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              {item.customizations.removalsWithDetails &&
                                item.customizations.removalsWithDetails.length >
                                  0 && (
                                  <div className="mt-1">
                                    <span className="text-orange-400 font-medium">
                                      Remove:
                                    </span>{" "}
                                    {item.customizations.removalsWithDetails
                                      .map((removal) => removal.name)
                                      .join(", ")}
                                  </div>
                                )}
                              {item.customizations.specialInstructions && (
                                <div className="mt-1">
                                  <span className="text-blue-400 font-medium">
                                    Note:
                                  </span>{" "}
                                  {item.customizations.specialInstructions}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-popular font-bold mt-1">
                            Total:
                            {(item.finalPrice || item.price)?.toFixed(2) ||
                              "0.00"}{" "}
                            EG
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(itemId);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(itemId, -1);
                            }}
                            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-popular rounded-full flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(itemId, 1);
                            }}
                            className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-popular rounded-full flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">Total:</span>
                  <span className="text-md font-bold text-popular">
                    {total.toFixed(2)} EG
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">Total After Vat:</span>
                  <span className="text-md font-bold text-popular">
                    {total.toFixed(2)} EG
                  </span>
                </div>

                <button
                  onClick={() => {
                    setShowCart(false);

                    let newOrder = {
                      table: state.table,
                      guestCount: state.guestCount,
                      orderType: "dine-in",
                    };
                    newOrder.items = cart.map((ele) => {
                      const itemData = {
                        quantity: ele.quantity,
                        notes: ele.notes || "",
                        customizations: ele.customizations ?? {},
                        productType: ele.productType || "regular",
                      };

                      if (ele.productType === "offer") {
                        itemData.offer = ele._id;
                      } else {
                        itemData.product = ele._id;
                      }

                      return itemData;
                    });
                    mutate({ data: newOrder });
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Place Order ({cart.length} items)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Overlay */}
        {showCart && (
          <div
            className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          />
        )}
      </div>

      {/* Customization Modal */}
      {showCustomization && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Customize {selectedProduct.title}
              </h3>
              <button
                onClick={closeCustomization}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Size Selection */}

              {/* Extras */}
              <div>
                <div className="flex items-end justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Add Extras
                  </h4>
                  {selectedProduct && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-popular hover:bg-popular/50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      disabled={creatingExtra}
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add Custom Extra
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {showAddForm && (
                    <div className="flex items-center justify-between p-3 border-2 border-dashed border-[#ffbc0f] rounded-lg bg-[#f7e6bc]">
                      <div className="flex items-center flex-1">
                        <div className="w-6 mr-3"></div>{" "}
                        {/* Spacer for alignment */}
                        <input
                          type="text"
                          value={newExtra.name}
                          onChange={(e) =>
                            setNewExtra((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="font-medium bg-white text-black border rounded focus:border-[#ffbc0f] outline-none px-2 py-1 mr-2 flex-1"
                          placeholder="Enter extra name"
                        />
                        <input
                          type="number"
                          value={newExtra.price}
                          onChange={(e) =>
                            setNewExtra((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          className="bg-white text-black border rounded focus:border-[#ffbc0f] outline-none px-2 py-1 w-20"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                        <span className="ml-1 text-gray-600 font-bold">EG</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={handleAddExtra}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          disabled={
                            !newExtra.name.trim() ||
                            !newExtra.price ||
                            creatingExtra
                          }
                        >
                          {creatingExtra ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewExtra({ name: "", price: "" });
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {apiExtras.map((extra) => (
                    <div key={extra._id}>
                      {editingExtra === extra._id ? (
                        <EditForm extra={extra} />
                      ) : (
                        <label className="flex items-center text-gray-800 justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={customizations.extras.includes(
                                extra._id
                              )}
                              onChange={(e) =>
                                handleCustomizationChange(
                                  "extras",
                                  extra._id,
                                  e.target.checked
                                )
                              }
                              className="mr-3"
                            />
                            <span className="font-medium">{extra.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-bold">
                              {extra.price.toFixed(2)} EG
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                className="text-blue-600 hover:text-blue-800 p-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEditingExtra(extra._id);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 p-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  {
                                    handleDeleteExtra(extra._id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Removals */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Remove Items
                </h4>
                <div className="space-y-2">
                  {customizationOptions.removals.map((removal) => (
                    <label
                      key={removal.id}
                      className="flex items-center text-gray-800 justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customizations.removals.includes(removal.id)}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "removals",
                              removal.id,
                              e.target.checked
                            )
                          }
                          className="mr-3"
                        />
                        <span className="font-medium">{removal.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Special Instructions
                </h4>
                <textarea
                  value={customizations.specialInstructions}
                  onChange={(e) =>
                    handleCustomizationChange(
                      "specialInstructions",
                      e.target.value
                    )
                  }
                  placeholder="Any special requests or modifications..."
                  className="w-full p-3 border text-gray-800 rounded-lg resize-none h-20"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Base Price:</span>
                  <span>{selectedProduct.price?.toFixed(2) || "0.00"} EG</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Customizations:</span>
                  <span>{calculateCustomizationPrice().toFixed(2)} EG</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-popular">
                    {(
                      (selectedProduct.price || 0) +
                      calculateCustomizationPrice()
                    ).toFixed(2)}{" "}
                    EG
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={closeCustomization}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addToCartWithCustomizations}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
