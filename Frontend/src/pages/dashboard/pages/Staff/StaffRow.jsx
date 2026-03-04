// StaffRow.js (نسخه کامل اصلاح شده)
import React from "react";
import {
  FaWallet,
  FaClock,
  FaCalculator,
  FaTrash,
  FaChartBar,
  FaUserClock,
  FaUserTie,
} from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { deleteStaff } from "../../services/StaffService";
import Swal from "sweetalert2";

const StaffRow = ({
  staff,
  onViewDetails,
  onEdit,
  onDelete,
  onWallet,
  onOvertime,
  onAbsence,
  onFinancial,
  refreshData,
  index,
}) => {
const handleDelete = async () => {
  try {
    const result = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: `آیا می‌خواهید کارمند "${staff.name}" را حذف کنید؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "لغو",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    // Delete from database
    await deleteStaff(staff.id);

    // ⭐ Refresh data (VERY IMPORTANT)
    if (refreshData) {
      await refreshData();
    }

    Swal.fire({
      icon: "success",
      title: "حذف موفق",
      text: "کارمند با موفقیت حذف شد",
      timer: 1500,
      showConfirmButton: false,
    });

    if (onDelete) onDelete(staff.id);
  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "حذف کارمند انجام نشد",
    });
  }
};

  const getSalaryDisplay = () => {
    if (staff.baseSalary) {
      return staff.baseSalary.toLocaleString("fa-IR") + " افغانی";
    } else if (staff.salary) {
      return staff.salary.toLocaleString("fa-IR") + " افغانی";
    } else {
      return "0 افغانی";
    }
  };

  return (
    <tr className="border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-3 font-bold font-mono text-gray-800">{index + 1}</td>
      <td className="px-4 py-3 text-gray-700">{staff.name}</td>
      <td className="px-4 py-3 text-gray-700">{staff.fatherName}</td>

      <td className="px-4 py-3 text-semibold text-sm text-cyan-700">
        {getSalaryDisplay()}
      </td>

      {/* Actions Buttons - مدیریت */}
      <td className="px-4 py-3">
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => onWallet(staff)}
            className="px-3 py-1.5 bg-white gap-2 flex items-center
            border border-cyan-300 text-cyan-800 rounded-md
            font-medium hover:bg-cyan-800 hover:text-white transition-colors
            text-xs whitespace-nowrap"
            title="مدیریت کیف پول"
          >
            <FaWallet size={14} /> حساب معاش
          </button>

          {/* <button
            onClick={() => onOvertime(staff)}
            className="px-3 py-1.5 bg-white gap-2 flex items-center
            border border-orange-300 text-orange-800 rounded-md
            font-medium hover:bg-orange-800 hover:text-white transition-colors
            text-xs whitespace-nowrap"
            title="ثبت اضافه‌کاری"
          >
            <FaClock size={14} /> اضافه‌کاری
          </button>

          <button
            onClick={() => onAbsence(staff)} // بدون شرط
            className="px-3 py-1.5 bg-white gap-2 flex items-center
            border border-red-300 text-red-800 rounded-md
            font-medium hover:bg-red-800 hover:text-white transition-colors
            text-xs whitespace-nowrap"
            title="ثبت غیبت"
          >
            <FaUserClock size={14} /> غیرحاضری
          </button> */}

          <button
            onClick={() => onFinancial(staff)} // بدون شرط
            className="px-3 py-1.5 bg-white gap-2 flex items-center
            border border-purple-300 text-purple-800 rounded-md
            font-medium hover:bg-purple-800 hover:text-white transition-colors
            text-xs whitespace-nowrap"
            title="گزارشات مالی"
          >
            <FaChartBar size={14} /> گزارشات
          </button>
        </div>
      </td>

      {/* Actions Buttons - عملیات */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetails(staff)}
            className="p-2 text-cyan-700 bg-white rounded-md shadow-sm
            hover:bg-cyan-50 transition-colors border border-cyan-200"
            title="مشاهده جزئیات"
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>

          <button
            onClick={() => onEdit(staff)}
            className="p-2 text-green-700 bg-white rounded-md shadow-sm
            hover:bg-green-50 transition-colors border border-green-200"
            title="ویرایش"
          >
            <FiEdit size={18} />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-red-700 bg-white rounded-md shadow-sm
            hover:bg-red-50 transition-colors border border-red-200"
            title="حذف"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StaffRow;
