// services/reportService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const reportApi = axios.create({
  baseURL: `${BASE_URL}/report`,
});

export const reportService = {
  // گزارش جامع مالی
  getCompleteFinancialReport: async (params = {}) => {
    const response = await reportApi.get("/financial-report", { params });
    return response.data;
  },

  // گزارش ماهانه
  getMonthlyReport: async (params = {}) => {
    const response = await reportApi.get("/monthly-report", { params });
    return response.data;
  },

  // گزارش بدهی‌ها و طلب‌ها
  getDebtsAndCreditsReport: async () => {
    const response = await reportApi.get("/debts-report");
    return response.data;
  },

  // گزارش وضعیت گدام
  getWarehouseStatusReport: async (params = {}) => {
    const response = await reportApi.get("/warehouse-status", { params });
    return response.data;
  },

  // آمار سریع
  getQuickStats: async () => {
    const response = await reportApi.get("/quick-stats");
    return response.data;
  },
};

// Helper functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fa-AF").format(amount) + " افغانی";
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("fa-AF").format(number);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fa-IR");
};
