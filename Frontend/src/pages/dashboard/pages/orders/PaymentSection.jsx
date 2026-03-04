import React from "react";
import {
  FaExclamationTriangle,
  FaEye,
  FaMoneyBillWave,
  FaPrint,
  FaSave,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

const PaymentSection = ({
  record,
  handleRecipChange,
  isSubmitting,
  stockErrors,
  saveRecord,
  editMode,
  filledDigitalCount,
  filledOffsetCount,
  handleSaveAndPrint,
  handleViewCurrentBill,
  resetForm,
  customerId, // این prop جدید را اضافه کنید
}) => {
  // بررسی اینکه آیا مشتری معتبر انتخاب شده است
  const isCustomerValid = customerId && record.customer?.name?.trim();

  // بررسی اینکه آیا حداقل یک آیتم پر شده است
  const hasItems = filledDigitalCount > 0 || filledOffsetCount > 0;

  // بررسی اینکه آیا فرم قابل ثبت است
  const isFormValid = isCustomerValid && hasItems;

  return (
    <div className="bg-white rounded-md p-6 border border-gray-100">
      <div className="space-y-5">
        <div className="flex items-center gap-x-5">
          <div className="space-y-2 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ دریافتی
            </label>
            <div className="relative w-full">
              <input
                type="number"
                placeholder="مبلغ دریافتی را وارد کنید"
                value={record.recip}
                onChange={handleRecipChange}
                className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-800 focus:border-transparent transition-all duration-200 bg-gray-200 text-gray-800 placeholder-gray-400"
                disabled={isSubmitting}
              />
              <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ باقیمانده
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="مبلغ باقیمانده"
                value={record.remained}
                readOnly
                className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-cyan-800 focus:border-transparent transition-all duration-200 bg-gray-200 text-gray-800 placeholder-gray-400 cursor-not-allowed"
              />
              <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {stockErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <FaExclamationTriangle />
              <span className="font-semibold">موجودی ناکافی</span>
            </div>
            <div className="space-y-2">
              {stockErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-600">
                  • <span className="font-medium">{error.bookName}</span> (
                  {error.size}): نیاز به {error.needed} کارتن، موجود:{" "}
                  {error.available} کارتن
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-5">
          {/* دکمه ثبت سفارش */}
          <button
            onClick={() => saveRecord(false)}
            disabled={isSubmitting || !isFormValid}
            className={`flex items-center justify-center cursor-pointer gap-x-3 px-4 py-3.5 rounded-md font-semibold transition-all duration-200 transform hover:scale-102 shadow-lg hover:shadow-xl ${
              editMode
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900"
            } ${
              !isFormValid || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                در حال ثبت...
              </>
            ) : (
              <>
                <FaSave className="text-lg" />
                {editMode ? "ویرایش سفارش" : "ثبت سفارش"}
              </>
            )}
          </button>

          {/* دکمه ثبت و چاپ */}
          <button
            onClick={handleSaveAndPrint}
            disabled={isSubmitting || !isFormValid}
            className={`flex items-center justify-center gap-x-2 text-sm bg-purple-700 text-white px-4 py-3.5 rounded-md font-semibold transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-102 ${
              !isFormValid || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-800"
            }`}
          >
            <FaPrint className="text-lg" />
            ثبت و چاپ
          </button>
        </div>

        {/* دکمه مشاهده و چاپ بیل (در ردیف جداگانه) */}
        {/* <div className="grid grid-cols-1 gap-x-5 mt-3">
          <button
            onClick={handleViewCurrentBill}
            disabled={isSubmitting || !isFormValid}
            className={`flex items-center justify-center gap-x-2 text-sm bg-indigo-600 text-white px-4 py-3.5 rounded-md font-semibold transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-102 ${
              !isFormValid || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-indigo-700"
            }`}
          >
            <FaEye className="text-lg" />
            پیش‌نمایش فاکتور
          </button>
        </div> */}
      </div>

      {/* پیام‌های وضعیت */}
      {isSubmitting && (
        <div className="mt-5 flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
          <FaSpinner className="animate-spin" />
          <span className="text-sm">در حال ثبت سفارش، لطفاً صبر کنید...</span>
        </div>
      )}

      {/* پیام‌های خطا */}
      {!isFormValid && !isSubmitting && (
        <div className="mt-5 space-y-2 flex items-center justify-center">
          {!customerId && record.customer?.name && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <FaExclamationTriangle className="text-xs" />
              <span>مشتری معتبر انتخاب نشده است</span>
            </p>
          )}
          {!record.customer?.name.trim() && (
            <p className="text-red-600 text-sm flex items-center gap-1"></p>
          )}
        </div>
      )}

      {/* دکمه لغو ویرایش (در حالت ویرایش) */}
      {editMode && (
        <div className="mt-5">
          <button
            onClick={resetForm}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
          >
            <FaTimes className="text-sm" />
            لغو ویرایش
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
