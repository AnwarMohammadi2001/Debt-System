import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL; // Your server address

// ------------------ Sellers ------------------ //

// Get all sellers
export const getSellers = async ({ page = 1, search = "" } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/sellers`, {
      params: {
        page,
        search,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getAllSellers = async () => {
  const response = await axios.get(`${API_URL}/api/sellers/all`);
  return response.data;
};
export const updateSeller = async (sellerId, sellerData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/sellers/${sellerId}`,
      sellerData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete seller
export const deleteSeller = async (sellerId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/sellers/${sellerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Register new seller
export const createSeller = async (sellerData) => {
  try {
    const response = await axios.post(`${API_URL}/api/sellers`, sellerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get seller wallet details
export const getSellerWallet = async (sellerId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/sellers/${sellerId}/wallet`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add payment to seller
export const addSellerPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/sellers/payment`,
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ------------------ Purchases ------------------ //

// Get all purchases (optional filtering params)
export const getPurchases = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/sellers/purchases`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new stock purchase
export const addPurchase = async (purchaseData) => {
  try {
    const sanitizedData = {
      ...purchaseData,
      quantity: parseFloat(purchaseData.quantity) || 0,
      unitPrice: parseFloat(purchaseData.unitPrice) || 0,
      totalAmount: parseFloat(purchaseData.totalAmount) || 0,
      paidAmount: parseFloat(purchaseData.paidAmount) || 0,
      bill_number: purchaseData.bill_number
        ? parseInt(purchaseData.bill_number, 10)
        : null,
      size: purchaseData.size || "",
      unit: purchaseData.unit || "پاکت",
      description: purchaseData.description || "",
    };

    const response = await axios.post(
      `${API_URL}/api/sellers/purchase`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update existing purchase
export const updatePurchase = async (purchaseId, purchaseData) => {
  try {
    const sanitizedData = {
      ...purchaseData,
      quantity: parseFloat(purchaseData.quantity) || 0,
      unitPrice: parseFloat(purchaseData.unitPrice) || 0,
      totalAmount: parseFloat(purchaseData.totalAmount) || 0,
      paidAmount: parseFloat(purchaseData.paidAmount) || 0,
      bill_number: purchaseData.bill_number
        ? parseInt(purchaseData.bill_number, 10)
        : null,
      size: purchaseData.size || "",
      unit: purchaseData.unit || "پاکت",
      description: purchaseData.description || "",
    };

    const response = await axios.put(
      `${API_URL}/api/sellers/purchase/${purchaseId}`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update purchase payment only
export const updatePurchasePayment = async (purchaseId, paymentData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/sellers/purchase/${purchaseId}/pay`,
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ------------------ Copy Purchases / Stock ------------------ //

// Add new copy purchase

// Add new copy purchase (به‌روز شده)
export const addCopyPurchase = async (copyData) => {
  try {
    const sanitizedData = {
      ...copyData,
      cartonCount: parseInt(copyData.cartonCount) || 0,
      pricePerCarton: parseFloat(copyData.pricePerCarton) || 0,
      paidAmount: parseFloat(copyData.paidAmount) || 0,
      totalAmount:
        parseFloat(copyData.totalAmount) ||
        (parseInt(copyData.cartonCount) || 0) *
          (parseFloat(copyData.pricePerCarton) || 0),
      size: copyData.size || "",
      bill_number: copyData.bill_number
        ? parseInt(copyData.bill_number, 10)
        : null,
      description: copyData.description || "",
    };

    const response = await axios.post(
      `${API_URL}/api/copy-purchases`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all copy purchases
export const getCopyPurchases = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/copy-purchases`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update copy purchase
export const updateCopyPurchase = async (purchaseId, purchaseData) => {
  try {
    const sanitizedData = {
      ...purchaseData,
      cartonCount:
        purchaseData.cartonCount !== undefined
          ? parseInt(purchaseData.cartonCount)
          : undefined,
      pricePerCarton:
        purchaseData.pricePerCarton !== undefined
          ? parseFloat(purchaseData.pricePerCarton)
          : undefined,
      paidAmount:
        purchaseData.paidAmount !== undefined
          ? parseFloat(purchaseData.paidAmount)
          : undefined,
    };

    const response = await axios.put(
      `${API_URL}/api/copy-purchases/${purchaseId}`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete copy purchase
export const deleteCopyPurchase = async (purchaseId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/copy-purchases/${purchaseId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update copy purchase payment
export const updateCopyPurchasePayment = async (purchaseId, paymentData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/copy-purchases/${purchaseId}/pay`,
      paymentData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get copy stock inventory
export const getStockInventory = async (params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/copy-purchases/stockCopies`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a stock copy item
export const updateStockCopy = async (id, stockData) => {
  try {
    const sanitizedData = {
      ...stockData,
      cartonCount:
        stockData.cartonCount !== undefined
          ? parseInt(stockData.cartonCount)
          : undefined,
      unitPrice:
        stockData.unitPrice !== undefined
          ? parseFloat(stockData.unitPrice)
          : undefined,
      size: stockData.size || undefined,
    };
    const response = await axios.put(
      `${API_URL}/api/copy-purchases/stockCopies/${id}`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a stock copy item
export const deleteStockCopy = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/copy-purchases/stockCopies/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
// ------------------ Update & Delete Sellers ------------------ //


