// PrintMonthlyReport.js
import React, { useEffect, useRef } from "react";
import { FaPrint, FaTimes } from "react-icons/fa";
import jalaali from "jalaali-js";
import AnimatedModal from "../common/AnimatedModal";

const PrintMonthlyReport = ({
  isOpen,
  onClose,
  staffData,
  monthlyRecord,
  payments,
  autoPrint = false,
}) => {
  const hasAutoPrintedRef = useRef(false);
  const printTimeoutRef = useRef(null);

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

  const getMonthName = (month) => {
    const monthNames = [
      "حمل",
      "ثور",
      "جوزا",
      "سرطان",
      "اسد",
      "سنبله",
      "میزان",
      "عقرب",
      "قوس",
      "جدی",
      "دلو",
      "حوت",
    ];
    return monthNames[month - 1] || "";
  };

  const handlePrint = () => {
    window.print();
  };

  // Auto print
  useEffect(() => {
    if (autoPrint && isOpen && monthlyRecord && !hasAutoPrintedRef.current) {
      hasAutoPrintedRef.current = true;
      printTimeoutRef.current = setTimeout(() => {
        window.print();
      }, 800);
    }
    return () => {
      if (printTimeoutRef.current) {
        clearTimeout(printTimeoutRef.current);
      }
    };
  }, [autoPrint, isOpen, monthlyRecord]);

  // Reset print flag
  useEffect(() => {
    if (!isOpen) {
      hasAutoPrintedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen || !monthlyRecord || !staffData) {
    return null;
  }

  // فیلتر کردن پرداخت‌های مربوط به این ماه
  const monthlyPayments = payments.filter(
    (p) => p.month === monthlyRecord.month && p.year === monthlyRecord.year,
  );

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} className="p-0" maxWidth="max-w-lg" >
      {/* A5 Container */}
      <div className="">
        <div
          id="printable-area"
          className="bg-white shadow-2xl  overflow-hidden flex flex-col print:shadow-none print:rounded-none relative"
          style={{
            width: "148mm",
            height: "210mm",
            direction: "rtl",
            border: "1px solid #000",
          }}
        >
          {/* Report Title */}
          <div className="text-center px-4 py-2 border-b border-gray-400 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">
              گزارش ماهانه معاشات
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getMonthName(monthlyRecord.month)} {monthlyRecord.year}
            </p>
          </div>

          {/* Employee Info */}
          <div className="px-6 py-3 border-b border-gray-400">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold">نام کارمند: </span>
                <span>{staffData.name || "—"}</span>
              </div>
              <div className="text-left">
                <span className="font-bold">تاریخ گزارش: </span>
                <span>{formatToJalali(new Date())}</span>
              </div>
              {staffData.position && (
                <div>
                  <span className="font-bold">وظیفه: </span>
                  <span>{staffData.position}</span>
                </div>
              )}
              {staffData.phone && (
                <div className="text-left">
                  <span className="font-bold">شماره تماس: </span>
                  <span>{staffData.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Salary Details Table */}
          <div className="px-4 py-3 border-b border-gray-400">
            <h3 className="font-bold text-center mb-2 text-gray-700">
              جزئیات معاش ماهانه
            </h3>
            <div className="space-y-2">
              {/* Base Salary */}
              <div className="grid grid-cols-2 gap-10">
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 pb-2">
                  <div className="font-bold">معاش اصلی:</div>
                  <div className="text-left">
                    {formatCurrency(monthlyRecord.baseSalary)}
                  </div>
                </div>

                {/* Overtime */}

                <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 pb-2">
                  <div className="font-bold text-orange-700">اضافه‌کاری:</div>
                  <div className="text-left text-orange-700">
                    {formatCurrency(monthlyRecord.overtimeAmount)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                {/* Absence Deduction */}

                <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 pb-2">
                  <div className="font-bold text-red-700">کسر غیرحاضری:</div>
                  <div className="text-left text-red-700">
                    {formatCurrency(monthlyRecord.absenceDeduction)}
                  </div>
                </div>

                {/* Total Payable */}
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 pb-2">
                  <div className="text-green-800">قابل پرداخت:</div>
                  <div className="text-left text-green-800">
                    {formatCurrency(monthlyRecord.totalPayable)}
                  </div>
                </div>
              </div>

              {/* Paid Amount */}
              <div className="grid grid-cols-2 gap-10">
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 pb-2">
                  <div className="font-bold text-blue-700">پرداخت شده:</div>
                  <div className="text-left text-blue-700">
                    {formatCurrency(monthlyRecord.paidAmount)}
                  </div>
                </div>

                {/* Remaining Amount */}
                <div
                  className={`grid grid-cols-2 gap-4 text-sm border-b border-dashed border-gray-300 font-bold p-2 rounded ${
                    monthlyRecord.remainingAmount > 0 ? "" : ""
                  }`}
                >
                  <div
                    className={
                      monthlyRecord.remainingAmount > 0
                        ? "text-orange-800"
                        : "text-green-800"
                    }
                  >
                    باقی‌مانده:
                  </div>
                  <div
                    className={`text-left ${
                      monthlyRecord.remainingAmount > 0
                        ? "text-orange-800"
                        : "text-green-800"
                    }`}
                  >
                    {formatCurrency(monthlyRecord.remainingAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments History */}
          <div className="px-4 py-3 flex-1">
            <h3 className="font-bold text-center text-sm mb-2 text-gray-700">
              تاریخچه پرداخت‌های این ماه
            </h3>

            {monthlyPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse">
                  <thead>
                    <tr className="border-b border-gray-400">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-1">مبلغ</th>

                      <th className="py-2 px-1">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPayments.map((payment, index) => (
                      <tr
                        key={payment.id || index}
                        className="border-b border-gray-200"
                      >
                        <td className="py-1 px-1">{index + 1}</td>
                        <td className="py-1 px-1 font-bold text-green-700">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="py-1 px-1 text-gray-600">
                          {formatToJalali(payment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                هیچ پرداختی برای این ماه ثبت نشده است
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-6 left-6 flex gap-3 print:hidden">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <FaTimes size={14} /> بستن
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <FaPrint size={14} /> چاپ گزارش
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: 1px solid #000 !important;
          }

          .print-hidden {
            display: none !important;
          }

          /* Improve print quality */
          table,
          div {
            break-inside: avoid;
          }
        }

        /* Hide scrollbars for print */
        @media print {
          ::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AnimatedModal>
  );
};

export default PrintMonthlyReport;
