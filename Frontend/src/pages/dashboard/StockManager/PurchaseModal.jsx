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

const itemOptions = {
  offset: ["54", "60", "70", "80"],
  atpaper: ["80", "113", "128", "150"],
  kak: ["210", "250", "260", "300"],
  bleach_card: ["250", "270", "300"],
};

const PurchaseModal = ({
  isOpen,
  onClose,
  sellers,
  loadingSellers,
  onSubmit,
  submittingPurchase,
}) => {
  const [purchaseForm, setPurchaseForm] = useState({
    sellerId: "",
    itemCategory: "",
    itemType: "",
    size: "",
    quantity: "",
    unit: "پاکت",
    unitPrice: "",
    totalAmount: "",
    paidAmount: "",
    bill_number: "",
    description: "",
  });

  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");

  const sellerDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);

  // Filter sellers based on search term
  const filteredSellers = sellers.filter((seller) => {
    const searchLower = sellerSearchTerm.toLowerCase();
    return (
      seller.name?.toLowerCase().includes(searchLower) ||
      seller.phone?.toLowerCase().includes(searchLower) ||
      seller.company?.toLowerCase().includes(searchLower) ||
      seller.email?.toLowerCase().includes(searchLower)
    );
  });

  // Get selected seller name
  const getSelectedSellerName = () => {
    if (!purchaseForm.sellerId) return "انتخاب فروشنده";
    const seller = sellers.find(
      (s) => s.id === purchaseForm.sellerId || s._id === purchaseForm.sellerId,
    );
    return seller ? seller.name : "انتخاب شده";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(event.target)
      ) {
        setShowSellerDropdown(false);
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPurchaseForm({
        sellerId: "",
        itemCategory: "",
        itemType: "",
        size: "",
        quantity: "",
        unit: "پاکت",
        unitPrice: "",
        totalAmount: "",
        paidAmount: "",
        bill_number: "",
        description: "",
      });
      setSellerSearchTerm("");
      setShowSellerDropdown(false);
      setShowCategoryDropdown(false);
      setShowTypeDropdown(false);
      setShowSizeDropdown(false);
    }
  }, [isOpen]);

  // Set default size and itemType when category changes
  useEffect(() => {
    if (purchaseForm.itemCategory) {
      // Set default size
      if (sizeOptions[purchaseForm.itemCategory]) {
        const defaultSize = sizeOptions[purchaseForm.itemCategory][0];
        setPurchaseForm((prev) => ({
          ...prev,
          size: defaultSize,
        }));
      } else {
        setPurchaseForm((prev) => ({
          ...prev,
          size: "",
        }));
      }

      // Set default item type
      if (itemOptions[purchaseForm.itemCategory]) {
        const defaultType = itemOptions[purchaseForm.itemCategory][0];
        setPurchaseForm((prev) => ({
          ...prev,
          itemType: defaultType,
        }));
      } else {
        setPurchaseForm((prev) => ({
          ...prev,
          itemType: "",
        }));
      }
    } else {
      // Clear both if no category selected
      setPurchaseForm((prev) => ({
        ...prev,
        size: "",
        itemType: "",
      }));
    }
  }, [purchaseForm.itemCategory]);

  // Handle form input changes
  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // Calculate total amount when quantity or unit price changes
      if (name === "quantity" || name === "unitPrice") {
        const quantityVal = parseFloat(updatedForm.quantity) || 0;
        const unitPriceVal = parseFloat(updatedForm.unitPrice) || 0;
        updatedForm.totalAmount = (unitPriceVal * quantityVal).toFixed(2);
      }

      return updatedForm;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(purchaseForm);
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      purchaseForm.sellerId &&
      purchaseForm.itemCategory &&
      purchaseForm.itemType &&
      purchaseForm.size &&
      purchaseForm.quantity &&
      parseFloat(purchaseForm.quantity) > 0 &&
      purchaseForm.unitPrice &&
      parseFloat(purchaseForm.unitPrice) >= 0 &&
      !loadingSellers &&
      !submittingPurchase
    );
  };

  // Rest of your JSX code remains the same...
  return (
    <AnimatedModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-7xl">
      <div className="bg-white rounded-md">
        {/* Header */}
        <div className="p-4 flex items-center justify-between rounded-t-md bg-cyan-700">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FaShoppingCart className="text-gray-100" />
            ثبت خرید جدید از فروشنده
          </h3>
          <button
            type="button"
            className="cursor-pointer hover:bg-cyan-800 p-1 rounded"
            onClick={handleClose}
          >
            <FaXmark className="text-xl text-gray-100" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid bg-white grid-cols-3 rounded-md gap-5 p-4"
        >
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Seller Selection with Search */}
              <div className="col-span-1 relative" ref={sellerDropdownRef}>
                <label className="block text-sm text-gray-600 font-bold mb-2">
                  انتخاب فروشنده
                </label>
                <div className="relative">
                  <div
                    className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                    onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                  >
                    <span
                      className={
                        purchaseForm.sellerId
                          ? "text-gray-800"
                          : "text-gray-500"
                      }
                    >
                      {getSelectedSellerName()}
                    </span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        showSellerDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {showSellerDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="جستجوی فروشنده..."
                            className="w-full  rounded-md p-2 focus:outline-none focus:ring-1 ring-cyan-700  bg-white pr-8 text-sm"
                            value={sellerSearchTerm}
                            onChange={(e) =>
                              setSellerSearchTerm(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <FaSearch className="absolute left-2 top-3 text-gray-400 text-sm" />
                        </div>
                      </div>

                      {/* Seller list */}
                      <div className="max-h-64 overflow-y-auto">
                        {loadingSellers ? (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-800"></div>
                            <p className="mt-2">در حال بارگذاری...</p>
                          </div>
                        ) : filteredSellers.length === 0 ? (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            فروشنده‌ای یافت نشد
                          </div>
                        ) : (
                          filteredSellers.map((seller) => (
                            <div
                              key={seller.id || seller._id}
                              className={`p-3 cursor-pointer flex items-center justify-between  hover:bg-gray-200 border-b border-gray-300 ${
                                purchaseForm.sellerId ===
                                (seller.id || seller._id)
                                  ? "bg-cyan-100 font-semibold"
                                  : ""
                              }`}
                              onClick={() => {
                                setPurchaseForm({
                                  ...purchaseForm,
                                  sellerId: seller.id || seller._id,
                                });
                                setShowSellerDropdown(false);
                                setSellerSearchTerm("");
                              }}
                            >
                              <div className="font-medium">{seller.name}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {seller.phone && <span>{seller.phone}</span>}
                                {seller.company && (
                                  <span className="block mt-1">
                                    {seller.company}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {sellers.length === 0 && !loadingSellers && (
                  <p className="text-xs text-red-500 mt-1">
                    هیچ فروشنده‌ای یافت نشد. لطفا ابتدا فروشندگان را در سیستم
                    ثبت کنید.
                  </p>
                )}
              </div>

              {/* Bill Number */}
              <div>
                <label className="block text-sm font-bold mb-2">شماره بل</label>
                <input
                  type="text"
                  name="bill_number"
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.bill_number}
                  onChange={handlePurchaseFormChange}
                  placeholder="شماره بل (اختیاری)"
                />
              </div>

              {/* Category Select with Dropdown */}
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-sm font-bold mb-2">
                  دسته کالا
                </label>
                <div className="relative">
                  <div
                    className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
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
                  وزن
                </label>
                <div className="relative">
                  <div
                    className={`w-full  rounded-md px-2 py-2.5 flex justify-between items-center ${
                      !purchaseForm.itemCategory
                        ? "bg-gray-200 cursor-not-allowed  text-gray-400"
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
                        ? `${purchaseForm.itemType} گرم`
                        : purchaseForm.itemCategory
                          ? "انتخاب وزن"
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
                      {itemOptions[purchaseForm.itemCategory]?.map((type) => (
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
                          {type} گرم
                        </div>
                      ))}
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
                    className={`w-full  rounded-md px-2 py-2.5 flex justify-between items-center ${
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
                <label className="block text-sm font-bold mb-2">
                  تعداد (پاکت)
                </label>
                <input
                  type="number"
                  name="quantity"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.quantity}
                  onChange={handlePurchaseFormChange}
                  placeholder="مثال: 10"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-bold mb-2">واحد</label>
                <input
                  type="text"
                  name="unit"
                  required
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.unit}
                  onChange={handlePurchaseFormChange}
                  placeholder="پاکت"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  قیمت واحد (افغانی)
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  min="0"
                  step="0.01"
                  required
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.unitPrice}
                  onChange={handlePurchaseFormChange}
                  placeholder="مثال: 1500"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  مبلغ کل (افغانی)
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.totalAmount}
                  readOnly
                />
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  مبلغ پرداختی
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  min="0"
                  step="0.01"
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  value={purchaseForm.paidAmount}
                  onChange={handlePurchaseFormChange}
                  placeholder="مبلغ پرداخت شده (اختیاری)"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-2">
                  توضیحات خرید
                </label>
                <textarea
                  name="description"
                  className="w-full  rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-1 ring-cyan-700"
                  rows="3"
                  value={purchaseForm.description}
                  onChange={handlePurchaseFormChange}
                  placeholder="توضیحات اضافی درباره خرید..."
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
                disabled={!isFormValid()}
              >
                {submittingPurchase ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    ثبت خرید
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="col-span-1">
            {(purchaseForm.totalAmount &&
              parseFloat(purchaseForm.totalAmount) > 0) ||
              (purchaseForm.itemCategory && (
                <div className="mb-4 p-4 bg-gray-50 rounded-md ">
                  <h4 className="font-bold mb-3 text-gray-700 text-lg border-b pb-2">
                    خلاصه خرید
                  </h4>
                  <div className="space-y-3">
                    {purchaseForm.sellerId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">فروشنده:</span>
                        <span className="font-bold">
                          {getSelectedSellerName()}
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
                        <span className="text-gray-600">وزن:</span>
                        <span className="font-bold">
                          {purchaseForm.itemType} گرم
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
                          {purchaseForm.quantity} {purchaseForm.unit}
                        </span>
                      </div>
                    )}
                    {purchaseForm.unitPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">قیمت واحد:</span>
                        <span className="font-bold">
                          {parseFloat(
                            purchaseForm.unitPrice || 0,
                          ).toLocaleString()}{" "}
                          افغانی
                        </span>
                      </div>
                    )}
                    {purchaseForm.bill_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">شماره بل:</span>
                        <span className="font-bold">
                          {purchaseForm.bill_number}
                        </span>
                      </div>
                    )}
                    {purchaseForm.totalAmount &&
                      parseFloat(purchaseForm.totalAmount) > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-bold">
                              مبلغ کل:
                            </span>
                            <span className="font-bold text-lg text-green-700">
                              {parseFloat(
                                purchaseForm.totalAmount || 0,
                              ).toLocaleString()}{" "}
                              افغانی
                            </span>
                          </div>
                          {purchaseForm.paidAmount &&
                            parseFloat(purchaseForm.paidAmount) > 0 && (
                              <>
                                <div className="flex justify-between mt-2">
                                  <span className="text-gray-600">
                                    پرداخت شده:
                                  </span>
                                  <span className="font-bold text-blue-700">
                                    {parseFloat(
                                      purchaseForm.paidAmount,
                                    ).toLocaleString()}{" "}
                                    افغانی
                                  </span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t">
                                  <span className="text-gray-700">مانده:</span>
                                  <span className="font-bold text-red-700">
                                    {(
                                      parseFloat(
                                        purchaseForm.totalAmount || 0,
                                      ) -
                                      parseFloat(purchaseForm.paidAmount || 0)
                                    ).toLocaleString()}{" "}
                                    افغانی
                                  </span>
                                </div>
                              </>
                            )}
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

export default PurchaseModal;
