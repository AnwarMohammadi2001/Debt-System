import React from "react";
import { CgNotes } from "react-icons/cg";
const BillSummary = ({ record }) => {
  return (
    <div className="">
      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-600 mb-2">
                بخش چاپ
              </p>
              <p className="text-2xl font-bold text-cyan-800">
                {record.total_money_digital}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            </div>
          </div>
          <p className="text-base text-gray-500 mt-2">افغانی</p>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-600 mb-2">
                بخش کاپی
              </p>
              <p className="text-2xl font-bold text-cyan-800">
                {record.total_money_offset}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            </div>
          </div>
          <p className="text-base text-gray-500 mt-2">افغانی</p>
        </div>

        <div className="bg-white rounded-md p-4  shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-600 mb-2">
                مجموع کل
              </p>
              <p className="text-2xl text-cyan-800 font-bold">{record.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            </div>
          </div>
          <p className="text-base text-gray-500 mt-2">افغانی</p>
        </div>
      </div> */}

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-md p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          جزئیات محاسبات
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">مجموع چاپ :</span>
            <span className="font-semibold text-blue-600">
              {record.total_money_digital} افغانی
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">مجموع  کاپی:</span>
            <span className="font-semibold text-green-600">
              {record.total_money_offset} افغانی
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-semibold">مبلغ نهایی:</span>
            <span className="text-xl font-bold text-gray-800">
              {record.total} افغانی
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
