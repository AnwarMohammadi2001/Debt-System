import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaEye,
  FaFileInvoice,
  FaPrint,
  FaSearch,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import SearchBar from "../../searching/SearchBar";
import Pagination from "../../pagination/Pagination";
import { deleteOrder } from "../../services/ServiceManager";

const NewOrderList = ({
  orders,
  isSearching,
  handleSearchResults,
  searchQuery,
  handleSearchQueryChange,
  clearSearch,
  currentPage,
  totalPages,
  onPageChange,
  handleDetailsViewOrder,
  handleEditOrder,
  handlePrintBill,
  isSubmitting,
  searchBarRef,
  onOrderDeleted, // اضافه کردن callback برای بروزرسانی لیست بعد از حذف
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // تابع کمکی برای استخراج نام کتاب‌ها از سفارش
  const getBookNames = (order) => {
    const bookNames = [];

    // استخراج از آیتم‌های دیجیتال
    if (order.digital && order.digital.length > 0) {
      order.digital.forEach((item) => {
        if (item.name && !bookNames.includes(item.name)) {
          bookNames.push(item.name);
        }
      });
    }

    // استخراج از آیتم‌های آفست
    if (order.offset && order.offset.length > 0) {
      order.offset.forEach((item) => {
        if (item.book_name && !bookNames.includes(item.book_name)) {
          bookNames.push(item.book_name);
        }
      });
    }

    // اگر هیچ کتابی پیدا نشد، از نام اصلی سفارش استفاده کن
    if (bookNames.length === 0 && order.name) {
      return order.name;
    }

    return bookNames.length > 0 ? bookNames.join("، ") : "—";
  };

  const handleDeleteClick = (orderId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrderId(orderId);

    // پیدا کردن سفارش برای نمایش اطلاعات
    const order = orders.find((o) => o.id === orderId);
    const customerName = order?.customer?.name || order?.name || "نامشخص";
    const bookNames = getBookNames(order);

    Swal.fire({
      title: "حذف سفارش",
      html: `
        <div class="text-right" dir="rtl">
          <p class="mb-4 text-red-600 font-bold">آیا از حذف این سفارش مطمئن هستید؟</p>
          <div class="bg-gray-50 p-3 rounded-lg text-right">
            <p><span class="font-medium">شماره سفارش:</span> ${orderId}</p>
            <p><span class="font-medium">نام مشتری:</span> ${customerName}</p>
            <p><span class="font-medium">نام کتاب:</span> ${bookNames}</p>
            <p><span class="font-medium">تاریخ:</span> ${new Date(order?.createdAt).toLocaleDateString("fa-AF")}</p>
            <p><span class="font-medium">مبلغ کل:</span> ${order?.total?.toLocaleString()} تومان</p>
          </div>
          <p class="mt-4 text-sm text-red-500">این عمل غیرقابل بازگشت است!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await confirmDelete(orderId);
      }
    });
  };

  const confirmDelete = async (orderId) => {
    setIsDeleting(true);

    try {
      await deleteOrder(orderId);

      // اگر callback وجود دارد، صدا بزن
      if (onOrderDeleted) {
        onOrderDeleted(orderId);
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "سفارش با موفقیت حذف شد",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire({
        icon: "error",
        title: "خطا در حذف",
        text: error.response?.data?.message || "حذف سفارش انجام نشد",
        confirmButtonText: "باشه",
      });
    } finally {
      setIsDeleting(false);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className="bg-white rounded-md border-gray-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaFileInvoice className="text-cyan-800 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              لیست سفارشات جدید
            </h2>
            <p className="text-gray-600 text-sm">
              {isSearching ? (
                <span className="text-cyan-700">
                  نتایج جستجو: {orders.length} سفارش یافت شد
                </span>
              ) : (
                "مدیریت و مشاهده تمام سفارشات ثبت شده"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <SearchBar
            ref={searchBarRef}
            onResults={handleSearchResults}
            query={searchQuery}
            onQueryChange={handleSearchQueryChange}
          />

          {isSearching && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              <FaUndo className="text-sm" />
               پاک کردن جستجو
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto px-2">
        <table className="w-full border-gray-300">
          <thead className="bg-gray-200 text-center text-gray-700">
            <tr className="text-sm">
              <th className="border-gray-100 px-4 py-2.5 text-center">
                شماره بیل
              </th>
              <th className="border-gray-100 px-4 py-2.5">نام مشتری</th>
              <th className="border-gray-100 px-4 py-2.5">نام کتاب</th>
              <th className="border-gray-100 px-4 py-2.5">مجموع</th>
              <th className="border-gray-100 px-4 py-2.5">دریافتی</th>
              <th className="border-gray-100 px-4 py-2.5">باقیمانده</th>
              <th className="border-gray-100 px-4 py-2.5">تاریخ</th>
              <th className="border-gray-300 px-4 py-2.5">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const bookNames = getBookNames(order);

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-100 border-b text-center border-gray-200 ${
                      order.isDelivered && order.remained === 0 && "bg-green-50"
                    }`}
                  >
                    <td className="border-gray-300 px-4 py-2 text-center font-medium">
                      {order.id}
                    </td>

                    <td className="border-gray-300 px-4 py-2">
                      {order.customer?.name || order.name}
                    </td>

                    <td
                      className="border-gray-300 px-4 py-2 max-w-[200px] truncate"
                      title={bookNames}
                    >
                      {bookNames}
                    </td>

                    <td className="font-semibold text-sm text-gray-700 border-gray-300 px-4 py-2">
                      {order.total?.toLocaleString()}
                    </td>
                    <td className="font-semibold text-sm text-green-600 border-gray-300 px-4 py-2">
                      {order.recip?.toLocaleString() ?? 0}
                    </td>
                    <td
                      className={`font-black text-sm border-gray-300 px-4 py-2 ${
                        order.remained === 0 ? "text-black" : "text-red-500"
                      }`}
                    >
                      {order.remained?.toLocaleString() ?? 0}
                    </td>
                    <td className="border-gray-300 px-4 py-2">
                      {new Date(order.createdAt).toLocaleDateString("fa-AF")}
                    </td>

                    <td className="border-gray-300 px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDetailsViewOrder(order)}
                          disabled={isSubmitting || isDeleting}
                          className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-105"
                          title="جزئیات"
                        >
                          <FaEye className="text-cyan-800" size={18} />
                        </button>

                        <button
                          onClick={() => handleEditOrder(order)}
                          disabled={isSubmitting || isDeleting}
                          className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-105"
                          title="ویرایش"
                        >
                          <FaEdit className="text-green-600" size={18} />
                        </button>

                        <button
                          onClick={() => handlePrintBill(order)}
                          disabled={isSubmitting || isDeleting}
                          className="flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-105"
                          title="چاپ فاکتور"
                        >
                          <FaPrint className="text-cyan-700" size={18} />
                        </button>

                        <button
                          onClick={(e) => handleDeleteClick(order.id, e)}
                          disabled={isSubmitting || isDeleting}
                          className={`flex items-center justify-center h-8 w-8 cursor-pointer hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-105 ${
                            selectedOrderId === order.id ? "opacity-50" : ""
                          }`}
                          title="حذف"
                        >
                          <FaTrash className="text-red-500" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-gray-500 py-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isSearching ? (
                      <>
                        <FaSearch className="text-gray-400 text-3xl" />
                        <span className="text-lg">
                          نتیجه‌ای برای جستجوی شما یافت نشد
                        </span>
                        <button
                          onClick={clearSearch}
                          className="mt-2 text-cyan-800 hover:text-cyan-900 font-medium"
                        >
                          مشاهده همه سفارشات
                        </button>
                      </>
                    ) : (
                      "هیچ سفارشی وجود ندارد"
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Show pagination only when not searching */}
        {!isSearching && orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default NewOrderList;
