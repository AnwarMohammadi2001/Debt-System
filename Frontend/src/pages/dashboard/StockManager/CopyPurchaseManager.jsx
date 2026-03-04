import React, { useEffect, useState } from "react";
import {
  FaCopy,
  FaFileInvoiceDollar,
  FaBox,
  FaBoxes,
  FaMoneyBillWave,
  FaHistory,
  FaWarehouse,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getSellers,
  getAllSellers,
  addCopyPurchase,
  getStockInventory,
  getCopyPurchases,
} from "../services/sellerService";
import AddCopyPurchaseModal from "./AddCopyPurchaseModal";
import CopyPurchaseTable from "./CopyPurchaseTable";

const CopyPurchaseManager = () => {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" یا "history"
  const [stockInventory, setStockInventory] = useState([]);
  const [copyPurchases, setCopyPurchases] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch stock inventory data
  const fetchStockData = async () => {
    try {
      setLoading(true);
      const stockRes = await getStockInventory();

      let stockData = [];
      if (stockRes && stockRes.stocks) {
        stockData = Array.isArray(stockRes.stocks) ? stockRes.stocks : [];
      } else if (Array.isArray(stockRes)) {
        stockData = stockRes;
      }

      console.log("Stock inventory data:", stockData);
      setStockInventory(stockData);
    } catch (error) {
      console.error("Error fetching stock inventory:", error);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "امکان دریافت موجودی کاپی وجود ندارد",
        confirmButtonColor: "#dc2626",
      });
      setStockInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch copy purchases history
  const fetchCopyPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const purchasesRes = await getCopyPurchases();

      let purchasesData = [];
      if (purchasesRes && purchasesRes.purchases) {
        purchasesData = Array.isArray(purchasesRes.purchases)
          ? purchasesRes.purchases
          : [];
      } else if (Array.isArray(purchasesRes)) {
        purchasesData = purchasesRes;
      }

      console.log("Copy purchases data:", purchasesData);
      setCopyPurchases(purchasesData);
    } catch (error) {
      console.error("Error fetching copy purchases:", error);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "امکان دریافت تاریخچه خریدهای کاپی وجود ندارد",
        confirmButtonColor: "#dc2626",
      });
      setCopyPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const sellersRes = await getAllSellers();
      const normalizedSellers = Array.isArray(sellersRes)
        ? sellersRes
        : sellersRes.data
          ? sellersRes.data
          : [];
      setSellers(normalizedSellers);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setSellers([]);
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchSellers();
    if (activeTab === "inventory") {
      fetchStockData();
    } else {
      fetchCopyPurchases();
    }
  }, [activeTab]);

  // Handle new purchase addition
  const handleAddPurchase = async (purchaseData) => {
    try {
      const response = await addCopyPurchase(purchaseData);

      Swal.fire({
        icon: "success",
        title: "خرید ثبت شد",
        text: "خرید کارتن کاپی با موفقیت ثبت گردید",
        confirmButtonColor: "#10b981",
      });

      // Refresh both data
      await Promise.all([fetchStockData(), fetchCopyPurchases()]);
      setShowAddModal(false);

      return response;
    } catch (error) {
      console.error("Error adding copy purchase:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "خطا در ثبت خرید";

      Swal.fire({
        icon: "error",
        title: "خطا در ثبت",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      });
      throw error;
    }
  };

  // Calculate summary for inventory
  const calculateInventorySummary = () => {
    const inventory = Array.isArray(stockInventory) ? stockInventory : [];

    const totalItems = inventory.length;
    const totalCartons = inventory.reduce(
      (sum, item) => sum + (Number(item.cartonCount) || 0),
      0,
    );
    const totalValue = inventory.reduce(
      (sum, item) => sum + (Number(item.totalValue) || 0),
      0,
    );

    const avgPrice = totalCartons > 0 ? totalValue / totalCartons : 0;

    return {
      totalItems,
      totalCartons: totalCartons.toFixed(0),
      totalValue,
      avgPrice: avgPrice.toFixed(0),
    };
  };

  // Calculate summary for purchases
  const calculatePurchasesSummary = () => {
    const purchases = Array.isArray(copyPurchases) ? copyPurchases : [];

    const totalPurchases = purchases.length;
    const totalCartons = purchases.reduce(
      (sum, purchase) => sum + (Number(purchase.cartonCount) || 0),
      0,
    );
    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + (Number(purchase.totalAmount) || 0),
      0,
    );
    const totalPaid = purchases.reduce(
      (sum, purchase) => sum + (Number(purchase.paidAmount) || 0),
      0,
    );
    const totalRemaining = purchases.reduce(
      (sum, purchase) => sum + (Number(purchase.remainingAmount) || 0),
      0,
    );

    return {
      totalPurchases,
      totalCartons,
      totalAmount,
      totalPaid,
      totalRemaining,
    };
  };

  const inventorySummary = calculateInventorySummary();
  const purchasesSummary = calculatePurchasesSummary();

  // Loading state for inventory tab
  if (loading && activeTab === "inventory") {
    return (
      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری موجودی کاپی...</p>
        </div>
      </div>
    );
  }

  // Loading state for history tab
  if (loadingPurchases && activeTab === "history") {
    return (
      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
          <p className="mt-4 text-gray-600">
            در حال بارگذاری تاریخچه خریدها...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md  border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <FaCopy className="text-cyan-800 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              مدیریت گدام کاپی
            </h2>
            <p className="text-gray-600">
              ثبت خرید، مدیریت موجودی و تاریخچه اجناس کاپی
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 cursor-pointer hover:scale-102 duration-300 transition-all text-white px-4 py-2.5 rounded-md "
        >
          <FaFileInvoiceDollar />
          خرید جدید
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-6 py-4 font-medium cursor-pointer transition-colors ${
            activeTab === "inventory"
              ? "text-cyan-700 border-b-2 border-cyan-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          <FaWarehouse />
          موجودی گدام
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-4 font-medium cursor-pointer transition-colors ${
            activeTab === "history"
              ? "text-cyan-700 border-b-2 border-cyan-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory />
          تاریخچه خریدها
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        {activeTab === "inventory" ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">انواع سایزها</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {inventorySummary.totalItems}
                  </p>
                </div>
                <FaCopy className="text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل کارتن‌ها</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {inventorySummary.totalCartons}
                  </p>
                </div>
                <FaBoxes className="text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ارزش کل موجودی</p>
                  <p className="text-xl font-bold text-gray-800">
                    {Number(inventorySummary.totalValue).toLocaleString()}{" "}
                    افغانی
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-indigo-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">آخرین بروزرسانی</p>
                  <p className="text-lg font-bold text-gray-800">
                    {stockInventory.length > 0
                      ? new Date(
                          stockInventory[0]?.updatedAt,
                        ).toLocaleDateString("fa-IR")
                      : "-"}
                  </p>
                </div>
                <FaBox className="text-yellow-600" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل کارتن‌ها</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {purchasesSummary.totalCartons}
                  </p>
                </div>
                <FaBoxes className="text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مبلغ کل</p>
                  <p className="text-xl font-bold text-gray-800">
                    {purchasesSummary.totalAmount.toLocaleString()} افغانی
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-purple-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">پرداخت شده</p>
                  <p className="text-xl font-bold text-green-700">
                    {purchasesSummary.totalPaid.toLocaleString()} افغانی
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">باقی‌مانده</p>
                  <p className="text-xl font-bold text-red-700">
                    {purchasesSummary.totalRemaining.toLocaleString()} افغانی
                  </p>
                </div>
                <FaFileInvoiceDollar className="text-red-600" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "inventory" ? (
          // Inventory Table
          stockInventory.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <FaBox className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                هیچ موجودی کاپی ثبت نشده است
              </h3>
              <p className="text-gray-500 mb-6">
                برای شروع، اولین خرید کاپی را ثبت کنید.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-md transition-colors mx-auto"
              >
                <FaFileInvoiceDollar />
                ثبت خرید جدید
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto ">
              <table className="min-w-full text-center text-sm bg-white">
                <thead className="bg-gray-200 text-center">
                  <tr>
                    {[
                      "شماره",
                      "سایز",
                      "تعداد کارتن",
                      "فی کارتن",
                      "ارزش کل",
                      "آخرین بروزرسانی",
                    ].map((header) => (
                      <th
                        key={header}
                        className="py-3 px-4 border-b border-gray-200 font-semibold text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockInventory.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-gray-100 border-b border-gray-200 text-center"
                    >
                      <td className="py-3 px-5 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-5">
                        <span className="px-3 py-1   rounded-full text-sm font-medium">
                          {item.size}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-700 font-medium">
                        <span className="text-lg">
                          {Number(item.cartonCount).toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-500 mr-1">
                          {" "}
                          کارتن
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-700">
                        {Number(item.unitPrice).toLocaleString()} افغانی
                      </td>
                      <td className="py-3 px-5 font-bold text-sm text-gray-800">
                        {Number(item.totalValue).toLocaleString()} افغانی
                      </td>
                      <td className="py-3 px-5 text-gray-600 text-sm">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("fa-IR")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : // Purchase History Table
        copyPurchases.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
            <FaHistory className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              هیچ خرید کاپی ثبت نشده است
            </h3>
            <p className="text-gray-500 mb-6">
              برای شروع، اولین خرید کاپی را ثبت کنید.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-md transition-colors mx-auto"
            >
              <FaFileInvoiceDollar />
              ثبت خرید جدید
            </button>
          </div>
        ) : (
          <CopyPurchaseTable
            purchases={copyPurchases}
            onRefresh={fetchCopyPurchases}
            sellers={sellers}
          />
        )}
      </div>

      {/* Add Purchase Modal */}
      <AddCopyPurchaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        sellers={sellers}
        loadingSellers={false}
        onPurchaseAdded={handleAddPurchase}
        currentUser={{ name: "ادمین" }}
      />
    </div>
  );
};

export default CopyPurchaseManager;
