// 1. ابتدا یک فایل services/stockForPrint.js ایجاد کنید:
import {
  consumePaperForOrder,
  checkPaperAvailability,
  getAvailablePapers,
} from "./stockService";

// تبدیل نوع کاغذ فارسی به انگلیسی
export const getPaperCategory = (paperType) => {
  if (!paperType) return "offset";
  if (paperType.includes("افست")) return "offset";
  if (paperType.includes("آرت پیپر")) return "atpaper";
  if (paperType.includes("کاک")) return "kak";
  if (paperType.includes("بلیچ کارت")) return "bleach_card";
  return "offset";
};

// استخراج وزن از رشته
export const getPaperWeight = (paperType) => {
  if (!paperType) return "80";
  const match = paperType.match(/(\d+)\s*گرم/);
  return match ? match[1] : "80";
};

// تبدیل سایز فارسی به عددی
export const getSizeNumber = (sizeLabel, paperCategory) => {
  if (!sizeLabel) return "20*25";

  const sizeMap = {
    offset: {
      وزیری: "20*25",
      رقعه‌ای: "23*35",
      لیتر: "20*40",
    },
    atpaper: {
      وزیری: "20*30",
      رقعه‌ای: "23*36",
    },
    kak: {
      وزیری: "20*30",
      رقعه‌ای: "23*36",
    },
    bleach_card: {
      وزیری: "20*30",
      رقعه‌ای: "23*36",
    },
  };

  const category = getPaperCategoryFromSize(paperCategory);
  return sizeMap[category]?.[sizeLabel] || "20*25";
};

// تشخیص دسته‌بندی بر اساس سایز
const getPaperCategoryFromSize = (paperType) => {
  if (paperType?.includes("کاک")) return "kak";
  if (paperType?.includes("بلیچ کارت")) return "bleach_card";
  return "offset"; // پیش‌فرض
};
