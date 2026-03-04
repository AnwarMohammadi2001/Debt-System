// StaffList.js - اصلاح شده
import React from "react";
import StaffRow from "./StaffRow";

const StaffList = ({
  staffs,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
  onWallet,
  onOvertime,
  onAbsence, // اضافه شده
  onFinancial,
  refreshData,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-800"></div>
        <p className="text-gray-500 mt-2">در حال بارگذاری...</p>
      </div>
    );
  }

  if (staffs.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 text-lg">کارمندی یافت نشد</p>
        <p className="text-gray-400 text-sm mt-1">کارمند جدیدی اضافه کنید</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center">
        <thead className="bg-gray-200 border-b border-gray-300 text-gray-600">
          <tr>
            <th className="p-4">شماره</th>
            <th className="p-4">نام</th>
            <th className="p-4">نام پدر</th>
            <th className="p-4">معاش</th>
            <th className="p-4">حساب</th>
            <th className="p-4 text-center">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff, index) => (
            <StaffRow
              key={staff.id}
              staff={staff}
              index={index}
              refreshData={refreshData}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onDelete={onDelete}
              onWallet={onWallet}
              onOvertime={onOvertime}
              onAbsence={onAbsence}
              onFinancial={onFinancial}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;
