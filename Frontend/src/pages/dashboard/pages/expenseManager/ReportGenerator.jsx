import React, { useState } from "react";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  getCurrentMonth,
  getCurrentYear,
  formatDateForAPI,
} from "../../services/expenseService";

const ReportGenerator = ({ onGenerateReport, report, loading }) => {
  const [reportType, setReportType] = useState("daily");
  const [customDates, setCustomDates] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [monthlyParams, setMonthlyParams] = useState({
    year: getCurrentYear(),
    month: getCurrentMonth(),
  });

  const handleGenerate = () => {
    let params = {};
    switch (reportType) {
      case "daily":
        params = { date: formatDateForAPI(new Date()) };
        break;
      case "monthly":
        params = monthlyParams;
        break;
      case "custom":
        params = {
          startDate: formatDateForAPI(customDates.startDate),
          endDate: formatDateForAPI(customDates.endDate),
        };
        break;
      default:
        return;
    }

    onGenerateReport(reportType, params);
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    // Reset dates if switching to daily or custom
    if (type === "custom" || type === "daily") {
      const today = formatDateForAPI(new Date());
      setCustomDates({ startDate: today, endDate: today });
    }
  };

  const renderReportTypeForm = () => {
    switch (reportType) {
      case "daily":
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              انتخاب تاریخ
            </label>
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) =>
                setCustomDates({ ...customDates, startDate: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        );
      case "monthly":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سال
              </label>
              <input
                type="number"
                value={monthlyParams.year}
                onChange={(e) =>
                  setMonthlyParams({
                    ...monthlyParams,
                    year: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ماه
              </label>
              <select
                value={monthlyParams.month}
                onChange={(e) =>
                  setMonthlyParams({
                    ...monthlyParams,
                    month: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    ماه {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case "custom":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ شروع
              </label>
              <input
                type="date"
                value={customDates.startDate}
                onChange={(e) =>
                  setCustomDates({ ...customDates, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ پایان
              </label>
              <input
                type="date"
                value={customDates.endDate}
                onChange={(e) =>
                  setCustomDates({ ...customDates, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderReportContent = () => {
    if (!report) return null;

    return (
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-600">مجموع مبلغ</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary?.totalAmount?.toLocaleString() || 0} افغانی
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-600">تعداد مصارف</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary?.count || report.expenses?.length || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-purple-600">میانگین</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary?.averageAmount?.toFixed(2) || 0} افغانی
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <p className="text-sm text-yellow-600">بیشترین مصرف</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary?.maxAmount?.toLocaleString() || 0} افغانی
            </p>
          </div>
        </div>

        {report.categoryBreakdown && report.categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">
              توزیع بر اساس کتگوری
            </h4>
            <div className="space-y-3">
              {report.categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {item.ExpenseCategory?.name || "بدون کتگوری"}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {item.total?.toLocaleString()} افغانی
                    </span>
                    <span className="text-sm text-gray-500">
                      ({item.count} مورد)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-semibold text-gray-900">گزارشات مصارف</h2>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          نوع گزارش
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: "daily", label: "روزانه", icon: "📅" },
            { id: "monthly", label: "ماهانه", icon: "📊" },
            { id: "custom", label: "سفارشی", icon: "⚙️" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleReportTypeChange(type.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                reportType === type.id
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl mb-2">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Parameters */}
      {renderReportTypeForm()}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            در حال تولید گزارش...
          </>
        ) : (
          <>
            <DocumentChartBarIcon className="h-5 w-5" />
            تولید گزارش
          </>
        )}
      </button>

      {/* Report Results */}
      {renderReportContent()}
    </div>
  );
};

export default ReportGenerator;
