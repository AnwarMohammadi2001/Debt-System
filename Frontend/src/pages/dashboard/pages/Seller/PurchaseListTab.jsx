// components/seller/PurchaseListTab.jsx
import React from "react";
import { FaPrint, FaCopy } from "react-icons/fa";

const categoryLabels = {
  offset: "افست",
  atpaper: "آرت پیپر",
  kak: "کاک",
  bleach_card: "بلیچ کارت",
};

const PurchaseListTab = ({
  stockPurchases = [],
  copyPurchases = [],
  currentPage = 1,
  itemsPerPage = 15,
  startIndex = 0,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ترکیب خریدها بدون وارونه کردن
  const allPurchases = [...stockPurchases, ...copyPurchases];

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-center text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-5 text-gray-700">شماره</th>
            <th className="py-3 px-5 text-gray-700">نوع</th>
            <th className="py-3 px-5 text-gray-700">تاریخ</th>
            <th className="py-3 px-5 text-gray-700">بیل نمبر</th>
            <th className="py-3 px-5 text-gray-700">دسته</th>
            <th className="py-3 px-5 text-gray-700">نوع/وزن</th>
            <th className="py-3 px-5 text-gray-700">سایز</th>
            <th className="py-3 px-5 text-gray-700">مقدار</th>
            <th className="py-3 px-5 text-gray-700">فی واحد</th>
            <th className="py-3 px-5 text-gray-700">جمله</th>
          </tr>
        </thead>
        <tbody>
          {allPurchases.length > 0 ? (
            allPurchases.map((purchase, index) => (
              <tr
                key={`${purchase.id}-${index}`}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-5">{startIndex + index + 1}</td>
                <td className="py-3 px-5">
                  {purchase.size && purchase.unit ? (
                    <span className="inline-flex items-center gap-1 text-blue-600">
                
                      <span>چاپ</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-600">
                  
                      <span>کاپی</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-5">
                  <div>{formatDate(purchase.purchaseDate)}</div>
                
                </td>
                <td className="py-3 px-5 font-bold">
                  <span className="text-cyan-700 px-2 py-1 rounded">
                    {purchase.bill_number || "-"}
                  </span>
                </td>
                <td className="py-3 px-5">
                  {purchase.size && purchase.unit ? (
                    categoryLabels[purchase.itemCategory] ||
                    purchase.itemCategory
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-5">
                  {purchase.size && purchase.unit ? (
                    <span className="px-2 py-1 rounded text-sm">
                      {purchase.itemType} گرم
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-5">
                  <span className="px-2 py-1 rounded text-sm">
                    {purchase.size}
                  </span>
                </td>
                <td className="py-3 px-5">
                  {purchase.size && purchase.unit ? (
                    <span className="font-bold">
                      {purchase.quantity}
                      <span className="text-gray-600 text-sm mr-1">
                        {purchase.unit}
                      </span>
                    </span>
                  ) : (
                    <span className="font-bold">
                      {purchase.cartonCount}
                      <span className="text-gray-600 text-sm mr-1">کارتن</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-5">
                  {purchase.size && purchase.unit ? (
                    <span className="text-cyan-700 font-bold">
                      {purchase.unitPrice?.toLocaleString()}
                      <span className="text-gray-600 text-sm mr-1">افغانی</span>
                    </span>
                  ) : (
                    <span className="text-cyan-700 font-bold">
                      {purchase.pricePerCarton?.toLocaleString()}
                      <span className="text-gray-600 text-sm mr-1">افغانی</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-5">
                  <div className="font-bold text-green-700">
                    {purchase.totalAmount?.toLocaleString()} افغانی
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="p-8 text-center text-gray-500">
                هیچ خریدی ثبت نشده است
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseListTab;
