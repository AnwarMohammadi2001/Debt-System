import React from "react";
import jalaali from "jalaali-js";
import { FaPrint } from "react-icons/fa";

const CustomerWalletPrint = ({ data, customerId, onClose }) => {
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
    const customerName = data?.customer
      ? `${data.customer.name || ""} ${data.customer.lastName || ""}`.trim()
      : "مشتری";
    const currentDate = formatToJalali(new Date());

    // محاسبه مجموع خرید، پرداخت و باقی‌مانده
    const totalDebt = data?.stats?.totalDebt || 0;
    const totalPaid = data?.stats?.totalPaid || 0;
    const balance = data?.stats?.balance || 0;

    // محاسبه مجموع باقی‌مانده سفارشات
    const totalRemaining = data?.orders?.reduce(
      (sum, order) => sum + (order.remained || 0),
      0,
    );

    // محاسبه مجموع رسیده‌گی‌ها
    const totalRecip = data?.orders?.reduce(
      (sum, order) => sum + (order.recip || 0),
      0,
    );

    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>گزارش حساب مشتری - ${customerName}</title>
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
            .customer-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
              border: 1px solid #dee2e6;
            }
            .customer-info p {
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
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 13px;
            }
            th {
              background: #0e7490;
              color: white;
              padding: 10px;
              font-weight: bold;
              text-align: center;
              border: 1px solid #0c5f77;
            }
            td {
              padding: 8px;
              border: 1px solid #dee2e6;
              text-align: center;
            }
            tr:nth-child(even) {
              background: #f8f9fa;
            }
            .section-title {
              background: #115e6b;
              color: white;
              padding: 10px 15px;
              margin: 25px 0 15px 0;
              border-radius: 5px;
              font-size: 16px;
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
            .items-list {
              font-size: 12px;
              text-align: right;
              padding-right: 10px;
            }
            .items-list ul {
              margin: 5px 0;
              padding-right: 20px;
            }
            .items-list li {
              margin: 3px 0;
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
              <h1>گزارش جامع حساب مشتری</h1>
              <h2>${customerName}</h2>
              <p class="print-date">تاریخ چاپ: ${currentDate}</p>
            </div>

            <!-- اطلاعات مشتری -->
            <div class="customer-info">
              <p><strong>نام و نام خانوادگی:</strong> ${customerName}</p>
              <p><strong>شماره تماس:</strong> ${data?.customer?.phone || "-"}</p>
              <p><strong>آدرس:</strong> ${data?.customer?.address || "-"}</p>
              <p><strong>تاریخ ثبت نام:</strong> ${
                data?.customer?.createdAt
                  ? formatToJalali(data.customer.createdAt)
                  : "-"
              }</p>
            </div>

            <!-- کارت‌های خلاصه حساب -->
            <div class="summary-cards">
              <div class="card blue">
                <div class="card-title">مجموع خرید</div>
                <div class="card-amount">${formatCurrency(totalDebt)}</div>
              </div>
              <div class="card green">
                <div class="card-title">مجموع پرداخت</div>
                <div class="card-amount">${formatCurrency(totalPaid)}</div>
              </div>
              <div class="card ${balance > 0 ? "red" : "green"}">
                <div class="card-title">باقی‌مانده کل</div>
                <div class="card-amount">${formatCurrency(balance)}</div>
              </div>
            </div>

            <!-- لیست محاسبات (سفارشات) -->
            <div class="section-title">لیست محاسبات (سفارشات)</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>نمبر بل</th>
                  <th>تاریخ</th>
                  <th>جزئیات سفارش</th>
                  <th>مبلغ کل</th>
                  <th>رسیده‌گی</th>
                  <th>باقی‌مانده</th>
                  <th>وضعیت تحویل</th>
                </tr>
              </thead>
              <tbody>
                ${data?.orders
                  ?.map(
                    (order, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>#${order.id}</td>
                    <td>${formatToJalali(order.createdAt)}</td>
                    <td class="items-list">
                      ${
                        order.items
                          ? `
                        <ul>
                          ${order.items
                            .slice(0, 3)
                            .map(
                              (item) => `
                            <li>${item.name || "محصول"} - ${
                              item.quantity || 0
                            } عدد</li>
                          `,
                            )
                            .join("")}
                          ${
                            order.items.length > 3
                              ? `<li>... و ${
                                  order.items.length - 3
                                } آیتم دیگر</li>`
                              : ""
                          }
                        </ul>
                      `
                          : "جزئیات در سیستم موجود است"
                      }
                    </td>
                    <td>${formatCurrency(order.total)}</td>
                    <td>${formatCurrency(order.recip || 0)}</td>
                    <td>${formatCurrency(order.remained || 0)}</td>
                    <td>${
                      order.isDelivered ? "تحویل شده" : "در انتظار تحویل"
                    }</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr style="background: #e2e8f0; font-weight: bold;">
                  <td colspan="4">مجموع</td>
                  <td>${formatCurrency(totalDebt)}</td>
                  <td>${formatCurrency(totalRecip || 0)}</td>
                  <td>${formatCurrency(totalRemaining || 0)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <!-- تاریخچه پرداخت‌ها -->
            <div class="section-title">تاریخچه پرداخت‌ها</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>تاریخ</th>
                  <th>مبلغ</th>
                  <th>بابت</th>
                  <th>ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody>
                ${
                  data?.payments?.length > 0
                    ? data.payments
                        .map(
                          (payment, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${formatToJalali(payment.createdAt)}</td>
                        <td>${formatCurrency(payment.amount)}</td>
                        <td>${payment.description || "-"}</td>
                        <td>${payment.recordedBy || "Admin"}</td>
                      </tr>
                    `,
                        )
                        .join("")
                    : `
                      <tr>
                        <td colspan="5" style="text-align: center; padding: 20px;">
                          هیچ پرداختی ثبت نشده است
                        </td>
                      </tr>
                    `
                }
              </tbody>
              <tfoot>
                <tr style="background: #e2e8f0; font-weight: bold;">
                  <td colspan="2">مجموع پرداخت‌ها</td>
                  <td colspan="3">${formatCurrency(totalPaid)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- فوتر گزارش -->
            <div class="footer">
              <div class="signature">
                <p>امضاء مسئول: ____________________</p>
              </div>
              <div class="signature">
                <p>امضاء مشتری: ____________________</p>
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
      className="bg-white/10 hover:bg-white/20 text-white p-2 cursor-pointer hover:text-cyan-200 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="چاپ گزارش کامل"
    >
      <FaPrint size={20} />
    </button>
  );
};

export default CustomerWalletPrint;
