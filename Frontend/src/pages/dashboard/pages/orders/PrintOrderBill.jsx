import React, { useEffect, useRef } from "react";
import { FaPhone, FaPrint, FaTimes } from "react-icons/fa";
import jalaali from "jalaali-js";

const PrintBillOrder = ({ isOpen, onClose, order, autoPrint }) => {
  const hasAutoPrintedRef = useRef(false);
  const printTimeoutRef = useRef(null);

  // Helper functions to check if items are filled
  const isDigitalItemFilled = (item) => {
    return (
      item?.name?.trim() !== "" ||
      item?.quantity > 0 ||
      item?.total_price > 0 ||
      item?.money > 0
    );
  };

  const isOffsetItemFilled = (item) => {
    return (
      item?.book_name?.trim() !== "" ||
      item?.quantity > 0 ||
      item?.total_price > 0 ||
      item?.money > 0
    );
  };

  const formatCurrency = (num) => {
    const number = Number(num || 0);
    return number.toLocaleString() + " افغانی";
  };

  const handlePrint = () => {
    window.print();
  };

  // Auto print
  useEffect(() => {
    if (autoPrint && isOpen && order && !hasAutoPrintedRef.current) {
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
  }, [autoPrint, isOpen, order]);

  // Reset print flag
  useEffect(() => {
    if (!isOpen) {
      hasAutoPrintedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen || !order) {
    return null;
  }

  // Filter filled items
  const filledDigital = (order.digital || []).filter(isDigitalItemFilled);
  const filledOffset = (order.offset || []).filter(isOffsetItemFilled);

  // Calculate totals
  const total_money_digital = filledDigital.reduce((sum, d) => {
    const qty = Number(d.quantity || 0);
    const price = Number(d.price_per || d.price_per_unit || 0);
    const itemTotal = Number(d.total_price || d.money || qty * price || 0);
    return sum + itemTotal;
  }, 0);

  const total_money_offset = filledOffset.reduce((sum, o) => {
    const qty = Number(o.quantity || 0);
    const price = Number(
      o.price_per_book || o.price_per_unit || o.price_per || 0,
    );
    const itemTotal = Number(o.total_price || o.money || qty * price || 0);
    return sum + itemTotal;
  }, 0);

  const calculatedTotal = total_money_digital + total_money_offset;
  const total =
    order.total && order.total >= calculatedTotal
      ? order.total
      : calculatedTotal;
  const remained = total - (order.recip || 0);

  // Bill number
  const billNumber = order.id
    ? `${order.id}`
    : `${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  function formatToJalali(dateString) {
    const date =
      !dateString || dateString === "0" ? new Date() : new Date(dateString);
    const { jy, jm, jd } = jalaali.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${jy}/${pad(jm)}/${pad(jd)}`;
  }

  // Combine all items for display
  const allItems = [...filledDigital, ...filledOffset];
  const totalItems = allItems.length;
  const handleSavePDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print:bg-transparent print:p-0">
      {/* A5 Container */}
      <div className="px-5">
        <div
          id="printable-area"
          className="bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col print:shadow-none print:rounded-none relative"
          style={{
            width: "148mm",
            height: "210mm",
            direction: "rtl",

            border: "1px solid #000",
          }}
        >
          {/* Header Section */}
          <div className="text-center flex items-center justify-between  p-5 pt-3 pb-2 border-b border-gray-400">
            <h1 className="text-4xl font-bold mb-1 text-cyan-700">
              مطبعه خوشه
            </h1>
            <div>
              <img src="logo.jpeg" alt="" className="h-15" />
            </div>
            <h1 className="text-2xl font-bold flex flex-col mb-1 text-cyan-700">
              Khosha printing
              <span>press</span>
            </h1>
          </div>
          <div className=" text-center  px-4 py-2">
            <p className="font-bold mb-1">خدمات ما:</p>
            <div className="flex flex-wrap justify-center gap-x-2 text-sm leading-tight">
              <span>
                چاپ وطراحی: کتاب، مجله، بروشور، دایری، تقویم وپوسترهای تبليغاتی
              </span>
              <span>صحافت: جلدسخت، چسب گرم، مونوگراف ولوح تقدیر</span>
              <span>
                ملزومات اداری شفاخانه، بیل، کارت ویزیت، دوسیه (فایل فولدر) پاکت
                و ...
              </span>
              <span>قوطی، جعبه خدمات فوتوکاپی (کاپی، پرنت، اسکن) و .....</span>
            </div>
          </div>

          {/* Customer and Bill Info */}
          <div className="px-10 py-2 border-b border-gray-400">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold">اسم مشتری: </span>
                <span>{order.customer?.name || order.name || "—"}</span>
              </div>
              <div className="text-left">
                <span className="font-bold">نمبر بیل: </span>
                <span className="font-bold text-blue-700">{billNumber}</span>
              </div>
              <div className="">
                <span className="font-bold">شماره تماس: </span>
                <span>
                  {order.customer?.phone_number || order.phone_number || "—"}
                </span>
              </div>
              <div className="text-left mt-1">
                <span className="font-bold">تاریخ: </span>
                <span>{formatToJalali(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Main Items Table */}
          {/* Main Items Table */}
          <div className="flex-1 px-4 py-2">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_2fr_80px_80px_80px] gap-x-2 text-xs font-bold">
              <div className="border rounded-md border-gray-800 p-1 text-center">
                شماره
              </div>
              <div className="border rounded-md border-gray-800 p-1 text-center">
                نوع چاپ
              </div>
              <div className="border rounded-md border-gray-800 p-1 text-center">
                تعداد
              </div>
              <div className="border rounded-md border-gray-800 p-1 text-center">
                قیمت
              </div>
              <div className="border rounded-md border-gray-800 p-1 text-center">
                جمله
              </div>
            </div>

            {/* Table Body */}
            <div className="relative mt-2 min-h-[320px]">
              {/* Columns border */}
              <div className="absolute inset-0 grid grid-cols-[40px_2fr_80px_80px_80px] gap-x-2">
                {[...Array(5)].map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className={`border rounded-md border-gray-700 ${
                      colIdx === 6 ? "border-r-0" : ""
                    }`}
                  ></div>
                ))}
              </div>

              {/* Rows */}
              <div className="relative z-10">
                {allItems.length > 0 ? (
                  allItems.map((item, index) => {
                    const qty = Number(item.quantity || 0);
                    const isDigital = !item.book_name;

                    const price = isDigital
                      ? Number(item.price_per || item.price_per_unit || 0)
                      : Number(
                          item.price_per_book ||
                            item.price_per_unit ||
                            item.price_per ||
                            0,
                        );
                    const rowTotal = Number(
                      item.total_price || item.money || qty * price || 0,
                    );
                    const itemName = isDigital ? item.name : item.book_name;

                    return (
                      <div className="grid grid-cols-[40px_2fr_80px_80px_80px] gap-x-2 text-xs h-8 items-center">
                        <div className="p-1 text-center flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="p-1 text-center  flex items-center justify-center">
                          {itemName}
                        </div>
                        <div className="p-1 text-center flex items-center justify-center">
                          {qty.toLocaleString()}
                        </div>
                        <div className="p-1 text-center flex items-center justify-center">
                          {price.toLocaleString()}
                        </div>
                        <div className="p-1 text-center flex items-center justify-center font-bold">
                          {rowTotal.toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    هیچ محصولی ثبت نشده است
                  </div>
                )}

                {/* Empty Rows */}
                {Array.from({ length: Math.max(0, 10 - totalItems) }).map(
                  (_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="grid grid-cols-7 text-xs h-8 items-center"
                    >
                      {[...Array(7)].map((_, cellIdx) => (
                        <div
                          key={cellIdx}
                          className="p-1 text-center flex items-center justify-center"
                        >
                          &nbsp;
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="px-4 py-4  border-gray-400">
            <div className=" border-gray-800 p-2">
              <div className="flex items-center  gap-4">
                {/* Right Column - Contact Info */}
                <div className="w-[55%] col-span-2">
                  <div className="flex items-center gap-x-4">
                    <span className="font-bold">تماس:</span>
                    <span>0708804121 - 0778959161 </span>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <span className="font-bold">ایمیل:</span>
                    <span>khosha.print@gmail.com</span>
                  </div>
                  <div className="flex  items-center gap-x-4">
                    <span className="font-bold">آدرس:</span>
                    <span className="text-xs">
                      کوته سنگی، کوچه حلبمی سازی مطبعه خوشه
                    </span>
                  </div>
                </div>
                {/* Left Column - Totals */}
                <div className=" w-[45%] space-y-2">
                  <div className="flex justify-between gap-x-2 items-center">
                    <span className="font-bold border py-1 text-sm px-2 w-20 rounded-md">
                      جمله کل:
                    </span>
                    <span className="font-bold border py-1 text-sm px-2 w-[140px] rounded-md">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-x-2 items-center">
                    <span className="font-bold border py-1 text-sm px-2 w-20 rounded-md">
                      رسیده:
                    </span>
                    <span className="font-bold border py-1 px-2 text-sm rounded-md w-[140px]">
                      {formatCurrency(order.recip || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-x-2 items-center">
                    <span className="font-bold border py-1 px-2 text-sm  w-20 rounded-md">
                      باقی مانده:
                    </span>
                    <span
                      className="font-bold border py-1 px-2 text-sm rounded-md w-[140px]"
                      style={{ color: remained > 0 ? "#dc2626" : "#000" }}
                    >
                      {formatCurrency(remained)}
                    </span>
                  </div>
                </div>
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
          <FaPrint size={14} /> چاپ فاکتور
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
            padding: !important;
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
    </div>
  );
};

export default PrintBillOrder;
