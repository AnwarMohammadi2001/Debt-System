import React, { useState, useEffect } from "react";
import { getSellers, addPurchase } from "../../services/sellerApi"; // Adjust your import path
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  UserIcon,
  CubeIcon,
  TagIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const AddStockPurchase = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sellerId: "",
    itemName: "",
    itemType: "raw_material",
    quantity: "",
    unit: "",
    unitPrice: "",
    totalAmount: "",
    paidAmount: "0",
    remainingAmount: "",
    purchaseDate: new Date(),
    description: "",
    recordedBy: "",
  });

  // Unit options
  const unitOptions = [
    { value: "kg", label: "Kilogram (kg)", icon: "⚖️" },
    { value: "gram", label: "Gram (g)", icon: "⚖️" },
    { value: "piece", label: "Piece", icon: "📦" },
    { value: "meter", label: "Meter", icon: "📏" },
    { value: "liter", label: "Liter", icon: "🧴" },
    { value: "box", label: "Box", icon: "📦" },
    { value: "packet", label: "Packet", icon: "📫" },
    { value: "dozen", label: "Dozen", icon: "🥚" },
    { value: "bundle", label: "Bundle", icon: "🎁" },
    { value: "other", label: "Other", icon: "📌" },
  ];

  // Item type options
  const itemTypeOptions = [
    { value: "raw_material", label: "Raw Material", icon: "🛢️" },
    { value: "finished_goods", label: "Finished Goods", icon: "🏭" },
    { value: "equipment", label: "Equipment", icon: "🔧" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  // Fetch sellers on component mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Calculate remaining amount when total or paid amount changes
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0;
    const paid = parseFloat(formData.paidAmount) || 0;
    const remaining = total - paid;

    setFormData((prev) => ({
      ...prev,
      remainingAmount: remaining >= 0 ? remaining.toFixed(2) : "0.00",
    }));
  }, [formData.totalAmount, formData.paidAmount]);

  // Calculate total amount when quantity or unit price changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const total = quantity * unitPrice;

    if (quantity > 0 && unitPrice > 0) {
      setFormData((prev) => ({
        ...prev,
        totalAmount: total.toFixed(2),
      }));
    }
  }, [formData.quantity, formData.unitPrice]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const sellersData = await getSellers();
      setSellers(sellersData);
      setError("");
    } catch (err) {
      setError("Failed to fetch sellers. Please try again.");
      console.error("Error fetching sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate required fields
    if (
      !formData.sellerId ||
      !formData.itemName ||
      !formData.quantity ||
      !formData.unit ||
      !formData.unitPrice ||
      !formData.totalAmount
    ) {
      setError("Please fill in all required fields (*)");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (parseFloat(formData.unitPrice) <= 0) {
      setError("Unit price must be greater than 0");
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Prepare data for API
    const purchaseData = {
      sellerId: parseInt(formData.sellerId),
      itemName: formData.itemName.trim(),
      itemType: formData.itemType,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      unitPrice: parseFloat(formData.unitPrice),
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount) || 0,
      remainingAmount: parseFloat(formData.remainingAmount) || 0,
      purchaseDate: formData.purchaseDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      description: formData.description.trim(),
      recordedBy: formData.recordedBy.trim() || "System",
    };

    try {
      setLoading(true);
      setError("");

      const response = await addPurchase(purchaseData);

      setSuccess(
        `Stock purchase added successfully! Purchase ID: ${response.id || "N/A"}`,
      );
      setTimeout(() => setSuccess(""), 5000);

      // Reset form
      setFormData({
        sellerId: "",
        itemName: "",
        itemType: "raw_material",
        quantity: "",
        unit: "",
        unitPrice: "",
        totalAmount: "",
        paidAmount: "0",
        remainingAmount: "",
        purchaseDate: new Date(),
        description: "",
        recordedBy: "",
      });
      setSubmitted(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to add stock purchase";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
      console.error("Error adding purchase:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Add New Stock Purchase
          </h1>
          <p className="text-gray-600">
            Record new stock purchases from sellers. All fields marked with *
            are required.
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seller Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Select Seller *
                    </span>
                  </label>
                  <select
                    name="sellerId"
                    value={formData.sellerId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      submitted && !formData.sellerId
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } focus:ring-2 focus:ring-opacity-50 transition-colors`}
                  >
                    <option value="">Choose a seller...</option>
                    {sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name} - {seller.phone} (
                        {seller.address || "No address"})
                      </option>
                    ))}
                  </select>
                  {submitted && !formData.sellerId && (
                    <p className="mt-2 text-sm text-red-600">
                      Please select a seller
                    </p>
                  )}
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center">
                        <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Item Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder="Enter item name (e.g., Cotton, Wool, Thread)"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        submitted && !formData.itemName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    />
                  </div>

                  {/* Item Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center">
                        <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Item Type *
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {itemTypeOptions.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              itemType: type.value,
                            }))
                          }
                          className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                            formData.itemType === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-2">{type.icon}</span>
                          <span className="text-sm font-medium">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center">
                        <ScaleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Quantity *
                      </span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        submitted &&
                        (!formData.quantity ||
                          parseFloat(formData.quantity) <= 0)
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        submitted && !formData.unit
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    >
                      <option value="">Select unit...</option>
                      {unitOptions.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.icon} {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Unit Price *
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          submitted &&
                          (!formData.unitPrice ||
                            parseFloat(formData.unitPrice) <= 0)
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        } focus:ring-2 focus:ring-opacity-50 transition-colors`}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="totalAmount"
                        value={formData.totalAmount}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-calculated
                    </p>
                  </div>

                  {/* Paid Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="paidAmount"
                        value={formData.paidAmount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={formData.totalAmount}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remaining Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="remainingAmount"
                        value={formData.remainingAmount}
                        readOnly
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          parseFloat(formData.remainingAmount) > 0
                            ? "border-amber-300 bg-amber-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Date and Recorded By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        Purchase Date
                      </span>
                    </label>
                    <DatePicker
                      selected={formData.purchaseDate}
                      onChange={(date) =>
                        setFormData((prev) => ({ ...prev, purchaseDate: date }))
                      }
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    />
                  </div>

                  {/* Recorded By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recorded By
                    </label>
                    <input
                      type="text"
                      name="recordedBy"
                      value={formData.recordedBy}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Description (Optional)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add any notes or details about this purchase..."
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-medium text-white transition-all ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Stock Purchase
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Purchase Summary
              </h2>

              <div className="space-y-4">
                {/* Item Preview */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Item Preview
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium">
                        {formData.itemName || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {formData.itemType?.replace("_", " ") ||
                          "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">
                        {formData.quantity || "0"} {formData.unit || ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Financial Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">
                        ₹{formData.unitPrice || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-blue-600">
                        ₹{formData.totalAmount || "0.00"}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between ${parseFloat(formData.paidAmount) > 0 ? "text-green-600" : "text-gray-600"}`}
                    >
                      <span>Paid:</span>
                      <span className="font-medium">
                        ₹{formData.paidAmount || "0.00"}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between ${parseFloat(formData.remainingAmount) > 0 ? "text-amber-600" : "text-green-600"}`}
                    >
                      <span>Remaining:</span>
                      <span className="font-medium">
                        ₹{formData.remainingAmount || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Payment Status
                  </h3>
                  <div className="flex items-center">
                    {parseFloat(formData.paidAmount) === 0 ? (
                      <>
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-red-700 font-medium">
                          Not Paid
                        </span>
                      </>
                    ) : parseFloat(formData.remainingAmount) > 0 ? (
                      <>
                        <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-amber-700 font-medium">
                          Partially Paid
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-green-700 font-medium">
                          Fully Paid
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    💡 Quick Tips
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Fill all required fields marked with *</li>
                    <li>• Quantity and unit price will auto-calculate total</li>
                    <li>• Remaining amount updates automatically</li>
                    <li>
                      • Recorded by field helps track who entered the data
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockPurchase;
