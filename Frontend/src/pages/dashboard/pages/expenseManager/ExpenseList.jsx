import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/green.css";
import {
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const ExpenseList = ({
  expenses,
  categories,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onUpdateExpense,
  onDeleteExpense,
  pagination,
}) => {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to convert Persian date to Gregorian
  const convertPersianToGregorian = (dateObject) => {
    if (!dateObject) return "";

    try {
      // If it's a Date object from react-multi-date-picker
      if (dateObject && dateObject.toDate) {
        const gregorianDate = dateObject.toDate();
        const year = gregorianDate.getFullYear();
        const month = String(gregorianDate.getMonth() + 1).padStart(2, "0");
        const day = String(gregorianDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      // If it's a regular Date object
      if (dateObject instanceof Date) {
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0");
        const day = String(dateObject.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error("Error converting date:", error);
    }

    return "";
  };

  // Helper function to convert Gregorian to Persian Date object
  const convertGregorianToPersianDate = (gregorianDateStr) => {
    if (!gregorianDateStr) return null;

    try {
      const [year, month, day] = gregorianDateStr.split("-").map(Number);
      // Create a date object that react-multi-date-picker can understand
      // We need to create a Date object and then let the picker handle the conversion
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error("Error converting to Persian date:", error);
      return null;
    }
  };

  // Initialize date states from filters
  const [shamsiStartDate, setShamsiStartDate] = useState(
    filters.startDate ? convertGregorianToPersianDate(filters.startDate) : null,
  );

  const [shamsiEndDate, setShamsiEndDate] = useState(
    filters.endDate ? convertGregorianToPersianDate(filters.endDate) : null,
  );

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "بدون کتگوری";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "بدون کتگوری";
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return "bg-gray-100 text-gray-800";

    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];

    const index = category.name.length % colors.length;
    return colors[index];
  };

  // Payment type labels
  const paymentTypeLabels = {
    cash: { label: "نقدی", color: "bg-green-100 text-green-800" },
    card: { label: "کارت", color: "bg-blue-100 text-blue-800" },
    transfer: { label: "حواله", color: "bg-purple-100 text-purple-800" },
  };

  // Format date to Shamsi for display
  const formatToShamsi = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return formatToShamsi(dateString);
  };

  // Handle filter input change (for non-date fields)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  // Handle Shamsi start date change
  const handleShamsiStartDateChange = (date) => {
    setShamsiStartDate(date);
    // Convert to Gregorian for API (YYYY-MM-DD format)
    const gregorianDate = date ? convertPersianToGregorian(date) : "";
    onFilterChange({ startDate: gregorianDate });
  };

  // Handle Shamsi end date change
  const handleShamsiEndDateChange = (date) => {
    setShamsiEndDate(date);
    // Convert to Gregorian for API (YYYY-MM-DD format)
    const gregorianDate = date ? convertPersianToGregorian(date) : "";
    onFilterChange({ endDate: gregorianDate });
  };

  // Reset filters
  const handleResetFilters = () => {
    setShamsiStartDate(null);
    setShamsiEndDate(null);
    onResetFilters();
  };

  // View expense details
  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetails(true);
  };

  // Delete expense with confirmation
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("آیا از حذف این مصرف مطمئن هستید؟")) {
      await onDeleteExpense(expenseId);
    }
  };

  // Export to CSV with Shamsi dates
  const handleExportCSV = () => {
    const headers = ["تاریخ (شمسی)", "مبلغ", "کتگوری", "روش پرداخت", "توضیحات"];
    const csvContent = [
      headers.join(","),
      ...expenses.map((exp) =>
        [
          formatToShamsi(exp.expenseDate),
          exp.amount,
          getCategoryName(exp.categoryId),
          paymentTypeLabels[exp.paymentType]?.label || exp.paymentType,
          `"${exp.description || ""}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `expenses-${new Date().toLocaleDateString("fa-IR").replace(/\//g, "-")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                لیست مصارف
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                نمایش و مدیریت تمام مصارف ثبت شده
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              فیلترها
              {(filters.categoryId ||
                filters.search ||
                filters.startDate ||
                filters.endDate ||
                filters.minAmount ||
                filters.maxAmount) && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              خروجی CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                جستجو در توضیحات
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search || ""}
                  onChange={handleInputChange}
                  placeholder="جستجو..."
                  className="w-full px-4 py-2 pr-10 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کتگوری
              </label>
              <select
                name="categoryId"
                value={filters.categoryId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
              >
                <option value="">همه کتگوری‌ها</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shamsi Start Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ شروع (شمسی)
              </label>
              <DatePicker
                value={shamsiStartDate}
                onChange={handleShamsiStartDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ شروع"
                className="green"
                inputClass="w-full px-4 py-2 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
                containerClassName="w-full"
                format="YYYY/MM/DD"
                monthYearSeparator=" "
              />
            </div>

            {/* Shamsi End Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ پایان (شمسی)
              </label>
              <DatePicker
                value={shamsiEndDate}
                onChange={handleShamsiEndDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                placeholder="انتخاب تاریخ پایان"
                className="green"
                inputClass="w-full px-4 py-2 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
                containerClassName="w-full"
                format="YYYY/MM/DD"
                monthYearSeparator=" "
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداقل مبلغ
              </label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount || ""}
                onChange={handleInputChange}
                placeholder="۰"
                className="w-full px-4 py-2 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداکثر مبلغ
              </label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount || ""}
                onChange={handleInputChange}
                placeholder="بدون محدودیت"
                className="w-full px-4 py-2 rounded-md bg-gray-200 focus:ring-1 focus:ring-cyan-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.values(filters).some((val) => val !== "") && (
                <span>فیلترها فعال هستند</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
              >
                پاک کردن فیلترها
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md hover:bg-gray-300 transition-colors"
              >
                بستن فیلترها
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">در حال بارگذاری مصارف...</p>
        </div>
      )}

      {/* Expenses Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  شماره
                </th>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  تاریخ (شمسی)
                </th>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  مبلغ
                </th>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  کتگوری
                </th>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  توضیحات
                </th>
                <th className="px-5 py-3 text-sm text-gray-700 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap">
                    {((pagination?.page || 1) - 1) *
                      (pagination?.pageSize || expenses.length) +
                      index +
                      1}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(expense.expenseDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <span className="font-medium text-gray-900">
                        {parseFloat(expense.amount || 0).toLocaleString()}{" "}
                        افغانی
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.categoryId)}`}
                    >
                      {getCategoryName(expense.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="max-w-xs truncate">
                      <span className="text-sm text-gray-900">
                        {expense.description || "بدون توضیحات"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(expense)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                <CurrencyDollarIcon className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                هیچ مصرفی یافت نشد
              </h3>
              <p className="text-gray-600">
                {Object.values(filters).some((val) => val !== "")
                  ? "هیچ مصرفی با فیلترهای انتخابی مطابقت ندارد"
                  : "هنوز هیچ مصرفی ثبت نشده است"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expense Details Modal */}
      {showDetails && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">جزئیات مصرف</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    مبلغ
                  </h4>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {parseFloat(selectedExpense.amount || 0).toLocaleString()}{" "}
                      افغانی
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      تاریخ (شمسی)
                    </h4>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(selectedExpense.expenseDate)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      کتگوری
                    </h4>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      <span>{getCategoryName(selectedExpense.categoryId)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      روش پرداخت
                    </h4>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CreditCardIcon className="h-4 w-4 text-gray-400" />
                      <span>
                        {paymentTypeLabels[selectedExpense.paymentType]
                          ?.label || selectedExpense.paymentType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      شماره رسید
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{selectedExpense.receiptNumber || "ندارد"}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    توضیحات
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {selectedExpense.description || "بدون توضیحات"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    onClick={() => {
                      handleDeleteExpense(selectedExpense.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    حذف
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
