import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  createStaff,
  updateStaff,
  getCurrentAfghanDate,
} from "../../services/StaffService";
import AnimatedModal from "../../../../components/common/AnimatedModal";

const AddStaffModal = ({ isOpen, onClose, editingStaff, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    phone: "",
    position: "",
    baseSalary: "",
    overtimeRatePerHour: "",
    workStartTime: "",
    workEndTime: "",
    dailyWorkHours: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [currentDate] = useState(getCurrentAfghanDate());

  // اگر در حالت ویرایش هستیم، فرم را پر کن
  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || "",
        fatherName: editingStaff.fatherName || "",
        phone: editingStaff.phone || "",
        position: editingStaff.position || "کارمند",
        baseSalary: editingStaff.baseSalary || editingStaff.salary || "",
        overtimeRatePerHour:
          editingStaff.overtimeRatePerHour || editingStaff.overworkCost || "",
        workStartTime:
          editingStaff.workStartTime || editingStaff.startOfWork || "08:00",
        workEndTime:
          editingStaff.workEndTime || editingStaff.endOfWork || "17:00",
        dailyWorkHours:
          editingStaff.dailyWorkHours || editingStaff.workTime || 8,
        address: editingStaff.address || "",
      });
    } else {
      // ریست فرم برای حالت جدید
      setFormData({
        name: "",
        fatherName: "",
        phone: "",
        position: "",
        baseSalary: "",
        overtimeRatePerHour: "",
        workStartTime: "08:00",
        workEndTime: "17:00",
        dailyWorkHours: "8",
        address: "",
      });
    }
  }, [editingStaff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی
    if (!formData.name || !formData.phone || !formData.baseSalary) {
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "پر کردن فیلدهای ضروری الزامی است",
      });
      return;
    }

    setLoading(true);

    try {
      if (editingStaff) {
        // ویرایش کارمند موجود
        await updateStaff(editingStaff.id, formData);
        Swal.fire({
          icon: "success",
          title: "ویرایش شد",
          text: "اطلاعات کارمند بروزرسانی شد",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // ثبت کارمند جدید
        await createStaff({
          name: formData.name,
          fatherName: formData.fatherName,
          phone: formData.phone,
          position: formData.position,
          salary: formData.baseSalary,
          overworkCost: formData.overtimeRatePerHour,
          startOfWork: formData.workStartTime,
          endOfWork: formData.workEndTime,
          workTime: formData.dailyWorkHours,
          address: formData.address,
        });

        Swal.fire({
          icon: "success",
          title: "ثبت شد",
          text: `کارمند با موفقیت ثبت گردید (${currentDate.year}/${currentDate.month}/${currentDate.day})`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // موفقیت
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving staff:", error);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: error.response?.data?.message || "مشکلی در ذخیره اطلاعات پیش آمد",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[70vw]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaUserPlus className="text-cyan-800" />
              {editingStaff ? "ویرایش کارمند" : "ثبت کارمند جدید"}
            </h2>
            {!editingStaff && (
              <div className="bg-cyan-50 px-3 py-1 rounded-md border border-cyan-200 text-sm">
                <span className="text-gray-600 ml-1">تاریخ ثبت:</span>
                <span className="font-bold text-cyan-800">
                  {currentDate.year}/{currentDate.month}/{currentDate.day}
                </span>
                <span className="text-gray-400 mx-1">-</span>
                <span className="text-cyan-600">{currentDate.dayName}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* ردیف اول */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نام کامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نام پدر <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                required
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>
          </div>

          {/* ردیف دوم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                موقعیت شغلی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                معاش اصلی (افغانی) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="baseSalary"
                required
                value={formData.baseSalary}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نرخ اضافه‌کاری (فی ساعت)
              </label>
              <input
                type="number"
                name="overtimeRatePerHour"
                value={formData.overtimeRatePerHour}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
                min="0"
              />
            </div>
          </div>

          {/* ردیف سوم */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ساعت شروع کار <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="workStartTime"
                required
                value={formData.workStartTime}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ساعت پایان کار <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="workEndTime"
                required
                value={formData.workEndTime}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ساعت کاری روزانه <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dailyWorkHours"
                required
                value={formData.dailyWorkHours}
                onChange={handleChange}
                className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
                min="1"
                max="24"
                step="0.5"
              />
            </div>
          </div>

          {/* آدرس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              آدرس
            </label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              className="w-full border bg-gray-100 border-gray-300 rounded-md px-4 py-2.5 
                focus:ring-1 focus:ring-cyan-700 focus:border-cyan-500 outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-red-600 text-gray-100 hover:bg-red-700 
              rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-cyan-800 text-white hover:bg-cyan-900 
              rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  در حال ذخیره...
                </>
              ) : editingStaff ? (
                "بروزرسانی اطلاعات"
              ) : (
                "ثبت کارمند جدید"
              )}
            </button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

export default AddStaffModal;
