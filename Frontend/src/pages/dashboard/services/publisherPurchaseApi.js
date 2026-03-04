import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

// توابع خریدهای ناشر
export const getPublisherPurchases = async (params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/purchases`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPublisherPurchase = async (purchaseData) => {
  try {
    const sanitizedData = {
      customerId: Number(purchaseData.customerId),
      itemCategory: purchaseData.itemCategory,
      itemType: purchaseData.itemType,
      size: purchaseData.size || null,
      quantity: Number(purchaseData.quantity),
      unit: purchaseData.unit || "ورق",
      description: purchaseData.description || "",
      recordedBy: purchaseData.recordedBy || "Admin",
    };

    console.log("Sending publisher purchase data:", sanitizedData);

    const response = await axios.post(
      `${API_URL}/api/publisher-stock/purchases`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPublisherPurchaseById = async (purchaseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/purchases/${purchaseId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePublisherPurchase = async (purchaseId, purchaseData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/publisher-stock/purchases/${purchaseId}`,
      purchaseData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePublisherPurchase = async (purchaseId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/publisher-stock/purchases/${purchaseId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPurchasesByCustomer = async (customerId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/purchases`,
      {
        params: { customerId, ...params },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع مدیریت انبار مشتریان
export const getCustomerStock = async (customerId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/stock`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerPurchaseHistory = async (customerId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/history`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomerStockItem = async (
  customerId,
  stockId,
  stockData,
) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/publisher-stock/customer/${customerId}/stock/${stockId}`,
      stockData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomerStockItem = async (
  customerId,
  stockId,
  data = {},
) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/publisher-stock/customer/${customerId}/stock/${stockId}`,
      { data },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};



// توابع کمکی
export const getAvailableSizes = async (category) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/sizes/${category}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPublisherStats = async (customerId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/stats/${customerId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTodayPurchases = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/publisher-stock/today`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع پیشرفته انبار
export const getAllCustomersWithStock = async (params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customers-with-stock`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerStockSummary = async (customerId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/stock/summary`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchCustomersByStockItem = async (searchParams) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customers/search`,
      { params: searchParams },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع جدید برای بهبود مدیریت موجودی
export const getStockAnalytics = async (params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/analytics`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportCustomerStock = async (customerId, format = "csv") => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/export`,
      {
        params: { format },
        responseType: "blob",
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const importCustomerStock = async (customerId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_URL}/api/publisher-stock/customer/${customerId}/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع دشبورد
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/dashboard`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLowStockAlerts = async (threshold = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/alerts/low-stock`,
      { params: { threshold } },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع دسته‌بندی
export const getStockCategories = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/categories`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getItemTypesByCategory = async (category) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/categories/${category}/types`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع گزارش‌گیری
export const generateStockReport = async (reportParams) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/reports/generate`,
      reportParams,
      { responseType: "blob" },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMonthlyStockReport = async (year, month) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/reports/monthly`,
      { params: { year, month } },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع بک‌آپ و بازیابی
export const backupCustomerStocks = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/publisher-stock/backup`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreCustomerStocks = async (backupId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/restore`,
      { backupId },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع دسته‌ای
export const bulkUpdateStock = async (updates) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/bulk-update`,
      updates,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const bulkDeleteStock = async (stockIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/bulk-delete`,
      { stockIds },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع لاگ و تاریخچه
export const getStockHistory = async (customerId, stockId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/stock/${stockId}/history`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerActivityLog = async (customerId, params = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/customer/${customerId}/activity`,
      { params },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// توابع نوتیفیکیشن
export const getStockNotifications = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/publisher-stock/notifications`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/publisher-stock/notifications/${notificationId}/read`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hook برای استفاده آسان‌تر در کامپوننت‌ها
export const usePublisherStockApi = () => {
  return {
    // خریدها
    getPublisherPurchases,
    createPublisherPurchase,
    getPublisherPurchaseById,
    updatePublisherPurchase,
    deletePublisherPurchase,
    getPurchasesByCustomer,

    // انبار مشتریان
    getCustomerStock,
    getCustomerPurchaseHistory,
    updateCustomerStockItem,
    deleteCustomerStockItem,

    // انتقال موجودی
    transferStockBetweenCustomers,

    // کمکی
    getAvailableSizes,
    getPublisherStats,
    getTodayPurchases,

    // پیشرفته
    getAllCustomersWithStock,
    getCustomerStockSummary,
    searchCustomersByStockItem,
    getStockAnalytics,

    // ایمپورت/اکسپورت
    exportCustomerStock,
    importCustomerStock,

    // دشبورد
    getDashboardStats,
    getLowStockAlerts,

    // دسته‌بندی
    getStockCategories,
    getItemTypesByCategory,

    // گزارش‌گیری
    generateStockReport,
    getMonthlyStockReport,

    // بک‌آپ
    backupCustomerStocks,
    restoreCustomerStocks,

    // دسته‌ای
    bulkUpdateStock,
    bulkDeleteStock,

    // تاریخچه
    getStockHistory,
    getCustomerActivityLog,

    // نوتیفیکیشن
    getStockNotifications,
    markNotificationAsRead,
  };
};

// آپلود فایل
export const uploadStockFile = async (file, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (options.customerId) {
      formData.append("customerId", options.customerId);
    }

    const response = await axios.post(
      `${API_URL}/api/publisher-stock/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: options.onProgress,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// جستجوی پیشرفته
export const advancedStockSearch = async (searchCriteria) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/search`,
      searchCriteria,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// همگام‌سازی
export const syncCustomerStocks = async (customerIds) => {
  try {
    const response = await axios.post(`${API_URL}/api/publisher-stock/sync`, {
      customerIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// اعتبارسنجی
export const validateStockItem = async (stockItem) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/publisher-stock/validate`,
      stockItem,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
