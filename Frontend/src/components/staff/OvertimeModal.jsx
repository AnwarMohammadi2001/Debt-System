import React, { useState, useEffect } from "react";
import { FaClock, FaTimes, FaHistory, FaCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../pages/dashboard/services/StaffService";
import AnimatedModal from "../common/AnimatedModal";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const OvertimeModal = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  overtimeRate,
  refreshData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    date: moment().format("jYYYY-jMM-jDD"),
    year: moment().jYear(),
    month: moment().jMonth() + 1,
    hours: "",
    description: "",
  });

  const [recentOvertimes, setRecentOvertimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [successCallback, setSuccessCallback] = useState(null);

  // دریافت اضافه‌کاری‌های اخیر
  useEffect(() => {
    if (isOpen && staffId) {
      fetchRecentOvertimes();
    }
  }, [isOpen, staffId]);

  // محاسبه مبلغ اضافه‌کاری
  useEffect(() => {
    if (formData.hours && overtimeRate) {
      const hours = parseFloat(formData.hours) || 0;
      const rate = parseFloat(overtimeRate) || 0;
      setCalculatedAmount(hours * rate);
    } else {
      setCalculatedAmount(0);
    }
  }, [formData.hours, overtimeRate]);

  const fetchRecentOvertimes = async () => {
    setLoading(true);
    try {
      const currentYear = moment().jYear();
      const currentMonth = moment().jMonth() + 1;

      // دریافت رکورد ماهانه
      await api.initializeMonthlyRecord(staffId, currentYear, currentMonth);

      // دریافت اضافه‌کاری‌ها
      const result = await api.getStaffOvertimes(staffId, {
        year: currentYear,
        month: currentMonth,
      });

      if (result.success) {
        setRecentOvertimes(result.overtimes.slice(0, 5));
      }

      // تنظیم سال و ماه در فرم
      setFormData((prev) => ({
        ...prev,
        year: currentYear,
        month: currentMonth,
      }));
    } catch (error) {
      console.error("Error fetching recent overtimes:", error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.hours || parseFloat(formData.hours) <= 0) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "لطفاً ساعت معتبر وارد کنید",
    });
    return;
  }

  setSubmitting(true);

  try {
    const result = await api.addOvertime(staffId, {
      year: formData.year,
      month: formData.month,
      date: formData.date,
      hours: parseFloat(formData.hours),
      description: formData.description || "اضافه‌کاری",
    });

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "ثبت موفق",
        text: `اضافه‌کاری با موفقیت ثبت شد ⏱️ (${calculatedAmount.toLocaleString()} افغانی)`,
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        date: moment().format("jYYYY-jMM-jDD"),
        year: moment().jYear(),
        month: moment().jMonth() + 1,
        hours: "",
        description: "",
      });

      fetchRecentOvertimes();

      // Call the success callback if it exists - use onSuccess directly, not props.onSuccess
      if (onSuccess) {
        onSuccess();
      }

      if (refreshData) refreshData();

      // Close the modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  } catch (error) {
    console.error("❌ Error recording overtime:", error);
    Swal.fire({
      icon: "error",
      title: "خطا در ثبت",
      text: error.response?.data?.message || "مشکلی در ثبت اضافه‌کاری پیش آمد",
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleDateChange = (e) => {
    const date = e.target.value;
    const parts = date.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      setFormData((prev) => ({
        ...prev,
        date,
        year,
        month,
      }));
    }
  };

  const handleHoursChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, hours: value });
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateString;
  };

  if (!isOpen) return null;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[70vw]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Left section - Form */}
        <div className="w-96 p-6 border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaClock className="text-orange-600" />
              ثبت اضافه‌کاری
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* Staff Info */}
          <div className="mb-6 p-4 bg-orange-50 rounded-md border border-orange-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">کارمند:</span>
              <span className="font-bold text-orange-700 mr-2">
                {staffName}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              نرخ اضافه‌کاری:{" "}
              <span className="font-bold">
                {overtimeRate?.toLocaleString() || 0} افغانی/ساعت
              </span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              تاریخ جاری: {moment().format("jYYYY/jMM/jDD")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تاریخ (شمسی) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full border-gray-300 bg-gray-200 rounded-md px-4 py-3 
                  focus:ring-1 focus:ring-orange-500 outline-none transition"
                  value={formData.date}
                  onChange={handleDateChange}
                  max={moment().format("jYYYY-jMM-jDD")}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.month && <>ماه: {api.getMonthName(formData.month)}</>}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تعداد ساعت <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full border-gray-300 bg-gray-200 rounded-md px-4 py-3 
                  focus:ring-1 focus:ring-orange-500 outline-none transition"
                  placeholder="مثال: 2.5"
                  value={formData.hours}
                  onChange={handleHoursChange}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ساعت
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, hours: h.toString() })
                    }
                    className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {h} ساعت
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Amount */}
            {calculatedAmount > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    مبلغ قابل پرداخت:
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {calculatedAmount.toLocaleString()} افغانی
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                توضیحات (اختیاری)
              </label>
              <textarea
                rows="2"
                className="w-full border-gray-300 bg-gray-200 rounded-md px-4 py-3 
                  focus:ring-1 focus:ring-orange-500 outline-none transition"
                placeholder="علت اضافه‌کاری..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 
                rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-orange-600 text-white hover:bg-orange-700 
                rounded-md font-semibold shadow-lg transition-all disabled:opacity-50 
                disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <FaClock />
                    ثبت اضافه‌کاری
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right section - History */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaHistory className="text-gray-600" />
            اضافه‌کاری‌های اخیر
          </h4>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : recentOvertimes.length === 0 ? (
            <div className="text-center py-8">
              <FaClock className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">هیچ اضافه‌کاری‌ای ثبت نشده است</p>
              <p className="text-gray-400 text-sm mt-1">
                اولین اضافه‌کاری را ثبت کنید
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOvertimes.map((ot, index) => (
                <div
                  key={index}
                  className="bg-gray-200 p-3 rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {formatDisplayDate(ot.date)}
                      </p>
                      {ot.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {ot.description}
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-bold">
                        {ot.hours} ساعت
                      </span>
                      {ot.amount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {api.formatCurrency(ot.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>
                      وضعیت:
                      <span
                        className={`mr-1 font-medium ${
                          ot.status === "approved"
                            ? "text-green-600"
                            : ot.status === "paid"
                              ? "text-blue-600"
                              : "text-gray-600"
                        }`}
                      >
                        {ot.status === "approved"
                          ? "تأیید شده"
                          : ot.status === "paid"
                            ? "پرداخت شده"
                            : "در انتظار"}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
};

export default OvertimeModal;
