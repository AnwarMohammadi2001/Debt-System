import React from "react";
import { CurrencyDollarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const RecentExpenses = ({ expenses, categories, onRefresh, loading }) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "بدون کتگوری";
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return "bg-gray-100 text-gray-800";

    // Generate color based on category name
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

  const paymentTypeLabels = {
    cash: { label: "نقدی", color: "bg-green-100 text-green-800" },
    card: { label: "کارت", color: "bg-blue-100 text-blue-800" },
    transfer: { label: "حواله", color: "bg-purple-100 text-purple-800" },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR");
  };

  return (
    <div className="bg-gray-50 rounded-md shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">مصارف اخیر</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{expenses.length} مورد</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="بروزرسانی"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {expenses.slice(0, 4).map((expense) => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {parseFloat(expense.amount || 0).toLocaleString()} افغانی
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {expense.description || "بدون توضیحات"}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">
                  {formatDate(expense.expenseDate)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {expense.ExpenseCategory?.name ||
                    getCategoryName(expense.categoryId)}
                </p>
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(expense.categoryId)}`}
                >
                  {expense.ExpenseCategory?.name ||
                    getCategoryName(expense.categoryId)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${paymentTypeLabels[expense.paymentType]?.color || "bg-gray-100 text-gray-800"}`}
                >
                  {paymentTypeLabels[expense.paymentType]?.label ||
                    expense.paymentType}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  ویرایش
                </button>
                <button className="text-xs text-red-600 hover:text-red-800">
                  حذف
                </button>
              </div>
            </div> */}
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          هیچ مصرفی ثبت نشده است
        </div>
      )}

      {expenses.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            مشاهده همه مصارف ({expenses.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
