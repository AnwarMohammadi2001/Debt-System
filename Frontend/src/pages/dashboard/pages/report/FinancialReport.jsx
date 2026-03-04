// components/dashboard/reports/FinancialReport.jsx
import React, { useState, useEffect } from "react";
import {
  FaFilter,
  FaCalendarAlt,
  FaDownload,
  FaChartBar,
  FaUsers,
  FaBox,
  FaMoneyBillWave,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  reportService,
  formatCurrency,
  formatNumber,
  formatDate,
} from "../../services/reportService";

const FinancialReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];

      const response = await reportService.getCompleteFinancialReport(params);
      if (response.success) {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      setError("خطا در دریافت گزارش مالی");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    // Export functionality
    console.log("Exporting report...");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const {
    revenue,
    orders,
    customers,
    sellers,
    expenses,
    warehouse,
    financialSummary,
  } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartBar className="text-cyan-600" />
            گزارش جامع مالی
          </h2>
          <p className="text-gray-600 mt-1">
            {data.timeRange.hasTimeRange
              ? `بازه زمانی: ${formatDate(data.timeRange.startDate)} تا ${formatDate(data.timeRange.endDate)}`
              : "گزارش کلی سیستم"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            <FaFilter />
            فیلتر
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white"
          >
            <FaDownload />
            خروجی
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                از تاریخ
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholderText="انتخاب تاریخ شروع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تا تاریخ
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholderText="انتخاب تاریخ پایان"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchData}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg"
              >
                اعمال فیلتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-md p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">کل عایدات</h3>
            <FaMoneyBillWave className="text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-cyan-700 mb-2">
            {formatCurrency(revenue.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            درآمد خالص: {formatCurrency(revenue.netIncome)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-md p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">دریافتی‌ها</h3>
            <FaMoneyBillWave className="text-green-600" />
          </div>
          <div className="text-lg font-bold text-green-700 mb-2">
            {formatCurrency(revenue.totalReceived)}
          </div>
          <div className="text-sm text-gray-600">
            باقیمانده: {formatCurrency(revenue.totalPending)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-md p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">میانگین سفارش</h3>
            <FaChartBar className="text-purple-600" />
          </div>
          <div className="text-lg font-bold text-purple-700 mb-2">
            {formatCurrency(revenue.averageOrderValue)}
          </div>
          <div className="text-sm text-gray-600">
            تعداد سفارشات: {formatNumber(orders.totalOrders)}
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            آمار سفارشات
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-600">نرخ تحویل:</span>
              <span className="font-bold text-blue-700">
                {orders.deliveryRate}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {formatNumber(orders.deliveredOrders)}
                </div>
                <div className="text-blue-600 text-sm">تحویل شده</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {formatNumber(orders.pendingOrders)}
                </div>
                <div className="text-orange-600 text-sm">در انتظار</div>
              </div>
            </div>

            {/* Digital vs Offset */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">
                تفکیک نوع سفارش
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>دیجیتال</span>
                    <span>{formatCurrency(orders.digital.totalPrice)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(orders.digital.totalOrders / orders.totalOrders) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>افست</span>
                    <span>{formatCurrency(orders.offset.totalPrice)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(orders.offset.totalOrders / orders.totalOrders) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar className="text-green-600" />
            معیارهای مالی
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "کل دارایی‌ها",
                value: financialSummary.totalAssets,
                color: "text-green-700",
              },
              {
                label: "کل بدهی‌ها",
                value: financialSummary.totalLiabilities,
                color: "text-red-700",
              },
              {
                label: "سرمایه در گردش",
                value: financialSummary.workingCapital,
                color: "text-blue-700",
              },
              {
                label: "حاشیه سود",
                value: `${financialSummary.profitMargin}%`,
                color: "text-purple-700",
              },
              {
                label: "نسبت مصارف به درآمد",
                value: `${expenses.expenseToRevenueRatio}%`,
                color: "text-orange-700",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center pb-3 border-b border-gray-100"
              >
                <span className="text-gray-600">{item.label}:</span>
                <span className={`font-bold ${item.color}`}>
                  {typeof item.value === "number"
                    ? formatCurrency(item.value)
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer and Seller Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUsers className="text-indigo-600" />
            وضعیت مشتریان
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-xl font-bold text-indigo-700">
                  {formatNumber(customers.totalCustomers)}
                </div>
                <div className="text-indigo-600 text-sm">کل مشتریان</div>
              </div>

              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <div className="text-xl font-bold text-cyan-700">
                  {formatCurrency(customers.totalBalance)}
                </div>
                <div className="text-cyan-600 text-sm">موجودی کل</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>مشتریان بدهکار:</span>
                <span className="font-medium">
                  {customers.customersWithDebt} نفر
                </span>
              </div>
              <div className="flex justify-between">
                <span>مشتریان طلبکار:</span>
                <span className="font-medium">
                  {customers.customersWithCredit} نفر
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBox className="text-amber-600" />
            وضعیت گدام
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-700">
                  {formatNumber(warehouse.digital.total)}
                </div>
                <div className="text-amber-600 text-sm">سفارشات دیجیتال</div>
              </div>

              <div className="text-center p-3 bg-rose-50 rounded-lg">
                <div className="text-xl font-bold text-rose-700">
                  {formatNumber(warehouse.offset.total)}
                </div>
                <div className="text-rose-600 text-sm">سفارشات افست</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>در انتظار چاپ:</span>
                <span className="font-medium">
                  {warehouse.digital.pendingPrint +
                    warehouse.offset.pendingPrint}{" "}
                  سفارش
                </span>
              </div>
              <div className="flex justify-between">
                <span>چاپ شده:</span>
                <span className="font-medium">
                  {warehouse.digital.completedPrint +
                    warehouse.offset.completedPrint}{" "}
                  سفارش
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
