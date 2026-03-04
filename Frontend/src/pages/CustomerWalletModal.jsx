
import React, { useState, useEffect, useRef } from "react";
import {
  getCustomerWallet,
  addCustomerPayment,
} from "../pages/dashboard/services/CustomerService";
import { getOrderById } from "../pages/dashboard/services/ServiceManager";
import {
  FaTimes,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaPlus,
  FaUserCircle,
  FaSpinner,
  FaCheck,
  FaPrint,
} from "react-icons/fa";
import { TbListCheck } from "react-icons/tb";
import Swal from "sweetalert2";
import AnimatedModal from "../components/common/AnimatedModal";
import Pagination from "../pages/dashboard/pagination/Pagination";
import { ImCross } from "react-icons/im";
import jalaali from "jalaali-js";
import CustomerWalletPrint from "./CustomerWalletPrint";
import PrintPaymentReceipt from "./CustomerPrintPaymentReceipt"; // Import the new component

const CustomerWalletModal = ({ isOpen, onClose, customerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [payAmount, setPayAmount] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingOrders, setLoadingOrders] = useState({});
  const [printReceiptOpen, setPrintReceiptOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const printContentRef = useRef(null);

  // حالت‌های جدید برای پاگی‌نیشن
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  const itemsPerPage = 15;

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

  const fetchWallet = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      const res = await getCustomerWallet(customerId);
      console.log("Wallet data:", res);
      setData(res);

      // بعد از دریافت سفارشات، جزئیات هر کدام را بگیر
      if (res.orders && res.orders.length > 0) {
        fetchAllOrderDetails(res.orders);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("خطا", "دریافت اطلاعات حساب با مشکل مواجه شد", "error");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // تابع برای دریافت جزئیات همه سفارشات
  const fetchAllOrderDetails = async (orders) => {
    const details = {};
    const loadingStates = {};

    // ابتدا همه را در حالت لودینگ قرار می‌دهیم
    orders.forEach((order) => {
      loadingStates[order.id] = true;
    });
    setLoadingOrders(loadingStates);

    // سپس به ترتیب جزئیات هر سفارش را می‌گیریم
    for (const order of orders) {
      try {
        const detail = await getOrderById(order.id);
        details[order.id] = detail;
      } catch (error) {
        console.error(`Error fetching details for order ${order.id}:`, error);
        details[order.id] = null;
      } finally {
        setLoadingOrders((prev) => ({
          ...prev,
          [order.id]: false,
        }));
      }
    }

    setOrderDetails(details);
  };

  // تابع برای دریافت جزئیات یک سفارش خاص
  const fetchSingleOrderDetail = async (orderId) => {
    setLoadingOrders((prev) => ({
      ...prev,
      [orderId]: true,
    }));

    try {
      const detail = await getOrderById(orderId);
      setOrderDetails((prev) => ({
        ...prev,
        [orderId]: detail,
      }));
    } catch (error) {
      console.error(`Error fetching details for order ${orderId}:`, error);
    } finally {
      setLoadingOrders((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      setData(null);
      setOrderDetails({});
      setLoadingOrders({});
      setCurrentPage(1);
      setCurrentPagePayments(1);
      fetchWallet();
      setActiveTab("orders");
    }
  }, [isOpen, customerId]);

const handlePayment = async (e) => {
  e.preventDefault();

  // اعتبارسنجی اولیه
  if (!payAmount || parseFloat(payAmount) <= 0) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "لطفاً مبلغ معتبر وارد کنید",
      confirmButtonText: "متوجه شدم",
      confirmButtonColor: "#dc2626",
    });
    return;
  }

  // نمایش جزئیات پرداخت برای تأیید
  const confirmResult = await Swal.fire({
    title: "تأیید جزئیات پرداخت",
    html: `
      <div style="text-align: right; direction: rtl; padding: 10px;">
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>مبلغ پرداخت:</strong> <span style="color: #059669; font-weight: bold; font-size: 24px;">${parseFloat(payAmount).toLocaleString()} افغانی</span></p>
          ${payDesc ? `<p style="margin: 5px 0; font-size: 14px;"><strong>بابت:</strong> ${payDesc}</p>` : ""}
          <p style="margin: 5px 0; font-size: 14px;"><strong>مشتری:</strong> ${data?.customer?.name || ""} ${data?.customer?.lastName || ""}</p>
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
    return; // اگر کاربر انصراف داد، فرآیند متوقف شود
  }

  try {
    // نمایش لودینگ هنگام ثبت
    Swal.fire({
      title: "در حال ثبت...",
      html: "لطفاً منتظر بمانید",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await addCustomerPayment({
      customerId,
      amount: parseFloat(payAmount),
      description: payDesc,
    });

    // بستن لودینگ
    Swal.close();

    setPayAmount("");
    setPayDesc("");
    await fetchWallet();

    // سوال برای چاپ رسید
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
      // پیدا کردن آخرین پرداخت ثبت شده
      const newPayment = data?.payments?.[data.payments.length - 1];
      if (newPayment) {
        setSelectedPayment(newPayment);
        setAutoPrintReceipt(true);
        setPrintReceiptOpen(true);
      }
    } else {
      // اگر چاپ را انتخاب نکرد، پیام موفقیت نمایش بده
      Swal.fire({
        icon: "success",
        title: "ثبت شد",
        text: "پرداخت با موفقیت ثبت شد",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "ثبت پرداخت انجام نشد",
      confirmButtonText: "متوجه شدم",
      confirmButtonColor: "#dc2626",
    });
  }
};

  // Function to print specific payment
  const handlePrintPayment = (payment) => {
    setSelectedPayment(payment);
    setAutoPrintReceipt(false);
    setPrintReceiptOpen(true);
  };

  // محاسبه سفارشات صفحه جاری - با ترتیب قدیمی‌ترین اول
  const getCurrentPageOrders = () => {
    if (!data?.orders || !Array.isArray(data.orders)) return [];

    const reversedOrders = [...data.orders].reverse();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reversedOrders.slice(startIndex, endIndex);
  };

  // محاسبه تعداد صفحات سفارشات
  const getTotalPagesOrders = () => {
    if (!data?.orders || !Array.isArray(data.orders)) return 1;
    return Math.ceil(data.orders.length / itemsPerPage);
  };

  // محاسبه پرداخت‌های صفحه جاری
  const getCurrentPagePayments = () => {
    if (!data?.payments || !Array.isArray(data.payments)) return [];

    const startIndex = (currentPagePayments - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.payments.slice(startIndex, endIndex);
  };

  // محاسبه تعداد صفحات پرداخت‌ها
  const getTotalPagesPayments = () => {
    if (!data?.payments || !Array.isArray(data.payments)) return 1;
    return Math.ceil(data.payments.length / itemsPerPage);
  };

  // هندل تغییر صفحه سفارشات
  const handleOrdersPageChange = (page) => {
    setCurrentPage(page);
  };

  // هندل تغییر صفحه پرداخت‌ها
  const handlePaymentsPageChange = (page) => {
    setCurrentPagePayments(page);
  };

  // تابع برای رفتن به اولین صفحه سفارشات
  const goToFirstOrdersPage = () => {
    setCurrentPage(1);
  };

  // تابع برای رفتن به آخرین صفحه سفارشات
  const goToLastOrdersPage = () => {
    setCurrentPage(getTotalPagesOrders());
  };

  // تابع برای رفتن به اولین صفحه پرداخت‌ها
  const goToFirstPaymentsPage = () => {
    setCurrentPagePayments(1);
  };

  // تابع برای رفتن به آخرین صفحه پرداخت‌ها
  const goToLastPaymentsPage = () => {
    setCurrentPagePayments(getTotalPagesPayments());
  };

  if (!isOpen) return null;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[98vw]">
      <div className="shadow-2xl w-full h-[97vh] flex flex-col rounded-md overflow-hidden">
        {/* Header */}
        <div className="bg-cyan-800 text-white px-5 rounded-t-md py-3 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <FaUserCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {loading
                  ? "در حال بارگذاری..."
                  : `${data?.customer?.name || "مشتری"} ${
                      data?.customer?.lastName || ""
                    }`}
              </h2>
              <p className="text-sm text-cyan-100">{data?.customer?.phone}</p>
            </div>
          </div>
          <div className="flex items-center text-lg text-gray-800 rounded-md gap-x-2 p-2 bg-gray-100">
            <span className="font-bold">صورت حساب</span>
            <span className="font-bold">
              {loading
                ? "در حال بارگذاری..."
                : `${data?.customer?.name || "مشتری"} ${
                    data?.customer?.lastName || ""
                  }`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* استفاده از کامپوننت مجزای پرینت */}
            <CustomerWalletPrint data={data} customerId={customerId} />

            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 cursor-pointer hover:text-red-500 rounded-full transition-all"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* بقیه کد شما بدون تغییر می‌ماند */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800"></div>
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            اطلاعاتی یافت نشد.
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
            {/* Sidebar / Stats Panel */}
            <div className="w-full md:w-1/4 bg-white border-l border-gray-200 p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Balance Card */}
              <div className="bg-sky-100 p-3 rounded-md border space-y-1 text-center border-blue-100">
                <p className="text-sm text-gray-500">مجموع خرید</p>
                <p className="font-bold text-gray-900">
                  {data.stats.totalDebt.toLocaleString()}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="bg-purple-100 p-3 space-y-1 rounded-md border text-center border-purple-100">
                  <p className="text-sm text-gray-500">مجموع پرداخت</p>
                  <p className="font-bold text-purple-700">
                    {data.stats.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-md text-center shadow-sm border ${
                    data.stats.balance > 0
                      ? "bg-red-100 border-red-100"
                      : "bg-green-50 border-green-100"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1 font-bold">
                    باقی‌داری کل
                  </p>
                  <p
                    className={`text-2xl font-black dir-ltr my-1 ${
                      data.stats.balance > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {data.stats.balance.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-2">
                  <div className="bg-cyan-50 p-3 rounded-md border text-center space-y-2 border-purple-100">
                    <p className="text-sm text-gray-500">تعداد سفارشات</p>
                    <p className="font-bold text-cyan-700">
                      {data.orders.length}
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-md border text-center space-y-2 border-purple-100">
                    <p className="text-sm text-gray-500">سفارش تحویل شده</p>
                    <p className="font-bold text-cyan-700">
                      {data.orders.filter((o) => o.isDelivered).length}
                    </p>
                  </div>
                </div>
                <div className="bg-cyan-50 px-3 py-1 rounded-md border text-center space-y-2 border-purple-100">
                  <p className="text-sm text-gray-500">سفارشات باقی مانده</p>
                  <p className="font-bold text-cyan-700">
                    {data.orders.filter((o) => o.isDelivered === false).length}
                  </p>
                </div>
              </div>

              {/* Add Payment Form */}
              <div className="mt-auto pt-4 border-t-2 border-gray-300">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <FaPlus className="text-green-600" size={12} /> ثبت پرداخت
                  جدید
                </h4>
                <form onSubmit={handlePayment} className="space-y-2">
                  <input
                    type="number"
                    placeholder="مبلغ (افغانی)"
                    className="w-full bg-gray-200 border border-gray-200 rounded-md px-3 py-3 text-sm focus:ring-1 focus:ring-cyan-600 outline-none transition-all"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="بابت (قسط، تسویه...)"
                    className="w-full bg-gray-200 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:ring-1 focus:ring-cyan-600 outline-none transition-all"
                    value={payDesc}
                    onChange={(e) => setPayDesc(e.target.value)}
                  />
                  <button className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-3 hover:scale-102 cursor-pointer rounded-md text-sm font-bold shadow-md transition-all active:scale-95">
                    ثبت و کسر از حساب
                  </button>
                </form>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 py-4 text-sm font-bold flex items-center cursor-pointer justify-center gap-2 transition-all relative ${
                    activeTab === "orders"
                      ? "text-cyan-800 bg-cyan-50"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <TbListCheck size={16} /> لیست سفارشات
                  {activeTab === "orders" && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-800"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("counting")}
                  className={`flex-1 py-4 text-sm font-bold flex items-center cursor-pointer justify-center gap-2 transition-all relative ${
                    activeTab === "counting"
                      ? "text-cyan-800 bg-cyan-50"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <FaFileInvoiceDollar size={16} /> لیست محاسبات
                  {activeTab === "counting" && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-800"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`flex-1 py-4 text-sm font-bold flex items-center cursor-pointer justify-center gap-2 transition-all relative ${
                    activeTab === "payments"
                      ? "text-cyan-800 bg-cyan-50"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <FaMoneyBillWave size={16} /> تاریخچه پرداخت‌ها
                  {activeTab === "payments" && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-800"></div>
                  )}
                </button>
              </div>

              {/* Tab Body */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* ORDERS LIST */}
             {activeTab === "orders" && (
                  <>
                    <div className="flex-1 overflow-y-auto  custom-scrollbar">
                      <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-200 text-gray-600 sticky top-0">
                          <tr>
                            <th className="p-3">شماره</th>
                            <th className="p-3">نمبر بل</th>
                            <th className="p-3">تاریخ</th>
                            <th className="p-3">جزئیات سفارش</th>
                            <th className="p-3">مبلغ کل</th>
                            <th className="p-3">وضعیت تحویل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(() => {
                            const currentOrders = getCurrentPageOrders();
                            let cumulativeBalance = 0;

                            return currentOrders.map((o, index) => {
                              // محاسبه باقیمانده تجمعی
                              cumulativeBalance += o.remained || 0;

                              // دریافت جزئیات این سفارش
                              const detail = orderDetails[o.id];
                              const isLoading = loadingOrders[o.id];

                              return (
                                <tr
                                  key={o.id}
                                  className="hover:bg-gray-100 transition-colors"
                                >
                                  <td className="p-3 font-mono text-gray-500">
                                    {(currentPage - 1) * itemsPerPage +
                                      index +
                                      1}
                                  </td>
                                  <td className="p-3 font-mono text-gray-500">
                                    #{o.id}
                                  </td>
                                  <td className="p-3 text-gray-600">
                                    {new Date(o.createdAt).toLocaleDateString(
                                      "fa-AF",
                                    )}
                                  </td>
                                  <td className="p-3 text-gray-700 text-center min-w-[200px]">
                                    {isLoading ? (
                                      <div className="flex justify-center py-2">
                                        <FaSpinner className="animate-spin text-cyan-600 text-sm" />
                                      </div>
                                    ) : detail ? (
                                      <div className="space-y-2">
                                        {/* نمایش آیتم‌های digital */}
                                        {detail.digital &&
                                          detail.digital.length > 0 && (
                                            <div className="text-right">
                                              <div className="space-y-1">
                                                {detail.digital
                                                  .slice(0, 3)
                                                  .map((item, i) => (
                                                    <div
                                                      key={item.id || i}
                                                      className="text-xs flex items-center  justify-center gap-x-5  pb-1 border-gray-100 "
                                                    >
                                                      <div className="flex items-center gap-x-5 ">
                                                        <span className="font-medium text-gray-700">
                                                          {item.name || "محصول"}
                                                        </span>
                                                        <span className="text-gray-400">
                                                          {Number(
                                                            item.quantity || 0,
                                                          ).toLocaleString()}{" "}
                                                          نسخه
                                                        </span>
                                                      </div>
                                                      {item.size && (
                                                        <div className="text-[10px] text-gray-500 ">
                                                          {item.size}
                                                          {item.paper_type &&
                                                            ` : ${item.paper_type}`}
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                {detail.digital.length > 3 && (
                                                  <div className="text-[10px] text-gray-500 text-center">
                                                    +{" "}
                                                    {detail.digital.length - 3}{" "}
                                                    آیتم دیگر
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* نمایش آیتم‌های offset */}
                                        {detail.offset &&
                                          detail.offset.length > 0 && (
                                            <div className="text-right mt-2">
                                              <div className="space-y-1">
                                                {detail.offset
                                                  .slice(0, 3)
                                                  .map((item, i) => (
                                                    <div
                                                      key={item.id || i}
                                                      className="text-xs flex  items-center gap-x-5 justify-center border-b pb-1 border-gray-100 last:border-0"
                                                    >
                                                      <div className="flex items-center gap-x-5">
                                                        <span className="font-medium text-gray-700">
                                                          {item.book_name ||
                                                            "کتاب"}
                                                        </span>
                                                        <span className="text-gray-400">
                                                          {Number(
                                                            item.quantity || 0,
                                                          ).toLocaleString()}{" "}
                                                          جلد
                                                        </span>
                                                      </div>
                                                      {item.publisher && (
                                                        <div className="text-[10px] text-gray-500 ">
                                                          {item.publisher}
                                                          {item.size &&
                                                            `   ${item.size}`}
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                {detail.offset.length > 3 && (
                                                  <div className="text-[10px] text-gray-500 text-center">
                                                    + {detail.offset.length - 3}{" "}
                                                    آیتم دیگر
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                        {/* اگر هیچ آیتمی یافت نشد */}
                                        {(!detail.digital ||
                                          detail.digital.length === 0) &&
                                          (!detail.offset ||
                                            detail.offset.length === 0) && (
                                            <button
                                              onClick={() =>
                                                fetchSingleOrderDetail(o.id)
                                              }
                                              className="text-cyan-600 hover:text-cyan-800 text-xs underline cursor-pointer w-full text-center py-1"
                                            >
                                              دریافت جزئیات
                                            </button>
                                          )}
                                      </div>
                                    ) : (
                                      // اگر جزئیات هنوز دریافت نشده
                                      <button
                                        onClick={() =>
                                          fetchSingleOrderDetail(o.id)
                                        }
                                        className="text-cyan-600 hover:text-cyan-800 text-xs underline cursor-pointer w-full text-center py-1"
                                      >
                                        مشاهده جزئیات
                                      </button>
                                    )}
                                  </td>
                                  <td className="p-3 font-bold text-sm text-gray-600">
                                    {o.total?.toLocaleString() || "0"}
                                  </td>

                                  <td className="p-3">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        o.isDelivered
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {o.isDelivered ? (
                                        <>
                                          <FaCheck className="ml-1" size={10} />
                                          تحویل شده
                                        </>
                                      ) : (
                                        <>
                                          <ImCross className="ml-1" size={10} />
                                          در انتظار تحویل
                                        </>
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}

                          {getCurrentPageOrders().length === 0 && (
                            <tr>
                              <td colSpan="8" className="p-8 text-gray-400">
                                هیچ سفارشی یافت نشد
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* پاگی‌نیشن سفارشات */}
                    {data.orders.length > itemsPerPage && (
                      <div className="border-t border-gray-200  bg-white">
                        <div className="flex justify-around items-center text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToFirstOrdersPage}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                            >
                              ⏮ اول
                            </button>

                            <Pagination
                              currentPage={currentPage}
                              totalPages={getTotalPagesOrders()}
                              onPageChange={handleOrdersPageChange}
                            />

                            <button
                              onClick={goToLastOrdersPage}
                              disabled={currentPage === getTotalPagesOrders()}
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                            >
                              آخر ⏭
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* COUNTING LIST */}
                {activeTab === "counting" && (
                   <>
                    <div className="flex-1 overflow-y-auto  custom-scrollbar">
                      <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-200 text-gray-600 sticky top-0">
                          <tr>
                            <th className="p-3">شماره</th>
                            <th className="p-3">نمبر بل</th>
                            <th className="p-3">تاریخ</th>
                            <th className="p-3">تفصیلات</th>
                            <th className="p-3">برده گی</th>
                            <th className="p-3">رسیده گی</th>
                            <th className="p-3">باقی مانده</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {(() => {
                            const currentOrders = getCurrentPageOrders();
                            let cumulativeBalance = 0;

                            return currentOrders.map((o, index) => {
                              // محاسبه باقیمانده تجمعی
                              cumulativeBalance += o.remained || 0;

                              // دریافت جزئیات این سفارش
                              const detail = orderDetails[o.id];
                              const isLoading = loadingOrders[o.id];

                              return (
                                <tr
                                  key={o.id}
                                  className="hover:bg-blue-50/50 transition-colors"
                                >
                                  <td className="p-3 font-mono text-gray-500">
                                    {(currentPage - 1) * itemsPerPage +
                                      index +
                                      1}
                                  </td>
                                  <td className="p-3 font-mono text-gray-500">
                                    #{o.id}
                                  </td>
                                  <td className="p-3 text-gray-600">
                                    {new Date(o.createdAt).toLocaleDateString(
                                      "fa-AF",
                                    )}
                                  </td>
                                  <td className="p-3 text-gray-700 text-center min-w-[100px]">
                                    {isLoading ? (
                                      <div className="flex  justify-center py-2">
                                        <FaSpinner className="animate-spin text-cyan-600 text-sm" />
                                      </div>
                                    ) : detail ? (
                                      <div className="space-y-1 flex justify-center">
                                        {/* نمایش آیتم‌های digital */}
                                        {detail.digital &&
                                          detail.digital.length > 0 && (
                                            <div className="flex items-center">
                                              <ul className="space-y-0.5">
                                                {detail.digital
                                                  .slice(0, 2)
                                                  .map((item, i) => (
                                                    <li
                                                      key={item.id || i}
                                                      className="text-xs flex gap-x-5 items-center"
                                                    >
                                                      <span className=" text-sm font-semibold text-gray-600 flex-1">
                                                        {item.name || "محصول"}
                                                      </span>
                                                      <span className="text-gray-400 text-xs">
                                                        {Number(
                                                          item.quantity || 0,
                                                        ).toLocaleString()}{" "}
                                                      </span>
                                                    </li>
                                                  ))}
                                                {detail.digital.length > 2 && (
                                                  <li className="text-[10px] text-gray-500 text-center">
                                                    +{" "}
                                                    {detail.digital.length - 2}{" "}
                                                    آیتم دیگر
                                                  </li>
                                                )}
                                              </ul>
                                            </div>
                                          )}

                                        {/* نمایش آیتم‌های offset */}
                                        {detail.offset &&
                                          detail.offset.length > 0 && (
                                            <div>
                                              <p className="text-xs text-gray-500 mb-1 text-right">
                                                کاپی:
                                              </p>
                                              <ul className="space-y-0.5">
                                                {detail.offset
                                                  .slice(0, 2)
                                                  .map((item, i) => (
                                                    <li
                                                      key={item.id || i}
                                                      className="text-xs flex justify-between items-center"
                                                    >
                                                      <span className="text-right flex-1">
                                                        {item.book_name ||
                                                          "کتاب"}
                                                      </span>
                                                      <span className="text-gray-400 text-[10px] mr-1">
                                                        {Number(
                                                          item.quantity || 0,
                                                        ).toLocaleString()}{" "}
                                                        جلد
                                                      </span>
                                                    </li>
                                                  ))}
                                                {detail.offset.length > 2 && (
                                                  <li className="text-[10px] text-gray-500 text-center">
                                                    + {detail.offset.length - 2}{" "}
                                                    آیتم دیگر
                                                  </li>
                                                )}
                                              </ul>
                                            </div>
                                          )}

                                        {/* اگر هیچ آیتمی یافت نشد */}
                                        {(!detail.digital ||
                                          detail.digital.length === 0) &&
                                          (!detail.offset ||
                                            detail.offset.length === 0) && (
                                            <button
                                              onClick={() =>
                                                fetchSingleOrderDetail(o.id)
                                              }
                                              className="text-cyan-600 hover:text-cyan-800 text-xs underline cursor-pointer w-full text-center py-1"
                                            >
                                              دریافت جزئیات
                                            </button>
                                          )}
                                      </div>
                                    ) : (
                                      // اگر جزئیات هنوز دریافت نشده
                                      <button
                                        onClick={() =>
                                          fetchSingleOrderDetail(o.id)
                                        }
                                        className="text-cyan-600 hover:text-cyan-800 text-xs underline cursor-pointer w-full text-center py-1"
                                      >
                                        مشاهده جزئیات
                                      </button>
                                    )}
                                  </td>
                                  <td className="p-3 font-bold text-gray-700">
                                    {o.total.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-green-600">
                                    {o.recip.toLocaleString()}
                                  </td>
                                  <td
                                    className={`p-3 font-bold ${
                                      cumulativeBalance > 0
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {cumulativeBalance.toLocaleString()}
                                  </td>
                                </tr>
                              );
                            });
                          })()}

                          {getCurrentPageOrders().length === 0 && (
                            <tr>
                              <td colSpan="7" className="p-8 text-gray-400">
                                هیچ سفارشی یافت نشد
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {data.orders.length > itemsPerPage && (
                      <div className="border-t border-gray-200 bg-white">
                        <div className="flex justify-center items-center text-sm text-gray-600 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToFirstOrdersPage}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                            >
                              ⏮ اول
                            </button>

                            <Pagination
                              currentPage={currentPage}
                              totalPages={getTotalPagesOrders()}
                              onPageChange={handleOrdersPageChange}
                            />

                            <button
                              onClick={goToLastOrdersPage}
                              disabled={currentPage === getTotalPagesOrders()}
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                            >
                              آخر ⏭
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* PAYMENTS LIST - با دکمه پرینت برای هر پرداخت */}
                {activeTab === "payments" && (
                  <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-sm text-center border-collapse">
                        <thead className="bg-gray-100 text-gray-600 sticky top-0">
                          <tr>
                            <th className="p-3">شماره</th>
                            <th className="p-3">تاریخ</th>
                            <th className="p-3">مبلغ پرداختی</th>
                            <th className="p-3">بابت</th>
                            <th className="p-3">کاربر</th>
                            <th className="p-3">عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {data?.payments && data.payments.length > 0 ? (
                            getCurrentPagePayments().map((p, index) => (
                              <tr
                                key={p.id}
                                className="hover:bg-green-50/50 transition-colors"
                              >
                                <td className="p-3 text-gray-600">
                                  {(currentPagePayments - 1) * itemsPerPage +
                                    index +
                                    1}
                                </td>
                                <td className="p-3 text-gray-600">
                                  {new Date(p.createdAt).toLocaleDateString(
                                    "fa-AF",
                                  )}
                                </td>
                                <td className="p-3 font-bold text-green-700">
                                  {p.amount?.toLocaleString() || "0"}
                                </td>
                                <td className="p-3 text-gray-600">
                                  {p.description || "-"}
                                </td>
                                <td className="p-3 text-xs text-gray-400">
                                  {p.recordedBy || "Admin"}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => handlePrintPayment(p)}
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
                              <td
                                colSpan="6"
                                className="p-8 text-gray-400 text-center"
                              >
                                هیچ پرداختی یافت نشد
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* پاگی‌نیشن پرداخت‌ها */}
                    {data?.payments && data.payments.length > itemsPerPage && (
                      <div className="border-t border-gray-200 bg-white">
                        <div className="flex justify-center items-center text-sm text-gray-600 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToFirstPaymentsPage}
                              disabled={currentPagePayments === 1}
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                              ⏮ اول
                            </button>

                            <Pagination
                              currentPage={currentPagePayments}
                              totalPages={getTotalPagesPayments()}
                              onPageChange={handlePaymentsPageChange}
                            />

                            <button
                              onClick={goToLastPaymentsPage}
                              disabled={
                                currentPagePayments === getTotalPagesPayments()
                              }
                              className="px-3 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                              آخر ⏭
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Receipt Modal */}
      {selectedPayment && (
        <PrintPaymentReceipt
          isOpen={printReceiptOpen}
          onClose={() => {
            setPrintReceiptOpen(false);
            setSelectedPayment(null);
            setAutoPrintReceipt(false);
          }}
          paymentData={selectedPayment}
          customerData={data?.customer}
          walletStats={data?.stats}
          autoPrint={autoPrintReceipt}
        />
      )}
    </AnimatedModal>
  );
};

export default CustomerWalletModal;
