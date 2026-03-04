import React, { useState, useEffect } from "react";
import PublisherPurchaseModal from "./PublisherPurchaseModal";
import { createPublisherPurchase } from "../services/publisherPurchaseApi";
import { getAllCustomers } from "../services/CustomerService";
import { FaShoppingCart, FaSync, FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";

const PublisherPurchaseManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submittingPurchase, setSubmittingPurchase] = useState(false);
  const [errorLoading, setErrorLoading] = useState(null);

  // بارگیری مشتریان چاپی
  useEffect(() => {
    loadPrintCustomers();
  }, []);

  const loadPrintCustomers = async () => {
    setLoadingCustomers(true);
    setErrorLoading(null);
    setCustomers([]); // ابتدا پاک کردن لیست

    try {
      const allCustomers = await getAllCustomers();

      console.log("📋 Customers API Response:", {
        data: allCustomers,
        type: typeof allCustomers,
        isArray: Array.isArray(allCustomers),
        keys:
          allCustomers && typeof allCustomers === "object"
            ? Object.keys(allCustomers)
            : null,
      });

      // تابع ایمن برای استخراج آرایه از پاسخ API
      const extractCustomersArray = (data) => {
        if (!data) return [];

        // اگر مستقیم آرایه است
        if (Array.isArray(data)) {
          return data;
        }

        // اگر آبجکت است، دنبال آرایه بگرد
        if (data && typeof data === "object") {
          // بررسی کلیدهای رایج
          const possibleKeys = [
            "customers",
            "data",
            "results",
            "items",
            "list",
          ];

          for (const key of possibleKeys) {
            if (data[key] && Array.isArray(data[key])) {
              console.log(`✅ Found customers in key: ${key}`);
              return data[key];
            }
          }

          // اگر هیچ آرایه‌ای پیدا نشد، کلیدهای آبجکت را بررسی کن
          for (const key in data) {
            if (Array.isArray(data[key])) {
              console.log(`✅ Found array in key: ${key}`);
              return data[key];
            }
          }
        }

        return [];
      };

      const customersArray = extractCustomersArray(allCustomers);

      console.log("📊 Extracted customers array:", {
        length: customersArray.length,
        firstItem: customersArray[0],
        sample: customersArray.slice(0, 3),
      });

      if (Array.isArray(customersArray) && customersArray.length > 0) {
        // فیلتر کردن مشتریان چاپی با بررسی ایمن
        const printCustomers = customersArray.filter((customer) => {
          // بررسی اینکه customer وجود دارد و آبجکت است
          if (!customer || typeof customer !== "object") return false;

          // بررسی چندین نام ممکن برای فیلدها
          const customerType =
            customer.customerType ||
            customer.type ||
            customer.customer_type ||
            "";
          const hasStock =
            customer.isStock || customer.hasStock || customer.is_stock || false;

          // لاگ برای دیباگ
          console.log("🔍 Checking customer:", {
            name: customer.name,
            customerType,
            hasStock,
            meetsCondition: customerType === "print" && hasStock === true,
          });

          return customerType === "print" && hasStock === true;
        });

        setCustomers(printCustomers);

        if (printCustomers.length === 0) {
          setErrorLoading("هیچ مشتری چاپی با موجودی فعال یافت نشد.");
        }
      } else {
        setErrorLoading("داده‌های دریافتی از سرور در فرمت صحیح نیستند.");
      }
    } catch (error) {
      console.error("❌ Error loading customers:", error);
      setErrorLoading(`خطا در بارگذاری مشتریان: ${error.message}`);
      setCustomers([]);

      Swal.fire({
        icon: "error",
        title: "خطا در بارگذاری",
        html: `<div class="text-right">
                <p class="mb-2">خطا در بارگذاری لیست مشتریان:</p>
                <p class="text-red-600 text-sm">${error.message}</p>
               </div>`,
        confirmButtonText: "متوجه شدم",
        confirmButtonColor: "#dc2626",
        timer: 4000,
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ارسال خرید جدید
  const handleSubmitPurchase = async (purchaseData) => {
    setSubmittingPurchase(true);

    Swal.fire({
      title: "در حال ثبت خرید...",
      text: "لطفاً صبر کنید",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const result = await createPublisherPurchase(purchaseData);

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "خرید با موفقیت ثبت شد!",
        text: "خرید ناشر با موفقیت ثبت شد. کالا در وضعیت 'در انبار' قرار دارد.",
        confirmButtonText: "متوجه شدم",
        confirmButtonColor: "#10b981",
        timer: 3000,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
      });

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Error creating purchase:", error);
      Swal.close();

      const errorMessage =
        error.response?.data?.message || error.message || "خطای نامشخص";

      Swal.fire({
        icon: "error",
        title: "خطا در ثبت خرید",
        html: `<div class="text-right">
                <p class="mb-2">خطا در ثبت خرید:</p>
                <p class="text-red-600 font-bold">${errorMessage}</p>
               </div>`,
        confirmButtonText: "متوجه شدم",
        confirmButtonColor: "#dc2626",
        timer: 4000,
      });
    } finally {
      setSubmittingPurchase(false);
    }
  };

  // باز کردن مودال
  const openPurchaseModal = () => {
    if (!Array.isArray(customers) || customers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "هیچ مشتری ثبت نشده",
        html: `<div class="text-right">
                <p class="mb-2">برای ثبت خرید، ابتدا باید مشتری چاپی را در سیستم ثبت کنید.</p>
                ${errorLoading ? `<p class="text-sm text-red-500 mt-2">${errorLoading}</p>` : ""}
               </div>`,
        confirmButtonText: "متوجه شدم",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setIsModalOpen(true);
  };

  // بارگذاری مجدد مشتریان
  const handleReloadCustomers = () => {
    loadPrintCustomers();
  };

  // بستن مودال با تایید
  const closePurchaseModal = () => {
    Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "در صورت انصراف، اطلاعات وارد شده از بین خواهد رفت.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، انصراف",
      cancelButtonText: "خیر، ادامه",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsModalOpen(false);
      }
    });
  };

  // بستن مستقیم مودال
  const closeModalDirectly = () => {
    setIsModalOpen(false);
  };

  // نمایش تعداد مشتریان فعال
  const getActiveCustomersCount = () => {
    if (!Array.isArray(customers)) return 0;
    return customers.length;
  };

  return (
    <div className="p-4">
      <div className="mb-6 bg-white  p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={handleReloadCustomers}
              disabled={loadingCustomers}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              title="بارگذاری مجدد مشتریان"
            >
              <FaSync className={`${loadingCustomers ? "animate-spin" : ""}`} />
              بروزرسانی
            </button>

            <button
              onClick={openPurchaseModal}
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2.5 px-4 rounded-md flex items-center hover:scale-102 transition-all duration-300 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                loadingCustomers ||
                !Array.isArray(customers) ||
                customers.length === 0
              }
            >
              <FaShoppingCart />
              {loadingCustomers
                ? "در حال بارگذاری..."
                : "ثبت خرید جدید از ناشر"}
              {loadingCustomers && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></div>
              )}
            </button>
          </div>
        </div>

        {/* نمایش وضعیت */}
        <div className="space-y-3">
          {loadingCustomers && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
              <span className="text-sm">در حال بارگذاری لیست مشتریان...</span>
            </div>
          )}

          {errorLoading && !loadingCustomers && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <FaExclamationTriangle />
              <div className="flex-1">
                <span className="text-sm font-medium">{errorLoading}</span>
                <button
                  onClick={handleReloadCustomers}
                  className="text-xs text-blue-500 hover:text-blue-700 mt-1 block"
                >
                  تلاش مجدد
                </button>
              </div>
            </div>
          )}

          {!loadingCustomers &&
            !errorLoading &&
            (!Array.isArray(customers) || customers.length === 0) && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle />
                  <span>هیچ مشتری چاپی با موجودی فعال یافت نشد.</span>
                </div>
              </div>
            )}
        </div>
      </div>

      <PublisherPurchaseModal
        isOpen={isModalOpen}
        onClose={closeModalDirectly}
        customers={customers}
        loadingCustomers={loadingCustomers}
        onSubmit={handleSubmitPurchase}
        submittingPurchase={submittingPurchase}
      />

      {/* نمایش خریدهای ثبت شده */}
      <div className="mt-6">
        {/* می‌توانید لیست خریدهای ناشر را اینجا نمایش دهید */}
      </div>
    </div>
  );
};

export default PublisherPurchaseManager;
