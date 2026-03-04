// SellerWalletModal.jsx - با پشتیبانی از Pagination و پرینت
import React, { useState, useEffect } from "react";
import { FaTimes, FaStore, FaPrint } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getSellerWallet,
  addSellerPayment,
} from "../../services/sellerService";
import AnimatedModal from "../../../../components/common/AnimatedModal";
import jalaali from "jalaali-js";

// Import components
import PurchaseListTab from "./PurchaseListTab";
import CalculationListTab from "./CalculationListTab";
import PaymentHistoryTab from "./PaymentHistoryTab";
import StatsCards from "./StatsCards";
import PaymentForm from "./PaymentForm";
import Pagination from "../../pagination/Pagination";
import SellerWalletPrint from "./SellerWalletPrint";
import SellerPrintPaymentReceipt from "./SellerPrintPaymentReceipt";

const SellerWalletModal = ({ isOpen, onClose, sellerId }) => {
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("purchases");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: "",
    bill_number: null,
  });

  // Pagination states
  const itemsPerPage = 15;
  const [currentPagePurchases, setCurrentPagePurchases] = useState(1);
  const [currentPageCalculations, setCurrentPageCalculations] = useState(1);
  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  // Add these states
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);

  // Add this function
  const handlePrintPayment = (payment) => {
    setSelectedPayment(payment);
    setAutoPrintReceipt(false);
    setPrintReceiptOpen(true);
  };

  // توابع کمکی برای فرمت‌سازی
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

  // Fetch seller wallet data
  const fetchSellerData = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const data = await getSellerWallet(sellerId);
      setSellerData(data);
    } catch (error) {
      console.error(error);
      Swal.fire("خطا", "بارگذاری اطلاعات فروشنده ناموفق بود", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sellerId) fetchSellerData();
  }, [isOpen, sellerId]);

  // Payment submission
  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      Swal.fire("خطا", "لطفا مبلغ صحیح وارد کنید", "error");
      return;
    }

    // Show confirmation dialog
    const confirmResult = await Swal.fire({
      title: "تأیید جزئیات پرداخت",
      html: `
      <div style="text-align: right; direction: rtl; padding: 10px;">
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>مبلغ پرداخت:</strong> 
            <span style="color: #059669; font-weight: bold; font-size: 24px;">
              ${parseFloat(paymentForm.amount).toLocaleString()} افغانی
            </span>
          </p>
          ${paymentForm.description ? `<p style="margin: 5px 0; font-size: 14px;"><strong>بابت:</strong> ${paymentForm.description}</p>` : ""}
          ${paymentForm.bill_number ? `<p style="margin: 5px 0; font-size: 14px;"><strong>شماره بل:</strong> #${paymentForm.bill_number}</p>` : ""}
          <p style="margin: 5px 0; font-size: 14px;"><strong>فروشنده:</strong> ${sellerData?.seller.name || ""} ${sellerData?.seller.lastName || ""}</p>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-top: 10px;">آیا از ثبت این پرداخت اطمینان دارید؟</p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0e7490",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "بله، ثبت شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setPaymentLoading(true);
    try {
      await addSellerPayment({
        sellerId,
        amount: parseFloat(paymentForm.amount),
        description: paymentForm.description,
        bill_number: paymentForm.bill_number,
      });

      setPaymentForm({ amount: "", description: "", bill_number: null });
      await fetchSellerData();

      // Ask for printing
      const { value: printOption } = await Swal.fire({
        title: "چاپ رسید",
        text: "آیا می‌خواهید رسید پرداخت را چاپ کنید؟",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0e7490",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "بله، چاپ شود",
        cancelButtonText: "خیر",
      });

      if (printOption) {
        // Find the newly created payment (last payment)
        const newPayment =
          sellerData?.payments?.[sellerData.payments.length - 1];
        if (newPayment) {
          setSelectedPayment(newPayment);
          setAutoPrintReceipt(true);
          setPrintReceiptOpen(true);
        }
      } else {
        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "پرداخت با موفقیت ثبت شد",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "خطا",
        error.response?.data?.message || "ثبت پرداخت ناموفق بود",
        "error",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // تابع پرینت گزارش
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const sellerName = sellerData?.seller
      ? `${sellerData.seller.name || ""} ${sellerData.seller.lastName || ""}`.trim()
      : "فروشنده";
    const storeName = sellerData?.seller?.storeName || "";
    const currentDate = formatToJalali(new Date());

    // محاسبه آمار
    const totalPurchase = sellerData?.stats?.totalPurchaseAmount || 0;
    const totalPaid = sellerData?.stats?.totalPaid || 0;
    const remainingBalance = totalPurchase - totalPaid;

    const stockPurchases = sellerData?.stockPurchases || [];
    const copyPurchases = sellerData?.copyPurchases || [];
    const payments = sellerData?.payments || [];

    const totalStockAmount = stockPurchases.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0,
    );
    const totalCopyAmount = copyPurchases.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0,
    );
    const totalStockPaid = stockPurchases.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0,
    );
    const totalCopyPaid = copyPurchases.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0,
    );
    const totalStockRemaining = stockPurchases.reduce(
      (sum, p) => sum + (p.remainingAmount || 0),
      0,
    );
    const totalCopyRemaining = copyPurchases.reduce(
      (sum, p) => sum + (p.remainingAmount || 0),
      0,
    );

    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>گزارش حساب فروشنده - ${sellerName}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .print-container {
              max-width: 100%;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0e7490;
            }
            .header h1 {
              color: #0e7490;
              margin: 10px 0;
              font-size: 24px;
            }
            .header h2 {
              color: #115e6b;
              margin: 5px 0;
              font-size: 20px;
            }
            .seller-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
              border: 1px solid #dee2e6;
            }
            .seller-info p {
              margin: 8px 0;
              font-size: 14px;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .card {
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .card.red {
              background: #fff5f5;
              border-color: #feb2b2;
            }
            .card.green {
              background: #f0fff4;
              border-color: #9ae6b4;
            }
            .card.blue {
              background: #ebf8ff;
              border-color: #90cdf4;
            }
            .card.purple {
              background: #faf5ff;
              border-color: #d6bcfa;
            }
            .card-title {
              font-size: 14px;
              color: #4a5568;
              margin-bottom: 8px;
            }
            .card-amount {
              font-size: 20px;
              font-weight: bold;
              color: #2d3748;
            }
            .card.red .card-amount { color: #c53030; }
            .card.green .card-amount { color: #276749; }
            .card.blue .card-amount { color: #2c5282; }
            .card.purple .card-amount { color: #6b46c1; }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            th {
              background: #0e7490;
              color: white;
              padding: 8px;
              font-weight: bold;
              text-align: center;
              border: 1px solid #0c5f77;
            }
            td {
              padding: 6px;
              border: 1px solid #dee2e6;
              text-align: center;
            }
            tr:nth-child(even) {
              background: #f8f9fa;
            }
            .section-title {
              background: #115e6b;
              color: white;
              padding: 8px 15px;
              margin: 25px 0 15px 0;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
            }
            .sub-section-title {
              background: #2c7a7b;
              color: white;
              padding: 5px 10px;
              margin: 15px 0 10px 0;
              border-radius: 3px;
              font-size: 14px;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px dashed #0e7490;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
            }
            .signature {
              text-align: center;
            }
            .print-date {
              color: #718096;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              background: #e2e8f0;
              padding: 10px;
              margin-top: 10px;
              border-radius: 5px;
              font-weight: bold;
            }
            .summary-row span {
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 11px;
              font-weight: bold;
            }
            .badge-success {
              background: #c6f6d5;
              color: #22543d;
            }
            .badge-warning {
              background: #feebc8;
              color: #744210;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- هدر گزارش -->
            <div class="header">
              <h1>گزارش جامع حساب فروشنده</h1>
              <h2>${sellerName}</h2>
              ${storeName ? `<h3 style="color: #4a5568; margin-top: 5px;">${storeName}</h3>` : ""}
              <p class="print-date">تاریخ چاپ: ${currentDate}</p>
            </div>

            <!-- اطلاعات فروشنده -->
            <div class="seller-info">
              <p><strong>نام و نام خانوادگی:</strong> ${sellerName}</p>
              <p><strong>نام فروشگاه:</strong> ${storeName || "-"}</p>
              <p><strong>شماره تماس:</strong> ${sellerData?.seller?.phone || "-"}</p>
              <p><strong>آدرس:</strong> ${sellerData?.seller?.address || "-"}</p>
              <p><strong>تاریخ ثبت نام:</strong> ${
                sellerData?.seller?.createdAt
                  ? formatToJalali(sellerData.seller.createdAt)
                  : "-"
              }</p>
            </div>

            <!-- کارت‌های خلاصه حساب -->
            <div class="summary-cards">
              <div class="card blue">
                <div class="card-title">مجموع خرید</div>
                <div class="card-amount">${formatCurrency(totalPurchase)}</div>
              </div>
              <div class="card green">
                <div class="card-title">مجموع پرداخت</div>
                <div class="card-amount">${formatCurrency(totalPaid)}</div>
              </div>
              <div class="card ${remainingBalance > 0 ? "red" : "green"}">
                <div class="card-title">باقی‌مانده کل</div>
                <div class="card-amount">${formatCurrency(remainingBalance)}</div>
              </div>
            </div>

            <!-- خریدهای استوک -->
            ${
              stockPurchases.length > 0
                ? `
            <div class="sub-section-title">خریدهای استوک</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>نمبر بل</th>
                  <th>تاریخ</th>
                  <th>محصولات</th>
                  <th>مبلغ کل</th>
                  <th>پرداخت شده</th>
                  <th>باقی‌مانده</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                ${stockPurchases
                  .map(
                    (purchase, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>#${purchase.id}</td>
                    <td>${formatToJalali(purchase.createdAt)}</td>
                    <td>
                      ${purchase.items
                        ?.map(
                          (item) =>
                            `${item.name || item.book_name || "محصول"} (${item.quantity || 0} عدد)`,
                        )
                        .join("، ")
                        .substring(
                          0,
                          50,
                        )}${purchase.items?.length > 2 ? "..." : ""}
                    </td>
                    <td>${formatCurrency(purchase.totalPrice || 0)}</td>
                    <td>${formatCurrency(purchase.paidAmount || 0)}</td>
                    <td>${formatCurrency(purchase.remainingAmount || 0)}</td>
                    <td>
                      <span class="badge ${purchase.remainingAmount === 0 ? "badge-success" : "badge-warning"}">
                        ${purchase.remainingAmount === 0 ? "تسویه شده" : "بدهکار"}
                      </span>
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr style="background: #e2e8f0; font-weight: bold;">
                  <td colspan="4">جمع کل استوک</td>
                  <td>${formatCurrency(totalStockAmount)}</td>
                  <td>${formatCurrency(totalStockPaid)}</td>
                  <td>${formatCurrency(totalStockRemaining)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            `
                : ""
            }

            <!-- خریدهای کاپی -->
            ${
              copyPurchases.length > 0
                ? `
            <div class="sub-section-title">خریدهای کاپی</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>نمبر بل</th>
                  <th>تاریخ</th>
                  <th>محصولات</th>
                  <th>مبلغ کل</th>
                  <th>پرداخت شده</th>
                  <th>باقی‌مانده</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                ${copyPurchases
                  .map(
                    (purchase, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>#${purchase.id}</td>
                    <td>${formatToJalali(purchase.createdAt)}</td>
                    <td>
                      ${purchase.items
                        ?.map(
                          (item) =>
                            `${item.name || item.book_name || "محصول"} (${item.quantity || 0} عدد)`,
                        )
                        .join("، ")
                        .substring(
                          0,
                          50,
                        )}${purchase.items?.length > 2 ? "..." : ""}
                    </td>
                    <td>${formatCurrency(purchase.totalPrice || 0)}</td>
                    <td>${formatCurrency(purchase.paidAmount || 0)}</td>
                    <td>${formatCurrency(purchase.remainingAmount || 0)}</td>
                    <td>
                      <span class="badge ${purchase.remainingAmount === 0 ? "badge-success" : "badge-warning"}">
                        ${purchase.remainingAmount === 0 ? "تسویه شده" : "بدهکار"}
                      </span>
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr style="background: #e2e8f0; font-weight: bold;">
                  <td colspan="4">جمع کل کاپی</td>
                  <td>${formatCurrency(totalCopyAmount)}</td>
                  <td>${formatCurrency(totalCopyPaid)}</td>
                  <td>${formatCurrency(totalCopyRemaining)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            `
                : ""
            }

            <!-- جمع کل نهایی -->
            <div class="summary-row">
              <span>جمع کل خریدها: ${formatCurrency(totalStockAmount + totalCopyAmount)}</span>
              <span>جمع کل پرداخت‌ها: ${formatCurrency(totalStockPaid + totalCopyPaid)}</span>
              <span>باقی‌مانده کل: ${formatCurrency(totalStockRemaining + totalCopyRemaining)}</span>
            </div>

            <!-- تاریخچه پرداخت‌ها -->
            <div class="section-title">تاریخچه پرداخت‌ها</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>تاریخ</th>
                  <th>مبلغ</th>
                  <th>بابت</th>
                  <th>شماره بل</th>
                  <th>ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody>
                ${
                  payments.length > 0
                    ? payments
                        .map(
                          (payment, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${formatToJalali(payment.createdAt)}</td>
                        <td>${formatCurrency(payment.amount)}</td>
                        <td>${payment.description || "-"}</td>
                        <td>${payment.bill_number ? `#${payment.bill_number}` : "-"}</td>
                        <td>${payment.recordedBy || "Admin"}</td>
                      </tr>
                    `,
                        )
                        .join("")
                    : `
                      <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                          هیچ پرداختی ثبت نشده است
                        </td>
                      </tr>
                    `
                }
              </tbody>
              <tfoot>
                <tr style="background: #e2e8f0; font-weight: bold;">
                  <td colspan="2">مجموع پرداخت‌ها</td>
                  <td colspan="4">${formatCurrency(totalPaid)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- خلاصه آمار -->
            <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div style="background: #ebf8ff; padding: 10px; border-radius: 5px; text-align: center;">
                <div style="font-size: 13px; color: #2c5282;">تعداد خرید استوک</div>
                <div style="font-size: 18px; font-weight: bold; color: #2c5282;">${stockPurchases.length}</div>
              </div>
              <div style="background: #faf5ff; padding: 10px; border-radius: 5px; text-align: center;">
                <div style="font-size: 13px; color: #6b46c1;">تعداد خرید کاپی</div>
                <div style="font-size: 18px; font-weight: bold; color: #6b46c1;">${copyPurchases.length}</div>
              </div>
              <div style="background: #f0fff4; padding: 10px; border-radius: 5px; text-align: center;">
                <div style="font-size: 13px; color: #276749;">تعداد پرداخت‌ها</div>
                <div style="font-size: 18px; font-weight: bold; color: #276749;">${payments.length}</div>
              </div>
            </div>

            <!-- فوتر گزارش -->
            <div class="footer">
              <div class="signature">
                <p>امضاء مسئول: ____________________</p>
              </div>
              <div class="signature">
                <p>امضاء فروشنده: ____________________</p>
              </div>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="
              background: #0e7490;
              color: white;
              border: none;
              padding: 10px 30px;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
              margin: 0 10px;
            ">چاپ گزارش</button>
            <button onclick="window.close()" style="
              background: #e53e3e;
              color: white;
              border: none;
              padding: 10px 30px;
              border-radius: 5px;
              font-size: 16px;
              cursor: pointer;
              margin: 0 10px;
            ">بستن</button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Stats helpers
  const getRemainingBalance = () => {
    if (!sellerData) return 0;
    return (
      (sellerData?.stats?.totalPurchaseAmount || 0) -
      (sellerData?.stats?.totalPaid || 0)
    );
  };

  const getTotalPurchases = () => {
    if (!sellerData) return { stock: 0, copy: 0 };
    return {
      stock: sellerData.stockPurchases?.length || 0,
      copy: sellerData.copyPurchases?.length || 0,
    };
  };

  const stockPurchases = sellerData?.stockPurchases || [];
  const copyPurchases = sellerData?.copyPurchases || [];
  const payments = sellerData?.payments || [];

  const totalPurchaseCount = stockPurchases.length + copyPurchases.length;

  // Pagination helpers
  const getTotalPages = (dataLength) => Math.ceil(dataLength / itemsPerPage);
  const paginateData = (data, currentPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  if (!isOpen || !sellerId) return null;

  if (loading) {
    return (
      <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
        <div className="bg-white p-8 rounded-md">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری اطلاعات...</p>
          </div>
        </div>
      </AnimatedModal>
    );
  }

  const remainingBalance = getRemainingBalance();
  const totalPurchases = getTotalPurchases();

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[98vw]">
      <div className="bg-white rounded-md shadow-xl w-full h-[98vh] flex flex-col">
        {/* Header - با دکمه پرینت اضافه شده */}
        <div className="bg-cyan-700 rounded-t-md px-6 py-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <FaStore className="text-sky-100" />
                {sellerData?.seller.name} {sellerData?.seller.lastName}
                <span className="text-lg text-gray-300">
                  ({sellerData?.seller.storeName})
                </span>
              </h2>
              <div className="flex items-center gap-x-6 mt-1">
                <p className="text-gray-200 text-sm">مدیریت حساب فروشنده</p>
                <div className="flex items-center text-gray-200 gap-x-2">
                  <p className="text-sm">شماره تماس:</p>
                  <p className="font-bold text-sm">
                    {sellerData?.seller.phone}
                  </p>
                </div>
                {sellerData?.seller.address && (
                  <div className="flex items-center text-gray-200 gap-x-2">
                    <p className="text-sm">آدرس:</p>
                    <p className="font-bold text-sm">
                      {sellerData?.seller.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={!sellerData}
                className="text-gray-100 cursor-pointer hover:bg-gray-300 p-2 rounded-full hover:text-cyan-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="چاپ گزارش کامل"
              >
                <FaPrint />
              </button>
              <button
                onClick={onClose}
                className="text-gray-100 cursor-pointer hover:bg-gray-300 p-1 rounded-full hover:text-red-500 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Main content - بدون تغییر */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden px-3 pt-3 bg-gray-50 min-h-0">
          {/* سمت چپ - آمار و فرم پرداخت */}
          <div className="w-full md:w-1/4 bg-white h-full border-l border-gray-200 px-4 flex flex-col gap-6 overflow-y-auto">
            <StatsCards
              sellerData={sellerData}
              remainingBalance={remainingBalance}
              totalPurchases={totalPurchases}
            />

            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">
                ثبت پرداخت جدید
              </h3>
              <PaymentForm
                paymentForm={paymentForm}
                setPaymentForm={setPaymentForm}
                onSubmit={handlePaymentSubmit}
                loading={paymentLoading}
              />
            </div>
          </div>

          {/* سمت راست - تب‌ها */}
          <div className="w-full md:w-3/4 pr-4 flex flex-col h-full min-h-0">
            {/* تب‌ها */}
            <div className="border-b border-gray-200 mb-4 flex-shrink-0">
              <div className="grid grid-cols-3 py-2 gap-1">
                <button
                  className={`px-4 py-2 font-bold text-sm cursor-pointer ${
                    activeTab === "purchases"
                      ? "border-b-2 border-cyan-700 text-cyan-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("purchases")}
                >
                  لیست خریدها
                </button>
                <button
                  className={`px-4 py-2 font-bold text-sm cursor-pointer ${
                    activeTab === "calculations"
                      ? "border-b-2 border-cyan-700 text-cyan-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("calculations")}
                >
                  لیست محاسبات
                </button>
                <button
                  className={`px-4 py-2 font-bold text-sm cursor-pointer ${
                    activeTab === "payments"
                      ? "border-b-2 border-cyan-700 text-cyan-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("payments")}
                >
                  تاریخچه پرداخت‌ها
                </button>
              </div>
            </div>

            {/* محتوای تب‌ها - بدون تغییر */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">
                {/* Purchases Tab */}
                {activeTab === "purchases" && (
                  <PurchaseListTab
                    stockPurchases={paginateData(
                      sellerData.stockPurchases || [],
                      currentPagePurchases,
                    )}
                    copyPurchases={paginateData(
                      sellerData.copyPurchases || [],
                      currentPagePurchases,
                    )}
                    currentPage={currentPagePurchases}
                    itemsPerPage={itemsPerPage}
                    startIndex={(currentPagePurchases - 1) * itemsPerPage}
                  />
                )}

                {/* Calculations Tab */}
                {activeTab === "calculations" && (
                  <CalculationListTab
                    stockPurchases={paginateData(
                      sellerData.stockPurchases || [],
                      currentPageCalculations,
                    )}
                    copyPurchases={paginateData(
                      sellerData.copyPurchases || [],
                      currentPageCalculations,
                    )}
                    onPaymentSuccess={fetchSellerData}
                    currentPage={currentPageCalculations}
                    itemsPerPage={itemsPerPage}
                    startIndex={(currentPageCalculations - 1) * itemsPerPage}
                  />
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <PaymentHistoryTab
                    payments={paginateData(
                      sellerData.payments || [],
                      currentPagePayments,
                    )}
                    currentPage={currentPagePayments}
                    itemsPerPage={itemsPerPage}
                    startIndex={(currentPagePayments - 1) * itemsPerPage}
                    onPrintPayment={handlePrintPayment}
                  />
                )}
              </div>

              {/* Pagination - بدون تغییر */}
              {/* Purchases Pagination */}
              {activeTab === "purchases" &&
                sellerData.stockPurchases.length +
                  sellerData.copyPurchases.length >
                  itemsPerPage && (
                  <div className="border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPagePurchases(1)}
                          disabled={currentPagePurchases === 1}
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          ⏮ اول
                        </button>

                        <Pagination
                          currentPage={currentPagePurchases}
                          totalPages={getTotalPages(
                            sellerData.stockPurchases.length +
                              sellerData.copyPurchases.length,
                          )}
                          onPageChange={setCurrentPagePurchases}
                        />

                        <button
                          onClick={() =>
                            setCurrentPagePurchases(
                              getTotalPages(
                                sellerData.stockPurchases.length +
                                  sellerData.copyPurchases.length,
                              ),
                            )
                          }
                          disabled={
                            currentPagePurchases ===
                            getTotalPages(
                              sellerData.stockPurchases.length +
                                sellerData.copyPurchases.length,
                            )
                          }
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          آخر ⏭
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Calculations Pagination */}
              {activeTab === "calculations" &&
                sellerData.stockPurchases.length +
                  sellerData.copyPurchases.length >
                  itemsPerPage && (
                  <div className="border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPageCalculations(1)}
                          disabled={currentPageCalculations === 1}
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          ⏮ اول
                        </button>

                        <Pagination
                          currentPage={currentPageCalculations}
                          totalPages={getTotalPages(
                            sellerData.stockPurchases.length +
                              sellerData.copyPurchases.length,
                          )}
                          onPageChange={setCurrentPageCalculations}
                        />

                        <button
                          onClick={() =>
                            setCurrentPageCalculations(
                              getTotalPages(
                                sellerData.stockPurchases.length +
                                  sellerData.copyPurchases.length,
                              ),
                            )
                          }
                          disabled={
                            currentPageCalculations ===
                            getTotalPages(
                              sellerData.stockPurchases.length +
                                sellerData.copyPurchases.length,
                            )
                          }
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          آخر ⏭
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Payments Pagination */}
              {activeTab === "payments" &&
                sellerData.payments.length > itemsPerPage && (
                  <div className="border-t border-gray-200 bg-white flex-shrink-0">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPagePayments(1)}
                          disabled={currentPagePayments === 1}
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          ⏮ اول
                        </button>

                        <Pagination
                          currentPage={currentPagePayments}
                          totalPages={getTotalPages(sellerData.payments.length)}
                          onPageChange={setCurrentPagePayments}
                        />

                        <button
                          onClick={() =>
                            setCurrentPagePayments(
                              getTotalPages(sellerData.payments.length),
                            )
                          }
                          disabled={
                            currentPagePayments ===
                            getTotalPages(sellerData.payments.length)
                          }
                          className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                        >
                          آخر ⏭
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      {selectedPayment && (
        <SellerPrintPaymentReceipt
          isOpen={printReceiptOpen}
          onClose={() => {
            setPrintReceiptOpen(false);
            setSelectedPayment(null);
            setAutoPrintReceipt(false);
          }}
          paymentData={selectedPayment}
          sellerData={sellerData?.seller}
          walletStats={sellerData?.stats}
          autoPrint={autoPrintReceipt}
        />
      )}
    </AnimatedModal>
  );
};

export default SellerWalletModal;
