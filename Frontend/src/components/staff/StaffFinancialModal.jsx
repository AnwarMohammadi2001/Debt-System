// StaffFinancialModal.js
import React, { useState, useEffect } from "react";
import {
  FaCalendar,
  FaMoneyBillWave,
  FaClock,
  FaReceipt,
  FaPercentage,
  FaUserClock,
  FaChartPie,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import api from "../../pages/dashboard/services/StaffService";
import AnimatedModal from "../common/AnimatedModal";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const StaffFinancialModal = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  staffSalary,
  staffPosition,
}) => {
  const [loading, setLoading] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(moment().jYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [summary, setSummary] = useState({
    totalBaseSalary: 0,
    totalOvertime: 0,
    totalAbsence: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalRemaining: 0,
    monthsCount: 0,
    paidMonths: 0,
    partialMonths: 0,
    pendingMonths: 0,
  });

  useEffect(() => {
    if (isOpen && staffId) {
      fetchFinancialData();
    }
  }, [isOpen, staffId, selectedYear]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // دریافت رکوردهای ماهانه
      const recordsData = await api.getStaffMonthlyRecords(
        staffId,
        selectedYear,
      );

      if (recordsData.success) {
        setMonthlyRecords(recordsData.records);

        // محاسبه خلاصه
        const newSummary = {
          totalBaseSalary: 0,
          totalOvertime: 0,
          totalAbsence: 0,
          totalPayable: 0,
          totalPaid: 0,
          totalRemaining: 0,
          monthsCount: recordsData.records.length,
          paidMonths: 0,
          partialMonths: 0,
          pendingMonths: 0,
        };

        recordsData.records.forEach((record) => {
          newSummary.totalBaseSalary += parseFloat(record.baseSalary || 0);
          newSummary.totalOvertime += parseFloat(record.overtimeAmount || 0);
          newSummary.totalAbsence += parseFloat(record.absenceDeduction || 0);
          newSummary.totalPayable += parseFloat(record.totalPayable || 0);
          newSummary.totalPaid += parseFloat(record.paidAmount || 0);
          newSummary.totalRemaining += parseFloat(record.remainingAmount || 0);

          if (record.status === "paid") newSummary.paidMonths++;
          else if (record.status === "partial") newSummary.partialMonths++;
          else if (record.status === "pending") newSummary.pendingMonths++;
        });

        setSummary(newSummary);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (record) => {
    setSelectedMonth(record.month);
    setSelectedRecord(record);
  };

  const handleExportReport = () => {
    // ایجاد گزارش CSV
    const headers = [
      "ماه",
      "سال",
      "معاش پایه",
      "اضافه‌کاری",
      "غیبت",
      "قابل پرداخت",
      "پرداخت شده",
      "باقی‌مانده",
      "وضعیت",
    ];
    const rows = monthlyRecords.map((record) => [
      api.getMonthName(record.month),
      record.year,
      record.baseSalary,
      record.overtimeAmount,
      record.absenceDeduction,
      record.totalPayable,
      record.paidAmount,
      record.remainingAmount,
      api.getMonthStatusText(record.status),
    ]);

    const csvContent = [
      headers.join("،"),
      ...rows.map((row) => row.join("،")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `financial_report_${staffName}_${selectedYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // فرمت تاریخ شمسی
  const formatAfghanDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("jYYYY/jMM/jDD");
  };

  const years = api.getAvailableYears();

  if (!isOpen) return null;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]">
      <div className="bg-white rounded-md shadow-xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-cyan-700 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaChartPie />
              گزارشات مالی کارمند
            </h2>
            <p className="text-blue-100 mt-1">
              {staffName} - {staffPosition} - سال {selectedYear}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* انتخاب سال و دکمه خروجی */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-medium">انتخاب سال:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-4 py-1.5 focus:ring-2 focus:ring-cyan-700 outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
         
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* خلاصه سالانه */}
              <div className="bg-gray-200 rounded-md p-6 mb-6 border border-blue-100">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <FaCalendar />
                  خلاصه مالی سال {selectedYear} (شمسی)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaMoneyBillWave className="text-blue-600" />
                      <span>کل معاش اصلی</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {api.formatCurrency(summary.totalBaseSalary)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaClock className="text-orange-600" />
                      <span>کل اضافه‌کاری</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {api.formatCurrency(summary.totalOvertime)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaUserClock className="text-red-600" />
                      <span>کل کسورات غیبت</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {api.formatCurrency(summary.totalAbsence)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaReceipt className="text-green-600" />
                      <span>کل قابل پرداخت</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {api.formatCurrency(summary.totalPayable)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaMoneyBillWave className="text-green-600" />
                      <span>پرداخت شده</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {api.formatCurrency(summary.totalPaid)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2 gap-2">
                      <FaPercentage className="text-orange-600" />
                      <span>باقی‌مانده</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {api.formatCurrency(summary.totalRemaining)}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm col-span-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {summary.paidMonths}
                        </div>
                        <div className="text-xs text-gray-600">
                          ماه پرداخت کامل
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {summary.partialMonths}
                        </div>
                        <div className="text-xs text-gray-600">
                          ماه پرداخت جزئی
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-600">
                          {summary.pendingMonths}
                        </div>
                        <div className="text-xs text-gray-600">
                          ماه در انتظار
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ماه‌های مالی */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  ماه‌های مالی (شمسی)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {monthlyRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleMonthClick(record)}
                      className={`bg-gray-100 rounded-md p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedMonth === record.month
                          ? "border-cyan-700 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-800">
                          {api.getMonthName(record.month)}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : record.status === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {api.getMonthStatusText(record.status)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">معاش:</span>
                          <span className="font-medium">
                            {api.formatCurrency(record.baseSalary)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">اضافه‌کاری:</span>
                          <span className="font-medium text-orange-600">
                            {api.formatCurrency(record.overtimeAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">کسری غیبت:</span>
                          <span className="font-medium text-red-600">
                            {api.formatCurrency(record.absenceDeduction)}
                          </span>
                        </div>

                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-700 font-semibold">
                            باقی‌مانده:
                          </span>
                          <span
                            className={`font-bold ${
                              record.remainingAmount > 0
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {api.formatCurrency(record.remainingAmount)}
                          </span>
                        </div>

                        {record.absenceDays > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {record.absenceDays} روز غیبت
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* جزئیات ماه انتخاب شده */}
              {selectedRecord && (
                <div className="bg-gray-100 rounded-md p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    جزئیات ماه {api.getMonthName(selectedRecord.month)}{" "}
                    {selectedRecord.year}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* اطلاعات پایه */}
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3 border-b pb-2">
                        اطلاعات پایه
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>معاش پایه:</span>
                          <span className="font-bold">
                            {api.formatCurrency(selectedRecord.baseSalary)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>تعداد روزهای ماه:</span>
                          <span className="font-bold">
                            {selectedRecord.daysInMonth} روز
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>نرخ روزانه:</span>
                          <span className="font-bold">
                            {api.formatCurrency(selectedRecord.dailySalaryRate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* اضافه‌کاری و غیبت */}
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3 border-b pb-2">
                        اضافه‌کاری و غیبت
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>ساعت اضافه‌کاری:</span>
                          <span className="font-bold text-orange-600">
                            {selectedRecord.overtimeHours} ساعت
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>مبلغ اضافه‌کاری:</span>
                          <span className="font-bold text-orange-600">
                            {api.formatCurrency(selectedRecord.overtimeAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>روزهای غیبت:</span>
                          <span className="font-bold text-red-600">
                            {selectedRecord.absenceDays} روز
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>کسورات غیبت:</span>
                          <span className="font-bold text-red-600">
                            {api.formatCurrency(
                              selectedRecord.absenceDeduction,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* وضعیت پرداخت */}
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-gray-700 mb-3 border-b pb-2">
                        وضعیت پرداخت
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>کل قابل پرداخت:</span>
                          <span className="font-bold text-green-700">
                            {api.formatCurrency(selectedRecord.totalPayable)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>پرداخت شده:</span>
                          <span className="font-bold text-blue-600">
                            {api.formatCurrency(selectedRecord.paidAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">باقی‌مانده:</span>
                          <span
                            className={`font-bold text-lg ${
                              selectedRecord.remainingAmount > 0
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {api.formatCurrency(selectedRecord.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* نمایش اضافه‌کاری‌ها */}
                  {selectedRecord.overtimes &&
                    selectedRecord.overtimes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          لیست اضافه‌کاری‌ها
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-center bg-white">
                            <thead className="bg-cyan-700 text-gray-100">
                              <tr>
                                <th className="py-2 px-3">تاریخ (شمسی)</th>
                                <th className="py-2 px-3">ساعت</th>
                                <th className="py-2 px-3">مبلغ</th>
                                <th className="py-2 px-3">توضیحات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedRecord.overtimes.map((ot, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="py-2 px-3">
                                    {(ot.date)}
                                  </td>
                                  <td className="py-2 px-3 font-medium">
                                    {ot.hours} ساعت
                                  </td>
                                  <td className="py-2 px-3 font-medium">
                                    {api.formatCurrency(ot.amount)}
                                  </td>
                                  <td className="py-2 px-3">
                                    {ot.description || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* نمایش غیبت‌ها */}
                  {selectedRecord.absences &&
                    selectedRecord.absences.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          لیست غیبت‌ها
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white text-center">
                            <thead className="bg-cyan-700 text-gray-100">
                              <tr>
                                <th className="py-2 px-3">تاریخ (شمسی)</th>
                                <th className="py-2 px-3">دلیل</th>
                                <th className="py-2 px-3">مبلغ کسر شده</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedRecord.absences.map((abs, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="py-2 px-3">
                                    {(abs.date)}
                                  </td>
                                  <td className="py-2 px-3">
                                    {abs.reason || "-"}
                                  </td>
                                  <td className="py-2 px-3 font-medium">
                                    {api.formatCurrency(
                                      selectedRecord.dailySalaryRate,
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default StaffFinancialModal;
