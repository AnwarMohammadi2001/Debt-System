// components/seller/StatsCards.jsx
import React from "react";
import {
  FaShoppingCart,
  FaCopy,
  FaMoneyBillWave,
  FaWallet,
  FaFileInvoiceDollar,
  FaBalanceScale,
} from "react-icons/fa";

const StatsCards = ({ sellerData, remainingBalance, totalPurchases }) => {
  // اعتبارسنجی داده‌ها برای جلوگیری از خطا
  if (!sellerData || !sellerData.stats) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-center text-gray-500 py-4">
            در حال بارگذاری آمار...
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "مجموع خریدها",
      value: `${(sellerData.stats.totalPurchaseAmount || 0).toLocaleString()} افغانی`,
      icon: FaMoneyBillWave,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      iconBg: "bg-purple-100",
    },
    {
      title: "مجموع پرداختی",
      value: `${(sellerData.stats.totalPaid || 0).toLocaleString()} افغانی`,
      icon: FaWallet,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      iconBg: "bg-orange-100",
    },
    {
      title: "باقی‌مانده حساب",
      value: `${Math.abs(remainingBalance || 0).toLocaleString()} افغانی`,
      subValue: `(${remainingBalance > 0 ? "بدهکار" : remainingBalance < 0 ? "بستانکار" : "تسویه شده"})`,
      icon: FaFileInvoiceDollar,
      color:
        remainingBalance > 0 ? "red" : remainingBalance < 0 ? "green" : "gray",
      bgColor:
        remainingBalance > 0
          ? "bg-red-50"
          : remainingBalance < 0
            ? "bg-green-50"
            : "bg-gray-50",
      borderColor:
        remainingBalance > 0
          ? "border-red-200"
          : remainingBalance < 0
            ? "border-green-200"
            : "border-gray-200",
      textColor:
        remainingBalance > 0
          ? "text-red-700"
          : remainingBalance < 0
            ? "text-green-700"
            : "text-gray-700",
      iconBg:
        remainingBalance > 0
          ? "bg-red-100"
          : remainingBalance < 0
            ? "bg-green-100"
            : "bg-gray-100",
    },
  ];

  return (
    <div className="space-y-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-md p-3`}
        >
          <div className="flex items-center gap-2">
            <div className={`${stat.iconBg} p-2 rounded-full`}>
              <stat.icon className={`${stat.textColor} text-sm`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-sm font-bold ${stat.textColor}`}>
                {stat.value}
              
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
