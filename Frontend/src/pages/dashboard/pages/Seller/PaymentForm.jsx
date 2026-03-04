// components/seller/PaymentForm.jsx - نسخه ایمن
import React from "react";
import { IoMdCard } from "react-icons/io";

const PaymentForm = ({
  paymentForm = {},
  setPaymentForm,
  onSubmit,
  loading = false,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  // مقدار پیش‌فرض برای جلوگیری از undefined
  const formData = {
    amount: paymentForm?.amount || "",
    description: paymentForm?.description || "",
    bill_number: paymentForm?.bill_number || "",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          مبلغ پرداختی 
        </label>
        <input
          type="number"
          required
          min="1"
          className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          value={formData.amount}
          onChange={(e) =>
            setPaymentForm({
              ...paymentForm,
              amount: e.target.value,
            })
          }
          placeholder="مبلغ را وارد کنید"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          بابت بیل نمبر
        </label>
        <input
          type="number"
          className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          value={formData.bill_number}
          onChange={(e) =>
            setPaymentForm({
              ...paymentForm,
              bill_number: e.target.value || null,
            })
          }
          placeholder=" شماره بیل"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          توضیحات
        </label>
        <textarea
          className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          rows="1"
          value={formData.description}
          onChange={(e) =>
            setPaymentForm({
              ...paymentForm,
              description: e.target.value,
            })
          }
          placeholder="توضیحات پرداخت"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        
        className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 disabled:bg-gray-400 transition-all duration-300 text-white rounded-md font-bold flex items-center justify-center gap-2"
      >
        <IoMdCard />
        {loading ? "در حال ثبت..." : "ثبت پرداخت"}
      </button>
    </form>
  );
};

export default PaymentForm;
