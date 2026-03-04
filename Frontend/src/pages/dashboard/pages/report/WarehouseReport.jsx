// components/dashboard/reports/WarehouseReport.jsx
import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaPrint,
  FaPallet,
  FaTruck,
  FaFilter,
  FaSearch,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaUsers,
} from "react-icons/fa";
import {
  reportService,
  formatCurrency,
  formatNumber,
} from "../../services/reportService";
import {
  PrintCopyComparisonChart,
  OrdersDistributionChart,
  OrdersTrendChart,
  TopCustomersChart,
  OrderStatusChart,
  RevenueComparisonChart,
} from "./OrdersCharts";

const WarehouseReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("orders"); // orders, customers, charts

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await reportService.getWarehouseStatusReport(params);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching warehouse report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const statusOptions = [
    { value: "all", label: "همه وضعیت‌ها" },
    { value: "pending", label: "در انتظار چاپ" },
    { value: "completed", label: "چاپ شده" },
    { value: "delivered", label: "تحویل داده شده" },
  ];

  const typeOptions = [
    { value: "all", label: "همه انواع" },
    { value: "digital", label: "چاپ" },
    { value: "offset", label: "کاپی" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, digital, offset, summary } = data;

  // فرضی: داده‌های مشتریان برای چارت (در واقعیت باید از API بگیرید)
  const sampleCustomers = [
    {
      id: 1,
      name: "احمد محمدی",
      fullName: "احمد محمدی",
      orderCount: 45,
      totalSpent: 1250000,
      phone: "0798123456",
    },
    {
      id: 2,
      name: "رضا کریمی",
      fullName: "رضا کریمی",
      orderCount: 38,
      totalSpent: 980000,
      phone: "0798234567",
    },
    {
      id: 3,
      name: "مریم حسینی",
      fullName: "مریم حسینی",
      orderCount: 32,
      totalSpent: 875000,
      phone: "0798345678",
    },
    {
      id: 4,
      name: "علی رضایی",
      fullName: "علی رضایی",
      orderCount: 28,
      totalSpent: 720000,
      phone: "0798456789",
    },
    {
      id: 5,
      name: "فاطمه موسوی",
      fullName: "فاطمه موسوی",
      orderCount: 25,
      totalSpent: 650000,
      phone: "0798567890",
    },
    {
      id: 6,
      name: "حسن نوروزی",
      fullName: "حسن نوروزی",
      orderCount: 22,
      totalSpent: 580000,
      phone: "0798678901",
    },
    {
      id: 7,
      name: "سارا جعفری",
      fullName: "سارا جعفری",
      orderCount: 19,
      totalSpent: 520000,
      phone: "0798789012",
    },
    {
      id: 8,
      name: "محمد علیزاده",
      fullName: "محمد علیزاده",
      orderCount: 17,
      totalSpent: 480000,
      phone: "0798890123",
    },
    {
      id: 9,
      name: "نازنین رحمانی",
      fullName: "نازنین رحمانی",
      orderCount: 15,
      totalSpent: 420000,
      phone: "0798901234",
    },
    {
      id: 10,
      name: "کاظم محمدی",
      fullName: "کاظم محمدی",
      orderCount: 12,
      totalSpent: 380000,
      phone: "0798012345",
    },
  ];

  // داده‌های روزانه برای چارت روند (فرضی)
  const dailySampleData = [
    {
      day: "2024-01-01",
      orderCount: 15,
      deliveredCount: 10,
      dailyRevenue: 450000,
    },
    {
      day: "2024-01-02",
      orderCount: 18,
      deliveredCount: 12,
      dailyRevenue: 520000,
    },
    {
      day: "2024-01-03",
      orderCount: 22,
      deliveredCount: 15,
      dailyRevenue: 610000,
    },
    {
      day: "2024-01-04",
      orderCount: 20,
      deliveredCount: 14,
      dailyRevenue: 580000,
    },
    {
      day: "2024-01-05",
      orderCount: 25,
      deliveredCount: 18,
      dailyRevenue: 720000,
    },
    {
      day: "2024-01-06",
      orderCount: 16,
      deliveredCount: 11,
      dailyRevenue: 480000,
    },
    {
      day: "2024-01-07",
      orderCount: 19,
      deliveredCount: 13,
      dailyRevenue: 540000,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaBoxOpen className="text-cyan-700" />
            گزارش وضعیت سفارشات
          </h2>
          <p className="text-gray-600 mt-1">
            موجودی و وضعیت سفارشات در چاپخانه
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "orders"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaBoxOpen className="inline ml-2" />
            سفارشات
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "customers"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaUsers className="inline ml-2" />
            مشتریان
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "charts"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaChartBar className="inline ml-2" />
            نمودارها
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام سفارش..."
              className="w-full p-3 pl-10 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-4 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-200 rounded-md p-6 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 font-medium">
                تمام سفارشات
              </div>
              <div className="text-2xl font-bold text-cyan-700">
                {formatNumber(summary.totalOrders)}
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaBoxOpen className="text-cyan-700 text-xl" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ارزش کل: {formatCurrency(summary.totalValue)}
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-6 shadow-inner">
          {" "}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 font-medium">
                در انتظار چاپ
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatNumber(
                  stats.digital.pendingPrint + stats.offset.pendingPrint,
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaPrint className="text-cyan-700 text-xl" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {stats.digital.pendingPrint} چاپ - {stats.offset.pendingPrint} کاپی
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-6 shadow-inner">
          {" "}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 font-medium">چاپ شده</div>
              <div className="text-2xl font-bold text-green-700">
                {formatNumber(
                  stats.digital.completedPrint + stats.offset.completedPrint,
                )}
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaPrint className="text-cyan-700 text-xl" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {stats.digital.completedPrint} چاپ - {stats.offset.completedPrint}{" "}
            کاپی
          </div>
        </div>
        <div className="bg-gray-200 rounded-md p-6 shadow-inner">
          {" "}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 font-medium">
                تحویل داده شده
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {formatNumber(stats.digital.deliveredPalet)}
              </div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaTruck className="text-cyan-700 text-xl" />
            </div>
          </div>
          <div className="text-xs text-gray-500">پلیت شده</div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <>
          {/* Digital Orders */}
          {(typeFilter === "all" || typeFilter === "digital") && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBoxOpen className="text-cyan-700" />
                  سفارشات چاپ
                </h3>
                <div className="text-sm text-gray-600">
                  تعداد: {stats.digital.total} | ارزش:{" "}
                  {formatCurrency(stats.digital.totalValue)}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          شماره
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          نام سفارش
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          وضعیت چاپ
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          مشتری
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          تعداد
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          قیمت کل
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          پرداخت شده
                        </th>
                        <th className="p-4 text-right text-sm font-semibold text-gray-700">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {digital.slice(0, 10).map((order, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {index + 1}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {order.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.size} - {order.paper_type}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status_print === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status_print === "completed"
                                ? "چاپ شده"
                                : "در انتظار"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-700">
                              {order.Order?.customer?.name || "مشتری گذری"}
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">
                            {formatNumber(order.quantity)}
                          </td>
                          <td className="p-4 font-medium text-gray-800">
                            {formatCurrency(order.total_price || 0)}
                          </td>
                          <td className="p-4">
                            <div className="text-green-700 font-medium">
                              {formatCurrency(order.money || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              مانده:{" "}
                              {formatCurrency(
                                (order.total_price || 0) - (order.money || 0),
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                              جزئیات
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {digital.length > 10 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                      نمایش همه ({digital.length} سفارش)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offset Orders */}
          {(typeFilter === "all" || typeFilter === "offset") && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBoxOpen className="text-purple-600" />
                  سفارشات کاپی
                </h3>
                <div className="text-sm text-gray-600">
                  تعداد: {stats.offset.total} | ارزش:{" "}
                  {formatCurrency(stats.offset.totalValue)}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-center">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          شماره
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          نام کتاب
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          وضعیت چاپ
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          مشتری
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          تعداد
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          قیمت کل
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          پرداخت شده
                        </th>
                        <th className="p-4  text-sm font-semibold text-gray-700">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {offset.slice(0, 10).map((order, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {index + 1}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {order.book_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.size}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status_print === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status_print === "completed"
                                ? "چاپ شده"
                                : "در انتظار"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-700">
                              {order.Order?.customer?.name || "مشتری گذری"}
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">
                            {formatNumber(order.quantity)}
                          </td>
                          <td className="p-4 font-medium text-gray-800">
                            {formatCurrency(order.total_price || 0)}
                          </td>
                          <td className="p-4">
                            <div className="text-green-700 font-medium">
                              {formatCurrency(order.money || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              مانده:{" "}
                              {formatCurrency(
                                (order.total_price || 0) - (order.money || 0),
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                              جزئیات
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {offset.length > 10 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                      نمایش همه ({offset.length} سفارش)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "customers" && (
        <div className="mb-8">
          <TopCustomersChart
            customers={sampleCustomers}
            title="۱۰ مشتری برتر از نظر تعداد سفارش"
            limit={10}
          />
        </div>
      )}

      {activeTab === "charts" && (
        <div className="space-y-8">
          {/* Chart Grid 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PrintCopyComparisonChart
              digitalData={stats.digital}
              offsetData={stats.offset}
              title="مقایسه سفارشات چاپ و کاپی"
            />

            <OrdersDistributionChart
              digitalCount={stats.digital.total}
              offsetCount={stats.offset.total}
              title="توزیع سفارشات بر اساس نوع"
            />
          </div>

          {/* Chart Grid 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderStatusChart stats={stats} title="وضعیت سفارشات بر اساس نوع" />

            <OrdersTrendChart
              dailyStats={dailySampleData}
              title="روند سفارشات در ۷ روز گذشته"
            />
          </div>

          {/* Chart Grid 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueComparisonChart
              digitalRevenue={stats.digital.totalValue}
              offsetRevenue={stats.offset.totalValue}
              title="مقایسه درآمد چاپ و کاپی (فرضی)"
            />
          </div>
        </div>
      )}

      {/* Warehouse Statistics */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-cyan-600" />
            آمار سفارشات چاپ
          </h4>
          <div className="space-y-4">
            {[
              {
                label: "در انتظار چاپ",
                value: stats.digital.pendingPrint,
                color: "text-yellow-600",
                bgColor: "bg-yellow-50",
              },
              {
                label: "چاپ شده",
                value: stats.digital.completedPrint,
                color: "text-green-600",
                bgColor: "bg-green-50",
              },
              {
                label: "در انتظار پالت",
                value: stats.digital.pendingPalet,
                color: "text-blue-600",
                bgColor: "bg-blue-50",
              },
              {
                label: "تحویل داده شده",
                value: stats.digital.deliveredPalet,
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <span className={`font-medium ${item.color}`}>
                  {formatNumber(item.value)} سفارش
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="text-purple-600" />
            آمار سفارشات کاپی
          </h4>
          <div className="space-y-4">
            {[
              {
                label: "در انتظار چاپ",
                value: stats.offset.pendingPrint,
                color: "text-yellow-600",
                bgColor: "bg-yellow-50",
              },
              {
                label: "چاپ شده",
                value: stats.offset.completedPrint,
                color: "text-green-600",
                bgColor: "bg-green-50",
              },
              {
                label: "ارزش کل سفارشات",
                value: stats.offset.totalValue,
                color: "text-cyan-600",
                bgColor: "bg-cyan-50",
                isCurrency: true,
              },
              {
                label: "درصد تکمیل",
                value:
                  stats.offset.total > 0
                    ? (
                        (stats.offset.completedPrint / stats.offset.total) *
                        100
                      ).toFixed(1)
                    : 0,
                color: "text-purple-600",
                bgColor: "bg-purple-50",
                isPercent: true,
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <span className={`font-medium ${item.color}`}>
                  {item.isCurrency
                    ? formatCurrency(item.value)
                    : item.isPercent
                      ? `${item.value}%`
                      : `${formatNumber(item.value)} سفارش`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseReport;
