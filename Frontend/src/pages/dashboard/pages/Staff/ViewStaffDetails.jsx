import React from "react";
import {
  FaTimes,
  FaUserTie,
  FaMoneyBillWave,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import AnimatedModal from "../../../../components/common/AnimatedModal";

const ViewStaffDetails = ({ staff, onClose }) => {
  if (!staff) return null;

  const formatCurrency = (value) =>
    value ? `${Number(value).toLocaleString("en-US")} افغانی` : "—";

  const formatTime = (time) => {
    if (!time) return "—";
    return new Date(`2024-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatedModal isOpen={!!staff} onClose={onClose}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <FaUserTie className="text-cyan-800" />
          جزئیات کامل کارمند
        </h2>

        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 transition"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <Detail label="شماره کارمند" value={staff?.id} />
        <Detail label="نام" value={staff?.name} />
        <Detail label="نام پدر" value={staff?.fatherName} />
        <Detail label="شماره تماس" value={staff?.phone} />

        <Detail
          label="معاش"
          value={formatCurrency(staff?.baseSalary)}
          icon={<FaMoneyBillWave />}
        />

        <Detail label="موقعیت کاری" value={staff?.position} />

        <Detail
          label="ساعت کاری"
          value={staff?.dailyWorkHours}
          icon={<FaClock />}
        />

        <Detail label="شروع کار" value={formatTime(staff?.workStartTime)} />
        <Detail label="پایان کار" value={formatTime(staff?.workEndTime)} />

        <div className="col-span-full">
          <Detail
            label="آدرس"
            value={staff?.address}
            icon={<FaMapMarkerAlt />}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-cyan-800 text-white rounded-md hover:bg-cyan-900 font-bold transition"
        >
          بستن
        </button>
      </div>
    </AnimatedModal>
  );
};

const Detail = ({ label, value, icon }) => (
  <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-1 hover:bg-gray-200 transition">
    <span className="text-gray-500 text-xs flex items-center gap-1">
      {icon && <span className="text-cyan-700">{icon}</span>}
      {label}
    </span>

    <span className="font-bold text-gray-800">{value || "—"}</span>
  </div>
);

export default ViewStaffDetails;
