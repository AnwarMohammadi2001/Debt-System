import React, { useEffect, useRef } from "react";
import { FaPrint, FaTimes } from "react-icons/fa";
import jalaali from "jalaali-js";
import AnimatedModal from "../../../../components/common/AnimatedModal";

const SellerPrintPaymentReceipt = ({
  isOpen,
  onClose,
  paymentData,
  sellerData,
  walletStats,
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

  const handlePrint = () => {
    window.print();
  };

  // Auto print
  useEffect(() => {
    if (autoPrint && isOpen && paymentData && !hasAutoPrintedRef.current) {
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
  }, [autoPrint, isOpen, paymentData]);

  // Reset print flag
  useEffect(() => {
    if (!isOpen) {
      hasAutoPrintedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen || !paymentData || !sellerData) {
    return null;
  }

  const sellerName =
    sellerData?.name && sellerData?.lastName
      ? `${sellerData.name} ${sellerData.lastName}`
      : sellerData?.name || "فروشنده";

  const storeName = sellerData?.storeName || "";

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      className="p-0"
      maxWidth="max-w-lg"
    >
      {/* A5 Container */}
      <div className="">
        <div
          id="printable-area"
          className="bg-white shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none relative"
          style={{
            width: "148mm",
            height: "210mm",
            direction: "rtl",
            border: "1px solid #000",
          }}
        >
          {/* Header */}
          <div className="text-center px-4 py-3 border-b border-gray-400 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">رسید پرداخت</h2>
            <p className="text-sm text-gray-600 mt-1">بابت حساب فروشنده</p>
          </div>

          {/* Receipt Info */}
          <div className="px-6 py-3 border-b border-gray-400">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold">نام فروشنده: </span>
                <span>{sellerName}</span>
              </div>
              <div className="">
                <span className="font-bold">نام فروشگاه: </span>
                <span>{storeName || "———"}</span>
              </div>
              <div>
                <span className="font-bold">شماره تماس: </span>
                <span>{sellerData.phone || "———"}</span>
              </div>
              <div>
                <span className="font-bold">تاریخ پرداخت: </span>
                <span>{formatToJalali(paymentData.createdAt)}</span>
              </div>
              {paymentData.bill_number && (
                <div className="col-span-2">
                  <span className="font-bold">شماره بل: </span>
                  <span className="font-mono">#{paymentData.bill_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-4 py-4 border-b border-gray-400">
            <h3 className="font-bold text-center mb-3 text-gray-700">
              جزئیات پرداخت
            </h3>
            <div className="space-y-3">
              {/* Payment Amount */}
              <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                <span className="font-bold text-lg">مبلغ پرداخت:</span>
                <span className="font-bold text-xl text-green-700">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>

              {/* Description */}
              {paymentData.description && (
                <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                  <span className="font-bold">بابت:</span>
                  <span className="text-gray-700">
                    {paymentData.description}
                  </span>
                </div>
              )}

              {/* Payment Method (if available) */}
              {paymentData.method && (
                <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                  <span className="font-bold">روش پرداخت:</span>
                  <span className="text-gray-700">{paymentData.method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller Account Summary */}
          <div className="px-4 py-4 border-b border-gray-400">
            <h3 className="font-bold text-center mb-3 text-gray-700">
              خلاصه حساب فروشنده
            </h3>
            <div className="space-y-3">
              {/* Total Purchase */}
              <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                <span className="font-bold text-blue-700">مجموع خرید:</span>
                <span className="font-bold text-blue-700">
                  {formatCurrency(walletStats?.totalPurchaseAmount || 0)}
                </span>
              </div>

              {/* Total Paid */}
              <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                <span className="font-bold text-green-700">مجموع پرداخت:</span>
                <span className="font-bold text-green-700">
                  {formatCurrency(walletStats?.totalPaid || 0)}
                </span>
              </div>

              {/* Remaining Balance */}
              <div className="flex justify-between items-center pt-1">
                <span
                  className={`font-bold text-lg ${
                    (walletStats?.totalPurchaseAmount -
                      walletStats?.totalPaid || 0) > 0
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  باقی‌مانده کل:
                </span>
                <span
                  className={`font-bold text-lg ${
                    (walletStats?.totalPurchaseAmount -
                      walletStats?.totalPaid || 0) > 0
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  {formatCurrency(
                    walletStats?.totalPurchaseAmount - walletStats?.totalPaid ||
                      0,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-6 mt-auto">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="text-center">
                <p className="font-bold mb-6">امضاء دریافت‌کننده</p>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
              </div>
              <div className="text-center">
                <p className="font-bold mb-6">امضاء پرداخت‌کننده</p>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
              </div>
            </div>
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
          <FaPrint size={14} /> چاپ رسید
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
          table,
          div {
            break-inside: avoid;
          }
        }
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

export default SellerPrintPaymentReceipt;
