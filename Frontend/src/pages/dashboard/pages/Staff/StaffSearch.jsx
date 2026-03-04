import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const StaffSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative my-4 px-5">
      <input
        type="text"
        placeholder="جستجو بر اساس نام، نام پدر، شماره تماس یا شماره کارمند..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full max-w-lg px-4 py-3 pr-10 rounded-md bg-gray-200 
        focus:ring-1 focus:ring-cyan-800 outline-none transition-all duration-200"
      />
      <FaSearch className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400" />
      {searchTerm && (
        <FaTimes
          onClick={() => onSearchChange("")}
          className="absolute left-9 top-1/2 -translate-y-1/2 cursor-pointer 
          text-red-500 hover:text-red-600"
        />
      )}
    </div>
  );
};

export default StaffSearch;
