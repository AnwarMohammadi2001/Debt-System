import React from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const QuickStats = ({ expenses, categories, totalExpenses, statistics }) => {
  // Calculate most used category
  const categoryUsage = expenses.reduce((acc, exp) => {
    const categoryName = exp.ExpenseCategory?.name || "بدون کتگوری";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const mostUsedCategory = Object.entries(categoryUsage).reduce(
    (max, [name, count]) => (count > max.count ? { name, count } : max),
    { name: "بدون کتگوری", count: 0 },
  );

  // Calculate payment method distribution
  const paymentDistribution = expenses.reduce((acc, exp) => {
    acc[exp.paymentType] = (acc[exp.paymentType] || 0) + 1;
    return acc;
  }, {});

  const mostUsedPayment = Object.entries(paymentDistribution).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: "cash", count: 0 },
  );

  // Calculate average daily expense
  const dailyAverage = expenses.length > 0 ? totalExpenses / 30 : 0;

  // Find highest expense
  const highestExpense = expenses.reduce(
    (max, exp) =>
      parseFloat(exp.amount || 0) > parseFloat(max.amount || 0) ? exp : max,
    { amount: 0 },
  );

  return (
    <div className="bg-white rounded-md  shadow-sm w-full border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">آمار سریع</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">میانگین روزانه</span>
          </div>
          <span className="font-semibold text-gray-900">
            {dailyAverage.toFixed(2)} افغانی
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700">پراستفاده‌ترین کتگوری</span>
          </div>
          <div className="text-right">
            <span className="block font-semibold text-gray-900">
              {mostUsedCategory.name}
            </span>
            <span className="text-xs text-gray-500">
              {mostUsedCategory.count} بار
            </span>
          </div>
        </div>


        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-gray-700">بیشترین مصرف</span>
          </div>
          <div className="text-right">
            <span className="block font-semibold text-gray-900">
              {parseFloat(highestExpense.amount || 0).toLocaleString()} افغانی
            </span>
            {highestExpense.description && (
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {highestExpense.description}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default QuickStats;
