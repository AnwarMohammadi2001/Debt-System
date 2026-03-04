import React from "react";
import { FaPrint } from "react-icons/fa";
import jalaali from "jalaali-js";

const PaymentHistoryTab = ({
  payments,
  currentPage,
  itemsPerPage,
  startIndex,
  onPrintPayment,
}) => {
  const formatCurrency = (num) => {
    const number = Number(num || 0);
    return number.toLocaleString() + " افغانی";
  };

  const formatToJalali = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const { jy, jm, jd } = jalaali.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${jy}/${pad(jm)}/${pad(jd)}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-center border-collapse">
        <thead className="bg-gray-100 text-gray-600 sticky top-0">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3">تاریخ</th>
            <th className="p-3">مبلغ</th>
            <th className="p-3">بابت</th>
            <th className="p-3">شماره بل</th>
            <th className="p-3">کاربر</th>
            <th className="p-3">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <tr
                key={payment.id}
                className="hover:bg-green-50/50 transition-colors"
              >
                <td className="p-3 text-gray-600">{startIndex + index + 1}</td>
                <td className="p-3 text-gray-600">
                  {formatToJalali(payment.createdAt)}
                </td>
                <td className="p-3 font-bold text-green-700">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="p-3 text-gray-600">
                  {payment.description || "-"}
                </td>
                <td className="p-3 text-gray-600">
                  {payment.bill_number ? `#${payment.bill_number}` : "-"}
                </td>
                <td className="p-3 text-xs text-gray-400">
                  {payment.recordedBy || "Admin"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onPrintPayment(payment)}
                    className="text-cyan-600 hover:text-cyan-800 p-1 rounded-full hover:bg-cyan-50 transition-colors"
                    title="چاپ رسید"
                  >
                    <FaPrint size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-8 text-gray-400 text-center">
                هیچ پرداختی ثبت نشده است
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistoryTab;
