// components/seller/CalculationListTab.jsx
import React, { useState } from "react";
import { FaCalculator, FaMoneyBillWave } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  updatePurchasePayment,
  updateCopyPurchasePayment,
} from "../../services/sellerService";

const categoryLabels = {
  offset: "افست",
  atpaper: "آرت پیپر",
  kak: "کاک",
  bleach_card: "بلیچ کارت",
};

const CalculationListTab = ({
  stockPurchases = [],
  copyPurchases = [],
  onPaymentSuccess,
  currentPage = 1,
  itemsPerPage = 15,
  startIndex = 0,
}) => {
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const handlePayment = async (purchaseId, type) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Swal.fire("خطا", "لطفا مبلغ صحیح وارد کنید", "error");
      return;
    }

    try {
      if (type === "stock") {
        await updatePurchasePayment(purchaseId, {
          paidAmount: parseFloat(paymentAmount),
        });
      } else if (type === "copy") {
        await updateCopyPurchasePayment(purchaseId, {
          paidAmount: parseFloat(paymentAmount),
        });
      }

      Swal.fire({
        icon: "success",
        title: "موفق",
        text: "پرداخت ثبت شد",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditingPurchase(null);
      setPaymentAmount("");
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (error) {
      Swal.fire("خطا", "ثبت پرداخت ناموفق بود", "error");
    }
  };

  // محاسبه باقی مانده انباشته
  const calculateCumulativeBalance = (transactions) => {
    let cumulative = 0;
    return transactions.map((transaction) => {
      const remaining = transaction.totalAmount - transaction.paidAmount;
      cumulative += remaining;
      return {
        ...transaction,
        remaining,
        cumulativeBalance: cumulative,
      };
    });
  };

  // ترکیب و مرتب‌سازی خریدها
  const allPurchases = [
    ...stockPurchases.map((p) => ({
      ...p,
      type: "stock",
      details: `${categoryLabels[p.itemCategory] || p.itemCategory} - ${p.itemType} گرم - ${p.size}`,
    })),
    ...copyPurchases.map((p) => ({
      ...p,
      type: "copy",
      details: ` ${p.size} کاپی - ${p.cartonCount}   کارتن `,
    })),
  ].sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  const purchasesWithCumulative = calculateCumulativeBalance(allPurchases);

  return (
    <div>
      {editingPurchase && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-yellow-800 mb-2">
            ثبت پرداخت برای خرید #{editingPurchase.id}
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 p-2 border rounded"
              placeholder="مبلغ پرداختی"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <button
              onClick={() =>
                handlePayment(editingPurchase.id, editingPurchase.type)
              }
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ثبت پرداخت
            </button>
            <button
              onClick={() => {
                setEditingPurchase(null);
                setPaymentAmount("");
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
      {purchasesWithCumulative.length > 0 ? (
        <div className="overflow-x-auto bg-white ">
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-5 py-3 text-gray-700">شماره</th>
                <th className="px-5 py-3 text-gray-700">تاریخ</th>
                <th className="px-5 py-3 text-gray-700">نام جنس</th>
                <th className="px-5 py-3 text-gray-700">برده‌گی</th>
                <th className="px-5 py-3 text-gray-700">رسیده‌گی </th>
                <th className="px-5 py-3 text-gray-700">باقی‌مانده </th>
              </tr>
            </thead>
            <tbody>
              {purchasesWithCumulative.map((purchase, index) => (
                <tr
                  key={purchase.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-5">{startIndex + index + 1}</td>
                  <td className="px-5 py-3">
                    {formatDate(purchase.purchaseDate)}
                  </td>
                  <td className="px-5 py-3 text-xs">{purchase.details}</td>
                  <td className="px-5 py-3 font-bold text-sm text-gray-600">
                    {purchase.totalAmount?.toLocaleString()} افغانی
                  </td>
                  <td className="px-5 py-3 font-bold text-cyan-700">
                    {purchase.paidAmount?.toLocaleString()} افغانی
                  </td>

                  <td
                    className={`px-5 py-3 font-semibold ${
                      purchase.cumulativeBalance > 0
                        ? "text-red-600"
                        : purchase.cumulativeBalance < 0
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}
                  >
                    {Math.abs(purchase.cumulativeBalance).toLocaleString()}{" "}
                    افغانی
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          هیچ خریدی برای محاسبه وجود ندارد
        </div>
      )}
    </div>
  );
};

export default CalculationListTab;
