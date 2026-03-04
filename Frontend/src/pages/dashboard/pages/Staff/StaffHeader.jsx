import React from "react";
import { FaUserPlus, FaUserTie } from "react-icons/fa";

const StaffHeader = ({ onAddStaff }) => {
  return (
    <div className="flex justify-between items-center p-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaUserTie className="text-cyan-800" />
          مدیریت کارمندان
        </h1>
        <p className="text-sm mr-8 text-gray-500 mt-1">
          لیست کارمندان مطبعه خوشه
        </p>
      </div>
      <button
        onClick={onAddStaff}
        className="bg-cyan-800 text-white px-5 py-3 rounded-md font-bold 
        hover:bg-cyan-900 flex items-center gap-2 transition-all duration-200"
      >
        <FaUserPlus /> ثبت کارمند جدید
      </button>
    </div>
  );
};

export default StaffHeader;
