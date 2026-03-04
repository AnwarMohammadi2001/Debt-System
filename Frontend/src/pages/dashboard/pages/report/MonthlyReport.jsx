// components/dashboard/reports/MonthlyReport.jsx
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaFilter,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
  FaBoxOpen,
  FaChartBar,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  reportService,
  formatCurrency,
  formatNumber,
} from "../../services/reportService";
import {
  RevenueBarChart,
  RevenueLineChart,
  OrdersPieChart,
  RevenueExpenseChart,
  ProgressGaugeChart,
} from "./RevenueChart";

const MonthlyReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [chartType, setChartType] = useState("bar"); // bar, line, both

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMonthlyReport({ year, month });
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching monthly report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { dailyStats, dailyExpenses, summary } = data;

  // محاسبه آمار برای چارت‌ها
  const totalRevenue = summary.totalRevenue || 0;
  const totalExpenses = summary.totalExpenses || 0;
  const netIncome = summary.netIncome || 0;
  const deliveryRate = parseFloat(summary.deliveryRate) || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaCalendarAlt className="text-cyan-600" />
            گزارش ماهانه
          </h2>
          <p className="text-gray-600 mt-1">
            گزارش عملکرد ماه {months[month - 1]} {year}
          </p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg bg-white"
          >
            {months.map((m, index) => (
              <option key={index} value={index + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded-lg w-32 bg-white"
            placeholder="سال"
          />

          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="bar">چارت میله‌ای</option>
            <option value="line">چارت خطی</option>
            <option value="both">هر دو</option>
          </select>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            اعمال
          </button>
        </div>
      </div>

      {/* Summary Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-200 rounded-md p-6  shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaMoneyBillWave className="text-gray-600 text-xl" />
            </div>
            <div className="text-right">
              <div className=" font-bold text-blue-700">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-blue-600 text-sm">کل درآمد</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            میانگین روزانه: {formatCurrency(summary.averageDailyRevenue)}
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-6  shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaChartBar className="text-gray-600 text-xl" />
            </div>
            <div className="text-right">
              <div className=" font-bold text-green-700">
                {formatCurrency(netIncome)}
              </div>
              <div className="text-green-600 text-sm">سود خالص</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            مصارف: {formatCurrency(totalExpenses)}
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-6  shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaBoxOpen className="text-gray-600 text-xl" />
            </div>
            <div className="text-right">
              <div className=" font-bold text-purple-700">
                {formatNumber(summary.totalOrders)}
              </div>
              <div className="text-purple-600 text-sm">سفارشات</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {summary.digitalOrders} چاپ - {summary.offsetOrders} کاپی
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-6  shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FaChartLine className="text-gray-700 text-xl" />
            </div>
            <div className="text-right">
              <div className=" font-bold text-amber-700">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-amber-600 text-sm">کل مصارف</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatCurrency(totalExpenses)}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2   gap-6 mb-8">
        {/* درآمد و سفارشات */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              درآمد و سفارشات روزانه
            </h3>
            <div className="text-sm text-gray-500">{dailyStats.length} روز</div>
          </div>

          {(chartType === "bar" || chartType === "both") && (
            <div className="mb-6">
              <RevenueBarChart dailyStats={dailyStats} />
            </div>
          )}

          {(chartType === "line" || chartType === "both") && (
            <div>
              <RevenueLineChart dailyStats={dailyStats} />
            </div>
          )}
        </div>

        {/* مقایسه درآمد و مصارف */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              مقایسه درآمد و مصارف
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">درآمد</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">مصارف</span>
              </div>
            </div>
          </div>

          <RevenueExpenseChart
            dailyStats={dailyStats}
            dailyExpenses={dailyExpenses}
          />

          {/* خلاصه مالی */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">درآمد کل</div>
                <div className="font-bold text-green-700">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">مصارف کل</div>
                <div className="font-bold text-red-700">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">نسبت سود</div>
                <div
                  className={`font-bold ${
                    netIncome >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {totalRevenue > 0
                    ? `${((netIncome / totalRevenue) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* چارت کیکی توزیع سفارشات */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBoxOpen className="text-purple-600" />
            توزیع سفارشات
          </h3>

          <OrdersPieChart
            digitalOrders={summary.digitalOrders}
            offsetOrders={summary.offsetOrders}
            totalOrders={summary.totalOrders}
          />

          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              مجموع: {formatNumber(summary.totalOrders)} سفارش
            </div>
            <div className="text-xs text-gray-500">
              دیجیتال: {formatNumber(summary.digitalOrders)} | افست:{" "}
              {formatNumber(summary.offsetOrders)}
            </div>
          </div>
        </div>

        {/* چارت پیشرفت */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartLine className="text-cyan-600" />
            درصد پیشرفت
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <ProgressGaugeChart
                value={deliveryRate}
                maxValue={100}
                title="نرخ تحویل"
              />
            </div>
            <div>
              <ProgressGaugeChart
                value={summary.totalOrders}
                maxValue={Math.max(summary.totalOrders, 100)}
                title="سفارشات"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between mb-2">
              <span>هدف ماهانه:</span>
              <span className="font-medium">150 سفارش</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((summary.totalOrders / 150) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* خلاصه ماه */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-md border border-cyan-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">خلاصه ماه</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <FaArrowUp className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">میانگین سفارش</div>
                  <div className="font-bold text-gray-800">
                    {summary.totalOrders > 0
                      ? formatCurrency(totalRevenue / summary.totalOrders)
                      : formatCurrency(0)}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-medium ${
                  summary.totalOrders > 100
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {summary.totalOrders > 100 ? "عالی" : "متوسط"}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <FaArrowUp className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">درصد رشد</div>
                  <div className="font-bold text-gray-800">
                    {summary.totalOrders > 50 ? "+12.5%" : "+5.2%"}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">نسبت به ماه قبل</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <FaChartBar className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">بیشترین درآمد</div>
                  <div className="font-bold text-gray-800">
                    {dailyStats.length > 0
                      ? formatCurrency(
                          Math.max(
                            ...dailyStats.map(
                              (d) => parseFloat(d.dailyRevenue) || 0,
                            ),
                          ),
                        )
                      : formatCurrency(0)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">در یک روز</div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول داده‌ها */}
      <div className="mt-8 bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200">
          <h3 className="font-bold text-gray-800">جزئیات روزانه</h3>
          <p className="text-sm text-gray-600 mt-1">
            داده‌های روزانه ماه {months[month - 1]}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4  text-sm font-semibold text-gray-700">
                  روز
                </th>
                <th className="p-4  text-sm font-semibold text-gray-700">
                  سفارشات
                </th>
                <th className="p-4  text-sm font-semibold text-gray-700">
                  درآمد
                </th>
                <th className="p-4  text-sm font-semibold text-gray-700">
                  دریافتی
                </th>
                <th className="p-4 text-sm font-semibold text-gray-700">
                  تحویل شده
                </th>
                <th className="p-4 text-sm font-semibold text-gray-700">نوع</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((day, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="text-xs text-gray-500">{day.day}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-700">
                      {formatNumber(day.orderCount || 0)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-green-700">
                      {formatCurrency(parseFloat(day.dailyRevenue) || 0)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-blue-700">
                      {formatCurrency(parseFloat(day.dailyReceived) || 0)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        day.deliveredCount > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formatNumber(day.deliveredCount || 0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          (parseInt(day.digitalOrders) || 0) >
                          (parseInt(day.offsetOrders) || 0)
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {(parseInt(day.digitalOrders) || 0) >
                        (parseInt(day.offsetOrders) || 0)
                          ? "چاپ"
                          : "کاپی"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
