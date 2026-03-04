// ServiceManager.js - اضافه کردن توابع گزارشات
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
//  گزارشات جامع گدام
export const getStockSummaryReport = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/summary`);
    return res.data.report;
  } catch (error) {
    console.error("❌ Error fetching stock summary report:", error);
    throw error;
  }
};

//  داده‌های نمودار
export const getStockChartsData = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/charts`);
    return res.data.charts;
  } catch (error) {
    console.error("❌ Error fetching stock charts data:", error);
    throw error;
  }
};

//  کالاهای کم موجودی
export const getLowStockReport = async (threshold = 10) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/low-stock`, {
      params: { threshold },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching low stock report:", error);
    throw error;
  }
};

//  گزارش ارزش گدام
export const getStockValueReport = async (groupBy = "category") => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/value`, {
      params: { groupBy },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching stock value report:", error);
    throw error;
  }
};

//  گزارش دشبورد
export const getDashboardSummary = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/dashboard`);
    return res.data.dashboard;
  } catch (error) {
    console.error("❌ Error fetching dashboard summary:", error);
    throw error;
  }
};

//  گزارش مصرف
export const getUsageReport = async (period = "month", limit = 10) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stock-reports/usage`, {
      params: { period, limit },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching usage report:", error);
    throw error;
  }
};

// دریافت تمام موجودی‌های چاپ
export const getAllPrintStocks = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stocks`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching print stocks:", error);
    throw error;
  }
};
export const getAllCopyStocks = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/stocks`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching copy stocks:", error);
    throw error;
  }
};
