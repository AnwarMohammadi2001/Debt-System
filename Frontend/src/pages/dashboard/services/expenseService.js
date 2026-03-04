import axios from "axios";
import { toJalaali } from "jalaali-js";

const API_URL = import.meta.env.VITE_BASE_URL;

// ------------------ Expense Categories ------------------ //

// Get all expense categories
export const getExpenseCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-categories`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getExpenseStatistics = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/statistics`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new expense category
export const createExpenseCategory = async (categoryData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/expense-categories`,
      categoryData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update expense category
export const updateExpenseCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/expense-categories/${id}`,
      categoryData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single category
export const getExpenseCategory = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete expense category
export const deleteExpenseCategory = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/expense-categories/${id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ------------------ Expenses ------------------ //

// Get all expenses (optional filters)
export const getExpenses = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single expense
export const getExpense = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new expense
export const createExpense = async (expenseData) => {
  try {
    const sanitizedData = {
      ...expenseData,
      amount: parseFloat(expenseData.amount) || 0,
      description: expenseData.description || "",
      paymentType: expenseData.paymentType || "cash",
      expenseDate: expenseData.expenseDate,
      categoryId: expenseData.categoryId,
    };
    const response = await axios.post(`${API_URL}/api/expenses`, sanitizedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    const sanitizedData = {
      ...expenseData,
      amount: expenseData.amount ? parseFloat(expenseData.amount) : undefined,
    };
    const response = await axios.put(
      `${API_URL}/api/expenses/${id}`,
      sanitizedData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete expense
export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ------------------ Expense Reports ------------------ //

// Daily report
export const getDailyExpenseReport = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-reports/daily`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Monthly report
export const getMonthlyExpenseReport = async (year, month) => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-reports/monthly`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Custom date range report
export const getCustomExpenseReport = async (startDate, endDate) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/expense-reports/custom-report`,
      {
        params: { startDate, endDate },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Afghan months
export const getAfghanMonths = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/expense-reports/afghan-months`,
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Afghan months:", error);
    return { success: false, months: [] };
  }
};

// ------------------ Utility Functions ------------------ //

// Format date for API
export const formatDateForAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Format Jalali date
export const formatJalaliDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const jalali = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
    const monthNames = [
      "حمل",
      "ثور",
      "جوزا",
      "سرطان",
      "اسد",
      "سنبله",
      "میزان",
      "عقرب",
      "قوس",
      "جدی",
      "دلو",
      "حوت",
    ];
    return `${jalali.jd} ${monthNames[jalali.jm - 1]} ${jalali.jy}`;
  } catch (error) {
    return dateString;
  }
};

// Get current month
export const getCurrentMonth = () => new Date().getMonth() + 1;

// Get current year
export const getCurrentYear = () => new Date().getFullYear();

export default {
  // Categories
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  getExpenseCategory,
  deleteExpenseCategory,

  // Expenses
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,

  // Reports
  getDailyExpenseReport,
  getMonthlyExpenseReport,
  getCustomExpenseReport,
  getExpenseStatistics,

  formatDateForAPI,
  formatJalaliDate,
  getAfghanMonths,
  getCurrentMonth,
  getCurrentYear,
};
