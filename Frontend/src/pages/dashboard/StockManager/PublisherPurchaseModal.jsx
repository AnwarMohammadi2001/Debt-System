import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch, FaShoppingCart } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import AnimatedModal from "../../../components/common/AnimatedModal";

const categoryLabels = {
  offset: "افست",
  atpaper: "آرت پیپر",
  kak: "کاک",
  bleach_card: "بلیچ کارت",
};

// سایزهای مجاز بر اساس دسته‌بندی
const sizeOptions = {
  offset: ["20*28", "28*40", "23*35", "23*36"],
  atpaper: ["20*30", "23*36"],
  kak: ["20*30", "23*36"],
  bleach_card: ["20*30", "23*36"],
};

// نوع/وزن کالاها بر اساس دسته‌بندی
const itemTypeOptions = {
  offset: ["54 گرم", "60 گرم", "70 گرم", "80 گرم"],
  atpaper: ["80 گرم", "113 گرم", "128 گرم", "150 گرم"],
  kak: ["210 گرم", "250 گرم", "260 گرم", "300 گرم"],
  bleach_card: ["250 گرم", "270 گرم", "300 گرم"],
};

const PublisherPurchaseModal = ({
  isOpen,
  onClose,
  customers = [], // لیست مشتریان چاپی
  loadingCustomers,
  onSubmit,
  submittingPurchase,
}) => {
  const [purchaseForm, setPurchaseForm] = useState({
    customerId: "",
    itemCategory: "",
    itemType: "",
    size: "",
    quantity: "",
    unit: "پاکت",
    description: "",
    recordedBy: "Admin",
  });

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  const customerDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);

  // فقط مشتریان چاپی را فیلتر کن
  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.customerType === "print" && customer.isStock === true,
    )
    .filter((customer) => {
      const searchLower = customerSearchTerm.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.lastName?.toLowerCase().includes(searchLower)
      );
    });

  // نام مشتری انتخاب شده
  const getSelectedCustomerName = () => {
    if (!purchaseForm.customerId) return "انتخاب مشتری چاپ";
    const customer = customers.find(
      (c) =>
        c.id === purchaseForm.customerId || c._id === purchaseForm.customerId,
    );
    return customer
      ? `${customer.name} ${customer.lastName || ""}`.trim()
      : "انتخاب شده";
  };

  // بستن dropdown‌ها با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setShowCustomerDropdown(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setShowTypeDropdown(false);
      }
      if (
        sizeDropdownRef.current &&
        !sizeDropdownRef.current.contains(event.target)
      ) {
        setShowSizeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ریست فرم وقتی مودال بسته می‌شود
  useEffect(() => {
    if (!isOpen) {
      setPurchaseForm({
        customerId: "",
        itemCategory: "",
        itemType: "",
        size: "",
        quantity: "",
        unit: "پاکت",

        description: "",
        recordedBy: "Admin",
      });
      setCustomerSearchTerm("");
      setShowCustomerDropdown(false);
      setShowCategoryDropdown(false);
      setShowTypeDropdown(false);
      setShowSizeDropdown(false);
    }
  }, [isOpen]);

  // وقتی دسته‌بندی تغییر کرد، سایز پیش‌فرض تنظیم کن
  useEffect(() => {
    if (purchaseForm.itemCategory && sizeOptions[purchaseForm.itemCategory]) {
      const defaultSize = sizeOptions[purchaseForm.itemCategory][0];
      setPurchaseForm((prev) => ({
        ...prev,
        size: defaultSize,
      }));
    }
  }, [purchaseForm.itemCategory]);

  // وقتی دسته‌بندی تغییر کرد، نوع پیش‌فرض تنظیم کن
  useEffect(() => {
    if (
      purchaseForm.itemCategory &&
      itemTypeOptions[purchaseForm.itemCategory]
    ) {
      const defaultType = itemTypeOptions[purchaseForm.itemCategory][0];
      setPurchaseForm((prev) => ({
        ...prev,
        itemType: defaultType,
      }));
    }
  }, [purchaseForm.itemCategory]);

  // تغییرات فرم
  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ارسال فرم
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(purchaseForm);
  };

  // بستن مودال
  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-7xl">
      <div className="">
        {/* Header */}
        <div className="p-4 flex items-center justify-between rounded-t-md bg-cyan-700">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FaShoppingCart className="text-gray-100" />
            ثبت خرید جدید از مشتری چاپ
          </h3>
          <button
            type="button"
            className="cursor-pointer hover:bg-green-800 p-1 rounded"
            onClick={handleClose}
          >
            <FaXmark className="text-xl text-gray-100" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid bg-white grid-cols-3 rounded-md gap-5 p-6"
        >
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Customer Selection with Search */}
              <div className="col-span-1 relative" ref={customerDropdownRef}>
                <label className="block text-sm text-gray-600 font-bold mb-2">
                  انتخاب مشتری چاپ
                </label>
                <div className="relative">
                  <div
                    className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-green-700"
                    onClick={() =>
                      setShowCustomerDropdown(!showCustomerDropdown)
                    }
                  >
                    <span
                      className={
                        purchaseForm.customerId
                          ? "text-gray-800"
                          : "text-gray-500"
                      }
                    >
                      {getSelectedCustomerName()}
                    </span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        showCustomerDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {showCustomerDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="جستجوی مشتری چاپ..."
                            className="w-full rounded-md p-2 focus:outline-none focus:ring-1 ring-green-700 bg-white pr-8 text-sm"
                            value={customerSearchTerm}
                            onChange={(e) =>
                              setCustomerSearchTerm(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <FaSearch className="absolute left-2 top-3 text-gray-400 text-sm" />
                        </div>
                      </div>

                      {/* Customer list */}
                      <div className="max-h-64 overflow-y-auto">
                        {loadingCustomers ? (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-800"></div>
                            <p className="mt-2">در حال بارگذاری...</p>
                          </div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            {customerSearchTerm
                              ? "مشتری چاپی با این مشخصات یافت نشد"
                              : "هیچ مشتری چاپی ثبت نشده است"}
                          </div>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id || customer._id}
                              className={`p-3 cursor-pointer flex items-center justify-between hover:bg-gray-200 border-b border-gray-300 ${
                                purchaseForm.customerId ===
                                (customer.id || customer._id)
                                  ? "bg-green-100 font-semibold"
                                  : ""
                              }`}
                              onClick={() => {
                                setPurchaseForm({
                                  ...purchaseForm,
                                  customerId: customer.id || customer._id,
                                });
                                setShowCustomerDropdown(false);
                                setCustomerSearchTerm("");
                              }}
                            >
                              <div>
                                <div className="font-medium">
                                  {customer.name} {customer.lastName || ""}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {customer.phone && (
                                    <span className="block">
                                      {customer.phone}
                                    </span>
                                  )}
                                  {customer.address && (
                                    <span className="block mt-1 text-gray-500">
                                      {customer.address.length > 30
                                        ? `${customer.address.substring(0, 30)}...`
                                        : customer.address}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                چاپ
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {filteredCustomers.length === 0 &&
                  !loadingCustomers &&
                  !customerSearchTerm && (
                    <p className="text-xs text-red-500 mt-1">
                      هیچ مشتری چاپی ثبت نشده است. ابتدا مشتری چاپ را در سیستم
                      ثبت کنید.
                    </p>
                  )}
              </div>

              {/* Category Select with Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-sm font-bold mb-2">
                  دسته کالا
                </label>
                <div className="relative">
                  <div
                    className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-green-700"
                    onClick={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                  >
                    <span
                      className={
                        purchaseForm.itemCategory
                          ? "text-gray-800"
                          : "text-gray-500"
                      }
                    >
                      {purchaseForm.itemCategory
                        ? categoryLabels[purchaseForm.itemCategory]
                        : "انتخاب دسته"}
                    </span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        showCategoryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {showCategoryDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <div
                          key={key}
                          className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                            purchaseForm.itemCategory === key
                              ? "bg-gray-200 font-semibold"
                              : ""
                          }`}
                          onClick={() => {
                            setPurchaseForm({
                              ...purchaseForm,
                              itemCategory: key,
                            });
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Type/Weight Select with Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <label className="block text-sm text-gray-600 font-bold mb-2">
                  نوع/وزن کاغذ
                </label>
                <div className="relative">
                  <div
                    className={`w-full rounded-md px-2 py-2.5 flex justify-between items-center ${
                      !purchaseForm.itemCategory
                        ? "bg-gray-200 cursor-not-allowed text-gray-400"
                        : "bg-gray-200 cursor-pointer hover:border-gray-400"
                    }`}
                    onClick={() => {
                      if (purchaseForm.itemCategory) {
                        setShowTypeDropdown(!showTypeDropdown);
                      }
                    }}
                  >
                    <span
                      className={
                        purchaseForm.itemType
                          ? "text-gray-800"
                          : "text-gray-500"
                      }
                    >
                      {purchaseForm.itemType
                        ? purchaseForm.itemType
                        : purchaseForm.itemCategory
                          ? "انتخاب نوع"
                          : "ابتدا دسته را انتخاب کنید"}
                    </span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        showTypeDropdown ? "rotate-180" : ""
                      } ${!purchaseForm.itemCategory ? "text-gray-400" : ""}`}
                    />
                  </div>

                  {showTypeDropdown && purchaseForm.itemCategory && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {itemTypeOptions[purchaseForm.itemCategory]?.map(
                        (type) => (
                          <div
                            key={type}
                            className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                              purchaseForm.itemType === type
                                ? "bg-gray-200 font-semibold"
                                : ""
                            }`}
                            onClick={() => {
                              setPurchaseForm({
                                ...purchaseForm,
                                itemType: type,
                              });
                              setShowTypeDropdown(false);
                            }}
                          >
                            {type}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div className="relative" ref={sizeDropdownRef}>
                <label className="block text-sm font-bold mb-2">
                  سایز کاغذ
                </label>
                <div className="relative">
                  <div
                    className={`w-full rounded-md px-2 py-2.5 flex justify-between items-center ${
                      !purchaseForm.itemCategory
                        ? "bg-gray-200 cursor-not-allowed text-gray-400"
                        : "bg-gray-200 cursor-pointer hover:border-gray-400"
                    }`}
                    onClick={() => {
                      if (purchaseForm.itemCategory) {
                        setShowSizeDropdown(!showSizeDropdown);
                      }
                    }}
                  >
                    <span
                      className={
                        purchaseForm.size ? "text-gray-800" : "text-gray-500"
                      }
                    >
                      {purchaseForm.size
                        ? purchaseForm.size
                        : purchaseForm.itemCategory
                          ? "انتخاب سایز"
                          : "ابتدا دسته را انتخاب کنید"}
                    </span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        showSizeDropdown ? "rotate-180" : ""
                      } ${!purchaseForm.itemCategory ? "text-gray-400" : ""}`}
                    />
                  </div>

                  {showSizeDropdown && purchaseForm.itemCategory && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {sizeOptions[purchaseForm.itemCategory]?.map((size) => (
                        <div
                          dir="ltr"
                          key={size}
                          className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 ${
                            purchaseForm.size === size
                              ? "bg-gray-200 font-semibold"
                              : ""
                          }`}
                          onClick={() => {
                            setPurchaseForm({
                              ...purchaseForm,
                              size: size,
                            });
                            setShowSizeDropdown(false);
                          }}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-2">تعداد</label>
                <input
                  type="number"
                  name="quantity"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-green-700"
                  value={purchaseForm.quantity}
                  onChange={handlePurchaseFormChange}
                  placeholder="مثال: 1000"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-bold mb-2">واحد</label>
                <select
                  name="unit"
                  required
                  className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-green-700"
                  value={purchaseForm.unit}
                  onChange={handlePurchaseFormChange}
                >
                  <option value="پاکت">پاکت</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  توضیحات خرید
                </label>
                <textarea
                  name="description"
                  className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-green-700"
                  rows="3"
                  value={purchaseForm.description}
                  onChange={handlePurchaseFormChange}
                  placeholder="توضیحات اضافی درباره خرید (اختیاری)..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-red-600 text-gray-100 rounded-md cursor-pointer hover:bg-red-800 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !purchaseForm.customerId ||
                  !purchaseForm.itemCategory ||
                  !purchaseForm.itemType ||
                  !purchaseForm.size ||
                  !purchaseForm.quantity ||
                  loadingCustomers ||
                  submittingPurchase
                }
              >
                {submittingPurchase ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    ثبت خرید ناشر
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="col-span-1">
            {(purchaseForm.totalAmount &&
              parseFloat(purchaseForm.totalAmount) > 0) ||
              ((purchaseForm.customerId || purchaseForm.itemCategory) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-bold mb-3 text-gray-700 text-lg border-b pb-2">
                    خلاصه خرید ناشر
                  </h4>

                  <div className="space-y-3">
                    {purchaseForm.customerId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">مشتری چاپ:</span>
                        <span className="font-bold">
                          {getSelectedCustomerName()}
                        </span>
                      </div>
                    )}

                    {purchaseForm.itemCategory && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">دسته:</span>
                        <span className="font-bold">
                          {categoryLabels[purchaseForm.itemCategory]}
                        </span>
                      </div>
                    )}

                    {purchaseForm.itemType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع:</span>
                        <span className="font-bold">
                          {purchaseForm.itemType}
                        </span>
                      </div>
                    )}

                    {purchaseForm.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">سایز:</span>
                        <span className="font-bold">{purchaseForm.size}</span>
                      </div>
                    )}

                    {purchaseForm.quantity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تعداد:</span>
                        <span className="font-bold">
                          {parseFloat(purchaseForm.quantity).toLocaleString()}{" "}
                          {purchaseForm.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

export default PublisherPurchaseModal;
