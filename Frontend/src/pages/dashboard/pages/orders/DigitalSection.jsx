import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWarehouse,
  FaUser,
  FaBoxOpen,
  FaInfoCircle,
} from "react-icons/fa";
import { preCheckDigitalOrderStock } from "../../services/ServiceManager";

const COVER_PAPER_TYPES = {
  کاک: ["210 گرم", "250 گرم", "260 گرم", "300 گرم"],
  "بلیچ کارت": ["250 گرم", "270 گرم", "300 گرم"],
};

const SIZES = ["وزیری", "رقعه‌ای", "لیتر"];
const COLORS = ["ساده", "دو رنگ", "چهار رنگ"];
const LAMINATIONS = ["جلا دار", "مات"];
const SAHAFAT_TYPES = ["گم", "سینتر پن", "جلد سخت"];
const PALET_LOCATIONS = ["سی تی پی غرب", "سی تی پی کابل", "پلیت موجود است"];

const PAPER_TYPES = {
  افست: ["54 گرم", "60 گرم", "70 گرم", "80 گرم"],
  "آرت پیپر": ["80 گرم", "113 گرم", "128 گرم", "150 گرم"],
};

const DigitalSection = ({ record = {}, setRecord, isSubmitting }) => {
  const digitalArray = record?.digital || [];
  const [expandedOrders, setExpandedOrders] = useState({ 0: true });
  const [openDropdown, setOpenDropdown] = useState(null);

  const [stockInfo, setStockInfo] = useState({});
  const [loadingStock, setLoadingStock] = useState({});
  // حالت جدید برای مودال پلیت لوکیشن
 

  // تغییر: فقط یک مودال می‌تواند باز باشد
  const [openStockModal, setOpenStockModal] = useState(null); // null یا {index: number, type: 'text' | 'cover'}

  const stockCheckTimerRef = useRef(null);
  const modalRefs = useRef({});

  const emptyDigital = {
    name: "",
    paper_type: "",
    cover_type: "",
    cover_weight: "",
    cover_quantity: null,
    size: "",
    quantity: null,
    qut_sheet: null,
    color: "",
    leminition_type: "",
    sahafat_type: "",
    Paper_weight: "",
    qut_palet: null,
    palet_location: "",
    price_per: null,
    price_units: null,
    totla_price: null,
  };

  // هندل کلیک خارج از مودال
  useEffect(() => {
    const handleClickOutside = (event) => {
      // اگر روی مودال فعلی کلیک نشده و روی هر دکمه دیگر کلیک شده، مودال را ببند
      if (openStockModal) {
        const modalRef =
          modalRefs.current[`${openStockModal.index}-${openStockModal.type}`];
        if (modalRef && !modalRef.contains(event.target)) {
          setOpenStockModal(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openStockModal]);

  // تابع برای باز کردن مودال موجودی
  const openStockModalHandler = (index, type) => {
    setOpenStockModal({ index, type });
  };

  // تابع برای بستن مودال موجودی
  const closeStockModalHandler = () => {
    setOpenStockModal(null);
  };

  // مودال شناور برای نمایش موجودی کاغذ متن
  const TextStockInfoModal = ({ item, index, isOpen }) => {
    if (!isOpen) return null;

    const info = stockInfo[index];
    const textData = info?.text;
    const isPersonal = info?.hasPersonalStock;

    if (!textData) {
      return (
        <div
          ref={(el) => (modalRefs.current[`${index}-text`] = el)}
          className="absolute z-50 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaInfoCircle className="text-yellow-600 text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  اطلاعات کاغذ متن
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  ابتدا نوع کاغذ و سایز را انتخاب کنید تا وضعیت موجودی بررسی
                  شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const availableQty = isPersonal
      ? textData.availableInPersonalStock
      : textData.availableInCentralStock;

    const isEnough = textData.canProceed;
    const sourceName = isPersonal ? "گدام مشتری" : "گدام مرکزی";

    return (
      <div
        ref={(el) => (modalRefs.current[`${index}-text`] = el)}
        className="absolute z-50 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-xl"
        style={{
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-blue-600" />
              <h4 className="font-semibold text-gray-800">موجودی کاغذ متن</h4>
            </div>
            <button
              onClick={closeStockModalHandler}
              className="text-gray-400 text-2xl hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Paper Type Info */}
          <div className="mb-4 ">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">نوع کاغذ:</span>
              <span className="font-medium text-sm text-gray-800">
                {item.paper_type}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">سایز:</span>
              <span className="font-medium text-sm text-gray-800">
                {item.size}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">پاکت مورد نیاز:</span>
              <span className="font-medium text-sm text-gray-800">
                {item.Paper_weight || 0} پاکت
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div
            className={`p-3 rounded-lg mb-4 ${isEnough ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isEnough ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-700">
                    موجودی کافی
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-700">
                    موجودی ناکافی
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700">
              {isEnough
                ? ` ${availableQty.toLocaleString()} پاکت در  ${sourceName} دارید      .`
                : `شما فقط ${availableQty.toLocaleString()} پاکت در  ${sourceName} دارید، اما ${textData.requiredQuantity.toLocaleString()} پاکت نیاز است.`}
            </p>
          </div>

          {/* Stock Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">منبع:</span>
              <span className="font-medium text-gray-800">{sourceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">موجودی فعلی:</span>
              <span className="font-medium text-gray-800">
                {availableQty.toLocaleString()} پاکت
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">نیاز سفارش:</span>
              <span className="font-medium text-gray-800">
                {textData.requiredQuantity.toLocaleString()} پاکت
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">تفاوت:</span>
              <span
                className={`font-bold ${isEnough ? "text-green-600" : "text-red-600"}`}
              >
                {isEnough
                  ? `+${(availableQty - textData.requiredQuantity).toLocaleString()}`
                  : `-${(textData.requiredQuantity - availableQty).toLocaleString()}`}{" "}
                پاکت
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {!isEnough && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  برای تکمیل این سفارش نیاز به خرید{" "}
                  {textData.requiredQuantity - availableQty} پاکت{" "}
                  {item.paper_type} دارید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // مودال شناور برای نمایش موجودی کاغذ جلد
  const CoverStockInfoModal = ({ item, index, isOpen }) => {
    if (!isOpen) return null;

    const info = stockInfo[index];
    const coverData = info?.cover;
    const isPersonal = info?.hasPersonalStock;

    if (!coverData) {
      return (
        <div
          ref={(el) => (modalRefs.current[`${index}-cover`] = el)}
          className="absolute z-50 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaInfoCircle className="text-yellow-600 text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  اطلاعات کاغذ جلد
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  ابتدا نوع کاغذ جلد و سایز را انتخاب کنید تا وضعیت موجودی بررسی
                  شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const availableQty = isPersonal
      ? coverData.availableInPersonalStock
      : coverData.availableInCentralStock;

    const isEnough = coverData.canProceed;
    const sourceName = isPersonal ? "گدام مشتری" : "گدام مرکزی";

    return (
      <div
        ref={(el) => (modalRefs.current[`${index}-cover`] = el)}
        className="absolute z-50 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-xl"
        style={{
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-purple-600" />
              <h4 className="font-semibold text-gray-800">موجودی کاغذ جلد</h4>
            </div>
            <button
              onClick={closeStockModalHandler}
              className="text-gray-400 text-xl hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Cover Paper Info */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">نوع کاغذ:</span>
              <span className="font-medium text-gray-800">
                {item.cover_type}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">سایز:</span>
              <span className="font-medium text-gray-800">{item.size}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">ورق مورد نیاز:</span>
              <span className="font-medium text-gray-800">
                {item.cover_quantity || 0} ورق
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div
            className={`p-3 rounded-lg mb-4 ${isEnough ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isEnough ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-700">
                    موجودی کافی
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-700">
                    موجودی ناکافی
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700">
              {isEnough
                ? `شما ${availableQty.toLocaleString()} کارتن در  ${sourceName} دارید که برای این سفارش کافی است.`
                : `شما فقط ${availableQty.toLocaleString()} کارتن در  ${sourceName} دارید، اما ${coverData.requiredQuantity.toLocaleString()} کارتن نیاز است.`}
            </p>
          </div>

          {/* Stock Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">منبع:</span>
              <span className="font-medium text-gray-800">{sourceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">موجودی فعلی:</span>
              <span className="font-medium text-gray-800">
                {availableQty.toLocaleString()} کارتن
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">نیاز سفارش:</span>
              <span className="font-medium text-gray-800">
                {coverData.requiredQuantity.toLocaleString()} کارتن
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">تفاوت:</span>
              <span
                className={`font-bold ${isEnough ? "text-green-600" : "text-red-600"}`}
              >
                {isEnough
                  ? `+${(availableQty - coverData.requiredQuantity).toLocaleString()}`
                  : `-${(coverData.requiredQuantity - availableQty).toLocaleString()}`}{" "}
                کارتن{" "}
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {!isEnough && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  برای تکمیل این سفارش نیاز به خرید{" "}
                  {coverData.requiredQuantity - availableQty} کارتن{" "}
                  {item.cover_type} دارید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- تابع هوشمند بررسی موجودی ---
  const checkItemStock = useCallback(
    async (index, item) => {
      if ((!item.paper_type && !item.cover_type) || !item.size) return;
      if (!record.customerId) return;

      setLoadingStock((prev) => ({ ...prev, [index]: true }));

      try {
        const result = await preCheckDigitalOrderStock({
          customerId: record.customerId,
          digital: [item],
        });

        if (
          result.success &&
          result.checkResults &&
          result.checkResults.length > 0
        ) {
          const itemResult = result.checkResults[0];
          setStockInfo((prev) => ({
            ...prev,
            [index]: {
              hasPersonalStock: result.customer.hasPersonalStock,
              text: itemResult.results.find((r) => r.type === "متن"),
              cover: itemResult.results.find((r) => r.type === "جلد"),
            },
          }));
        }
      } catch (error) {
        console.error("Stock check error:", error);
      } finally {
        setLoadingStock((prev) => ({ ...prev, [index]: false }));
      }
    },
    [record.customerId],
  );

  // آیکون وضعیت موجودی برای پاکت
  const renderTextStockIcon = (item, index) => {
    if (
      !item.paper_type ||
      !item.size ||
      !item.Paper_weight ||
      item.Paper_weight <= 0
    ) {
      return null;
    }

    const info = stockInfo[index];
    const textData = info?.text;
    const hasStock = textData?.canProceed;
    const isModalOpen =
      openStockModal?.index === index && openStockModal?.type === "text";

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          // اگر مودال دیگری باز است، بستن آن و باز کردن این
          openStockModalHandler(index, "text");
        }}
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${hasStock ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"} ${isModalOpen ? "ring-2 ring-blue-500" : ""}`}
        title={
          hasStock
            ? "موجودی کافی است - کلیک برای جزئیات"
            : "موجودی ناکافی - کلیک برای جزئیات"
        }
      >
        {hasStock ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <FaExclamationTriangle className="w-4 h-4" />
        )}
      </button>
    );
  };

  // آیکون وضعیت موجودی برای جلد
  const renderCoverStockIcon = (item, index) => {
    if (
      !item.cover_type ||
      !item.size ||
      !item.cover_quantity ||
      item.cover_quantity <= 0
    ) {
      return null;
    }

    const info = stockInfo[index];
    const coverData = info?.cover;
    const hasStock = coverData?.canProceed;
    const isModalOpen =
      openStockModal?.index === index && openStockModal?.type === "cover";

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          // اگر مودال دیگری باز است، بستن آن و باز کردن این
          openStockModalHandler(index, "cover");
        }}
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${hasStock ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"} ${isModalOpen ? "ring-2 ring-blue-500" : ""}`}
        title={
          hasStock
            ? "موجودی کافی است - کلیک برای جزئیات"
            : "موجودی ناکافی - کلیک برای جزئیات"
        }
      >
        {hasStock ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <FaExclamationTriangle className="w-4 h-4" />
        )}
      </button>
    );
  };

  const addDigital = () => {
    const newIndex = digitalArray.length;
    setRecord({ ...record, digital: [...digitalArray, { ...emptyDigital }] });
    setExpandedOrders({ ...expandedOrders, [newIndex]: true });
  };

  const updateDigital = (index, field, value) => {
    const updated = [...digitalArray];
    const numericFields = [
      "quantity",
      "qut_sheet",
      "qut_palet",
      "cover_quantity",
      "price_per",
      "price_units",
      "Paper_weight",
    ];

    if (numericFields.includes(field))
      updated[index][field] = Number(value) || 0;
    else if (field === "cover_type") {
      updated[index][field] = value;
      if (!value.includes(" ")) updated[index].cover_weight = "";
    }
    // Allow palet_location to be empty
    else if (field === "palet_location") {
      updated[index][field] = value || ""; // This allows empty string
    } else updated[index][field] = value;

    // محاسبات
    updated[index].qut_palet = calculateQutPalet(
      updated[index].size,
      updated[index].qut_sheet,
      updated[index].color,
    );
    const priceUnits = Number(updated[index].price_units) || 0;
    const qutSheet = Number(updated[index].qut_sheet) || 0;
    const quantity = Number(updated[index].quantity) || 0;

    const rawPricePer = priceUnits * qutSheet;
    updated[index].price_per = Number(rawPricePer.toFixed(2));

    const rawTotal = updated[index].price_per * quantity;
    updated[index].total_price = Number(rawTotal.toFixed(2));

    setRecord({ ...record, digital: updated });

    if (
      [
        "paper_type",
        "cover_type",
        "size",
        "Paper_weight",
        "cover_quantity",
      ].includes(field)
    ) {
      if (stockCheckTimerRef.current) clearTimeout(stockCheckTimerRef.current);
      stockCheckTimerRef.current = setTimeout(() => {
        checkItemStock(index, updated[index]);
      }, 500);
    }
  };

  const deleteDigital = (index) => {
    const updated = digitalArray.filter((_, i) => i !== index);
    setRecord({ ...record, digital: updated });
    const newStockInfo = { ...stockInfo };
    delete newStockInfo[index];
    setStockInfo(newStockInfo);
    // اگر مودال این آیتم باز بود، ببند
    if (openStockModal?.index === index) {
      setOpenStockModal(null);
    }
  };

  const toggleOrderExpand = (index) => {
    setExpandedOrders((prev) => ({ ...prev, [index]: !prev[index] }));
    // اگر سفارش بسته شد، مودال آن را هم ببند
    if (expandedOrders[index] && openStockModal?.index === index) {
      setOpenStockModal(null);
    }
  };

  const calculateQutPalet = (size, qutSheet, color) => {
    const pages = Number(qutSheet) || 0;
    if (!size || pages === 0) return 0;
    let basePalet = 0;
    if (size === "وزیری" || size === "رقعه‌ای")
      basePalet = Math.ceil(pages / 8);
    else if (size === "لیتر") basePalet = Math.ceil(pages / 4);
    let colorMultiplier = 1;
    if (color === "دو رنگ") colorMultiplier = 2;
    if (color === "چهار رنگ") colorMultiplier = 4;
    return basePalet * colorMultiplier;
  };

  // --- رندر وضعیت موجودی (اصلاح شده برای جلد) ---
  const renderStockStatus = (index) => {
    if (loadingStock[index])
      return (
        <div className="text-xs text-blue-600 mt-2 animate-pulse flex items-center gap-1">
          <FaWarehouse /> در حال بررسی موجودی...
        </div>
      );
    const info = stockInfo[index];
    if (!info || (!info.text && !info.cover)) return null;

    const isPersonal = info.hasPersonalStock;

    const StockRow = ({ label, data, unit }) => {
      if (!data) return null;

      const availableQty = isPersonal
        ? data.availableInPersonalStock
        : data.availableInCentralStock;

      const isEnough = data.canProceed;
      const sourceName = isPersonal ? "گدام مشتری" : "گدام مرکزی";

      return (
        <div
          className={`flex justify-between items-center py-2 px-3 mb-1 rounded border transition-all duration-300 ${isEnough ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <div className="flex items-center gap-2">
            {isEnough ? (
              <FaCheckCircle className="text-green-600" />
            ) : (
              <FaExclamationTriangle className="text-red-500" />
            )}
            <span className="text-sm font-bold text-gray-700">{label}:</span>
          </div>
          <div className="text-xs text-left">
            <div
              className={`font-bold ${isEnough ? "text-green-700" : "text-red-700"}`}
            >
              موجودی: {availableQty.toLocaleString()} {unit}
            </div>
            <div className="text-gray-500">منبع: {sourceName}</div>
            {!isEnough && (
              <div className="text-red-600 font-bold mt-1 bg-white px-1 rounded">
                کمبود: {(data.requiredQuantity - availableQty).toLocaleString()}{" "}
                {unit}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <StockRow label="کاغذ متن" data={info.text} unit="پاکت" />
        <StockRow label="کاغذ جلد" data={info.cover} unit="ورق" />
      </div>
    );
  };

  const fieldGroups = [
    [
      { key: "name", type: "text", label: "نام جنس" },
      { key: "paper_type", type: "nested-paper", label: "نوع کاغذ" },
      { key: "cover_type", type: "nested-cover", label: "نوع کاغذ جلد" },
      { key: "size", type: "dropdown", options: SIZES, label: "سایز" },
    ],
    [
      { key: "quantity", type: "number", label: "تیراژ *" },
      { key: "qut_sheet", type: "number", label: "تعداد صفحات *" },
      { key: "color", type: "dropdown", options: COLORS, label: "نوع رنگ" },
      {
        key: "leminition_type",
        type: "dropdown",
        options: LAMINATIONS,
        label: "نوع لمینیشن",
      },
    ],
    [
      {
        key: "sahafat_type",
        type: "dropdown",
        options: SAHAFAT_TYPES,
        label: "نوع صحافی",
      },
      { key: "Paper_weight", type: "number", label: "تعداد پاکت *" },
      { key: "cover_quantity", type: "number", label: "تعداد جلد (ورق)" },
      { key: "qut_palet", type: "number", readOnly: true, label: "تعداد پلیت" },
    ],
    [
      {
        key: "palet_location",
        type: "dropdown",
        options: PALET_LOCATIONS,
        allowCustom: true,
        label: "محل پلیت (CTP)",
        allowEmpty: true, // Add this flag
      },
      { key: "price_units", type: "number", label: "قیمت فی صفحه *" },
      {
        key: "price_per",
        type: "number",
        readOnly: true,
        label: "قیمت فی جلد",
      },
      {
        key: "total_price",
        type: "number",
        readOnly: true,
        label: "قیمت مجموعی",
      },
    ],
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {digitalArray.map((d, i) => {
          const isExpanded = expandedOrders[i];
          const textStockIcon = renderTextStockIcon(d, i);
          const coverStockIcon = renderCoverStockIcon(d, i);

          return (
            <div
              key={i}
              className="bg-white rounded-md border border-gray-200 overflow-visible shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-md flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderExpand(i)}
              >
                <div className="flex items-center gap-2">
                  <div className="text-gray-600">
                    {isExpanded ? (
                      <FaChevronUp size={14} />
                    ) : (
                      <FaChevronDown size={14} />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-cyan-800">
                    سفارش چاپ {i + 1}
                  </h3>
                  {d.name && (
                    <span className="text-xs text-gray-500 border-r pr-2 mr-2">
                      {d.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-green-700 text-sm bg-green-50 px-2 py-1 rounded">
                    {Number(d.totla_price || 0).toLocaleString()} افغانی
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDigital(i);
                    }}
                    className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-5">
                  <div className="space-y-6 mt-4">
                    {fieldGroups.map((group, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                      >
                        {group.map(
                          ({
                            key,
                            type,
                            readOnly,
                            options,
                            allowCustom,
                            label,
                          }) => (
                            <div key={key} className="space-y-2 relative">
                              <label className="block text-xs font-bold text-gray-700">
                                {label}
                              </label>

                              {key === "paper_type" ? (
                                <PaperTypeDropdown
                                  value={d[key]}
                                  isOpen={
                                    openDropdown === `digital-${i}-${key}`
                                  }
                                  onToggle={() =>
                                    setOpenDropdown(
                                      openDropdown === `digital-${i}-${key}`
                                        ? null
                                        : `digital-${i}-${key}`,
                                    )
                                  }
                                  onChange={(val) => {
                                    updateDigital(i, key, val);
                                    setOpenDropdown(null);
                                  }}
                                />
                              ) : key === "cover_type" ? (
                                <CoverTypeDropdown
                                  value={d[key]}
                                  isOpen={
                                    openDropdown === `digital-${i}-${key}`
                                  }
                                  onToggle={() =>
                                    setOpenDropdown(
                                      openDropdown === `digital-${i}-${key}`
                                        ? null
                                        : `digital-${i}-${key}`,
                                    )
                                  }
                                  onSelect={(val) => {
                                    updateDigital(i, key, val);
                                    setOpenDropdown(null);
                                  }}
                                />
                              ) : options ? (
                                <Dropdown
                                  value={d[key]}
                                  options={options}
                                  allowCustom={allowCustom}
                                  isOpen={
                                    openDropdown === `digital-${i}-${key}`
                                  }
                                  onToggle={() =>
                                    setOpenDropdown(
                                      openDropdown === `digital-${i}-${key}`
                                        ? null
                                        : `digital-${i}-${key}`,
                                    )
                                  }
                                  onChange={(val) => {
                                    updateDigital(i, key, val);
                                    setOpenDropdown(null);
                                  }}
                                />
                              ) : (
                                <div className="relative">
                                  {/* آیکون موجودی برای Paper_weight */}
                                  {key === "Paper_weight" && textStockIcon}

                                  {/* آیکون موجودی برای cover_quantity */}
                                  {key === "cover_quantity" && coverStockIcon}

                                  <input
                                    type={type === "number" ? "number" : "text"}
                                    value={d[key] ?? ""}
                                    disabled={readOnly}
                                    onFocus={() => {
                                      if (key === "Paper_weight") {
                                        openStockModalHandler(i, "text");
                                      } else if (key === "cover_quantity") {
                                        openStockModalHandler(i, "cover");
                                      }
                                    }}
                                    onChange={(e) =>
                                      updateDigital(i, key, e.target.value)
                                    }
                                    className={`w-full px-3 py-2.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-transparent transition-all ${readOnly ? "bg-gray-200 cursor-not-allowed" : "bg-gray-200 hover:border-gray-400"} ${key === "Paper_weight" || key === "cover_quantity" ? "pl-10" : ""}`}
                                  />

                                  {/* مودال شناور برای کاغذ متن */}
                                  {key === "Paper_weight" && (
                                    <TextStockInfoModal
                                      item={d}
                                      index={i}
                                      isOpen={
                                        openStockModal?.index === i &&
                                        openStockModal?.type === "text"
                                      }
                                    />
                                  )}

                                  {/* مودال شناور برای کاغذ جلد */}
                                  {key === "cover_quantity" && (
                                    <CoverStockInfoModal
                                      item={d}
                                      index={i}
                                      isOpen={
                                        openStockModal?.index === i &&
                                        openStockModal?.type === "cover"
                                      }
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addDigital}
        className="mt-4 flex items-center gap-2 bg-cyan-700 text-white px-5 py-2.5 rounded-lg shadow hover:bg-cyan-800 transition-all transform hover:scale-[1.02] font-semibold text-sm"
      >
        <FaPlus /> افزودن سفارش جدید
      </button>
    </div>
  );
};;

export default DigitalSection;

// Dropdowns (بقیه کد dropdownها بدون تغییر باقی می‌ماند)
export const Dropdown = ({
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  allowCustom,
}) => (
  <div className="relative">
    <div
      className={`w-full bg-gray-200 border border-gray-300 rounded-md flex items-center transition-all ${isOpen ? "ring-2 ring-cyan-700 border-transparent" : "hover:border-gray-400"}`}
    >
      {allowCustom ? (
        <input
          type="text"
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none rounded-md"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onClick={onToggle}
          placeholder="انتخاب یا تایپ..."
        />
      ) : (
        <div
          onClick={onToggle}
          className="w-full px-3 py-2.5 cursor-pointer flex justify-between items-center text-sm"
        >
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {value || "انتخاب کنید"}
          </span>
        </div>
      )}
      <FaChevronDown
        onClick={onToggle}
        className={`mx-3 text-gray-500 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
    {isOpen && (
      <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto animate-fadeIn">
        {options?.map((opt, i) => (
          <li
            key={i}
            onClick={() => onChange(opt)}
            className="px-4 py-2.5 border border-gray-100 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-0 text-gray-700 transition-colors"
          >
            {opt}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export const PaperTypeDropdown = ({ value, onChange, isOpen, onToggle }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  return (
    <div className="relative">
      <div
        onClick={onToggle}
        className={`w-full bg-gray-200 border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer flex justify-between items-center transition-all ${isOpen ? "ring-2 ring-cyan-700 border-transparent" : "hover:border-gray-400"}`}
      >
        <span
          className={`text-sm ${value ? "text-gray-800" : "text-gray-400"}`}
        >
          {value || "انتخاب نوع کاغذ"}
        </span>
        <FaChevronDown
          className={`text-gray-500 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 flex bg-white border border-gray-200 rounded-md shadow-xl animate-fadeIn">
          <ul className="w-32 bg-gray-50 rounded-r-md border-l border-gray-200">
            {Object.keys(PAPER_TYPES).map((cat) => (
              <li
                key={cat}
                onMouseEnter={() => setHoveredCategory(cat)}
                className={`px-3 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${hoveredCategory === cat ? "bg-white text-cyan-800 font-bold" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {cat}{" "}
                <FaChevronDown
                  className={`text-[10px] transform rotate-90 ${hoveredCategory === cat ? "text-cyan-800" : "text-gray-400"}`}
                />
              </li>
            ))}
          </ul>
          <ul className="w-32 bg-white rounded-l-md h-full min-h-[150px]">
            {hoveredCategory ? (
              PAPER_TYPES[hoveredCategory].map((weight) => (
                <li
                  key={weight}
                  onClick={() => onChange(`${hoveredCategory} ${weight}`)}
                  className="px-3 py-2.5 text-sm hover:bg-cyan-50 hover:text-cyan-800 border border-gray-200 cursor-pointer text-gray-700 transition-colors"
                >
                  {weight}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-xs text-gray-400 text-center">
                لطفا یک دسته را انتخاب کنید
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export const CoverTypeDropdown = ({ value, onSelect, isOpen, onToggle }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  return (
    <div className="relative">
      <div
        onClick={onToggle}
        className={`w-full bg-gray-200 border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer flex justify-between items-center transition-all ${isOpen ? "ring-2 ring-cyan-700 border-transparent" : "hover:border-gray-400"}`}
      >
        <span
          className={`text-sm ${value ? "text-gray-800" : "text-gray-400"}`}
        >
          {value || "انتخاب کاغذ جلد"}
        </span>
        <FaChevronDown
          className={`text-gray-500 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 flex bg-gray-200 border border-gray-200 rounded-md shadow-xl animate-fadeIn">
          <ul className="w-32 bg-gray-50 rounded-r-md border-l border-gray-200">
            {Object.keys(COVER_PAPER_TYPES).map((cat) => (
              <li
                key={cat}
                onMouseEnter={() => setHoveredCategory(cat)}
                className={`px-3 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${hoveredCategory === cat ? "bg-gray-100 text-cyan-800 font-bold" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {cat}{" "}
                <FaChevronDown
                  className={`text-[10px] transform rotate-90 ${hoveredCategory === cat ? "text-cyan-800" : "text-gray-400"}`}
                />
              </li>
            ))}
          </ul>
          <ul className="w-32 bg-gray-50  rounded-l-md h-full min-h-[150px]">
            {hoveredCategory ? (
              COVER_PAPER_TYPES[hoveredCategory].map((weight) => (
                <li
                  key={weight}
                  onClick={() => onSelect(`${hoveredCategory} ${weight}`)}
                  className="px-3 py-2.5 text-sm hover:bg-cyan-50 hover:text-cyan-800 border border-gray-200 cursor-pointer text-gray-700 transition-colors"
                >
                  {weight}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-xs text-gray-400 text-center">
                لطفا یک دسته را انتخاب کنید
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
