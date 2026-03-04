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

// ✅ Get all sellers with search
export const getSellers = async (search = "") => {
  try {
    const res = await axios.get(`${BASE_URL}/sellers`, {
      params: { search },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching sellers:", error);
    showAlert("خطا", "بارگذاری فروشندگان موفقیت‌آمیز نبود", "error");
    throw error;
  }
};

// ✅ Register new seller
export const createSeller = async (sellerData) => {
  try {
    if (!sellerData.name || sellerData.name.trim() === "") {
      showAlert("خطا", "نام فروشنده نمی‌تواند خالی باشد", "error");
      return;
    }

    if (!sellerData.phone || sellerData.phone.trim() === "") {
      showAlert("خطا", "شماره تماس نمی‌تواند خالی باشد", "error");
      return;
    }

    if (!sellerData.storeName || sellerData.storeName.trim() === "") {
      showAlert("خطا", "نام فروشگاه نمی‌تواند خالی باشد", "error");
      return;
    }

    const res = await axios.post(`${BASE_URL}/sellers`, sellerData);
    showAlert("موفق", "فروشنده با موفقیت ثبت شد", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    if (error.response?.status === 400) {
      showAlert("خطا", error.response.data.message, "error");
    } else {
      showAlert("خطا", "خطا در ثبت فروشنده", "error");
    }
    throw error;
  }
};

// ✅ Get seller wallet details
export const getSellerWallet = async (sellerId) => {
  try {
    const res = await axios.get(`${BASE_URL}/sellers/${sellerId}/wallet`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching seller wallet:", error);
    showAlert("خطا", "اطلاعات فروشنده یافت نشد", "error");
    throw error;
  }
};

// ✅ Add new stock purchase
export const addPurchase = async (purchaseData) => {
  try {
    const requiredFields = [
      "sellerId",
      "itemName",
      "quantity",
      "unit",
      "unitPrice",
      "totalAmount",
    ];
    for (const field of requiredFields) {
      if (!purchaseData[field]) {
        showAlert("خطا", `${field} نمی‌تواند خالی باشد`, "error");
        return;
      }
    }

    const res = await axios.post(`${BASE_URL}/sellers/purchase`, purchaseData);
    showAlert("موفق", "خرید کالا با موفقیت ثبت شد", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در ثبت خرید کالا", "error");
    throw error;
  }
};

// ✅ Add payment to seller
export const addSellerPayment = async (paymentData) => {
  try {
    const { sellerId, amount } = paymentData;

    if (!sellerId) {
      showAlert("خطا", "فروشنده انتخاب نشده است", "error");
      return;
    }

    if (!amount || amount <= 0) {
      showAlert("خطا", "مبلغ پرداخت باید بیشتر از صفر باشد", "error");
      return;
    }

    // Confirmation dialog
    const result = await Swal.fire({
      title: "تأیید پرداخت",
      text: `آیا از پرداخت ${amount.toLocaleString()} افغانی به فروشنده مطمئن هستید؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "بله، پرداخت شود",
      cancelButtonText: "خیر، لغو",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      showAlert("لغو شد", "پرداخت لغو گردید", "info");
      return;
    }

    const res = await axios.post(`${BASE_URL}/sellers/payment`, paymentData);
    showAlert("موفق", "پرداخت با موفقیت ثبت شد", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در ثبت پرداخت", "error");
    throw error;
  }
};

// ✅ Update purchase payment
export const updatePurchasePayment = async (purchaseId, paymentData) => {
  try {
    const { paidAmount } = paymentData;

    if (paidAmount < 0) {
      showAlert("خطا", "مبلغ پرداخت نمی‌تواند منفی باشد", "error");
      return;
    }

    const res = await axios.patch(
      `${BASE_URL}/sellers/purchase/${purchaseId}/pay`,
      paymentData
    );

    showAlert("موفق", "پرداخت خرید با موفقیت به‌روزرسانی شد", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در به‌روزرسانی پرداخت خرید", "error");
    throw error;
  }
};

// ✅ Delete seller
export const deleteSeller = async (id, name) => {
  try {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: `آیا می‌خواهید فروشنده "${name}" را حذف کنید؟ این عمل قابل بازگشت نیست!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "خیر، لغو",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      showAlert("لغو شد", "حذف فروشنده لغو گردید", "info");
      return;
    }

    await axios.delete(`${BASE_URL}/sellers/${id}`);
    showAlert("حذف شد", "فروشنده با موفقیت حذف گردید", "success");
  } catch (error) {
    console.error("Error deleting seller:", error);
    showAlert("خطا", "در هنگام حذف فروشنده خطایی رخ داد", "error");
    throw error;
  }
};
