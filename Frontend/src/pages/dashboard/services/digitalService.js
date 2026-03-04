// services/digitalService.js - فایل جدید برای سرویس‌های دیجیتال
import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// export const preCheckDigitalStock = async (customerId, digitalItems) => {
//   try {
//     const response = await axios.post(`${BASE_URL}/orders/digital/pre-check`, {
//       customerId,
//       digital: digitalItems,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error pre-checking digital stock:", error);

//     // نمایش پیام خطا
//     Swal.fire({
//       title: "خطا در بررسی موجودی",
//       text: "خطا در بررسی موجودی کاغذ دیجیتال",
//       icon: "error",
//     });

//     throw error;
//   }
// };
export const preCheckDigitalStock = async (customerId, digitalItems) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders/digital/pre-check`, {
      customerId,
      digital: digitalItems,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error pre-checking digital stock:", error);

    Swal.fire({
      title: "خطا در بررسی موجودی",
      text: error.response?.data?.message || "خطا در بررسی موجودی کاغذ دیجیتال",
      icon: "error",
    });

    throw error;
  }
};

export const quickCheckPaperAvailability = async (
  paperType,
  size,
  requiredQuantity,
  customerId = null,
) => {
  try {
    // ❌ این endpoint وجود ندارد - غیرفعال کنید
    console.warn(
      "⚠️ تابع quickCheckPaperAvailability غیرفعال است. از preCheckDigitalStock استفاده کنید.",
    );
    return null;
  } catch (error) {
    console.error("❌ Quick check paper availability error:", error);
    return null;
  }
};

export const getCustomerStock = async (customerId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/publisher-stock/customer/${customerId}/stock`,
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Error getting customer stock for ${customerId}:`, error);
    return null;
  }
};

export const getAvailableDigitalPapers = async (category = null) => {
  try {
    const params = {};
    if (category) params.category = category;

    const response = await axios.get(`${BASE_URL}/stocks/available-papers`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error getting available papers:", error);
    return { success: false, allPapers: [] };
  }
};
