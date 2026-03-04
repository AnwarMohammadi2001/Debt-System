import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch, FaCopy } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import AnimatedModal from "../../../components/common/AnimatedModal";
import { addCopyPurchase } from "../services/sellerService"; // Your API service

const sizeOptions = ["A4", "A5"];

const AddCopyPurchaseModal = ({
  isOpen,
  onClose,
  sellers,
  loadingSellers,
  onPurchaseAdded, // Callback when purchase is successfully added
  currentUser,
}) => {
  const [purchaseForm, setPurchaseForm] = useState({
    sellerId: "",
    size: "A4",
    cartonCount: "",
    pricePerCarton: "",
    totalAmount: "",
    paidAmount: "",
    remainingAmount: "",
    bill_number: "",
    description: "",
    recordedBy: currentUser?.name || "",
  });

  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sellerDropdownRef = useRef(null);
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
        size: "A4",
        cartonCount: "",
        pricePerCarton: "",
        totalAmount: "",
        paidAmount: "",
        remainingAmount: "",
        bill_number: "",
        description: "",
        recordedBy: currentUser?.name || "",
      });
      setSellerSearchTerm("");
      setShowSellerDropdown(false);
      setShowSizeDropdown(false);
      setError("");
      setSubmitting(false);
    }
  }, [isOpen, currentUser]);

  // Calculate total amount when carton count or price changes
  useEffect(() => {
    const cartonCount = parseFloat(purchaseForm.cartonCount) || 0;
    const pricePerCarton = parseFloat(purchaseForm.pricePerCarton) || 0;
    const totalAmount = cartonCount * pricePerCarton;

    const paidAmount = parseFloat(purchaseForm.paidAmount) || 0;
    const remainingAmount = totalAmount - paidAmount;

    setPurchaseForm((prev) => ({
      ...prev,
      totalAmount: totalAmount > 0 ? totalAmount.toFixed(2) : "",
      remainingAmount:
        remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00",
    }));
  }, [
    purchaseForm.cartonCount,
    purchaseForm.pricePerCarton,
    purchaseForm.paidAmount,
  ]);

  // Handle form input changes
  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!purchaseForm.sellerId) {
      setError("لطفا فروشنده را انتخاب کنید");
      return;
    }

    if (
      !purchaseForm.cartonCount ||
      parseFloat(purchaseForm.cartonCount) <= 0
    ) {
      setError("تعداد کارتن باید بیشتر از صفر باشد");
      return;
    }

    if (
      !purchaseForm.pricePerCarton ||
      parseFloat(purchaseForm.pricePerCarton) <= 0
    ) {
      setError("قیمت فی کارتن باید بیشتر از صفر باشد");
      return;
    }

    try {
      setSubmitting(true);

      const purchaseData = {
        sellerId: purchaseForm.sellerId,
        size: purchaseForm.size,
        cartonCount: parseInt(purchaseForm.cartonCount),
        pricePerCarton: parseFloat(purchaseForm.pricePerCarton),
        totalAmount: parseFloat(purchaseForm.totalAmount) || 0,
        paidAmount: parseFloat(purchaseForm.paidAmount) || 0,
        remainingAmount: parseFloat(purchaseForm.remainingAmount) || 0,
        bill_number: purchaseForm.bill_number || null,
        description: purchaseForm.description,
        recordedBy: purchaseForm.recordedBy,
      };

      await onPurchaseAdded(purchaseData);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "خطا در ثبت خرید. لطفا دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      purchaseForm.sellerId &&
      purchaseForm.cartonCount &&
      parseFloat(purchaseForm.cartonCount) > 0 &&
      purchaseForm.pricePerCarton &&
      parseFloat(purchaseForm.pricePerCarton) > 0 &&
      !loadingSellers &&
      !submitting
    );
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="bg-white rounded-md">
        {/* Header */}
        <div className="p-4 flex items-center justify-between rounded-t-md bg-cyan-700">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <FaCopy className="text-gray-100" />
            خرید جدید کاپی
          </h3>
          <button
            type="button"
            className="cursor-pointer hover:bg-blue-800 p-1 rounded disabled:opacity-50"
            onClick={handleClose}
            disabled={submitting}
          >
            <FaXmark className="text-xl text-gray-100" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <FaXmark className="text-red-500" />
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Seller Selection with Search */}
            <div className="md:col-span-2 relative" ref={sellerDropdownRef}>
              <label className="block text-sm text-gray-600 font-bold mb-2">
                انتخاب فروشنده *
              </label>
              <div className="relative">
                <div
                  className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  onClick={() =>
                    !submitting && setShowSellerDropdown(!showSellerDropdown)
                  }
                >
                  <span
                    className={
                      purchaseForm.sellerId ? "text-gray-800" : "text-gray-500"
                    }
                  >
                    {getSelectedSellerName()}
                  </span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      showSellerDropdown ? "rotate-180" : ""
                    } ${submitting ? "opacity-50" : ""}`}
                  />
                </div>

                {showSellerDropdown && !submitting && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                    {/* Search input */}
                    <div className="p-2 border-b">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="جستجوی فروشنده..."
                          className="w-full rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-700 bg-white pr-8 text-sm border"
                          value={sellerSearchTerm}
                          onChange={(e) => setSellerSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <FaSearch className="absolute left-2 top-3 text-gray-400 text-sm" />
                      </div>
                    </div>

                    {/* Seller list */}
                    <div className="max-h-64 overflow-y-auto">
                      {loadingSellers ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-800"></div>
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
                            className={`p-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 border-b ${
                              purchaseForm.sellerId ===
                              (seller.id || seller._id)
                                ? "bg-gray-50 font-semibold border-gray-200"
                                : "border-gray-200"
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
                            <div className="text-xs text-gray-600">
                              {seller.phone && <span>{seller.phone}</span>}
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
                  هیچ فروشنده‌ای یافت نشد. لطفا ابتدا فروشندگان را در سیستم ثبت
                  کنید.
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="relative" ref={sizeDropdownRef}>
              <label className="block text-sm font-bold mb-2">
                سایز کارتن *
              </label>
              <div className="relative">
                <div
                  className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300 hover:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() =>
                    !submitting && setShowSizeDropdown(!showSizeDropdown)
                  }
                >
                  <span className="text-gray-800">{purchaseForm.size}</span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      showSizeDropdown ? "rotate-180" : ""
                    } ${submitting ? "opacity-50" : ""}`}
                  />
                </div>

                {showSizeDropdown && !submitting && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {sizeOptions.map((size) => (
                      <div
                        key={size}
                        className={`p-3 cursor-pointer hover:bg-gray-100 border-b ${
                          purchaseForm.size === size
                            ? "bg-blue-50 font-semibold border-blue-200"
                            : "border-gray-200"
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

            {/* Bill Number */}
            <div>
              <label className="block text-sm font-bold mb-2">شماره بل</label>
              <input
                type="number"
                name="bill_number"
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={purchaseForm.bill_number}
                onChange={handlePurchaseFormChange}
                placeholder="شماره بل (اختیاری)"
                disabled={submitting}
              />
            </div>

            {/* Carton Count */}
            <div>
              <label className="block text-sm font-bold mb-2">
                تعداد کارتن *
              </label>
              <input
                type="number"
                name="cartonCount"
                min="1"
                required
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={purchaseForm.cartonCount}
                onChange={handlePurchaseFormChange}
                placeholder="مثال: 10"
                disabled={submitting}
              />
            </div>

            {/* Price Per Carton */}
            <div>
              <label className="block text-sm font-bold mb-2">
                قیمت فی کارتن (افغانی) *
              </label>
              <input
                type="number"
                name="pricePerCarton"
                min="0"
                step="100"
                required
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={purchaseForm.pricePerCarton}
                onChange={handlePurchaseFormChange}
                placeholder="مثال: 2500"
                disabled={submitting}
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-bold mb-2">
                مبلغ کل (افغانی)
              </label>
              <input
                type="text"
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={
                  purchaseForm.totalAmount
                    ? `${parseFloat(purchaseForm.totalAmount).toLocaleString()} افغانی`
                    : "0 افغانی"
                }
                readOnly
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-sm font-bold mb-2">
                مبلغ پرداختی (افغانی)
              </label>
              <input
                type="number"
                name="paidAmount"
                min="0"
                step="100"
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={purchaseForm.paidAmount}
                onChange={handlePurchaseFormChange}
                placeholder="مبلغ پرداخت شده"
                disabled={submitting}
              />
            </div>

            {/* Remaining Amount */}
            <div>
              <label className="block text-sm font-bold mb-2">
                مبلغ باقیمانده (افغانی)
              </label>
              <input
                type="text"
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={
                  purchaseForm.remainingAmount
                    ? `${parseFloat(purchaseForm.remainingAmount).toLocaleString()} افغانی`
                    : "0 افغانی"
                }
                readOnly
              />
            </div>

            {/* Recorded By */}
            <div>
              <label className="block text-sm font-bold mb-2">
                ثبت شده توسط
              </label>
              <input
                type="text"
                className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
                value={purchaseForm.recordedBy}
                readOnly
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">توضیحات</label>
            <textarea
              name="description"
              className="w-full rounded-md px-2 bg-gray-200 py-2.5 cursor-pointer flex justify-between items-center border border-gray-300  focus:outline-none focus:ring-1 focus:ring-cyan-700"
              rows="2"
              value={purchaseForm.description}
              onChange={handlePurchaseFormChange}
              placeholder="توضیحات اضافی درباره خرید..."
              disabled={submitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 bg-red-600 text-gray-100 rounded-md cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid() || submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <FaCopy />
                  ثبت خرید
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

export default AddCopyPurchaseModal;
