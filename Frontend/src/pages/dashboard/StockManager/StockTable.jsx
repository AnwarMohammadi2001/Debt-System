import React, { useState, useEffect } from "react";
import {
  FaFilter,
  FaSearch,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaBox,
} from "react-icons/fa";
import Swal from "sweetalert2";

const categoryLabels = {
  offset: "افست",
  atpaper: "آرت پیپر",
  kak: "کاک",
  bleach_card: "بلیچ کارت",
};

// تابع برای گرفتن نام سایز بر اساس دسته‌بندی
const getSizeLabel = (category, size) => {
  if (!size) return "ثبت نشده";

  // پاکسازی سایز
  const cleanSize = size.trim();

  if (category === "offset") {
    switch (cleanSize) {
      case "20*28":
        return "وزیری";
      case "28*40":
        return "وزیری";
      case "20*30":
        return "لیتر";
      case "23*36":
        return "رقعه‌ای";
      case "23*35":
        return "رقعه‌ای";

      default:
        return cleanSize;
    }
  } else if (category === "atpaper") {
    switch (cleanSize) {
      case "20*30":
        return "وزیری";
      case "23*36":
        return "رقعه‌ای";
      default:
        return cleanSize;
    }
  } else if (category === "kak") {
    switch (cleanSize) {
      case "20*30":
        return "وزیری";
      case "23*36":
        return "رقعه‌ای";
      default:
        return cleanSize;
    }
  } else if (category === "bleach_card") {
    switch (cleanSize) {
      case "20*30":
        return "وزیری";
      case "23*36":
        return "رقعه‌ای";
      default:
        return cleanSize;
    }
  }

  return cleanSize;
};

const StockTable = ({ stocks, onFilterChange }) => {
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("itemCategory");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    filterAndSortStocks();
  }, [
    stocks,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const getStockStatus = (quantity) => {
    if (quantity < 0)
      return {
        label: "موجودی باقی",
        color: "text-purple-800",
        badge: "bg-purple-500",
      };

    if (quantity === 0)
      return {
        label: "اتمام موجودی",
        color: "text-red-800",
        badge: "bg-red-500",
      };

    if (quantity <= 10)
      return {
        label: "موجودی کم",
        color: "text-yellow-800",
        badge: "bg-yellow-500",
      };

    if (quantity <= 50)
      return {
        label: "موجودی متوسط",
        color: "text-blue-800",
        badge: "bg-blue-500",
      };

    return {
      label: "کافی",
      color: "text-green-800",
      badge: "bg-green-500",
    };
  };

  const filterAndSortStocks = () => {
    let filtered = [...stocks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          categoryLabels[item.itemCategory]?.includes(searchTerm) ||
          item.itemType?.includes(searchTerm) ||
          item.unit?.includes(searchTerm) ||
          item.size?.includes(searchTerm) ||
          getSizeLabel(item.itemCategory, item.size)?.includes(searchTerm),
      );
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (item) => item.itemCategory === categoryFilter,
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "OUT_OF_STOCK") return item.quantity === 0;
        if (statusFilter === "LOW_STOCK")
          return item.quantity > 0 && item.quantity <= 10;
        if (statusFilter === "SUFFICIENT") return item.quantity > 10;
        return true;
      });
    }

    // Sorting - add size sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "itemCategory") {
        aValue = categoryLabels[a[sortField]];
        bValue = categoryLabels[b[sortField]];
      }

      if (sortField === "totalValue") {
        aValue = (a.unitPrice || 0) * a.quantity;
        bValue = (b.unitPrice || 0) * b.quantity;
      }

      if (sortField === "size") {
        aValue = getSizeLabel(a.itemCategory, a.size);
        bValue = getSizeLabel(b.itemCategory, b.size);
      }

      if (typeof aValue === "string") {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredStocks(filtered);

    // Notify parent component about filtered data
    if (onFilterChange) {
      onFilterChange(filtered);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="text-cyan-800" />
    ) : (
      <FaSortDown className="text-cyan-800" />
    );
  };

  const exportReport = () => {
    Swal.fire({
      title: "خروجی گزارش",
      text: "فرمت گزارش مورد نظر را انتخاب کنید",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "PDF",
      cancelButtonText: "Excel",
      showDenyButton: true,
      denyButtonText: "چاپ",
      confirmButtonColor: "oklch(52% 0.105 223.128)",
      cancelButtonColor: "#10b981",
      denyButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("موفق", "گزارش PDF با موفقیت تولید شد", "success");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("موفق", "گزارش Excel با موفقیت تولید شد", "success");
      } else if (result.isDenied) {
        window.print();
      }
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="items-center gap-4 py-6  border-t space-y-5 border-gray-200">
        <div className="flex items-center justify-start gap-3">
          <div className="p-2 bg-gray-100 rounded-md">
            <FaFilter className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              لیست موجودی گدام
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              تعداد نمایش: {filteredStocks.length} آیتم
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-3 w-full lg:w-auto items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-x-5">
            <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden p-1 w-full md:w-auto">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  categoryFilter === "ALL"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                همه
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                    categoryFilter === key
                      ? "bg-cyan-800 text-white"
                      : "text-gray-600 hover:bg-cyan-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden p-1 w-full md:w-auto">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  statusFilter === "ALL"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                همه وضعیت‌ها
              </button>
              <button
                onClick={() => setStatusFilter("SUFFICIENT")}
                className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                  statusFilter === "SUFFICIENT"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-green-50"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                کافی
              </button>
              <button
                onClick={() => setStatusFilter("LOW_STOCK")}
                className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                  statusFilter === "LOW_STOCK"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-600 hover:bg-yellow-50"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                کم
              </button>
              <button
                onClick={() => setStatusFilter("OUT_OF_STOCK")}
                className={`px-3 py-2 text-xs font-bold rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                  statusFilter === "OUT_OF_STOCK"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-red-50"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                تمام شده
              </button>
            </div>
          </div>

          <div className="flex items-center gap-x-5">
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="جستجوی کالا..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-800 w-full md:w-64 text-sm transition-all"
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
            </div>

          
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto  pb-6">
        <table className="w-full text-center border-collapse">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className=" px-4 py-3 text-sm">
                <button className="flex items-center justify-center gap-1 w-full hover:text-cyan-800">
                  شماره
                </button>
              </th>
              <th className=" px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("itemCategory")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  دسته بندی
                  {getSortIcon("itemCategory")}
                </button>
              </th>
              <th className=" px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("itemType")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  نوع / گرم
                  {getSortIcon("itemType")}
                </button>
              </th>
              <th className=" px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("quantity")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  مقدار
                  {getSortIcon("quantity")}
                </button>
              </th>
              <th className="b px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("size")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  سایز (نوع)
                  {getSortIcon("size")}
                </button>
              </th>
              <th className=" px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("totalValue")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  ارزش کل
                  {getSortIcon("totalValue")}
                </button>
              </th>
              <th className="b px-4 py-3 text-sm">وضعیت</th>
              <th className=" px-4 py-3 text-sm">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="flex items-center justify-center gap-1 w-full hover:text-cyan-800"
                >
                  آخرین بروزرسانی
                  {getSortIcon("updatedAt")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FaBox className="text-4xl opacity-20" />
                    <span>هیچ کالایی با این فیلترها یافت نشد.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStocks.map((item, index) => {
                const status = getStockStatus(item.quantity);
                const sizeLabel = getSizeLabel(item.itemCategory, item.size);

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      item.quantity < 0
                        ? "bg-rose-100"
                        : item.quantity === 0
                          ? "bg-red-50"
                          : item.quantity <= 10
                            ? "bg-yellow-50"
                            : ""
                    }`}
                  >
                    <td className=" px-4 py-3">
                      <div className="font-mono text-gray-700  py-1 px-3 rounded inline-block">
                        {index + 1}
                      </div>
                    </td>
                    <td className=" px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className=" font-semibold text-sm text-gray-800">
                          {categoryLabels[item.itemCategory]}
                        </span>
                      </div>
                    </td>
                    <td className=" px-4 py-3">
                      <div className=" text-sm font-semibold text-gray-700  py-1 px-3 rounded inline-block">
                        {item.itemType} <span>gr</span>
                      </div>
                    </td>
                    <td className=" px-4 py-3">
                      <span
                        className={`text-sm font-bold ${
                          item.quantity === 0
                            ? "text-red-600"
                            : item.quantity <= 10
                              ? "text-yellow-600"
                              : "text-gray-700"
                        }`}
                      >
                        {item.quantity.toLocaleString()}
                      </span>
                    </td>

                    {/* سایز با نام فارسی */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center">
                        {item.size ? (
                          <div>
                            <span className="font-bold text-sm text-cyan-800 block">
                              {sizeLabel}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 block">
                              ({item.size})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            ثبت نشده
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm text-cyan-800">
                          {item.totalValue?.toLocaleString("fa-IR")} افغانی
                        </span>
                      </div>
                    </td>

                    <td className=" px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold  ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className=" px-4 py-3">
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-600">
                          {new Date(
                            item.updatedAt || item.lastUpdatedAt,
                          ).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <div className="flex items-center gap-4">
          <span>
            تعداد کالاها:{" "}
            <b className="text-gray-800">{filteredStocks.length}</b>
          </span>
          <span className="hidden md:block">•</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>
                کافی: {filteredStocks.filter((i) => i.quantity > 10).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>
                کم:{" "}
                {
                  filteredStocks.filter(
                    (i) => i.quantity > 0 && i.quantity <= 10,
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>
                تمام شده:{" "}
                {filteredStocks.filter((i) => i.quantity === 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockTable;
