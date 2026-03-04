import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ Helper function for showing Swal messages
const showAlert = (title, text, icon = "success") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "تایید",
    timer: icon === "success" ? 1500 : null,
  });
};

// ✅ Get all orders with pagination
export const getOrders = async (page = 1, limit = 20) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/orders?page=${page}&limit=${limit}`,
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    showAlert("خطا", "بارگذاری بیل‌ها موفقیت‌آمیز نبود", "error");
    throw error;
  }
};

// ✅ Get a single order by ID
export const getOrderById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    showAlert("خطا", "بیل موردنظر یافت نشد", "error");
    throw error;
  }
};

// ✅ Create a new order
export const createOrder = async (orderData) => {
  try {
    if (!orderData.customer.name || orderData.customer.name.trim() === "") {
      showAlert("خطا", "نام مشتری نمی‌تواند خالی باشد", "error");
      return;
    }
    const res = await axios.post(`${BASE_URL}/orders`, orderData);
    return res.data;
  } catch (error) {
    console.error("Create Order Error:", error);

    // استخراج پیام خطای دقیق از سرور
    const serverMessage = error.response?.data?.message || "خطا در ثبت بیل";
    const serverDetails = error.response?.data?.error || "";

    // اگر جزئیات خطا وجود دارد (مثل خطای موجودی)
    let errorText = serverMessage;

    if (
      error.response?.data?.details &&
      Array.isArray(error.response.data.details)
    ) {
      // ساخت لیست خطاها برای نمایش
      const detailList = error.response.data.details
        .map((d) => `• ${d.item}: ${d.error}`)
        .join("\n");
      errorText += `\n${detailList}`;
    } else if (serverDetails) {
      errorText += `\n(${serverDetails})`;
    }

    Swal.fire({
      icon: "error",
      title: "خطا",
      text: errorText,
      confirmButtonText: "متوجه شدم",
    });

    throw error;
  }
};

// ✅ Update an existing order
export const updateOrder = async (id, orderData) => {
  try {
    const res = await axios.put(`${BASE_URL}/orders/${id}`, orderData);
    // showAlert("موفق", "بیل با موفقیت ویرایش شد ✏️", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در ویرایش بیل 😢", "error");
    throw error;
  }
};

// ✅ Delete an order

export const deleteOrder = async (id) => {
  try {
    // 🟡 مرحله تأیید قبل از حذف
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: `آیا می‌خواهید  بیل ${id}را حذف کنید؟ این عمل قابل بازگشت نیست!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "خیر، لغو",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: "حذف لغو شد",
        text: "عملیات حذف انجام نگردید.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // ✅ اگر کاربر تأیید کرد، حذف را انجام بده
    await axios.delete(`${BASE_URL}/orders/${id}`);

    Swal.fire({
      icon: "success",
      title: "حذف موفقانه انجام شد",
      text: "بیل با موفقیت حذف گردید 🗑️",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    Swal.fire({
      icon: "error",
      title: "خطا در حذف",
      text: "در هنگام حذف بیل خطایی رخ داد. لطفاً دوباره تلاش کنید 😢",
    });

    throw error;
  }
};

export const toggleDelivery = async (orderId, currentStatus) => {
  try {
    const res = await axios.patch(`${BASE_URL}/orders/${orderId}`, {
      isDelivered: !currentStatus,
    });

    Swal.fire({
      title: "موفق",
      text: `وضعیت تحویل بیل نمبر ${orderId} تغییر کرد ✅`,
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
    });

    return res.data;
  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "خطا",
      text: "تغییر وضعیت تحویل انجام نشد 😢",
      icon: "error",
      timer: 1000,
      showConfirmButton: false,
    });
  }
};

export const payRemaining = async (order) => {
  try {
    // ✅ اگر کاربر تأیید کرد، پرداخت را انجام بده
    const updatedOrder = await axios.patch(`${BASE_URL}/orders/${order.id}`, {
      recip: order.recip + order.remained,
      remained: 0,
    });

    // ✅ پیام موفقیت
    Swal.fire({
      icon: "success",
      title: "پرداخت موفقانه انجام شد",
      text: "باقی‌مانده پول این سفارش پرداخت گردید.",
      timer: 2000,
      showConfirmButton: false,
    });

    return updatedOrder.data;
  } catch (err) {
    console.error("Error paying remaining:", err);

    // ❌ پیام خطا
    Swal.fire({
      icon: "error",
      title: "پرداخت ناموفق بود",
      text: "در هنگام پرداخت خطایی رخ داد. لطفاً دوباره تلاش کنید.",
    });

    throw err;
  }
};
export const getOrdersByDateRange = async (
  startDate,
  endDate,
  page = 1,
  limit = 1000,
) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders/download`, {
      params: {
        startDate,
        endDate,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders by date range:", error);
    throw error;
  }
};

export const exportOrdersToCSV = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${BASE_URL}/orders/download`, {
      params: {
        startDate,
        endDate,
      },
      responseType: "blob", // Important for file download
    });
    return response;
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};
export const updateDigitalStatus = async (itemId, status, type) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/orders/digital/${itemId}/status`,
      {
        status,
        type, // "palet" | "print"
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating digital status:", error);
    throw error;
  }
};
export const updateOffsetPrintStatus = async (itemId, status) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/orders/offset/${itemId}/print-status`,
      { status },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating offset print status:", error);
    throw error;
  }
};

export const updateDigitalMachine = async (digitalId, machine) => {
  try {
    // اگر backend شما route را در order تعریف کرده:
    // PUT /orders/digital/:id/machine
    const response = await axios.put(
      `${BASE_URL}/orders/digital/${digitalId}/machine`,
      { machine },
    );

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "ماشین با موفقیت تغییر کرد",
      showConfirmButton: false,
      timer: 2000,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating digital machine:", error);

    // اگر خطای خاصی از backend میاد، نمایش بده
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "تغییر ماشین انجام نشد";

    Swal.fire({
      icon: "error",
      title: "خطا",
      text: errorMessage,
    });

    throw error;
  }
};

// services/ServiceManager.js
// services/ServiceManager.js
export const updateOrderDelivery = async (orderId, isDelivered) => {
  try {
    const response = await axios.put(`${BASE_URL}/orders/${orderId}/delivery`, {
      isDelivered: Boolean(isDelivered),
    });
    return response.data.order;
  } catch (error) {
    console.error("Error updating order delivery:", error);
    throw error;
  }
};

// دریافت همه موجودی‌های کاغذ
export const getAllStockCopies = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/copy-purchases/stockCopies`);
    return res.data.stocks;
  } catch (error) {
    console.error("❌ Error fetching stock copies:", error);
    Swal.fire({
      title: "خطا",
      text: "بارگذاری موجودی‌های کاغذ موفقیت‌آمیز نبود",
      icon: "error",
    });
    throw error;
  }
};

// کسر موجودی کاغذ (برای سفارش)
export const deductCopyStock = async (size, cartonCount) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/copy-purchases/stock/deduct`,
      {
        size,
        cartonCount,
      },
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error deducting copy stock:", error);

    // اگر موجودی کافی نبود
    if (error.response?.data?.error?.includes("موجودی کافی نیست")) {
      Swal.fire({
        title: "موجودی ناکافی",
        text: error.response.data.error,
        icon: "error",
      });
    } else {
      Swal.fire({
        title: "خطا",
        text: "کسر موجودی با مشکل مواجه شد",
        icon: "error",
      });
    }
    throw error;
  }
};

// ServiceManager.js - اضافه کردن تابع
export const getStockBySize = async (size) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/copy-purchases/stock/${size}`);
    return res.data.stock; // { size, cartonCount, unitPrice, totalValue }
  } catch (error) {
    // اگر موجودی نبود، null برمی‌گرداند
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`❌ Error fetching stock for size ${size}:`, error);
    throw error;
  }
};

export const preCheckDigitalOrderStock = async (data) => {
  try {
    // data شامل { customerId, digital: [item] } است
    const response = await axios.post(
      `${BASE_URL}/orders/digital/pre-check`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error pre-checking digital stock:", error);
    throw error;
  }
};
export const updateDigitalPaletLocation = async (digitalId, palet_location) => {
  try {
    // فقط وقتی مقدار معتبر است، بفرست
    const payload = {};

    if (
      palet_location !== undefined &&
      palet_location !== null &&
      palet_location !== ""
    ) {
      payload.palet_location = palet_location;
    }

    const response = await axios.put(
      `${BASE_URL}/orders/digital/${digitalId}/palet-location`,
      payload,
    );

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "محل پالت با موفقیت ثبت / تغییر شد",
      showConfirmButton: false,
      timer: 2000,
    });

    return response.data;
  } catch (error) {
    console.error("Error updating palet location:", error);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "تغییر محل پالت انجام نشد";

    Swal.fire({
      icon: "error",
      title: "خطا",
      text: errorMessage,
    });

    throw error;
  }
};

// ✅ Delete an offset (copy) order item
export const deleteOffsetOrder = async (offsetId) => {
  try {
    // ✅ حذف offset
    await axios.delete(`${BASE_URL}/orders/offset/${offsetId}`);
  } catch (error) {
    console.error("❌ Error deleting offset order:", error);

    const errorMessage =
      error.response?.data?.message || "در هنگام حذف آیتم کاپی خطایی رخ داد";

    Swal.fire({
      icon: "error",
      title: "خطا در حذف",
      text: errorMessage,
    });

    throw error;
  }
};
