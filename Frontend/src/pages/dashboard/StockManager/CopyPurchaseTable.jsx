import React from "react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  updateCopyPurchase,
  deleteCopyPurchase,
  updateCopyPurchasePayment,
} from "../services/sellerService";

const CopyPurchaseTable = ({ purchases, onRefresh, sellers }) => {
  const getSellerName = (sellerId) => {
    if (!sellerId) return "نامشخص";

    const seller = sellers.find(
      (s) =>
        s.id === sellerId ||
        s._id === sellerId ||
        (s._id && sellerId.toString() === s._id.toString()),
    );

    return seller ? seller.name : "نامشخص";
  };

  // Handle delete purchase
  const handleDelete = async (purchaseId) => {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این خرید حذف خواهد شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "بله، حذف کن",
      cancelButtonText: "لغو",
    });

    if (result.isConfirmed) {
      try {
        await deleteCopyPurchase(purchaseId);
        Swal.fire("حذف شد!", "خرید با موفقیت حذف شد.", "success");
        onRefresh();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("خطا!", "حذف خرید انجام نشد.", "error");
      }
    }
  };

  // Handle payment for purchase
  const handlePayment = async (purchase) => {
    const remaining =
      purchase.remainingAmount ||
      purchase.totalAmount - (purchase.paidAmount || 0);

    if (remaining <= 0) {
      Swal.fire("توجه", "مبلغ باقیمانده صفر است.", "info");
      return;
    }

    const { value: amount } = await Swal.fire({
      title: "ثبت پرداخت",
      html: `
        <div class="text-right">
          <p class="mb-2">مبلغ کل: ${(purchase.totalAmount || 0).toLocaleString()} افغانی</p>
          <p class="mb-2">پرداخت شده: ${(purchase.paidAmount || 0).toLocaleString()} افغانی</p>
          <p class="mb-4 text-red-600 font-bold">باقیمانده: ${remaining.toLocaleString()} افغانی</p>
          <input type="number" id="paymentAmount" class="swal2-input" placeholder="مبلغ پرداختی" min="0" max="${remaining}" value="${remaining}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "ثبت پرداخت",
      cancelButtonText: "لغو",
      preConfirm: () => {
        const val = parseFloat(document.getElementById("paymentAmount").value);
        if (!val || val <= 0 || val > remaining) {
          Swal.showValidationMessage("مبلغ پرداختی معتبر نیست");
        }
        return val;
      },
    });

    if (amount) {
      try {
        await updateCopyPurchasePayment(purchase.id, {
          paidAmount: amount + (purchase.paidAmount || 0),
        });

        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "پرداخت ثبت شد",
          confirmButtonColor: "#10b981",
        });

        onRefresh();
      } catch (error) {
        console.error("Payment error:", error);
        Swal.fire({
          icon: "error",
          title: "خطا",
          text: "پرداخت ثبت نشد",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // Handle edit purchase
  const handleEdit = async (purchase) => {
    const { value: formValues } = await Swal.fire({
      title: "ویرایش خرید",
      html: `
        <input type="number" id="cartonCount" class="swal2-input" placeholder="تعداد کارتن" value="${purchase.cartonCount || ""}">
        <input type="number" id="pricePerCarton" class="swal2-input" placeholder="فی کارتن (افغانی)" value="${purchase.pricePerCarton || ""}">
        <input type="number" id="paidAmount" class="swal2-input" placeholder="مبلغ پرداختی" value="${purchase.paidAmount || 0}">
      `,
      showCancelButton: true,
      confirmButtonText: "ذخیره تغییرات",
      cancelButtonText: "لغو",
      preConfirm: () => {
        const cartonCount = parseInt(
          document.getElementById("cartonCount").value,
        );
        const pricePerCarton = parseFloat(
          document.getElementById("pricePerCarton").value,
        );
        const paidAmount = parseFloat(
          document.getElementById("paidAmount").value,
        );

        if (!cartonCount || cartonCount <= 0) {
          Swal.showValidationMessage("تعداد کارتن نامعتبر است");
          return false;
        }

        if (!pricePerCarton || pricePerCarton < 0) {
          Swal.showValidationMessage("فی کارتن نامعتبر است");
          return false;
        }

        if (paidAmount < 0) {
          Swal.showValidationMessage("مبلغ پرداختی نمی‌تواند منفی باشد");
          return false;
        }

        const totalAmount = cartonCount * pricePerCarton;
        if (paidAmount > totalAmount) {
          Swal.showValidationMessage(
            "مبلغ پرداختی نمی‌تواند از مبلغ کل بیشتر باشد",
          );
          return false;
        }

        return { cartonCount, pricePerCarton, paidAmount };
      },
    });

    if (formValues) {
      try {
        await updateCopyPurchase(purchase.id, formValues);

        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "خرید آپدیت شد",
          confirmButtonColor: "#10b981",
        });

        onRefresh();
      } catch (error) {
        console.error("Update error:", error);
        Swal.fire({
          icon: "error",
          title: "خطا",
          text: "آپدیت خرید انجام نشد",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm text-center ">
        <thead>
          <tr className="bg-gray-200">
            {[
              "شماره",
              "فروشنده",
              "سایز",
              "تعداد کارتن",
              "فی کارتن",
              "مبلغ کل",
              "پرداخت شده",
              "باقیمانده",
              "تاریخ خرید",
              "شماره بل",
            ].map((header) => (
              <th
                key={header}
                className="py-3 px-5 border-b border-gray-200  text-sm font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!purchases || purchases.length === 0 ? (
            <tr>
              <td colSpan="11" className="py-8 text-center text-gray-500">
                هیچ خریدی ثبت نشده است
              </td>
            </tr>
          ) : (
            purchases.map((purchase, index) => {
              const totalAmount =
                purchase.totalAmount ||
                purchase.cartonCount * purchase.pricePerCarton ||
                0;
              const paidAmount = purchase.paidAmount || 0;
              const remainingAmount = totalAmount - paidAmount;

              return (
                <tr
                  key={purchase.id || purchase._id}
                  className="hover:bg-gray-100 border-b border-gray-200"
                >
                  <td className="py-3 px-5 text-gray-600">
                    {index + 1}
                  </td>
                  <td className="py-3 px-5 text-gray-800 font-medium">
                    {getSellerName(purchase.sellerId)}
                  </td>
                  <td className="py-3 px-5 ">
                    <span className="px-3 py-1  rounded-full text-sm">
                      {purchase.size || "بدون سایز"}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-700">
                    {purchase.cartonCount || 0} کارتن
                  </td>
                  <td className="py-3 px-5 text-xs text-gray-700">
                    {(purchase.pricePerCarton || 0).toLocaleString()} افغانی
                  </td>
                  <td className="py-3 px-5 text-xs font-bold text-gray-800">
                    {totalAmount.toLocaleString()} افغانی
                  </td>
                  <td className="py-3 px-5 text-xs text-green-700 font-medium">
                    {paidAmount.toLocaleString()} افغانی
                  </td>
                  <td
                    className="py-3 px-5 font-bold"
                    style={{
                      color: remainingAmount > 0 ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {remainingAmount.toLocaleString()} افغانی
                  </td>
                  <td className="py-3 px-5 text-gray-600 text-sm">
                    {purchase.purchaseDate || purchase.createdAt
                      ? new Date(
                          purchase.purchaseDate || purchase.createdAt,
                        ).toLocaleDateString("fa-IR")
                      : "نامشخص"}
                  </td>
                  <td className="py-3 px-5 text-gray-600">
                    {purchase.bill_number || "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CopyPurchaseTable;
