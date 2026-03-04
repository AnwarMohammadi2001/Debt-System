import React, { useState, useEffect } from "react";
import { FaTimes, FaUserClock, FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../pages/dashboard/services/StaffService";
import AnimatedModal from "../../components/common/AnimatedModal";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const StaffAbsenceModal = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  refreshData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    date: moment().format("jYYYY-jMM-jDD"),
    year: moment().jYear(),
    month: moment().jMonth() + 1,
    absenceDays: "1",
    reason: "",
  });

  const [recentAbsences, setRecentAbsences] = useState([]);
  const [monthlyRecord, setMonthlyRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedDeduction, setCalculatedDeduction] = useState(0);

  // دریافت غیبت‌های اخیر و رکورد ماهانه
  useEffect(() => {
    if (isOpen && staffId) {
      fetchData();
    }
  }, [isOpen, staffId]);

  // محاسبه مبلغ کسر شده بر اساس تعداد روز
  useEffect(() => {
    if (monthlyRecord && formData.absenceDays) {
      const days = parseInt(formData.absenceDays) || 0;
      const dailyRate = monthlyRecord.dailySalaryRate || 0;
      setCalculatedDeduction(days * dailyRate);
    } else {
      setCalculatedDeduction(0);
    }
  }, [formData.absenceDays, monthlyRecord]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentYear = moment().jYear();
      const currentMonth = moment().jMonth() + 1;

      // ابتدا رکورد ماهانه را ایجاد یا دریافت کن
      await api.initializeMonthlyRecord(staffId, currentYear, currentMonth);

      // دریافت رکوردهای ماهانه
      const records = await api.getStaffMonthlyRecords(
        staffId,
        currentYear,
        currentMonth,
      );

      if (records.success && records.records.length > 0) {
        setMonthlyRecord(records.records[0]);

        if (records.records[0].absences) {
          setRecentAbsences(records.records[0].absences.slice(0, 5));
        }
      }

      setFormData((prev) => ({
        ...prev,
        year: currentYear,
        month: currentMonth,
      }));
    } catch (error) {
      console.error("Error fetching absence data:", error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.absenceDays || parseInt(formData.absenceDays) <= 0) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "لطفاً تعداد روزهای غیبت را وارد کنید",
    });
    return;
  }

  const days = parseInt(formData.absenceDays);
  const maxPossibleDays = monthlyRecord?.daysInMonth || 30;

  if (days > maxPossibleDays) {
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: `تعداد روزهای غیبت نمی‌تواند بیشتر از ${maxPossibleDays} روز باشد`,
    });
    return;
  }

  setSubmitting(true);

  try {
    const promises = [];
    const startDate = moment(formData.date, "jYYYY-jMM-jDD");

    for (let i = 0; i < days; i++) {
      const currentDate = startDate.clone().add(i, "days");
      const dateStr = currentDate.format("jYYYY-jMM-jDD");

      promises.push(
        api.addAbsence(staffId, {
          year: formData.year,
          month: formData.month,
          date: dateStr,
          reason: formData.reason || `غیبت ${i + 1} از ${days} روز`,
        }),
      );
    }

    const results = await Promise.all(promises);
    const allSuccess = results.every((r) => r.success);

    if (allSuccess) {
      Swal.fire({
        icon: "success",
        title: "ثبت موفق",
        text: `${days} روز غیبت با موفقیت ثبت شد و ${api.formatCurrency(calculatedDeduction)} از حقوق کسر شد ⏳`,
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({
        date: moment().format("jYYYY-jMM-jDD"),
        year: moment().jYear(),
        month: moment().jMonth() + 1,
        absenceDays: "1",
        reason: "",
      });

      fetchData();

      // Call the success callback if it exists - use onSuccess directly, not props.onSuccess
      if (onSuccess) {
        onSuccess();
      }

      if (refreshData) refreshData();

      // Close the modal after successful submission
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  } catch (error) {
    console.error("❌ Error recording absence:", error);
    Swal.fire({
      icon: "error",
      title: "خطا در ثبت",
      text: error.response?.data?.message || "مشکلی در ثبت غیبت پیش آمد",
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleDaysChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        absenceDays: value,
      }));
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
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <FaUserClock className="text-red-600" />
              ثبت غیبت
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500 text-xl" />
            </button>
          </div>

          {/* Staff Info */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">کارمند:</span>
              <span className="font-bold text-red-700 mr-2">{staffName}</span>
            </p>
            {monthlyRecord && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>کسر هر روز غیبت:</span>
                  <span className="font-bold text-red-600">
                    {api.formatCurrency(monthlyRecord.dailySalaryRate)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>غیبت‌های این ماه:</span>
                  <span className="font-bold">
                    {monthlyRecord.absenceDays || 0} روز
                  </span>
                </div>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-2">
              تاریخ جاری: {moment().format("jYYYY/jMM/jDD")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تاریخ شروع (شمسی) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full bg-gray-200 border-gray-300 rounded-md px-4 py-3 
                  focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition"
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
                تعداد روزهای غیبت <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="absenceDays"
                  required
                  className="w-full bg-gray-200 border-gray-300 rounded-md px-4 py-3 
                  focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="مثال: 5"
                  value={formData.absenceDays}
                  onChange={handleDaysChange}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  روز
                </span>
              </div>
            </div>

            {/* Calculated Deduction */}
            {calculatedDeduction > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    مبلغ کسر شده از حقوق:
                  </span>
                  <span className="text-lg font-bold text-red-700">
                    {api.formatCurrency(calculatedDeduction)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.absenceDays} روز ×{" "}
                  {api.formatCurrency(monthlyRecord?.dailySalaryRate || 0)}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 
                rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={submitting || !monthlyRecord}
                className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 
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
                    <FaUserClock />
                    ثبت غیبت
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
            غیبت‌های اخیر
          </h4>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : recentAbsences.length === 0 ? (
            <div className="text-center py-8">
              <FaUserClock className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">هیچ غیبتی ثبت نشده است</p>
              <p className="text-gray-400 text-sm mt-1">
                اولین غیبت را ثبت کنید
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAbsences.map((absence, index) => (
                <div
                  key={index}
                  className="bg-gray-200 p-3 rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {formatDisplayDate(absence.date)}
                      </p>
                      {absence.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          {absence.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                        کسر{" "}
                        {api.formatCurrency(
                          monthlyRecord?.dailySalaryRate || 0,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Monthly Absence Summary */}
          {monthlyRecord && monthlyRecord.absenceDays > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-700 mb-3">
                خلاصه غیبت ماه جاری
              </h5>
              <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">تعداد روزهای غیبت:</span>
                  <span className="font-bold text-red-700">
                    {monthlyRecord.absenceDays} روز
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">مبلغ کسر شده:</span>
                  <span className="font-bold text-red-700">
                    {api.formatCurrency(monthlyRecord.absenceDeduction)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">حقوق قابل پرداخت:</span>
                  <span className="font-bold text-green-700">
                    {api.formatCurrency(monthlyRecord.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h5 className="font-semibold text-blue-800 text-sm mb-2">
              نکات مهم:
            </h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• هر روز غیبت معادل یک روز حقوق از معاش کسر می‌شود</li>
              <li>• نرخ روزانه بر اساس تعداد روزهای ماه شمسی محاسبه می‌شود</li>
              <li>• غیبت‌ها در گزارشات ماهانه و سالانه نمایش داده می‌شوند</li>
            </ul>
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default StaffAbsenceModal;
