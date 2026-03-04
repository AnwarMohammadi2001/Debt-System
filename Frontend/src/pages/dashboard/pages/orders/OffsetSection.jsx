import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaBoxOpen,
  FaInfoCircle,
} from "react-icons/fa";
import { getStockBySize } from "../../services/ServiceManager";

const SIZE_OPTIONS = ["A4", "A5", ];

const OffsetSection = ({ record, setRecord }) => {
  const offsetArray = record?.offset || [];
  const [expandedOrders, setExpandedOrders] = useState({ 0: true });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [stockData, setStockData] = useState({});
  const [showStockModal, setShowStockModal] = useState({});

  // Refs برای تشخیص کلیک خارج از مودال
  const modalRefs = useRef({});

  // تابع برای دریافت موجودی یک سایز
  const fetchStockForSize = async (size) => {
    if (!size) return;

    try {
      const stock = await getStockBySize(size);
      setStockData((prev) => ({
        ...prev,
        [size]: stock,
      }));
    } catch (error) {
      console.error(`Error fetching stock for ${size}:`, error);
      setStockData((prev) => ({
        ...prev,
        [size]: null,
      }));
    }
  };

  // هندل کلیک خارج از مودال
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(modalRefs.current).forEach((key) => {
        const modalRef = modalRefs.current[key];
        if (modalRef && !modalRef.contains(event.target)) {
          const [index, field] = key.split("-");
          if (field === "stock" && showStockModal[index]) {
            closeStockModal(index);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStockModal]);

  // مودال شناور برای نمایش موجودی
  const StockInfoModal = ({ item, index, isOpen, onClose }) => {
    if (!isOpen) return null;

    const { hasStock, available, needed } = checkStockAvailability(item);

    // اگر سایز انتخاب نشده
    if (!item.size) {
      return (
        <div
          ref={(el) => (modalRefs.current[`${index}-stock`] = el)}
          className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: "300px",
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
                  ابتدا سایز را انتخاب کنید
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  برای مشاهده موجودی گدام، ابتدا سایز کاغذ را از لیست انتخاب
                  نمایید.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // اگر مقدار کاغذ وارد نشده
    if (!item.Paper_weight || item.Paper_weight <= 0) {
      return (
        <div
          ref={(el) => (modalRefs.current[`${index}-stock`] = el)}
          className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaInfoCircle className="text-blue-600 text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  مقدار کاغذ مورد نیاز
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  لطفاً تعداد کارتن کاغذ مورد نیاز را وارد کنید تا وضعیت موجودی
                  بررسی شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // مودال اصلی اطلاعات موجودی
    return (
      <div
        ref={(el) => (modalRefs.current[`${index}-stock`] = el)}
        className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-xl"
        style={{
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          maxHeight: "300px",
          overflow: "auto",
        }}
      >
        <div className="p-2">
          {/* Stock Status */}
          <div
            className={`p-3 rounded-lg mb-4 ${hasStock ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {hasStock ? (
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
              {hasStock
                ? `شما ${available} کارتن در گدام دارید      .`
                : `شما فقط ${available} کارتن در گدام دارید، اما ${needed} کارتن نیاز است.`}
            </p>
          </div>

          {/* Stock Details */}
          <div className="space-y-2">
          
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">نیاز سفارش:</span>
              <span className="font-medium text-gray-800">{needed} کارتن</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">تفاوت:</span>
              <span
                className={`font-bold ${hasStock ? "text-green-600" : "text-red-600"}`}
              >
                {hasStock ? `+${available - needed}` : `-${needed - available}`}{" "}
                کارتن
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {!hasStock && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  برای تکمیل این سفارش نیاز به خرید {needed - available} کارتن{" "}
                  {item.size} دارید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // تابع برای باز کردن مودال موجودی
  const openStockModal = (index) => {
    setShowStockModal((prev) => ({ ...prev, [index]: true }));
  };

  // تابع برای بستن مودال موجودی
  const closeStockModal = (index) => {
    setShowStockModal((prev) => ({ ...prev, [index]: false }));
  };

  // تابع برای toggle کردن مودال
  const toggleStockModal = (index) => {
    setShowStockModal((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const updateOffset = (index, field, value) => {
    const updated = [...offsetArray];

    const numericFields = [
      "quantity",
      "price_per_unit",
      "total_sheet",
      "Paper_weight",
      "cover_price",
    ];

    if (numericFields.includes(field)) {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }

    // اگر سایز تغییر کرد، موجودی جدید بگیر
    if (field === "size" && value) {
      fetchStockForSize(value);
    }

    // محاسبات
    const totalSheet = updated[index].total_sheet || 0;
    const pricePerPage = updated[index].price_per_unit || 0;
    const coverPrice = updated[index].cover_price || 0;
    const quantity = updated[index].quantity || 0;
    const paperWeight = parseFloat(updated[index].Paper_weight) || 0;

    // ✅ قیمت فی جلد
    const pricePerBook = totalSheet * pricePerPage + coverPrice;

    // ✅ قیمت مجموعی
    const totalPrice = pricePerBook * quantity;

    updated[index].price_per_book = Math.round(pricePerBook);
    updated[index].total_price = Math.round(totalPrice);
    updated[index].money = Math.round(totalPrice);

    // محاسبه مقدار کاغذ لازم (کارتن)
    const cartonsNeeded = paperWeight > 0 ? paperWeight : 0;
    updated[index].cartons_needed = cartonsNeeded;

    setRecord({ ...record, offset: updated });
  };

  // بررسی اینکه آیا کاغذ کافی داریم
  const checkStockAvailability = (item) => {
    if (!item.size || !item.cartons_needed || item.cartons_needed <= 0) {
      return { hasStock: true, available: 0, needed: 0 };
    }

    const stock = stockData[item.size];
    if (!stock) {
      return { hasStock: false, available: 0, needed: item.cartons_needed };
    }

    const available = stock.cartonCount || 0;
    const needed = item.cartons_needed || 0;

    return {
      hasStock: available >= needed,
      available,
      needed,
    };
  };

  // تابع برای نمایش وضعیت موجودی (حالا فقط آیکون نمایش می‌دهیم)
  const renderStockIcon = (item, index) => {
    if (!item.size || !item.Paper_weight || item.Paper_weight <= 0) {
      return null;
    }

    const { hasStock } = checkStockAvailability(item);

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleStockModal(index);
        }}
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors ${hasStock ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"}`}
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

  // بقیه توابع بدون تغییر...
  const addOffset = () => {
    const newIndex = offsetArray.length;
    setRecord({
      ...record,
      offset: [
        ...offsetArray,
        {
          book_name: "",
          total_sheet: 0,
          size: "",
          quantity: 0,
          descriptions: "",
          price_per_unit: 0,
          cover_price: 0,
          price_per_book: 0,
          Paper_weight: 0,
          total_price: 0,
          money: 0,
          cartons_needed: 0,
        },
      ],
    });

    const newExpanded = {};
    newExpanded[newIndex] = true;
    setExpandedOrders(newExpanded);
  };

  const deleteOffset = (index) => {
    const updated = offsetArray.filter((_, i) => i !== index);
    setRecord({ ...record, offset: updated });

    const newExpanded = { ...expandedOrders };
    delete newExpanded[index];

    const reIndexed = {};
    Object.keys(newExpanded).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        reIndexed[numKey - 1] = expandedOrders[key];
      } else if (numKey < index) {
        reIndexed[numKey] = expandedOrders[key];
      }
    });
    setExpandedOrders(reIndexed);
  };

  const toggleOrderExpand = (index) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getFieldLabel = (field) => {
    const labels = {
      book_name: "نام کتاب",
      total_sheet: "تعداد صفحه",
      cover_price: "قیمت پوش",
      size: "سایز",
      quantity: "تیراژ",
      Paper_weight: "مقدار کاغذ (کارتن)",
      descriptions: "ملاحظات",
      price_per_unit: "قیمت فی صفحه",
      price_per_book: "قیمت فی جلد",
      total_price: "قیمت کل",
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      book_name: "نام کتاب",
      total_sheet: "تعداد صفحه",
      cover_price: "قیمت جلد",
      size: "A4، A5",
      quantity: "تعداد",
      descriptions: "توضیحات اضافی",
      price_per_unit: "قیمت هر واحد",
      price_per_book: "محاسبه خودکار",
      Paper_weight: "تعداد کارتن مورد نیاز",
      total_price: "محاسبه خودکار",
    };
    return placeholders[field] || field;
  };

  // رندر فرم برای هر سفارش
  const renderOrderFields = (o, i) => {
    const stockIcon = renderStockIcon(o, i);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {[
          { key: "book_name", type: "text" },
          { key: "total_sheet", type: "number" },
          { key: "size", type: "text" },
          { key: "quantity", type: "number" },
          { key: "Paper_weight", type: "number" },
          { key: "price_per_unit", type: "number" },
          { key: "cover_price", type: "number" },
        ].map(({ key, type }) => (
          <div key={key} className="space-y-2  relative">
            <label className="block text-sm font-medium text-gray-700">
              {getFieldLabel(key)}
              {type === "number" && (
                <span className="text-red-500 mr-1">*</span>
              )}
            </label>
            <div className="relative">
              {key === "size" ? (
                <Dropdown
                  value={o[key]}
                  options={SIZE_OPTIONS}
                  placeholder={getFieldPlaceholder(key)}
                  isOpen={openDropdown === `offset-${i}-${key}`}
                  onToggle={() =>
                    setOpenDropdown(
                      openDropdown === `offset-${i}-${key}`
                        ? null
                        : `offset-${i}-${key}`,
                    )
                  }
                  onChange={(val) => {
                    updateOffset(i, key, val);
                    setOpenDropdown(null);
                  }}
                />
              ) : (
                <div className="relative ">
                  {key === "Paper_weight" && stockIcon}
                  <input
                    type={type}
                    value={o[key] ?? ""}
                    onChange={(e) => updateOffset(i, key, e.target.value)}
                    onFocus={() => {
                      if (
                        key === "Paper_weight" &&
                        (o.size || o.Paper_weight > 0)
                      ) {
                        openStockModal(i);
                      }
                    }}
                    placeholder={getFieldPlaceholder(key)}
                    className={`w-full px-3 py-2.5 rounded-md placeholder:text-sm focus:outline-none focus:ring-1 ring-cyan-700 bg-gray-200 ${key === "Paper_weight" ? "pl-10" : ""}`}
                  />

                  {/* مودال شناور موجودی */}
                  {key === "Paper_weight" && (
                    <StockInfoModal
                      item={o}
                      index={i}
                      isOpen={showStockModal[i]}
                      onClose={() => closeStockModal(i)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* فیلدهای فقط خواندنی */}
        {[
          { key: "price_per_book", label: "قیمت فی جلد" },
          { key: "total_price", label: "قیمت کل" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="text"
              value={o[key] ? o[key].toLocaleString() : "0"}
              readOnly
              className="w-full px-3 py-2.5 rounded-md bg-gray-200 cursor-not-allowed"
            />
          </div>
        ))}

        {/* فیلد توضیحات */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            ملاحظات
          </label>
          <textarea
            value={o.descriptions || ""}
            onChange={(e) => updateOffset(i, "descriptions", e.target.value)}
            placeholder="توضیحات اضافی"
            className="w-full px-3 py-2.5 rounded-md placeholder:text-sm focus:outline-none focus:ring-1 ring-cyan-700 bg-gray-200"
            rows="1"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-gray-50 rounded-lg">
      <div className="space-y-4">
        <div className="space-y-4">
          {offsetArray.length > 0 ? (
            offsetArray.map((o, i) => {
              const isExpanded = expandedOrders[i];
              const orderTotal = o.total_price || 0;

              return (
                <div
                  key={i}
                  className="bg-white relative rounded-lg shadow border border-gray-200 "
                >
                  {/* Order Header */}
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleOrderExpand(i)}
                          className="text-gray-600 hover:text-cyan-800 transition-colors"
                        >
                          {isExpanded ? (
                            <FaChevronUp size={16} />
                          ) : (
                            <FaChevronDown size={16} />
                          )}
                        </button>
                        <h3 className="text-sm font-bold text-cyan-800">
                          سفارش افست {i + 1} {o.book_name && `- ${o.book_name}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700">
                          <span className="font-bold text-green-700">
                            {orderTotal.toLocaleString()} افغانی
                          </span>
                        </div>
                        <button
                          onClick={() => deleteOffset(i)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="حذف سفارش"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-4">{renderOrderFields(o, i)}</div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow border border-gray-200">
              <p className="text-gray-500 text-lg mb-4">
                هیچ سفارش افستی اضافه نشده است.
              </p>
              <button
                onClick={addOffset}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaPlus />
                افزودن اولین سفارش
              </button>
            </div>
          )}
        </div>

        {offsetArray.length > 0 && (
          <div className="bg-white py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={addOffset}
                className="flex items-center gap-2 text-sm cursor-pointer bg-cyan-700 hover:bg-cyan-800 text-white px-5 py-3 rounded-md font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlus />
                افزودن دیگر
              </button>

              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-x-3 bg-gray-50 text-sm py-2 px-4 rounded-lg">
                  <span className="font-semibold text-gray-800">
                    تعداد سفارشات:
                  </span>
                  <span className="font-bold text-cyan-800">
                    {offsetArray.length}
                  </span>
                </div>

                <div className="flex items-center gap-x-3 text-sm py-2 px-4">
                  <span className="font-semibold text-gray-800">
                    مجموع قیمت کل:
                  </span>
                  <span className="font-bold text-green-700">
                    {offsetArray
                      .reduce((sum, item) => sum + (item.total_price || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// کامپوننت Dropdown بدون تغییر
export const Dropdown = ({
  value,
  options,
  onChange,
  placeholder,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="relative">
      <div
        onClick={onToggle}
        className="w-full bg-gray-200 px-3 py-2.5 rounded-md cursor-pointer flex justify-between items-center"
      >
        <span className={value ? "text-gray-800" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <FaChevronDown
          className={`text-cyan-800 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {isOpen && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt, i) => (
            <li
              key={i}
              onClick={() => onChange(opt)}
              className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-300"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OffsetSection;
