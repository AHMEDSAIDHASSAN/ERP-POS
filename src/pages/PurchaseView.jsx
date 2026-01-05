import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, Eye, Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getpurchasebyId, InventoryItems, updatePurchase } from "../services/apis";
import {
  Autocomplete,
  TextField,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function PurchaseView() {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [rows, setRows] = useState([
    { id: 1, inventoryId: "", productName: "", price: "", quantity: "", total: 0, search: "" }
  ]);

  // Fetch purchase data
  const { data, isLoading: isLoadingPurchase } = useQuery({
    queryKey: ["purchase_details", id],
    queryFn: () => getpurchasebyId(token, id),
    enabled: !!token && !!id
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (data?.data) {
      const purchase = data.data;
      setTitle(purchase.title || "");
      setPaidAmount(purchase.paidAmount?.toString() || "");
      
      if (purchase.items && purchase.items.length > 0) {
        const formattedRows = purchase.items.map((item, index) => ({
          id: item._id || Date.now() + index,
          inventoryId: item.inventoryId?._id || item.inventoryId || "",
          productName: item.inventoryId?.productName || item.productName || "",
          price: item.price?.toString() || "",
          quantity: item.quantity?.toString() || "",
          total: item.total || (item.price * item.quantity) || 0,
          search: ""
        }));
        setRows(formattedRows);
      }
    }
  }, [data]);

  // Update mutation
  const { mutate: updateMutation } = useMutation({
    mutationKey: ["update_purchase"],
    mutationFn: (payload) => updatePurchase(token, id, payload),
    onSuccess: () => {
      toast.success("Purchase updated successfully!");
      setIsEditMode(false);
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Failed to update purchase");
    }
  });

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      inventoryId: "",
      productName: "",
      price: "",
      quantity: "",
      total: 0,
      search: ""
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (rowId) => {
    if (rows.length === 1) {
      toast.warning("At least one item is required");
      return;
    }
    setRows(rows.filter(row => row.id !== rowId));
  };

  const updateRow = (rowId, updates) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, ...updates };
        
        const price = parseFloat(updatedRow.price) || 0;
        const quantity = parseFloat(updatedRow.quantity) || 0;
        updatedRow.total = price * quantity;
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handleProductSelect = (rowId, product) => {
    if (product) {
      updateRow(rowId, {
        inventoryId: product._id,
        productName: product.productName
      });
    } else {
      updateRow(rowId, {
        inventoryId: "",
        productName: ""
      });
    }
  };

  const calculateGrandTotal = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.total || 0), 0);
  }, [rows]);

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter a purchase title");
      return false;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      if (!row.inventoryId) {
        toast.error(`Please select a product for row ${i + 1}`);
        return false;
      }
      
      if (!row.price || parseFloat(row.price) <= 0) {
        toast.error(`Please enter a valid price for ${row.productName}`);
        return false;
      }
      
      if (!row.quantity || parseFloat(row.quantity) <= 0) {
        toast.error(`Please enter a valid quantity for ${row.productName}`);
        return false;
      }
    }

    if (!paidAmount || parseFloat(paidAmount) < 0) {
      toast.error("Please enter a valid paid amount");
      return false;
    }

    if (parseFloat(paidAmount) > calculateGrandTotal) {
      toast.error("Paid amount cannot exceed total amount");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const requestBody = {
      title: title.trim(),
      items: rows.map(row => ({
        inventoryId: row.inventoryId,
        price: parseFloat(row.price),
        quantity: parseFloat(row.quantity),
        total: row.total
      })),
      paidAmount: parseFloat(paidAmount)
    };

    updateMutation(requestBody);
  };

  const handleNumberInput = (value) => {
    return value < 0 ? "" : value;
  };

  if (isLoadingPurchase) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading purchase details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
              {isEditMode ? (
                <Edit className="w-8 h-8 text-blue-400 ml-4" />
              ) : (
                <Eye className="w-8 h-8 text-blue-400 ml-4" />
              )}
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {isEditMode ? "Edit Purchase" : "View Purchase"}
              </h1>
            </div>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 font-semibold rounded-lg transition-colors text-white"
            >
              {isEditMode ? "Cancel Edit" : "Edit Purchase"}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">
                Purchase Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                  !isEditMode ? "cursor-not-allowed opacity-75" : ""
                }`}
                placeholder="Enter purchase title"
              />
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Items</h2>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {rows.map((row) => (
                  <RowComponent
                    key={row.id}
                    row={row}
                    token={token}
                    updateRow={updateRow}
                    handleProductSelect={handleProductSelect}
                    handleNumberInput={handleNumberInput}
                    removeRow={removeRow}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 font-medium">Grand Total:</span>
                <span className="text-2xl font-bold text-white">
                  ${calculateGrandTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-300 font-medium">
                  Paid Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => {
                    const value = handleNumberInput(e.target.value);
                    setPaidAmount(value);
                  }}
                  disabled={!isEditMode}
                  className={`flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                    !isEditMode ? "cursor-not-allowed opacity-75" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>

              {paidAmount && calculateGrandTotal > 0 && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-400">Remaining Balance: </span>
                  <span className={`font-semibold ${calculateGrandTotal - parseFloat(paidAmount) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    ${(calculateGrandTotal - parseFloat(paidAmount || 0)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {isEditMode && (
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Update Purchase
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function RowComponent({ row, token, updateRow, handleProductSelect, handleNumberInput, removeRow, isEditMode }) {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-selector", row.id, search],
    queryFn: () => InventoryItems(token, search),
    enabled: !!token && isEditMode,
  });

  const inventoryOptions = data?.data || [];

  // Memoize the selected value to prevent unnecessary re-renders
  const selectedValue = useMemo(() => {
    return inventoryOptions.find(ele => ele._id === row.inventoryId) || null;
  }, [inventoryOptions, row.inventoryId]);

  // Reset input value when switching to edit mode or when product is selected
  useEffect(() => {
    if (isEditMode && row.productName && !inputValue) {
      setInputValue(row.productName);
    }
  }, [isEditMode, row.productName]);

  return (
    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Product Autocomplete */}
        <div className="col-span-4">
          <label className="block text-gray-300 text-sm mb-1">
            Product *
          </label>
          
          {isEditMode ? (
            <ThemeProvider theme={darkTheme}>
              <Autocomplete 
                options={inventoryOptions}
                getOptionLabel={(option) => option.productName || ""}
                value={selectedValue}
                onChange={(e, newValue) => {
                  handleProductSelect(row.id, newValue);
                  if (newValue) {
                    setInputValue(newValue.productName);
                  }
                }}
                inputValue={inputValue}
                onInputChange={(e, newInputValue, reason) => {
                  if (reason === 'input') {
                    setInputValue(newInputValue);
                    setSearch(newInputValue);
                  } else if (reason === 'reset') {
                    setInputValue(newInputValue);
                  }
                }}
                loading={isLoading}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search product"
                    size="small"
                  />
                )}
              />
            </ThemeProvider>
          ) : (
            <input
              type="text"
              value={row.productName}
              readOnly
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
            />
          )}
        </div>

        {/* Price */}
        <div className="col-span-2">
          <label className="block text-gray-300 text-sm mb-1">
            Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={row.price}
            onChange={(e) => {
              const value = handleNumberInput(e.target.value);
              updateRow(row.id, { price: value });
            }}
            disabled={!isEditMode}
            className={`w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500 ${
              !isEditMode ? "cursor-not-allowed opacity-75" : ""
            }`}
            placeholder="0.00"
          />
        </div>

        {/* Quantity */}
        <div className="col-span-2">
          <label className="block text-gray-300 text-sm mb-1">
            Quantity *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={row.quantity}
            onChange={(e) => {
              const value = handleNumberInput(e.target.value);
              updateRow(row.id, { quantity: value });
            }}
            disabled={!isEditMode}
            className={`w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500 ${
              !isEditMode ? "cursor-not-allowed opacity-75" : ""
            }`}
            placeholder="0"
          />
        </div>

        {/* Total */}
        <div className="col-span-3">
          <label className="block text-gray-300 text-sm mb-1">
            Total
          </label>
          <input
            type="text"
            value={row.total.toFixed(2)}
            readOnly
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
          />
        </div>

        {/* Delete Button */}
        <div className="col-span-1 flex items-end">
          {isEditMode && (
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}