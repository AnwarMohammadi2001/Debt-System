import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const SellerSelect = ({ sellers, value, onChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered sellers
  const filteredSellers = sellers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="border rounded-md p-2 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {value
            ? sellers.find((s) => (s.id || s._id) === value)?.name || "نامشخص"
            : loading
              ? "در حال دریافت فروشندگان..."
              : "انتخاب فروشنده"}
        </span>
        <FaChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b flex items-center gap-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              className="w-full outline-none"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredSellers.length > 0 ? (
            filteredSellers.map((seller) => (
              <div
                key={seller.id || seller._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(seller.id || seller._id);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {seller.name} - {seller.phone || ""}{" "}
                {seller.company ? `(${seller.company})` : ""}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400 text-sm">فروشنده‌ای یافت نشد</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerSelect;
