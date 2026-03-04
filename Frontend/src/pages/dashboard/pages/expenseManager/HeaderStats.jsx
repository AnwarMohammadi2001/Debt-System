import React from "react";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  TagIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const HeaderStats = ({
  totalExpenses,
  monthlyTotal,
  categoriesCount,
  filteredExpensesCount,
  activeTab,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">مجموع مصارف</p>
            <p className=" font-bold text-gray-900 mt-1">
              {totalExpenses.toLocaleString()} افغانی
            </p>
          </div>
          <CurrencyDollarIcon className="h-10 w-10 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">مصارف این ماه</p>
            <p className=" font-bold text-gray-900 mt-1">
              {monthlyTotal.toLocaleString()} افغانی
            </p>
          </div>
          <ChartBarIcon className="h-10 w-10 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">کتگوری‌ها</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {categoriesCount}
            </p>
          </div>
          <TagIcon className="h-10 w-10 text-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {activeTab === "expense-list" ? "مصارف فیلتر شده" : "کل مصارف"}
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {filteredExpensesCount}
            </p>
          </div>
          <ListBulletIcon className="h-10 w-10 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default HeaderStats;
