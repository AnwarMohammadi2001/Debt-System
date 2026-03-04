import React from "react";
import { FaPrint } from "react-icons/fa";
import jalaali from "jalaali-js";

const SellerWalletPrint = ({ data, sellerId, onClose }) => {
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
    const printWindow = window.open("", "_blank");
    const sellerName = data?.seller
      ? `${data.seller.name || ""} ${data.seller.lastName || ""}`.trim()
      : "فروشنده";
    const storeName = data?.seller?.storeName || "";
    const currentDate = formatToJalali(new Date());

    // Calculate statistics
    const totalPurchase = data?.stats?.totalPurchaseAmount || 0;
    const totalPaid = data?.stats?.totalPaid || 0;
    const remainingBalance = totalPurchase - totalPaid;

    const stockPurchases = data?.stockPurchases || [];
    const copyPurchases = data?.copyPurchases || [];
    const payments = data?.payments || [];

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
              <p><strong>شماره تماس:</strong> ${data?.seller?.phone || "-"}</p>
              <p><strong>آدرس:</strong> ${data?.seller?.address || "-"}</p>
              <p><strong>تاریخ ثبت نام:</strong> ${
                data?.seller?.createdAt
                  ? formatToJalali(data.seller.createdAt)
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

  return (
    <button
      onClick={handlePrint}
      disabled={!data}
      className="text-gray-100 cursor-pointer hover:bg-gray-300 p-2 rounded-full hover:text-cyan-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      title="چاپ گزارش کامل"
    >
      <FaPrint />
    </button>
  );
};

export default SellerWalletPrint;
