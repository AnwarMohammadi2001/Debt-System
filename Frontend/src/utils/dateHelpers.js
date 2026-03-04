// src/utils/dateHelpers.js - مخصوص فرانت‌اند
import jalaali from "jalaali-js";

// نام‌های ماه‌های افغانستان (هجری شمسی)
export const afghanMonthNames = [
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

// تبدیل تاریخ میلادی به شمسی
export const toJalaali = (date) => {
  const gregorianDate = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate(),
  );
  return { year: jy, month: jm, day: jd };
};

// تبدیل تاریخ شمسی به میلادی
export const toGregorian = (jy, jm, jd) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
};

// دریافت تعداد روزهای ماه شمسی
export const getDaysInJalaaliMonth = (year, month) => {
  // ماه‌های 31 روزه: حمل تا عقرب (ماه 1 تا 6)
  if (month <= 6) return 31;
  // ماه‌های 30 روزه: قوس تا حوت (ماه 7 تا 11)
  if (month <= 11) return 30;
  // ماه حوت (ماه 12): 29 روز در سال عادی، 30 روز در سال کبیسه
  return jalaali.isLeapJalaaliYear(year) ? 30 : 29;
};

// محاسبه روزهای باقی‌مانده از ماه شمسی
export const getRemainingDaysInMonth = (date) => {
  const { year, month, day } = toJalaali(date);
  const daysInMonth = getDaysInJalaaliMonth(year, month);
  return daysInMonth - day + 1;
};

// دریافت نام ماه به افغانی
export const getAfghanMonthName = (monthNumber) => {
  return afghanMonthNames[monthNumber - 1] || `ماه ${monthNumber}`;
};

// فرمت تاریخ به صورت شمسی
export const formatJalaaliDate = (date) => {
  const { year, month, day } = toJalaali(date);
  return `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
};

// فرمت تاریخ با نام ماه
export const formatJalaaliDateWithName = (date) => {
  const { year, month, day } = toJalaali(date);
  const monthName = getAfghanMonthName(month);
  return `${day} ${monthName} ${year}`;
};

// دریافت سال جاری شمسی
export const getCurrentJalaaliYear = () => {
  return toJalaali(new Date()).year;
};

// دریافت ماه جاری شمسی
export const getCurrentJalaaliMonth = () => {
  return toJalaali(new Date()).month;
};

// دریافت روز جاری شمسی
export const getCurrentJalaaliDay = () => {
  return toJalaali(new Date()).day;
};

// دریافت لیست سال‌های شمسی
export const getJalaaliYears = (range = 2) => {
  const currentYear = getCurrentJalaaliYear();
  const years = [];
  for (let year = currentYear - range; year <= currentYear + range; year++) {
    years.push(year);
  }
  return years;
};

// محاسبه معاش пропорционально
export const calculateProratedSalary = (monthlySalary, joinDate) => {
  const { year, month, day } = toJalaali(joinDate);
  const daysInMonth = getDaysInJalaaliMonth(year, month);
  const remainingDays = daysInMonth - day + 1;
  const dailyRate = monthlySalary / daysInMonth;

  return {
    dailyRate,
    daysInMonth,
    remainingDays,
    proratedAmount: dailyRate * remainingDays,
    percentage: (remainingDays / daysInMonth) * 100,
  };
};

// دریافت نام ماه‌ها برای dropdown
export const getMonthList = () => {
  return afghanMonthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));
};

// دریافت روزهای ماه جاری
export const getCurrentMonthDays = () => {
  const { year, month } = toJalaali(new Date());
  return getDaysInJalaaliMonth(year, month);
};

// تبدیل رشته تاریخ شمسی به آبجکت
export const parseJalaaliDate = (jalaaliStr) => {
  const parts = jalaaliStr.split("/");
  if (parts.length === 3) {
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]),
      day: parseInt(parts[2]),
    };
  }
  return null;
};
