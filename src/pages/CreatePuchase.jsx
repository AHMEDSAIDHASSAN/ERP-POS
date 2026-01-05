import { useState, useMemo } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPurchase, InventoryItems } from "../services/apis";
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

export default function CreatePurchase() {
  const token = useSelector((store) => store.user.token);
  const [title, setTitle] = useState("");
  const {id} = useParams()
  const navigate = useNavigate()
  const [paidAmount, setPaidAmount] = useState("");
  const [rows, setRows] = useState([
    { id: 1, inventoryId: "", productName: "", price: "", quantity: "", total: 0, search: "" }
  ]);

  const {mutate} = useMutation({
    mutationKey:["create_purchase"],
    mutationFn:(payload)=>createPurchase(token,payload),
    onSuccess:()=>{
      navigate("/supplier")
    },
    onError:(e)=>{
      toast.error(e?.response?.data?.message)
    }


  })
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

  const removeRow = (id) => {
    if (rows.length === 1) {
      toast.warning("At least one item is required");
      return;
    }
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, updates) => {
    setRows(rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, ...updates };
        
        // Calculate total
        const price = parseFloat(updatedRow.price) || 0;
        const quantity = parseFloat(updatedRow.quantity) || 0;
        updatedRow.total = price * quantity;
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handleProductSelect = (id, product) => {
    if (product) {
      updateRow(id, {
        inventoryId: product._id,
        productName: product.productName
      });
    } else {
      updateRow(id, {
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
      supplierId:id,
      items: rows.map(row => ({
        inventoryId: row.inventoryId,
        price: parseFloat(row.price),
        quantity: parseFloat(row.quantity),
        total: row.total
      })),
      paidAmount: parseFloat(paidAmount)
    };

    mutate(requestBody)
    
    toast.success("Purchase created successfully!");
    
    // Here you would make your API call
    // submitPurchase(token, requestBody);
  };

  const handleNumberInput = (value) => {
    return value < 0 ? "" : value;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Create Purchase</h1>
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
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter purchase title"
              />
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Items</h2>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
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
                  className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Create Purchase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Separate component for each row to have independent search state
function RowComponent({ row, token, updateRow, handleProductSelect, handleNumberInput, removeRow }) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-selector", row.id, search],
    queryFn: () => InventoryItems(token, search),
    enabled: !!token,
  });

  const inventoryOptions = data?.data || [];

  return (
    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Product Autocomplete */}
        <div className="col-span-4">
          <label className="block text-gray-300 text-sm mb-1">
            Product *
          </label>
         
          <ThemeProvider theme={darkTheme}>
            <Autocomplete 
              options={inventoryOptions}
              getOptionLabel={(option) => option.productName || ""}
              value={inventoryOptions.find(ele => ele._id === row.inventoryId) || null}
              onChange={(e, newValue) => handleProductSelect(row.id, newValue)}
              onInputChange={(e, newInputValue) => setSearch(newInputValue)}
              inputValue={search}
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
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500"
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
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500"
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
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}