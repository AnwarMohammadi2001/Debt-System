import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaWallet,
  FaCalendarAlt,
  FaHistory,
  FaInfoCircle,
  FaUserClock,
  FaClock,
  FaPrint,
} from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";
import Swal from "sweetalert2";
import api from "../../pages/dashboard/services/StaffService";
import AnimatedModal from "../../components/common/AnimatedModal";
import PrintMonthlyReport from "./PrintMonthlyReport";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const StaffWalletModal = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  onOvertime,
  onAbsence,
}) => {
  const [wallet, setWallet] = useState(null);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("months");
  const [selectedYear, setSelectedYear] = useState(moment().jYear());
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedMonthRecord, setSelectedMonthRecord] = useState(null);
  const [selectedMonthPayments, setSelectedMonthPayments] = useState([]);
  // Add this state with other useState declarations
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add these handler functions before the return statement
  const handleOvertimeClick = () => {
    onOvertime({
      id: staffId,
      name: staffName,
      onSuccess: () => {
        setRefreshTrigger((prev) => prev + 1);
        fetchWalletData(); // Immediate refresh
      },
    });
  };

  const handleAbsenceClick = () => {
    onAbsence({
      id: staffId,
      name: staffName,
      onSuccess: () => {
        setRefreshTrigger((prev) => prev + 1);
        fetchWalletData(); // Immediate refresh
      },
    });
  };

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: "",
    monthlyRecordId: "",
    recordedBy: "",
    paymentType: "salary",
    year: moment().jYear(),
    month: moment().jMonth() + 1,
  });

  const handlePrintMonth = (record) => {
    const monthPayments = payments.filter(
      (p) => p.month === record.month && p.year === record.year,
    );

    setSelectedMonthRecord(record);
    setSelectedMonthPayments(monthPayments);
    setPrintModalOpen(true);
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!staffId) return;

    setLoading(true);
    try {
      const walletData = await api.getStaffWallet(staffId);
      setWallet(
        walletData.wallet || { balance: 0, totalEarned: 0, totalPaid: 0 },
      );

      const recordsData = await api.getStaffMonthlyRecords(
        staffId,
        selectedYear,
      );

      if (recordsData.success) {
        setMonthlyRecords(recordsData.records);

        const allPayments = [];
        recordsData.records.forEach((record) => {
          if (record.payments && record.payments.length > 0) {
            record.payments.forEach((payment) => {
              allPayments.push({
                ...payment,
                monthName: api.getMonthName(record.month),
                year: record.year,
                createdAt: payment.createdAt,
              });
            });
          }
        });
        setPayments(
          allPayments.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "دریافت اطلاعات ولت ناموفق بود",
      });
    } finally {
      setLoading(false);
    }
  };

  // Replace the existing useEffect with this:
  useEffect(() => {
    if (isOpen) {
      fetchWalletData();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setPaymentForm((prev) => ({
        ...prev,
        recordedBy: user.name || "مدیر سیستم",
      }));
    }
  }, [isOpen, staffId, selectedYear, refreshTrigger]); // Add refreshTrigger

  // Validate payment amount
  const validatePaymentAmount = (amount, record, paymentType) => {
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, message: "مبلغ معتبر وارد کنید" };
    }

    if (record.isClosed) {
      return { valid: false, message: "این ماه قبلاً بسته شده است" };
    }

    return { valid: true };
  };

  // Handle payment submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!paymentForm.monthlyRecordId) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "لطفاً یک ماه را انتخاب کنید",
      });
      return;
    }

    const selectedId = parseInt(paymentForm.monthlyRecordId);
    const selectedRecord = monthlyRecords.find((r) => r.id === selectedId);

    if (!selectedRecord) {
      console.error("Record not found for ID:", selectedId);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "ماه مالی انتخاب شده معتبر نیست. لطفاً صفحه را رفرش کنید",
      });
      return;
    }

    const validation = validatePaymentAmount(
      paymentForm.amount,
      selectedRecord,
      paymentForm.paymentType,
    );

    if (!validation.valid) {
      Swal.fire({ icon: "error", title: "خطا", text: validation.message });
      return;
    }

    if (parseFloat(paymentForm.amount) > selectedRecord.remainingAmount) {
      const confirm = await Swal.fire({
        icon: "warning",
        title: "توجه",
        text: `مبلغ ${api.formatCurrency(paymentForm.amount)} بیشتر از باقی‌مانده (${api.formatCurrency(selectedRecord.remainingAmount)}) است. این مبلغ به عنوان پیش‌قرض ثبت می‌شود و موجودی منفی می‌شود. آیا مطمئن هستید؟`,
        showCancelButton: true,
        confirmButtonText: "بله، ادامه بده",
        cancelButtonText: "لغو",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (!confirm.isConfirmed) {
        return;
      }
    }

    try {
      const paymentData = {
        staffId,
        amount: parseFloat(paymentForm.amount),
        description: paymentForm.description,
        recordedBy: paymentForm.recordedBy,
        year: selectedRecord.year,
        month: selectedRecord.month,
        paymentType: paymentForm.paymentType,
      };

      const result = await api.paySalary(paymentData);

      if (result.success) {
        const paymentTypeText =
          paymentForm.paymentType === "advance" ? "پیش‌قرض" : "پرداخت";
        Swal.fire({
          icon: "success",
          title: "موفق",
          text: `${paymentTypeText} با موفقیت ثبت شد 💰`,
          timer: 1500,
          showConfirmButton: false,
        });

        setPaymentForm({
          amount: "",
          description: "",
          monthlyRecordId: "",
          recordedBy: paymentForm.recordedBy,
          paymentType: "salary",
          year: moment().jYear(),
          month: moment().jMonth() + 1,
        });

        fetchWalletData();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: error.response?.data?.message || "پرداخت ناموفق بود",
      });
    }
  };

  const totals = {
    totalEarned: monthlyRecords.reduce(
      (sum, r) => sum + parseFloat(r.totalPayable || 0),
      0,
    ),
    totalPaid: monthlyRecords.reduce(
      (sum, r) => sum + parseFloat(r.paidAmount || 0),
      0,
    ),
    totalRemaining: monthlyRecords.reduce(
      (sum, r) => sum + parseFloat(r.remainingAmount || 0),
      0,
    ),
    totalOvertime: monthlyRecords.reduce(
      (sum, r) => sum + parseFloat(r.overtimeAmount || 0),
      0,
    ),
    totalAbsence: monthlyRecords.reduce(
      (sum, r) => sum + parseFloat(r.absenceDeduction || 0),
      0,
    ),
    pendingMonths: monthlyRecords.filter((r) => r.status === "pending").length,
    partialMonths: monthlyRecords.filter((r) => r.status === "partial").length,
    paidMonths: monthlyRecords.filter((r) => r.status === "paid").length,
    closedMonths: monthlyRecords.filter((r) => r.isClosed).length,
  };

  const formatAfghanDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("jYYYY/jMM/jDD");
  };

  if (!isOpen) return null;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[98vw]">
      <div className="bg-white w-full relative rounded-md h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-3">
            <FaWallet className="text-cyan-700 text-2xl" />
            <div className="flex items-center gap-x-5">
              <h2 className="text-2xl font-bold text-gray-800">
                مدیریت معاشات
              </h2>
              <p className="text-3xl text-gray-600 mt-1">{staffName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500 text-xl hover:text-red-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Payment Form */}
          <div className="w-80 border-r bg-gradient-to-b from-gray-50 to-white border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <MdOutlinePayment className="text-cyan-700" />
                پرداخت
              </h3>
              <p className="text-2xl font-bold"> {staffName}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سال شمسی
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border bg-gray-100 border-gray-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-cyan-700 outline-none"
                >
                  {api.getAvailableYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ماه مالی (شمسی)
                </label>
                <select
                  value={paymentForm.monthlyRecordId?.toString() || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPaymentForm({
                      ...paymentForm,
                      monthlyRecordId: value,
                    });
                  }}
                  className="w-full border bg-gray-100 border-gray-300 rounded-md px-3 py-2.5 focus:ring-1 focus:ring-cyan-700 outline-none"
                  required
                >
                  <option value="">انتخاب ماه</option>
                  {monthlyRecords
                    .filter((r) => !r.isClosed)
                    .map((record) => {
                      const remainingAmount = record.remainingAmount || 0;
                      const baseSalary = parseFloat(record.baseSalary) || 0;
                      const paidAmount = parseFloat(record.paidAmount) || 0;

                      const maxAdvance = Math.max(
                        0,
                        baseSalary * 0.7 - paidAmount,
                      );

                      const isSelectable =
                        paymentForm.paymentType === "advance"
                          ? maxAdvance > 0
                          : true;

                      return (
                        <option
                          key={record.id}
                          value={record.id.toString()}
                          disabled={!isSelectable}
                          className={
                            !isSelectable ? "text-gray-400 bg-gray-50" : ""
                          }
                        >
                          {api.getMonthName(record.month)} {record.year} -
                          {paymentForm.paymentType === "advance"
                            ? `حداکثر پیش‌قرض: ${api.formatCurrency(maxAdvance)}`
                            : `باقی‌مانده: ${api.formatCurrency(remainingAmount)}`}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مبلغ پرداختی
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full border bg-gray-100 border-gray-300 rounded-md px-3 py-2.5 focus:ring-1 focus:ring-cyan-700 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توضیحات
                </label>
                <textarea
                  rows="1"
                  value={paymentForm.description}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2.5 focus:ring-1 focus:ring-cyan-700 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white rounded-lg font-bold transition-all shadow-lg ${
                  paymentForm.paymentType === "advance"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                }`}
              >
                {paymentForm.paymentType === "advance"
                  ? "ثبت پیش‌قرض"
                  : "ثبت پرداخت"}
              </button>
            </form>

            {/* Overtime and Absence Buttons */}
            {/* Replace the existing buttons with these */}
            <div className="flex items-center py-4 justify-between">
              <button
                onClick={handleOvertimeClick} // Changed from inline function
                className="px-3 py-2 bg-white gap-2 flex items-center
      border border-orange-300 text-orange-800 rounded-md
      font-medium hover:bg-orange-800 hover:text-white transition-colors
      text-xs whitespace-nowrap"
                title="ثبت اضافه‌کاری"
              >
                <FaClock size={14} /> اضافه‌کاری
              </button>

              <button
                onClick={handleAbsenceClick} // Changed from inline function
                className="px-3 py-2 bg-white gap-2 flex items-center
      border border-red-300 text-red-800 rounded-md
      font-medium hover:bg-red-800 hover:text-white transition-colors
      text-xs whitespace-nowrap"
                title="ثبت غیبت"
              >
                <FaUserClock size={14} /> غیرحاضری
              </button>
            </div>
          </div>

          {/* Right Content - Tabs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Summary Cards */}
            <div className="p-6 border-b border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-200 rounded-md p-4">
                  <p className="text-sm text-cyan-700 font-medium">
                    مجموع حقوق قابل دریافت
                  </p>
                  <h3 className="text-xl font-bold text-cyan-800">
                    {api.formatCurrency(totals.totalEarned)}
                  </h3>
                </div>
                <div className="bg-gray-200 rounded-md p-4 ">
                  <p className="text-sm text-green-700 font-medium">
                    مجموع پرداخت شده
                  </p>
                  <h3 className="text-xl font-bold text-green-800">
                    {api.formatCurrency(totals.totalPaid)}
                  </h3>
                </div>

                <div className="bg-gray-200 rounded-md p-4  border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">
                    مجموع باقی‌مانده
                  </p>
                  <h3 className="text-xl font-bold text-orange-800">
                    {api.formatCurrency(totals.totalRemaining)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("months")}
                  className={`py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "months"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaCalendarAlt className="inline ml-1" /> ماه‌های شمسی
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "payments"
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaHistory className="inline ml-1" /> تاریخچه پرداخت
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-3 font-medium border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-cyan-600 text-cyan-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FaInfoCircle className="inline ml-1" /> خلاصه آماری
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto py-6 px-2">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-700">
                        {totals.paidMonths}
                      </div>
                      <div className="text-sm text-gray-600">
                        ماه پرداخت کامل
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-700">
                        {totals.partialMonths}
                      </div>
                      <div className="text-sm text-gray-600">
                        ماه پرداخت جزئی
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-700">
                        {totals.pendingMonths}
                      </div>
                      <div className="text-sm text-gray-600">ماه در انتظار</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-700">
                        {totals.closedMonths}
                      </div>
                      <div className="text-sm text-gray-600">ماه بسته شده</div>
                    </div>
                  </div>

                  {/* Overtime and Absence Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaClock className="text-orange-600" /> مجموع اضافه‌کاری
                      </h4>
                      <p className="text-2xl font-bold text-orange-700">
                        {api.formatCurrency(totals.totalOvertime)}
                      </p>
                      <p className="text-sm text-gray-500">تمام ماه‌های شمسی</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaUserClock className="text-red-600" /> مجموع کسورات
                        غیبت
                      </h4>
                      <p className="text-2xl font-bold text-red-700">
                        {api.formatCurrency(totals.totalAbsence)}
                      </p>
                      <p className="text-sm text-gray-500">تمام ماه‌های شمسی</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "months" && (
                <div className="overflow-x-auto">
                  <table className="w-full border text-center border-gray-200 rounded-md">
                    <thead className="bg-gray-200 text-gray-800">
                      <tr className="text-xs">
                        <th className="p-3">ماه / سال</th>
                        <th className="p-3">معاش اصلی</th>
                        <th className="p-3">اضافه‌کاری</th>
                        <th className="p-3">غیرحاضری </th>
                        <th className="p-3">قابل پرداخت</th>
                        <th className="p-3">پرداخت شده</th>
                        <th className="p-3">باقی‌مانده</th>
                        <th className="p-3">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {monthlyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className=" hover:bg-gray-100 odd:bg-gray-100 even:bg-white"
                        >
                          <td className="p-3 font-semibold text-sm">
                            {api.getMonthName(record.month)} {record.year}
                          </td>

                          <td className="p-3">
                            {api.formatCurrency(record.baseSalary)}
                          </td>

                          <td className="p-3 text-orange-600">
                            {api.formatCurrency(record.overtimeAmount)}
                          </td>

                          <td className="p-3 text-red-600">
                            {api.formatCurrency(record.absenceDeduction)}
                          </td>

                          <td className="p-3 font-bold text-green-700">
                            {api.formatCurrency(record.totalPayable)}
                          </td>

                          <td className="p-3 text-blue-700">
                            {api.formatCurrency(record.paidAmount)}
                          </td>

                          <td
                            className={`p-3 font-bold ${
                              record.remainingAmount > 0
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {api.formatCurrency(record.remainingAmount)}
                          </td>

                          <td className="p-3 text-center text-gray-500 hover:text-gray-700 cursor-pointer">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handlePrintMonth(record)}
                                className="text-gray-500 hover:text-cyan-700 transition-colors"
                                title="چاپ گزارش ماهانه"
                              >
                                <FaPrint size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-center">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-sm text-gray-700">#</th>
                        <th className="px-4 py-3 text-sm text-gray-700">
                          مبلغ
                        </th>
                        <th className="px-4 py-3 text-sm text-gray-700">ماه</th>
                        <th className="px-4 py-3 text-sm text-gray-700">
                          توضیحات
                        </th>
                        <th className="px-4 py-3 text-sm text-gray-700">
                          تاریخ شمسی
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment, index) => (
                        <tr
                          key={payment.id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-bold text-green-700">
                            {api.formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3">
                            {payment.monthName} {payment.year}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {payment.description || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatAfghanDate(payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        {printModalOpen && (
          <PrintMonthlyReport
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
            staffData={{ name: staffName, id: staffId }}
            monthlyRecord={selectedMonthRecord}
            payments={selectedMonthPayments}
            autoPrint={true}
          />
        )}
      </div>
    </AnimatedModal>
  );
};;

export default StaffWalletModal;
