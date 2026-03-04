// StaffService.js - تبدیل شده به شمسی افغانستان

import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const BASE_URL = import.meta.env.VITE_BASE_URL;

const showAlert = (title, text, icon = "success") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "تایید",
    timer: icon === "success" ? 1500 : null,
  });
};

export const getStaff = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/staff`);
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت لیست کارمندان:", error);
    showAlert("خطا", "بارگذاری لیست کارمندان ناموفق بود", "error");
    throw error;
  }
};

/**
 * دریافت اطلاعات یک کارمند با تمام جزئیات (ولت و رکوردهای ماهانه)
 */
export const getStaffById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/staff/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت کارمند:", error);
    showAlert("خطا", "کارمند موردنظر یافت نشد", "error");
    throw error;
  }
};

/**
 * ثبت کارمند جدید
 */
export const createStaff = async (staffData) => {
  try {
    if (!staffData.name || staffData.name.trim() === "") {
      showAlert("خطا", "نام کارمند نمی‌تواند خالی باشد", "error");
      return;
    }

    const formattedData = {
      name: staffData.name,
      fatherName: staffData.fatherName,
      phone: staffData.phone,
      email: staffData.email || "",
      position: staffData.position || "کارمند",
      baseSalary: parseFloat(staffData.salary) || 0,
      overtimeRatePerHour: parseFloat(staffData.overworkCost) || 0,
      workStartTime: staffData.startOfWork || "08:00:00",
      workEndTime: staffData.endOfWork || "17:00:00",
      dailyWorkHours: parseFloat(staffData.workTime) || 8,
      role: staffData.role || "employee",
      status: "active",
      address: staffData.address || "",
    };

    const res = await axios.post(`${BASE_URL}/staff/register`, formattedData);

    showAlert("موفق", "کارمند جدید با موفقیت ثبت شد ✅", "success");
    return res.data;
  } catch (error) {
    console.error("❌ خطا در ثبت کارمند:", error);
    showAlert(
      "خطا",
      error.response?.data?.message || "ثبت کارمند انجام نشد",
      "error",
    );
    throw error;
  }
};

/**
 * بروزرسانی اطلاعات کارمند
 */
export const updateStaff = async (id, staffData) => {
  try {
    const res = await axios.put(`${BASE_URL}/staff/${id}`, staffData);
    showAlert("موفق", "اطلاعات کارمند بروزرسانی شد ✏️", "success");
    return res.data;
  } catch (error) {
    console.error("❌ خطا در بروزرسانی کارمند:", error);
    showAlert(
      "خطا",
      error.response?.data?.message || "بروزرسانی اطلاعات انجام نشد",
      "error",
    );
    throw error;
  }
};

/**
 * حذف کارمند
 */
export const deleteStaff = async (id) => {
  try {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: `آیا می‌خواهید کارمند شماره ${id} را حذف کنید؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        icon: "info",
        title: "حذف لغو شد",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    await axios.delete(`${BASE_URL}/staff/${id}`);

    Swal.fire({
      icon: "success",
      title: "حذف موفقانه انجام شد",
      text: "کارمند با موفقیت حذف گردید 🗑️",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("❌ خطا در حذف کارمند:", error);
    Swal.fire({
      icon: "error",
      title: "خطا در حذف",
      text: error.response?.data?.message || "در هنگام حذف کارمند خطایی رخ داد",
    });
    throw error;
  }
};

/* ===============================
   ✅ مدیریت ولت
================================ */

/**
 * دریافت اطلاعات ولت کارمند - از طریق getStaffById
 */
export const getStaffWallet = async (staffId) => {
  try {
    const response = await getStaffById(staffId);

    if (response.success && response.staff) {
      return {
        success: true,
        wallet: response.staff.wallet || {
          balance: 0,
          totalEarned: 0,
          totalPaid: 0,
        },
        staff: response.staff,
      };
    }

    return {
      success: true,
      wallet: {
        balance: 0,
        totalEarned: 0,
        totalPaid: 0,
      },
    };
  } catch (error) {
    console.error("❌ خطا در دریافت ولت کارمند:", error);
    showAlert("خطا", "دریافت ولت کارمند ناموفق بود", "error");
    throw error;
  }
};

/* ===============================
   ✅ سیستم رکوردهای ماهانه
================================ */

/**
 * ایجاد یا دریافت رکورد ماهانه کارمند
 */
export const initializeMonthlyRecord = async (staffId, year, month) => {
  try {
    const res = await axios.post(`${BASE_URL}/staff/monthly-record/init`, {
      staffId,
      year,
      month,
    });
    return res.data;
  } catch (error) {
    console.error("❌ خطا در ایجاد رکورد ماهانه:", error);
    showAlert("خطا", "ایجاد رکورد ماهانه ناموفق بود", "error");
    throw error;
  }
};

/**
 * دریافت رکوردهای ماهانه کارمند
 */
export const getStaffMonthlyRecords = async (
  staffId,
  year = null,
  month = null,
) => {
  try {
    let url = `${BASE_URL}/staff/${staffId}/monthly-records`;
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت رکوردهای ماهانه:", error);
    return {
      success: true,
      records: [],
    };
  }
};

/**
 * دریافت خلاصه وضعیت مالی کارمند
 */
export const getStaffFinancialSummary = async (staffId, year = null) => {
  try {
    const records = await getStaffMonthlyRecords(staffId, year);

    if (records.success && records.records) {
      const summary = {
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsence: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        monthsCount: records.records.length,
        pendingMonths: 0,
        partialMonths: 0,
        paidMonths: 0,
        closedMonths: 0,
      };

      records.records.forEach((record) => {
        summary.totalBaseSalary += parseFloat(record.baseSalary || 0);
        summary.totalOvertime += parseFloat(record.overtimeAmount || 0);
        summary.totalAbsence += parseFloat(record.absenceDeduction || 0);
        summary.totalPayable += parseFloat(record.totalPayable || 0);
        summary.totalPaid += parseFloat(record.paidAmount || 0);
        summary.totalRemaining += parseFloat(record.remainingAmount || 0);

        if (record.status === "pending") summary.pendingMonths++;
        else if (record.status === "partial") summary.partialMonths++;
        else if (record.status === "paid") summary.paidMonths++;
        if (record.isClosed) summary.closedMonths++;
      });

      return {
        success: true,
        summary,
        records: records.records,
      };
    }

    return {
      success: true,
      summary: {
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsence: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        monthsCount: 0,
        pendingMonths: 0,
        partialMonths: 0,
        paidMonths: 0,
        closedMonths: 0,
      },
      records: [],
    };
  } catch (error) {
    console.error("❌ خطا در دریافت خلاصه مالی:", error);
    return {
      success: true,
      summary: {
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsence: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        monthsCount: 0,
        pendingMonths: 0,
        partialMonths: 0,
        paidMonths: 0,
        closedMonths: 0,
      },
      records: [],
    };
  }
};

/* ===============================
   ✅ مدیریت اضافه‌کاری
================================ */

/**
 * ثبت اضافه‌کاری
 */
export const addOvertime = async (staffId, data) => {
  try {
    if (!staffId || !data.year || !data.month || !data.date || !data.hours) {
      showAlert("خطا", "اطلاعات اضافه‌کاری کامل نیست", "error");
      return;
    }

    const formattedData = {
      staffId,
      year: data.year,
      month: data.month,
      date: data.date,
      hours: parseFloat(data.hours),
      description: data.description || "",
    };

    const res = await axios.post(`${BASE_URL}/staff/overtime`, formattedData);

    showAlert("موفق", "اضافه‌کاری با موفقیت ثبت شد ⏱️", "success");
    return res.data;
  } catch (error) {
    console.error("❌ خطا در ثبت اضافه‌کاری:", error);
    showAlert(
      "خطا",
      error.response?.data?.message || "ثبت اضافه‌کاری ناموفق بود",
      "error",
    );
    throw error;
  }
};

/**
 * دریافت لیست اضافه‌کاری‌های کارمند
 */
export const getStaffOvertimes = async (staffId, filters = {}) => {
  try {
    const records = await getStaffMonthlyRecords(
      staffId,
      filters.year,
      filters.month,
    );

    let allOvertimes = [];
    let totalHours = 0;
    let totalAmount = 0;

    if (records.success && records.records) {
      records.records.forEach((record) => {
        if (record.overtimes && record.overtimes.length > 0) {
          record.overtimes.forEach((ot) => {
            allOvertimes.push({
              ...ot,
              month: record.month,
              year: record.year,
              monthName: getAfghanMonthName(record.month),
            });
            totalHours += parseFloat(ot.hours || 0);
            totalAmount += parseFloat(ot.amount || 0);
          });
        }
      });
    }

    return {
      success: true,
      count: allOvertimes.length,
      totalHours,
      totalAmount,
      overtimes: allOvertimes,
    };
  } catch (error) {
    console.error("❌ خطا در دریافت اضافه‌کاری‌ها:", error);
    return {
      success: true,
      count: 0,
      totalHours: 0,
      totalAmount: 0,
      overtimes: [],
    };
  }
};

/* ===============================
   ✅ مدیریت غیبت
================================ */

/**
 * ثبت غیبت
 */
export const addAbsence = async (staffId, data) => {
  try {
    if (!staffId || !data.year || !data.month || !data.date) {
      showAlert("خطا", "اطلاعات غیبت کامل نیست", "error");
      return;
    }

    const formattedData = {
      staffId,
      year: data.year,
      month: data.month,
      date: data.date,
      reason: data.reason || "",
    };

    const res = await axios.post(`${BASE_URL}/staff/absence`, formattedData);

    showAlert("موفق", "غیبت با موفقیت ثبت شد ⏳", "success");
    return res.data;
  } catch (error) {
    console.error("❌ خطا در ثبت غیبت:", error);
    showAlert(
      "خطا",
      error.response?.data?.message || "ثبت غیبت ناموفق بود",
      "error",
    );
    throw error;
  }
};

/**
 * پرداخت معاش
 */
export const paySalary = async (paymentData) => {
  try {
    if (
      !paymentData.staffId ||
      !paymentData.amount ||
      !paymentData.year ||
      !paymentData.month
    ) {
      showAlert(
        "خطا",
        "اطلاعات پرداخت کامل نیست (سال و ماه الزامی است)",
        "error",
      );
      return;
    }

    const formattedPaymentData = {
      staffId: paymentData.staffId,
      year: paymentData.year,
      month: paymentData.month,
      amount: parseFloat(paymentData.amount),
      paymentType: paymentData.paymentType || "salary",
      description: paymentData.description || "",
      recordedBy: paymentData.recordedBy || "مدیر سیستم",
    };

    const res = await axios.post(
      `${BASE_URL}/staff/payment`,
      formattedPaymentData,
    );

    Swal.fire({
      icon: "success",
      title: "پرداخت موفق",
      text:
        paymentData.paymentType === "advance"
          ? "پیش‌قرض با موفقیت ثبت شد 💳"
          : "پرداخت معاش با موفقیت انجام شد 💰",
      timer: 2000,
      showConfirmButton: false,
    });

    return res.data;
  } catch (error) {
    console.error("❌ خطا در پرداخت:", error);
    Swal.fire({
      icon: "error",
      title: "پرداخت ناموفق",
      text: error.response?.data?.message || error.message || "خطا در پرداخت",
    });
    throw error;
  }
};

export const closeMonthlyRecord = async (staffId, year, month) => {
  try {
    const res = await axios.post(`${BASE_URL}/staff/monthly-record/close`, {
      staffId,
      year,
      month,
    });

    showAlert("موفق", "ماه مالی با موفقیت بسته شد 🔒", "success");
    return res.data;
  } catch (error) {
    console.error("❌ خطا در بستن ماه:", error);
    showAlert(
      "خطا",
      error.response?.data?.message || "بستن ماه ناموفق بود",
      "error",
    );
    throw error;
  }
};

/* ===============================
   ✅ گزارشات
================================ */

/**
 * گزارش خلاصه ماهانه
 */
export const getMonthlySalarySummary = async (year, month) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/staff/reports/monthly-summary?year=${year}&month=${month}`,
    );
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت گزارش ماهانه:", error);
    return {
      success: true,
      summary: {
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsenceDeduction: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        staffCount: 0,
        details: [],
      },
    };
  }
};

/**
 * گزارش سالانه
 */
export const getYearlySummary = async (year) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/staff/reports/yearly-summary?year=${year}`,
    );
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت گزارش سالانه:", error);
    return {
      success: true,
      year,
      monthlySummary: {},
      yearTotal: {
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsence: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
      },
    };
  }
};

/**
 * گزارش اضافه‌کاری ماهانه
 */
export const getOvertimeSummary = async (year, month) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/staff/reports/overtime-summary?year=${year}&month=${month}`,
    );
    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت گزارش اضافه‌کاری:", error);
    return {
      success: true,
      summary: {
        totalOvertimeHours: 0,
        totalOvertimeAmount: 0,
        staffCount: 0,
        details: [],
      },
    };
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return (
    new Intl.NumberFormat("fa-IR").format(Math.round(parseFloat(amount))) +
    " افغانی"
  );
};

/**
 * نام ماه‌های شمسی افغانستان
 */
export const afghanMonths = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

/**
 * نام ماه از شماره ماه (شمسی افغانستان)
 */
export const getAfghanMonthName = (monthNumber) => {
  return afghanMonths[monthNumber - 1] || `ماه ${monthNumber}`;
};

/**
 * وضعیت ماه به فارسی
 */
export const getMonthStatusText = (status) => {
  const statusMap = {
    pending: "در انتظار",
    partial: "پرداخت جزئی",
    paid: "پرداخت کامل",
    closed: "بسته شده",
  };
  return statusMap[status] || "نامشخص";
};

/**
 * کلاس رنگ وضعیت ماه
 */
export const getMonthStatusColor = (status) => {
  const colorMap = {
    pending: "warning",
    partial: "info",
    paid: "success",
    closed: "secondary",
  };
  return colorMap[status] || "light";
};

/**
 * محاسبه حقوق روزانه
 */
export const calculateDailyRate = (monthlySalary, daysInMonth) => {
  return monthlySalary / daysInMonth;
};

/**
 * محاسبه کسر غیبت
 */
export const calculateAbsenceDeduction = (dailyRate, absenceDays) => {
  return dailyRate * absenceDays;
};

/**
 * تولید سال‌های شمسی موجود
 */
export const getAvailableYears = () => {
  const currentYear = moment().jYear();
  const years = [];

  for (let year = currentYear; year <= currentYear + 2; year++) {
    years.push(year);
  }

  return years;
};

/**
 * تولید لیست ماه‌های شمسی
 */
export const getAfghanMonthList = () => [
  { value: 1, label: "حمل" },
  { value: 2, label: "ثور" },
  { value: 3, label: "جوزا" },
  { value: 4, label: "سرطان" },
  { value: 5, label: "اسد" },
  { value: 6, label: "سنبله" },
  { value: 7, label: "میزان" },
  { value: 8, label: "عقرب" },
  { value: 9, label: "قوس" },
  { value: 10, label: "جدی" },
  { value: 11, label: "دلو" },
  { value: 12, label: "حوت" },
];

// حفظ سازگاری با کدهای قدیمی
export const getMonthList = getAfghanMonthList;
export const getMonthName = getAfghanMonthName;

/**
 * دریافت تعداد روزهای ماه شمسی
 */
export const getDaysInMonth = (year, month) => {
  return moment.jDaysInMonth(year, month - 1);
};

/**
 * فرمت تاریخ شمسی
 */
export const formatAfghanDate = (date) => {
  if (!date) return "";
  return moment(date).format("jYYYY/jMM/jDD");
};

/**
 * دریافت تاریخ جاری شمسی
 */
export const getCurrentAfghanDate = () => {
  const now = moment();
  return {
    year: now.jYear(),
    month: now.jMonth() + 1,
    day: now.jDate(),
    full: now.format("jYYYY/jMM/jDD"),
    dayName: now.format("dddd"),
  };
};
// ===============================
// گزارش کلی (Overall Report)
// ===============================

/**
 * گزارش کلی از تمام کارمندان برای یک ماه مشخص
 * @param {number} year - سال شمسی
 * @param {number} month - ماه شمسی (1-12)
 */
export const getOverallReport = async (year, month) => {
  try {
    if (!year || !month) {
      console.error("❌ سال و ماه را وارد کنید");
      return {
        success: false,
        overall: null,
        summary: {
          totalStaff: 0,
          totalBaseSalary: 0,
          totalOvertime: 0,
          totalAbsence: 0,
          totalPayable: 0,
          totalPaid: 0,
          totalRemaining: 0,
          paymentPercentage: 0,
        },
      };
    }

    const res = await axios.get(
      `${BASE_URL}/staff/reports/overall?year=${year}&month=${month}`,
    );

    return res.data;
  } catch (error) {
    console.error("❌ خطا در دریافت گزارش کلی:", error);

    // برگرداندن ساختار پیش‌فرض در صورت خطا
    return {
      success: false,
      message: error.response?.data?.message || "خطا در دریافت گزارش کلی",
      overall: {
        year,
        month,
        monthName: getAfghanMonthName(month),
        totalStaff: 0,
        totalBaseSalary: 0,
        totalOvertimeAmount: 0,
        totalAbsenceDeduction: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        paymentPercentage: 0,
        staffWithOvertime: 0,
        staffWithAbsence: 0,
        fullyPaidStaff: 0,
        partiallyPaidStaff: 0,
        notPaidStaff: 0,
        details: [],
      },
      summary: {
        totalStaff: 0,
        totalBaseSalary: 0,
        totalOvertime: 0,
        totalAbsence: 0,
        totalPayable: 0,
        totalPaid: 0,
        totalRemaining: 0,
        paymentPercentage: 0,
      },
    };
  }
};

/**
 * دریافت گزارش کلی با فرمت مناسب برای نمایش
 * @param {number} year - سال شمسی
 * @param {number} month - ماه شمسی
 */
export const getFormattedOverallReport = async (year, month) => {
  const report = await getOverallReport(year, month);

  if (report.success && report.overall) {
    return {
      ...report,
      summary: {
        ...report.summary,
        // اضافه کردن مقادیر فرمت شده برای نمایش
        totalBaseSalaryFormatted: formatCurrency(
          report.summary.totalBaseSalary,
        ),
        totalOvertimeFormatted: formatCurrency(report.summary.totalOvertime),
        totalAbsenceFormatted: formatCurrency(report.summary.totalAbsence),
        totalPayableFormatted: formatCurrency(report.summary.totalPayable),
        totalPaidFormatted: formatCurrency(report.summary.totalPaid),
        totalRemainingFormatted: formatCurrency(report.summary.totalRemaining),
        paymentPercentageText: `${report.summary.paymentPercentage}%`,
      },
      overall: {
        ...report.overall,
        // اضافه کردن مقادیر فرمت شده
        totalBaseSalaryFormatted: formatCurrency(
          report.overall.totalBaseSalary,
        ),
        totalOvertimeFormatted: formatCurrency(
          report.overall.totalOvertimeAmount,
        ),
        totalAbsenceFormatted: formatCurrency(
          report.overall.totalAbsenceDeduction,
        ),
        totalPayableFormatted: formatCurrency(report.overall.totalPayable),
        totalPaidFormatted: formatCurrency(report.overall.totalPaid),
        totalRemainingFormatted: formatCurrency(report.overall.totalRemaining),
      },
    };
  }

  return report;
};

/* ===============================
   ✅ Export تمام توابع
================================ */
export default {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffWallet,
  initializeMonthlyRecord,
  getStaffMonthlyRecords,
  getStaffFinancialSummary,
  addOvertime,
  getStaffOvertimes,
  addAbsence,
  paySalary,
  closeMonthlyRecord,
  getMonthlySalarySummary,
  getYearlySummary,
  getOvertimeSummary,
  formatCurrency,
  getMonthName: getAfghanMonthName,
  getMonthStatusText,
  getMonthStatusColor,
  calculateDailyRate,
  calculateAbsenceDeduction,
  getAvailableYears,
  getMonthList: getAfghanMonthList,
  getDaysInMonth,
  formatAfghanDate,
  getCurrentAfghanDate,
  afghanMonths,
  getFormattedOverallReport,
};
