// components/dashboard/reports/DebtsReport.jsx
import React, { useState, useEffect } from "react";
import {
  FaFileInvoiceDollar,
  FaUser,
  FaStore,
  FaArrowDown,
  FaArrowUp,
  FaSearch,
} from "react-icons/fa";
import {
  reportService,
  formatCurrency,
  formatNumber,
} from "../../services/reportService";

const DebtsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, customers, sellers

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDebtsAndCreditsReport();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching debts report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { customers, sellers, summary } = data;

  // Filter customers based on search
  const filteredCustomers = {
    debts: customers.debts.details.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm),
    ),
    credits: customers.credits.details.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm),
    ),
  };

  // Filter sellers based on search
  const filteredSellers = {
    debts: sellers.debts.details.filter(
      (seller) =>
        seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    credits: sellers.credits.details.filter(
      (seller) =>
        seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaFileInvoiceDollar className="text-amber-600" />
            گزارش مالی قرضداران و طلبکاران
          </h2>
          <p className="text-gray-600 mt-1">
            وضعیت مالی با مشتریان و فروشندگان
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام، شماره تماس..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="all">همه</option>
            <option value="customers">مشتریان</option>
            <option value="sellers">فروشندگان</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-200 rounded-md p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600">
                تمام قرضداری از فروشندگان
              </div>
              <div className="text-lg font-bold text-gray-700">
                {formatCurrency(summary.totalReceivable)}
              </div>
            </div>
            <FaArrowDown className="text-cyan-800 text-xl" />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {customers.debts.count + sellers.debts.count} فروشنده
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">کل طلب از ما</div>
              <div
                className="text-lg font-bold textg
              ray-700"
              >
                {formatCurrency(summary.totalPayable)}
              </div>
            </div>
            <FaArrowUp className="text-green-500 text-xl" />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {customers.credits.count + sellers.credits.count} نفر
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">موقعیت مالی خالص</div>
              <div
                className={`text-2xl font-bold ${
                  summary.netFinancialPosition >= 0
                    ? "text-gray-700"
                    : "text-amber-700"
                }`}
              >
                {formatCurrency(Math.abs(summary.netFinancialPosition))}
              </div>
            </div>
            {summary.netFinancialPosition >= 0 ? (
              <FaArrowDown className="text-blue-500 text-xl" />
            ) : (
              <FaArrowUp className="text-amber-500 text-xl" />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {summary.netFinancialPosition >= 0 ? "دارایی خالص" : "بدهی خالص"}
          </div>
        </div>

        <div className="bg-gray-200 rounded-md p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">تعداد کل طرف‌ها</div>
              <div className="text-2xl font-bold text-purple-700">
                {formatNumber(
                  customers.debts.count +
                    customers.credits.count +
                    sellers.debts.count +
                    sellers.credits.count,
                )}
              </div>
            </div>
            <FaUser className="text-purple-500 text-xl" />
          </div>
          <div className="text-xs text-gray-500 mt-2">مشتریان و فروشندگان</div>
        </div>
      </div>

      {/* Customers Section */}
      {(filterType === "all" || filterType === "customers") && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaUser className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-800">مشتریان</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Debts */}
            <div className="bg-white rounded-md border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="font-bold">مشتریان قرضدار</div>
                  <div>{formatCurrency(customers.debts.total)}</div>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredCustomers.debts.length > 0 ? (
                  filteredCustomers.debts.map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 mb-2 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {customer.name} 
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          نوع:{" "}
                          {customer.customerType === "print" ? "پرینت" : "کپی"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-700">
                          {formatCurrency(customer.currentBalance)}
                        </div>
                        <div className="text-xs text-red-600">بدهکار</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    هیچ مشتری بدهکاری یافت نشد
                  </div>
                )}
              </div>
            </div>

            {/* Customer Credits */}
            <div className="bg-white rounded-md border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="font-bold">مشتریان طلبکار</div>
                  <div>{formatCurrency(customers.credits.total)}</div>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredCustomers.credits.length > 0 ? (
                  filteredCustomers.credits.map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 mb-2 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {customer.name} 
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          نوع:{" "}
                          {customer.customerType === "print" ? "پرینت" : "کپی"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">
                          {formatCurrency(Math.abs(customer.currentBalance))}
                        </div>
                        <div className="text-xs text-green-600">طلبکار</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    هیچ مشتری طلبکاری یافت نشد
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Section */}
      {(filterType === "all" || filterType === "sellers") && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaStore className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">فروشندگان</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seller Debts */}
            <div className="bg-white rounded-md border border-amber-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="font-bold">فروشندگان طلبکار</div>
                  <div>{formatCurrency(sellers.debts.total)}</div>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredSellers.debts.length > 0 ? (
                  filteredSellers.debts.map((seller, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 mb-2 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {seller.name} 
                        </div>
                        <div className="text-sm text-gray-600">
                          {seller.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {seller.storeName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-700">
                          {formatCurrency(seller.currentBalance)}
                        </div>
                        <div className="text-xs text-amber-600">بدهکار</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    هیچ فروشنده بدهکاری یافت نشد
                  </div>
                )}
              </div>
            </div>

            {/* Seller Credits */}
            <div className="bg-white rounded-md border border-cyan-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="font-bold">فروشندگان  قرضدار</div>
                  <div>{formatCurrency(sellers.credits.total)}</div>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {filteredSellers.credits.length > 0 ? (
                  filteredSellers.credits.map((seller, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 mb-2 bg-cyan-50 rounded-lg border border-cyan-200"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {seller.name} 
                        </div>
                        <div className="text-sm text-gray-600">
                          {seller.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {seller.storeName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-cyan-700">
                          {formatCurrency(Math.abs(seller.currentBalance))}
                        </div>
                        <div className="text-xs text-cyan-600">طلبکار</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    هیچ فروشنده طلبکاری یافت نشد
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsReport;
