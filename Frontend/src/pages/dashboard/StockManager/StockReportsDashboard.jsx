// components/dashboard/StockReportsDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  RadialLinearScale,
} from "chart.js";
import { Pie, Bar, Line, Doughnut, Radar } from "react-chartjs-2";
import {
  getDashboardSummary,
  getStockChartsData,
  getLowStockReport,
  getStockValueReport,
  getUsageReport,
  getAllPrintStocks,
  getAllCopyStocks,
} from "../services/stockReportsService";
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartPieIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// ثبت کامپوننت‌های Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  RadialLinearScale,
);

// تابع فرمت‌کردن اعداد فارسی
const formatNumber = (num) => {
  return new Intl.NumberFormat("fa-IR").format(num || 0);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// کامپوننت کارت خلاصه
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-lg p-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {trend.direction === "up" ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${colorClasses[color] || "bg-gray-100 text-gray-600"}`}
        >
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

// کامپوننت نمودار دایره‌ای
const CategoryDistributionChart = ({ data }) => {
  if (!data?.categoryDistribution) return null;

  const chartData = {
    labels: data.categoryDistribution.map(
      (item) => item.label || item.category,
    ),
    datasets: [
      {
        data: data.categoryDistribution.map((item) => item.value || 0),
        backgroundColor: [
          "#3B82F6", // blue-500
          "#10B981", // green-500
          "#EF4444", // red-500
          "#F59E0B", // yellow-500
          "#8B5CF6", // purple-500
          "#EC4899", // pink-500
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-md  shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          توزیع ارزش بر اساس دسته‌بندی
        </h3>
        <ChartPieIcon className="h-6 w-6 text-blue-500" />
      </div>
      <div className="h-64 flex flex-col justify-center items-center">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// کامپوننت نمودار میله‌ای
const StockValueChart = ({ data }) => {
  if (!data?.stockValues) return null;

  const chartData = {
    labels: ["گدام چاپ", "گدام کاپی"],
    datasets: [
      {
        label: "ارزش (افغانی)",
        data: [data.stockValues.print || 0, data.stockValues.copy || 0],
        backgroundColor: ["#3B82F6", "#10B981"],
        borderColor: ["#2563EB", "#059669"],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-md shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">ارزش هر گدام</h3>
        <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// کامپوننت جدول کالاهای کم موجودی
const LowStockTable = ({ data }) => {
  if (!data?.items || data.items.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-green-700 font-semibold">
          همه کالاها موجودی مناسبی دارند
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "تمام شده":
        return "bg-red-100 text-red-800";
      case "کمبود شدید":
        return "bg-orange-100 text-orange-800";
      case "کمبود":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    return type === "چاپ"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              کالاهای کم موجودی
            </h3>
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
              {data.totalLowStockItems || 0} مورد
            </span>
          </div>
          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
            {data.outOfStock || 0} مورد تمام شده
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                نوع
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                شرح کالا
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                موجودی فعلی
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                واحد
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                حداقل
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                وضعیت
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.items.map((item, index) => (
              <tr
                key={index}
                className={
                  item.status === "تمام شده"
                    ? "bg-red-50"
                    : item.status === "کمبود شدید"
                      ? "bg-orange-50"
                      : ""
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-bold ${item.currentQuantity === 0 ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {formatNumber(item.currentQuantity)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(item.threshold)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {item.status === "تمام شده" && (
                      <XCircleIcon className="h-3 w-3 ml-1" />
                    )}
                    {item.status === "کمبود شدید" && (
                      <ExclamationTriangleIcon className="h-3 w-3 ml-1" />
                    )}
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// کامپوننت نمودار رادار برای سایزها
const SizeRadarChart = ({ data }) => {
  if (!data?.sizeDistribution || data.sizeDistribution.length === 0)
    return null;

  const chartData = {
    labels: data.sizeDistribution.map((item) => item.size),
    datasets: [
      {
        label: "مقدار چاپ",
        data: data.sizeDistribution.map((item) => item.printQuantity || 0),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3B82F6",
        borderWidth: 2,
      },
      {
        label: "مقدار کاپی",
        data: data.sizeDistribution.map((item) => item.copyQuantity || 0),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10B981",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        rtl: true,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-md  shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          توزیع موجودی بر اساس سایز
        </h3>
        <ChartBarIcon className="h-6 w-6 text-indigo-500" />
      </div>
      <div className="h-64 flex justify-center items-center">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

// کامپوننت نمودار خطی برای روند ارزش
const ValueTrendChart = ({ data }) => {
  if (!data?.topValuableItems || data.topValuableItems.length === 0)
    return null;

  const sortedItems = [...data.topValuableItems]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const chartData = {
    labels: sortedItems.map(
      (item) => item.description.substring(0, 20) + "...",
    ),
    datasets: [
      {
        label: "ارزش (افغانی)",
        data: sortedItems.map((item) => item.totalValue),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-md shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          روند ارزش کالاهای برتر
        </h3>
        <ArrowTrendingUpIcon className="h-6 w-6 text-purple-500" />
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// کامپوننت اصلی دشبورد
const StockReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [lowStockData, setLowStockData] = useState(null);
  const [valueData, setValueData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [printStocks, setPrintStocks] = useState([]);
  const [copyStocks, setCopyStocks] = useState([]);
  const [error, setError] = useState(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboard,
        charts,
        lowStock,
        valueReport,
        usageReport,
        prints,
        copies,
      ] = await Promise.all([
        getDashboardSummary(),
        getStockChartsData(),
        getLowStockReport(),
        getStockValueReport(),
        getUsageReport(),
        getAllPrintStocks(),
        getAllCopyStocks(),
      ]);

      setDashboardData(dashboard);
      setChartsData(charts);
      setLowStockData(lowStock);
      setValueData(valueReport);
      setUsageData(usageReport);
      setPrintStocks(prints);
      setCopyStocks(copies);
    } catch (err) {
      console.error("Error loading stock data:", err);
      setError("خطا در بارگذاری داده‌های گدام. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRefresh = () => {
    loadAllData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">
                گزارشات عمومی گدام
              </h1>
              <p className="text-gray-600 mt-2">
                نمای کلی از وضعیت گدام‌های چاپ و کاپی
              </p>
            </div>
          </div>

          {/* تب‌های ناوبری */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-x-8 space-x-reverse">
              {[
                "dashboard",
                "low-stock",
                "value",
                "usage",
                "print",
                "copy",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-sky-700 text-sky-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "dashboard" && "دشبورد"}
                  {tab === "low-stock" && "کمبود موجودی"}
                  {tab === "value" && "ارزش گدام"}
                  {tab === "usage" && "گزارش مصرف"}
                  {tab === "print" && "گدام چاپ"}
                  {tab === "copy" && "گدام کاپی"}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* پیام خطا */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400 ml-2" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* محتوای تب دشبورد */}
        {activeTab === "dashboard" && (
          <>
            {/* کارت‌های خلاصه */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="کل ارزش گدام"
                value={dashboardData?.overview?.totalValue || 0}
                icon={CurrencyDollarIcon}
                color="green"
                subtitle={formatCurrency(
                  dashboardData?.overview?.totalValue || 0,
                )}
                isLoading={loading}
              />

              <StatCard
                title="تعداد کل کالاها"
                value={dashboardData?.overview?.totalItems || 0}
                icon={CubeIcon}
                color="blue"
                subtitle={`${dashboardData?.printStock?.totalCategories || 0} دسته‌بندی`}
                isLoading={loading}
              />

              <StatCard
                title="ارزش گدام چاپ"
                value={dashboardData?.overview?.printStockValue || 0}
                icon={PrinterIcon}
                color="indigo"
                subtitle={formatCurrency(
                  dashboardData?.overview?.printStockValue || 0,
                )}
                isLoading={loading}
              />

              <StatCard
                title="ارزش گدام کاپی"
                value={dashboardData?.overview?.copyStockValue || 0}
                icon={DocumentDuplicateIcon}
                color="purple"
                subtitle={formatCurrency(
                  dashboardData?.overview?.copyStockValue || 0,
                )}
                isLoading={loading}
              />
            </div>

            {/* کارت‌های وضعیت */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="کالاهای تمام شده"
                value={
                  dashboardData?.printStock?.outOfStock +
                    dashboardData?.copyStock?.outOfStock || 0
                }
                icon={XCircleIcon}
                color="red"
                isLoading={loading}
              />

              <StatCard
                title="کالاهای کم موجودی"
                value={
                  dashboardData?.printStock?.lowStock +
                    dashboardData?.copyStock?.lowStock || 0
                }
                icon={ExclamationTriangleIcon}
                color="yellow"
                isLoading={loading}
              />

              <StatCard
                title="انواع سایزها"
                value={
                  dashboardData?.printStock?.totalSizes +
                    dashboardData?.copyStock?.totalSizes || 0
                }
                icon={DocumentChartBarIcon}
                color="blue"
                isLoading={loading}
              />

              <StatCard
                title="دسته‌بندی‌ها"
                value={dashboardData?.printStock?.totalCategories || 0}
                icon={FunnelIcon}
                color="purple"
                isLoading={loading}
              />
            </div>

            {/* نمودارها */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CategoryDistributionChart data={chartsData} />
              <StockValueChart data={chartsData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SizeRadarChart data={chartsData} />
              <ValueTrendChart data={chartsData} />
            </div>

            {/* جدول کالاهای کم موجودی */}
            <div className="mb-8">
              <LowStockTable data={lowStockData} />
            </div>

            {/* جدول کالاهای با ارزش بالا */}
            {chartsData?.topValuableItems &&
              chartsData.topValuableItems.length > 0 && (
                <div className="bg-white rounded-md shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      اجناس با ارزش بالا
                    </h3>
                    <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            رتبه
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            کالا
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نوع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            مقدار
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ارزش کل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            درصد از کل
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chartsData.topValuableItems
                          .slice(0, 10)
                          .map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    item.type === "چاپ"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(item.quantity)} واحد
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {formatCurrency(item.totalValue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-green-600 h-2.5 rounded-full"
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 mr-2">
                                    {item.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </>
        )}

        {/* تب کمبود موجودی */}
        {activeTab === "low-stock" && (
          <div className="space-y-6">
            <LowStockTable data={lowStockData} />

            {/* کارت‌های خلاصه کمبود */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <XCircleIcon className="h-8 w-8 text-red-500 ml-3" />
                  <div>
                    <p className="text-sm text-red-600">کالاهای تمام شده</p>
                    <p className="text-2xl font-bold text-red-700">
                      {lowStockData?.outOfStock || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 ml-3" />
                  <div>
                    <p className="text-sm text-orange-600">کمبود شدید</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {lowStockData?.items?.filter(
                        (item) => item.status === "کمبود شدید",
                      ).length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 ml-3" />
                  <div>
                    <p className="text-sm text-yellow-600">کمبود</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {lowStockData?.items?.filter(
                        (item) => item.status === "کمبود",
                      ).length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تب ارزش گدام */}
        {activeTab === "value" && valueData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                className="bg-white lg:col-span-2 rounded-md
               shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  خلاصه ارزش
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">کل ارزش:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(valueData.totalValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ارزش گدام چاپ:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(valueData.printValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ارزش گدام کاپی:</span>
                    <span className="text-lg font-semibold text-purple-600">
                      {formatCurrency(valueData.copyValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">میانگین ارزش هر کالا:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {formatCurrency(valueData.averageValuePerItem)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md shadow-lg p-6 ">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  توزیع ارزش بر اساس دسته‌بندی
                </h3>
                <div className="space-y-3">
                  {valueData.valueByCategory &&
                    Object.entries(valueData.valueByCategory).map(
                      ([category, value]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {category === "offset"
                                ? "افست"
                                : category === "atpaper"
                                  ? "آرت پیپر"
                                  : category === "kak"
                                    ? "کاک"
                                    : category === "bleach_card"
                                      ? "بلیچ کارت"
                                      : category}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(value)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(value / valueData.totalValue) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تب گزارش مصرف */}
        {activeTab === "usage" && usageData && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                کالاهای پر مصرف
              </h3>
              <div className="space-y-4">
                {usageData.mostUsedItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold ml-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.estimatedUsage}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">موجودی فعلی</p>
                      <p className="font-bold text-gray-900">
                        {formatNumber(item.currentStock)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تب گدام چاپ */}
        {activeTab === "print" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <PrinterIcon className="h-6 w-6 text-blue-500 ml-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    موجودی گدام چاپ
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        دسته
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نوع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سایز
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        مقدار
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        واحد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        قیمت واحد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ارزش کل
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {printStocks.slice(0, 20).map((stock, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {stock.itemCategory === "offset"
                              ? "افست"
                              : stock.itemCategory === "atpaper"
                                ? "آرت پیپر"
                                : stock.itemCategory === "kak"
                                  ? "کاک"
                                  : stock.itemCategory === "bleach_card"
                                    ? "بلیچ کارت"
                                    : stock.itemCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.itemType} گرم
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              stock.quantity > 100
                                ? "bg-green-100 text-green-800"
                                : stock.quantity > 50
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formatNumber(stock.quantity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(stock.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(stock.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* تب گدام کاپی */}
        {activeTab === "copy" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <DocumentDuplicateIcon className="h-6 w-6 text-purple-500 ml-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    موجودی گدام کاپی
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سایز
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تعداد کارتن
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        قیمت هر کارتن
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ارزش کل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        وضعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {copyStocks.slice(0, 20).map((stock, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              stock.cartonCount > 20
                                ? "bg-green-100 text-green-800"
                                : stock.cartonCount > 10
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {formatNumber(stock.cartonCount)} کارتن
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(stock.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(stock.totalValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stock.cartonCount === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircleIcon className="h-3 w-3 ml-1" />
                              تمام شده
                            </span>
                          ) : stock.cartonCount < 5 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ExclamationTriangleIcon className="h-3 w-3 ml-1" />
                              کمبود
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 ml-1" />
                              کافی
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* فوتر اطلاعات */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-4 w-4 ml-1" />
              <span>
                آخرین بروزرسانی: {new Date().toLocaleDateString("fa-IR")}
              </span>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-gray-400">
                سیستم مدیریت گدام چاپ و کاپی
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReportsDashboard;
