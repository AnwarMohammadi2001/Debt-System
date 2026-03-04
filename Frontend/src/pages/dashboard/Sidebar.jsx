import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FaCheckCircle, FaRegCopy } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";
import { FaListUl } from "react-icons/fa6";
import { PiListChecksLight } from "react-icons/pi";
import { MdOutlineStore } from "react-icons/md";
import { GiExpense } from "react-icons/gi";
import {
  MdOutlineDashboardCustomize,
  MdAddShoppingCart,
  MdFormatListNumberedRtl,
  MdKeyboardArrowDown,
  MdOutlinePayments,
  MdOutlineAssessment,
  MdAttachMoney,
  MdOutlinePeopleAlt,
} from "react-icons/md";
import {
  FaList,
  FaUsers,
  FaSignOutAlt,
  FaShoppingBag,
  FaUserTie,
  FaFileInvoiceDollar,
  FaChartPie,
} from "react-icons/fa";
import { CgUserList } from "react-icons/cg";
import { LucideUserRoundPlus } from "lucide-react";
import { IoIosAdd } from "react-icons/io";
import { MdPayments } from "react-icons/md";
import { RiUserStarFill } from "react-icons/ri";

const Sidebar = ({ setActiveComponent }) => {
  const [selectedC, setSelectedC] = useState("home");
  const [openStaffMenu, setOpenStaffMenu] = useState(false);
  const [openOrdersMenu, setOpenOrdersMenu] = useState(false);
  const [openStockMenu, setOpenStockMenu] = useState(false);
  const [lastOpenedMenu, setLastOpenedMenu] = useState(null);

  const sidebarRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const MySwal = withReactContent(Swal);

  // Function to close all dropdowns except the specified one
  const closeOtherDropdowns = (menuToKeepOpen) => {
    if (menuToKeepOpen !== "orders") setOpenOrdersMenu(false);
    if (menuToKeepOpen !== "staff") setOpenStaffMenu(false);
    if (menuToKeepOpen !== "stock") setOpenStockMenu(false);
    setLastOpenedMenu(menuToKeepOpen);
  };

  // Function to handle dropdown toggle with auto-close of others
  const handleDropdownToggle = (menuType) => {
    // Toggle the clicked menu
    let shouldOpen = false;

    switch (menuType) {
      case "staff":
        shouldOpen = !openStaffMenu;
        setOpenStaffMenu(shouldOpen);
        break;
      case "orders":
        shouldOpen = !openOrdersMenu;
        setOpenOrdersMenu(shouldOpen);
        break;
      case "stock":
        shouldOpen = !openStockMenu;
        setOpenStockMenu(shouldOpen);
        break;
      default:
        break;
    }

    // If opening a menu, close others
    if (shouldOpen) {
      closeOtherDropdowns(menuType);
    } else {
      // If closing a menu, clear the last opened
      setLastOpenedMenu(null);
    }
  };

  // Function to handle component selection
  const handleComponentSelect = (componentValue) => {
    setSelectedC(componentValue);
    setActiveComponent(componentValue);
    closeOtherDropdowns(null);
  };

  // Function to handle sub-item click
  const handleSubItemClick = (componentValue, parentMenu) => {
    setSelectedC(componentValue);
    setActiveComponent(componentValue);
    setLastOpenedMenu(parentMenu);

    // Ensure parent menu stays open
    switch (parentMenu) {
      case "orders":
        setOpenOrdersMenu(true);
        setOpenStaffMenu(false);
        setOpenStockMenu(false);
        break;
      case "staff":
        setOpenStaffMenu(true);
        setOpenOrdersMenu(false);
        setOpenStockMenu(false);
        break;
      case "stock":
        setOpenStockMenu(true);
        setOpenOrdersMenu(false);
        setOpenStaffMenu(false);
        break;
      default:
        break;
    }
  };

  const handleSignOut = () => {
    MySwal.fire({
      title: "آیا مطمئن هستید؟",
      text: "شما از سیستم خارج خواهید شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "بله، خارج شو!",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(signOutSuccess());
        navigate("/sign-in");
      }
    });
  };

  // Staff Management Menu Items
  const staffComponents = [
    {
      name: "لیست کارمندان",
      value: "StaffManager",
      icon: <FaUsers />,
      description: "مشاهده و مدیریت لیست کارمندان",
    },
    {
      name: "گزارشات کارمندان",
      value: "StaffReports",
      icon: <FaChartPie />,
      description: "گزارشات کلی کارمندان",
    },
  ];

  // Order Menu Items
  const orderComponents = [
    { name: "سفارش جدید", value: "Orders", icon: <MdAddShoppingCart /> },
    { name: "سفارشات چاپ", value: "Order_Print_list", icon: <FiPrinter /> },
    { name: "سفارشات کاپی", value: "Order_Copy_list", icon: <FaRegCopy /> },
    {
      name: "سفارشات چاپ شده",
      value: "Order_Printed",
      icon: <FaCheckCircle />,
    },
    { name: "همه سفارشات", value: "OrdersList", icon: <FaListUl /> },
  ];

  // Other Components (excluding staff which is now a dropdown)
  const otherComponents = [
    { name: "مدیریت مشتریان", value: "CustomerManager", icon: <CgUserList /> },
    {
      name: "مدیریت فروشنده ها",
      value: "SellerManager",
      icon: <MdOutlineStore />,
    },
    { name: "مدیریت مصارف", value: "ExpenseManager", icon: <GiExpense /> },
  ];

  // Get accessible components based on user role
  let accessibleOrders = [];
  let accessibleStaff = [];
  let accessibleOthers = [];
  let hasHomeAccess = false;

 if (currentUser && currentUser.role) {
   const userRole = currentUser.role;

   // 👑 Admin → همه صفحات به جز Home
   if (userRole === "admin") {
     accessibleOrders = orderComponents;
     accessibleStaff = staffComponents;
     accessibleOthers = otherComponents;
     hasHomeAccess = false; // ❌ Home حذف شد
   }

   // 👔 Reception → فقط Home
   else if (userRole === "reception") {
     accessibleOrders = [];
     accessibleStaff = [];
     accessibleOthers = [];
     hasHomeAccess = true; // ✅ فقط Home
   }

   // سایر کاربران → هیچ
   else {
     accessibleOrders = [];
     accessibleStaff = [];
     accessibleOthers = [];
     hasHomeAccess = false;
   }
 }

  // Add scroll event listener to check if sidebar is scrollable
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      const isScrollable = sidebar.scrollHeight > sidebar.clientHeight;
      if (isScrollable) {
        sidebar.classList.add("has-scroll");
      }
    }
  }, []);

  return (
    <div className="h-full w-64 flex flex-col bg-white overflow-hidden">
      {/* Fixed Header - Will not scroll */}
      <header className="flex-shrink-0 flex items-center gap-3 p-5 text-white font-bold text-xl bg-white border-b border-gray-200">
        <div className="flex items-center justify-center p-1 bg-white rounded-full">
          <img src="logo.jpeg" alt="Logo" className="h-10 w-10 rounded-full" />
        </div>
        <span className="text-2xl font-bold text-cyan-700">مطبعه خوشه</span>
      </header>

      {/* Scrollable Menu Area */}
      <div
        ref={sidebarRef}
        className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar"
      >
        <ul className="space-y-[1px] pt-2">
          {/* Page principale (Home) - Always first */}
          {hasHomeAccess && (
            <li className="relative group cursor-pointer mb-1">
              <a
                onClick={() => handleComponentSelect("home")}
                className={`flex items-center w-full px-2 py-3 rounded-md transition-all duration-300 ${
                  selectedC === "home"
                    ? "bg-cyan-700 text-gray-100"
                    : "hover:bg-cyan-700 text-gray-700 hover:text-white"
                }`}
              >
                <span className="text-lg">
                  <MdOutlineDashboardCustomize />
                </span>
                <span className="mr-4 text-base font-semibold">
                  داشبورد اصلی
                </span>
              </a>
            </li>
          )}

          {/* Orders Dropdown Menu */}
          {accessibleOrders.length > 0 && (
            <li className="relative group cursor-pointer mb-1">
              <div>
                {/* Main Orders button */}
                <a
                  onClick={() => handleDropdownToggle("orders")}
                  className={`relative flex items-center justify-between w-full rounded-md px-2 py-3 transition-all duration-300 cursor-pointer ${
                    openOrdersMenu
                      ? "bg-cyan-700 text-white"
                      : "hover:bg-cyan-700 text-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-lg">
                      <FaShoppingBag />
                    </span>
                    <span className="mr-4 text-base font-semibold">
                      سفارشات
                    </span>
                  </div>
                  <MdKeyboardArrowDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openOrdersMenu ? "rotate-180" : ""
                    }`}
                  />
                </a>

                {/* Orders Sub Menu */}
                {openOrdersMenu && (
                  <ul className="mt-1 space-y-1">
                    {accessibleOrders.map((orderItem, index) => (
                      <li key={index}>
                        <a
                          onClick={() =>
                            handleSubItemClick(orderItem.value, "orders")
                          }
                          className={`flex items-center gap-x-2 px-3 py-3 text-sm rounded-md cursor-pointer transition ${
                            selectedC === orderItem.value
                              ? "bg-cyan-600 text-white"
                              : "text-gray-700 hover:bg-cyan-600 hover:text-white"
                          }`}
                          title={orderItem.description}
                        >
                          <span className="text-sm">{orderItem.icon}</span>
                          {orderItem.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )}

          {/* Staff Management Dropdown */}
          {accessibleStaff.length > 0 && (
            <li className="relative group cursor-pointer mb-1">
              <div>
                {/* Main Staff button */}
                <a
                  onClick={() => handleDropdownToggle("staff")}
                  className={`relative flex items-center justify-between w-full rounded-md px-2 py-3 transition-all duration-300 cursor-pointer ${
                    openStaffMenu
                      ? "bg-cyan-700 text-white"
                      : "hover:bg-cyan-700 text-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-lg">
                      <FaUsers />
                    </span>
                    <span className="mr-4 text-base font-semibold">
                      مدیریت کارمندان
                    </span>
                  </div>
                  <MdKeyboardArrowDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openStaffMenu ? "rotate-180" : ""
                    }`}
                  />
                </a>

                {/* Staff Sub Menu */}
                {openStaffMenu && (
                  <ul className="mt-1 space-y-1">
                    {accessibleStaff.map((staffItem, index) => (
                      <li key={index}>
                        <a
                          onClick={() =>
                            handleSubItemClick(staffItem.value, "staff")
                          }
                          className={`flex items-center gap-x-2 px-3 py-3 text-sm rounded-md cursor-pointer transition group ${
                            selectedC === staffItem.value
                              ? "bg-cyan-600 text-white"
                              : "text-gray-700 hover:bg-cyan-600 hover:text-white"
                          }`}
                          title={staffItem.description}
                        >
                          <span className="text-sm">{staffItem.icon}</span>
                          <span className="flex-1">{staffItem.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )}

          {/* Other Menu Items */}
          {accessibleOthers.map((component, index) => (
            <li key={index} className="relative group cursor-pointer">
              <a
                onClick={() => handleComponentSelect(component.value)}
                className={`flex items-center w-full px-2 py-3 rounded-md transition-all duration-300 ${
                  selectedC === component.value
                    ? "bg-cyan-700 text-gray-100"
                    : "hover:bg-cyan-700 text-gray-700 hover:text-white"
                }`}
              >
                <span className="text-lg">{component.icon}</span>
                <span className="mr-4 text-base font-semibold">
                  {component.name}
                </span>
              </a>
            </li>
          ))}

          {/* Stock Manager Dropdown (فقط برای ادمین) */}
          {currentUser?.role === "admin" && (
            <li className="relative group cursor-pointer mb-1">
              <div>
                {/* Main Stock button */}
                <a
                  onClick={() => handleDropdownToggle("stock")}
                  className={`relative flex items-center justify-between w-full rounded-md px-2 py-3 transition-all duration-300 cursor-pointer ${
                    openStockMenu
                      ? "bg-cyan-700 text-white"
                      : "hover:bg-cyan-700 text-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-lg">
                      <MdOutlineStore />
                    </span>
                    <span className="mr-4 text-base font-semibold">
                      مدیریت گدام
                    </span>
                  </div>
                  <MdKeyboardArrowDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      openStockMenu ? "rotate-180" : ""
                    }`}
                  />
                </a>

                {/* Stock Sub Menu */}
                {openStockMenu && (
                  <ul className="mt-1 space-y-1">
                    <li>
                      <a
                        onClick={() =>
                          handleSubItemClick("StockManager", "stock")
                        }
                        className={`flex items-center gap-x-2 px-3 py-3 text-sm rounded-md cursor-pointer transition ${
                          selectedC === "StockManager"
                            ? "bg-cyan-600 text-white"
                            : "text-gray-700 hover:bg-cyan-600 hover:text-white"
                        }`}
                      >
                        <MdOutlineStore size={20} />
                        مدیریت گدام مرکزی
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() =>
                          handleSubItemClick("CustomerStock", "stock")
                        }
                        className={`flex items-center gap-x-2 px-3 py-3 text-sm rounded-md cursor-pointer transition ${
                          selectedC === "CustomerStock"
                            ? "bg-cyan-600 text-white"
                            : "text-gray-700 hover:bg-cyan-600 hover:text-white"
                        }`}
                      >
                        <MdOutlineStore size={20} />
                        مدیریت گدام مشتری‌ها
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          )}

          {/* Sign Out - Always at bottom */}
          {currentUser && (
            <li className="relative group cursor-pointer mt-2 pt-2 border-t border-gray-200">
              <a
                onClick={handleSignOut}
                className="flex items-center w-full px-2 py-3 rounded-md transition-all duration-300 hover:bg-red-600 text-gray-700 hover:text-white"
              >
                <span className="text-lg">
                  <FaSignOutAlt />
                </span>
                <span className="mr-4 text-base font-semibold">خروج</span>
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Optional: Add CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
