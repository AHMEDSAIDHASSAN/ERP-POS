import axios from "axios";

export const baseUrl = `https://erp.patriacoffeebeans.com/api/v1`;
export const imageBase = `https://erp.patriacoffeebeans.com/`;
// export const baseUrl = `http://localhost:3001/api/v1`;
// export const imageBase = `http://localhost:3001/uploads/`;

// Helper function to get full image URL
// Handles both Express (relative path) and Odoo (/api/public/image/...) formats
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already an absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If it's an Odoo-style path (starts with /api), prepend the base domain
  if (imagePath.startsWith('/api')) {
    return `https://erp.patriacoffeebeans.com${imagePath}`;
  }
  // Otherwise, use the imageBase for Express-style paths
  return `${imageBase}${imagePath}`;
};

export async function login_staff(body) {
  const { data } = await axios.post(`${baseUrl}/auth/login`, body, {});

  return data;
}

export async function add_staff(body, token) {
  const { data } = await axios.post(`${baseUrl}/auth/addStaff`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function dashboaordmain(token) {
  const { data } = await axios.get(`${baseUrl}/order/stats`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function ordersWeekly(token) {
  const { data } = await axios.get(`${baseUrl}/order/weekly`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function ordersMonthly(token) {
  const { data } = await axios.get(`${baseUrl}/order/revenue/monthly`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function get_staff_by_id(id, token) {
  const { data } = await axios.get(`${baseUrl}/auth/getuser/${id}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function update_staff_by_id(id, payload, token) {
  const { data } = await axios.put(
    `${baseUrl}/auth/updateStaff/${id}`,
    payload.values,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function delete_staff_by_id(id, token) {
  const { data } = await axios.delete(
    `${baseUrl}/auth/staff/${id}`,

    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function add_kitchen(body, token) {
  const { data } = await axios.post(`${baseUrl}/kitchen`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function get_kitchens(token) {
  const { data } = await axios.get(`${baseUrl}/kitchen`, {
    headers: {
      token: `${token}`,
    },
  });

  return data.data || [];
}
export async function getCategories(token) {
  const { data } = await axios.get(`${baseUrl}/category`, {
    // headers: {
    //   Authorization: `${token}`,
    // },
  });

  return data?.data;
}

export async function getCategory(id, token) {
  const { data } = await axios.get(`${baseUrl}/category/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
export async function getsubCategoryByCategorie(id, token) {
  const { data } = await axios.get(`${baseUrl}/subCategory/category/${id}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data.data || [];
}
export async function getproductsBysubCat(id, token) {
  const { data } = await axios.get(`${baseUrl}/product/bysubcat/${id}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function getsubCategoryies(token) {
  const { data } = await axios.get(`${baseUrl}/subCategory/`, {
    headers: {
      token: `${token}`,
    },
  });

  return data.data;
}
export async function getproducts(token) {
  const { data } = await axios.get(`${baseUrl}/product/`, {
    headers: {
      token: `${token}`,
    },
  });

  return data.data;
}

export async function getProductById(id, token) {
  const { data } = await axios.get(`${baseUrl}/product/${id}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function getAllOrdersWebsite(page, token, bool, search) {
  const data = await axios.get(
    `${baseUrl}/order/?page=${page}&from=false&search=${search || ""}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}

export async function getAllOrders(page, token, bool, search, filter) {
  const data = await axios.get(
    `${baseUrl}/order/?page=${page}&from=${bool}&search=${
      search || ""
    }&filter=${filter}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}

export async function getAllOrdersApp(page, token, bool, search) {
  const data = await axios.get(
    `${baseUrl}/order/?page=${page}&from=true&search=${search || ""}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function updateItems(id, token, items) {
  const data = await axios.put(
    `${baseUrl}/order/items/${id}`,
    {
      items,
    },
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function getOrdersByKitchen(id, token) {
  const { data } = await axios.get(`${baseUrl}/order/getbykitchen/${id}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function addSection(title, token) {
  const { data } = await axios.post(
    `${baseUrl}/section/`,
    {
      title,
    },
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function updateSection(id, title, token) {
  const { data } = await axios.put(
    `${baseUrl}/section/${id}`,
    {
      name: title,
    },
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function deletedSection(id, token) {
  const { data } = await axios.delete(
    `${baseUrl}/section/${id}`,

    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function relatedTables(id, token) {
  const { data } = await axios.get(
    `${baseUrl}/section/${id}`,

    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function getSections(token) {
  const { data } = await axios.get(
    `${baseUrl}/section/`,

    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function updateOrder(id, body, token) {
  const { data } = await axios.put(`${baseUrl}/order/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function cancellOrder(id, token) {
  const { data } = await axios.put(
    `${baseUrl}/order/cancel/${id}`,
    {},
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function updateStatusOrder(body, token) {
  const { data } = await axios.patch(`${baseUrl}/order/`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function getTables(token) {
  const { data } = await axios.get(`${baseUrl}/tables`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function updateTable(id, body, token) {
  const { data } = await axios.put(`${baseUrl}/tables/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function createTable(body, token) {
  const { data } = await axios.post(`${baseUrl}/tables/`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function createOrder(payload, token) {
  const { data } = await axios.post(`${baseUrl}/order`, payload, {
    headers: {
      token: `${token}`,
    },
  });
}
export async function createCategory(payload, token) {
  const { data } = await axios.post(`${baseUrl}/category`, payload, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function createSubCategory(payload, token) {
  const { data } = await axios.post(`${baseUrl}/subCategory`, payload, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function createProduct(payload, token) {
  const { data } = await axios.post(`${baseUrl}/product`, payload, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function getStaff(token) {
  const { data } = await axios.get(`${baseUrl}/auth/staff`, {
    headers: {
      token: `${token}`,
    },
  });

  return data.data || [];
}

export async function getAllExtras(productId, token) {
  const { data } = await axios.get(`${baseUrl}/products/${productId}/extras`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function createExtra(productId, body, token) {
  const { data } = await axios.post(
    `${baseUrl}/products/${productId}/extras`,
    body,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}
export async function updateExtra(productId, extraId, body, token) {
  const { data } = await axios.put(
    `${baseUrl}/products/${productId}/extras/${extraId}`,
    body,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}

export async function deleteExtra(productId, extraId, token) {
  const { data } = await axios.delete(
    `${baseUrl}/products/${productId}/extras/${extraId}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}

export async function deleteProduct(productId, token) {
  const { data } = await axios.delete(`${baseUrl}/product/${productId}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function updateProduct(productId, body, token) {
  const { data } = await axios.put(`${baseUrl}/product/${productId}`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function deleteSubCategory(subCategoryId, token) {
  const { data } = await axios.delete(
    `${baseUrl}/subCategory/${subCategoryId}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );

  return data;
}

export async function getSubCategoryById(subCategoryId, token) {
  const { data } = await axios.get(`${baseUrl}/subCategory/${subCategoryId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function updateSubCategory(subCategoryId, body, token) {
  const { data } = await axios.put(
    `${baseUrl}/subCategory/${subCategoryId}`,
    body,
    {
      headers: {
        Token: `${token}`,
      },
    }
  );

  return data;
}

export async function deleteCategory(categoryId, token) {
  const { data } = await axios.delete(`${baseUrl}/category/${categoryId}`, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function updateCategory(id, body, token) {
  const { data } = await axios.put(`${baseUrl}/category/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}

export async function createOffer(body, token) {
  const { data } = await axios.post(`${baseUrl}/offers`, body, {
    headers: {
      token: `${token}`,
    },
  });

  return data;
}
export async function getOffers(token) {
  const { data } = await axios.get(`${baseUrl}/offers`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getSpecificOffer(id, token) {
  const { data } = await axios.get(`${baseUrl}/offers/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function deActiveOffer(offerId, token) {
  const { data } = await axios.patch(
    `${baseUrl}/offers/deActive/${offerId}`,
    {},
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function activeOffer(offerId, token) {
  const { data } = await axios.patch(
    `${baseUrl}/offers/active/${offerId}`,
    {},
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function updateOffer(offerId, body, token) {
  const { data } = await axios.patch(`${baseUrl}/offers/${offerId}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function deleteOffer(offerId, token) {
  const { data } = await axios.delete(`${baseUrl}/offers/${offerId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function createIngredinet(body, token) {
  const { data } = await axios.post(`${baseUrl}/ingredients`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getAllIngredinet(token) {
  const { data } = await axios.get(`${baseUrl}/ingredients`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function deleteIngredient(ingId, token) {
  const { data } = await axios.delete(`${baseUrl}/ingredients/${ingId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function updateIngredient(ingId, body, token) {
  const { data } = await axios.put(`${baseUrl}/ingredients/${ingId}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getIngredient(ingId, token) {
  const { data } = await axios.get(`${baseUrl}/ingredients/${ingId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getLocations(token) {
  const { data } = await axios.get(`${baseUrl}/location/`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function updateLocation(id, body, token) {
  const { data } = await axios.put(`${baseUrl}/location/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function mergeOrderFunction(body, token) {
  const { data } = await axios.post(`${baseUrl}/order/merge`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function checkoutOrder(body, token, id) {
  console.log(body);
  const { data } = await axios.put(`${baseUrl}/order/checkout/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getOrdersReport(token, params) {
  const {
    page = 1,
    limit = 10,
    createdBy,
    startDate,
    endDate,
    status,
    orderType,
  } = params;

  const queryParams = new URLSearchParams({
    page,
    limit,
    ...(createdBy && { createdBy }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(status && { status }),
    ...(orderType && { orderType }),
  });

  const { data } = await axios.get(`${baseUrl}/order/report?${queryParams}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getSuppliers(token) {
  const { data } = await axios.get(`${baseUrl}/supplier`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getSupplierbyId(token, id) {
  const { data } = await axios.get(`${baseUrl}/supplier/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function createSupplier(token, body) {
  const { data } = await axios.post(`${baseUrl}/supplier`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function updateSupplier(token, body, id) {
  const { data } = await axios.put(`${baseUrl}/supplier/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function updateSupplierStatus(token, body, id) {
  const { data } = await axios.patch(`${baseUrl}/supplier/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function addinventory(token, body) {
  const { data } = await axios.post(`${baseUrl}/inventory/`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getInventory(token) {
  const { data } = await axios.get(`${baseUrl}/inventory/`, {
    headers: {
      token: `${token}`,
    },
  });
  return data || [];
}
export async function updateInventory(token, body, id) {
  const { data } = await axios.put(`${baseUrl}/inventory/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function deleteInventory(token, id) {
  const { data } = await axios.delete(`${baseUrl}/inventory/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function InventoryItems(token, search) {
  const { data } = await axios.get(
    `${baseUrl}/inventory/items?search=${search}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

// SubInventory API Functions
export async function transferToKitchen(token, body) {
  const { data } = await axios.post(`${baseUrl}/sub-inventory/transfer`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getKitchenInventory(token, kitchenId) {
  const { data } = await axios.get(
    `${baseUrl}/sub-inventory/kitchen/${kitchenId}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function getAllKitchensInventory(token) {
  const { data } = await axios.get(`${baseUrl}/sub-inventory/kitchens/all`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getTransferHistory(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.kitchenId) queryParams.append("kitchenId", params.kitchenId);
  if (params.mainInventoryId)
    queryParams.append("mainInventoryId", params.mainInventoryId);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const { data } = await axios.get(
    `${baseUrl}/sub-inventory/transfers${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function getSubInventoryBatches(token, subInventoryId) {
  const { data } = await axios.get(
    `${baseUrl}/sub-inventory/batches/${subInventoryId}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}
export async function createPurchase(token, body) {
  const { data } = await axios.post(`${baseUrl}/purchase/`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function getsupplierBills(token, supplierId) {
  const { data } = await axios.get(
    `${baseUrl}/purchase/supplier/${supplierId}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}
export async function getpurchasebyId(token, id) {
  const { data } = await axios.get(`${baseUrl}/purchase/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function updatePurchase(token, id, body) {
  const { data } = await axios.put(`${baseUrl}/purchase/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
export async function exportToinventory(token, id) {
  const { data } = await axios.put(
    `${baseUrl}/purchase/export/${id}`,
    {},
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}
export async function batches(token, id) {
  const { data } = await axios.get(
    `${baseUrl}/inventory/batches/${id}`,

    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

// Recipe API Functions
export async function createRecipe(body, token) {
  const { data } = await axios.post(`${baseUrl}/recipe`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getAllRecipes(token, page = 1, limit = 10, search = "") {
  const { data } = await axios.get(
    `${baseUrl}/recipe?page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function getRecipeByProduct(productId, token) {
  const { data } = await axios.get(`${baseUrl}/recipe/product/${productId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getRecipeById(id, token) {
  const { data } = await axios.get(`${baseUrl}/recipe/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function updateRecipe(id, body, token) {
  const { data } = await axios.patch(`${baseUrl}/recipe/${id}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function deleteRecipe(id, token) {
  const { data } = await axios.delete(`${baseUrl}/recipe/${id}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function checkRecipeAvailability(productId, token, quantity = 1) {
  const { data } = await axios.get(
    `${baseUrl}/recipe/product/${productId}/availability?quantity=${quantity}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}
export async function getOrdersByTableId(tableId, token) {
  const { data } = await axios.get(`${baseUrl}/tables/table/${tableId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

// ==================== CASHIER API FUNCTIONS ====================

// Cash Registers
export async function getRegisters(token) {
  const { data } = await axios.get(`${baseUrl}/cashier/registers`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getRegister(registerId, token) {
  const { data } = await axios.get(`${baseUrl}/cashier/registers/${registerId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function createRegister(body, token) {
  const { data } = await axios.post(`${baseUrl}/cashier/registers`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function updateRegister(registerId, body, token) {
  const { data } = await axios.put(`${baseUrl}/cashier/registers/${registerId}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function deleteRegister(registerId, token) {
  const { data } = await axios.delete(`${baseUrl}/cashier/registers/${registerId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

// Cash Sessions
export async function openSession(body, token) {
  const { data } = await axios.post(`${baseUrl}/cashier/session/open`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function closeSession(body, token) {
  const { data } = await axios.post(`${baseUrl}/cashier/session/close`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getCurrentSession(token) {
  const { data } = await axios.get(`${baseUrl}/cashier/session/current`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getSession(sessionId, token) {
  const { data } = await axios.get(`${baseUrl}/cashier/session/${sessionId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getSessionHistory(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.register_id) queryParams.append("register_id", params.register_id);
  if (params.cashier_id) queryParams.append("cashier_id", params.cashier_id);
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);
  if (params.state) queryParams.append("state", params.state);

  const { data } = await axios.get(
    `${baseUrl}/cashier/session/history${queryParams.toString() ? "?" + queryParams.toString() : ""}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

// Payment Processing
export async function processCheckout(orderId, body, token) {
  const { data } = await axios.post(`${baseUrl}/cashier/checkout/${orderId}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function processRefund(transactionId, body, token) {
  const { data } = await axios.post(`${baseUrl}/cashier/refund/${transactionId}`, body, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

// Transactions
export async function getTransactions(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.session_id) queryParams.append("session_id", params.session_id);
  if (params.payment_method) queryParams.append("payment_method", params.payment_method);
  if (params.transaction_type) queryParams.append("transaction_type", params.transaction_type);
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const { data } = await axios.get(
    `${baseUrl}/cashier/transactions${queryParams.toString() ? "?" + queryParams.toString() : ""}`,
    {
      headers: {
        token: `${token}`,
      },
    }
  );
  return data;
}

export async function getReceipt(transactionId, token) {
  const { data } = await axios.get(`${baseUrl}/cashier/receipt/${transactionId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

// Reports
export async function getDailyReport(token, date) {
  const queryParams = date ? `?date=${date}` : "";
  const { data } = await axios.get(`${baseUrl}/cashier/reports/daily${queryParams}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

export async function getSessionReport(sessionId, token) {
  const { data } = await axios.get(`${baseUrl}/cashier/reports/session/${sessionId}`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}

// Orders Ready for Checkout
export async function getOrdersReadyForCheckout(token) {
  const { data } = await axios.get(`${baseUrl}/cashier/orders/ready`, {
    headers: {
      token: `${token}`,
    },
  });
  return data;
}
