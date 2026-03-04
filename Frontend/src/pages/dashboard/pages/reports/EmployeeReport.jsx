import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllEmployeesSafe,
  getEmployeeLoanHistory,
  formatMoney,
} from "../../services/EmployeesService";
import { FaSearch, FaUserTie, FaMoneyBillWave } from "react-icons/fa";

const EmployeeReport = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["allEmployees"],
    queryFn: getAllEmployeesSafe,
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ["employeeLoanHistory", selectedEmployee],
    queryFn: () => getEmployeeLoanHistory(selectedEmployee),
    enabled: !!selectedEmployee,
  });

  const filteredEmployees = employees?.filter(
    (emp) =>
      emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm),
  );

  const employeeData = history?.data;
  const statistics = employeeData?.statistics || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">گزارش کارمندان</h1>

      {/* Search and Select Employee */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              جستجوی کارمند
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="نام یا شماره تماس..."
                className="w-full p-2 pr-10 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              انتخاب کارمند
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">انتخاب کنید</option>
              {filteredEmployees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} - {emp.position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Statistics */}
      {selectedEmployee && employeeData && (
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserTie className="text-blue-600" />
              اطلاعات کارمند
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">نام</p>
                <p className="font-medium">{employeeData.employee?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">وظیفه</p>
                <p className="font-medium">{employeeData.employee?.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">شماره تماس</p>
                <p className="font-medium">{employeeData.employee?.phone}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">تعداد کل قرضه‌ها</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.totalLoans || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">قرضه‌های فعال</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statistics.activeLoans || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">مجموع قرضه‌ها</p>
              <p className="text-2xl font-bold text-green-600">
                {formatMoney(statistics.totalAmount)} AFN
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">مجموع پرداخت‌ها</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatMoney(statistics.totalPaid)} AFN
              </p>
            </div>
          </div>

          {/* Loans List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                لیست قرضه‌ها
              </h2>
            </div>
            <div className="p-4">
              {employeeData.loans?.length > 0 ? (
                <div className="space-y-4">
                  {employeeData.loans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              loan.status === "Active"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {loan.status === "Active" ? "فعال" : "تسویه شده"}
                          </span>
                          <p className="text-sm text-gray-600 mt-2">
                            تاریخ:{" "}
                            {new Date(loan.loanDate).toLocaleDateString(
                              "fa-AF",
                            )}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">مقدار قرضه</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatMoney(loan.amount)} AFN
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            باقی‌مانده:
                          </p>
                          <p
                            className={`font-medium ${
                              loan.remainingAmount > 0
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatMoney(loan.remainingAmount)} AFN
                          </p>
                        </div>
                      </div>

                      {/* Payments for this loan */}
                      {loan.LoanPayments?.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            پرداخت‌ها:
                          </p>
                          <div className="space-y-2">
                            {loan.LoanPayments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                              >
                                <span>
                                  {new Date(
                                    payment.paymentDate,
                                  ).toLocaleDateString("fa-AF")}
                                </span>
                                <span className="font-medium text-green-600">
                                  {formatMoney(payment.amount)} AFN
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  هیچ قرضه‌ای برای این کارمند یافت نشد
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeReport;
