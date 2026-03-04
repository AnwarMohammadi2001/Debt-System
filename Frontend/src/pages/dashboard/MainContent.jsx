import { useSelector } from "react-redux";
import Dashboard from "./pages/dashboard";
import Report from "./pages/reports";
import Orders from "../dashboard/pages/orders/Orders";
import OrdersList from "../dashboard/pages/orders/OrdersList";
import AddUser from "./pages/AddUser";
import CustomerManager from "../CustomerManager";
import Order_list from "../dashboard/pages/orders/Order_list";
import OrderCopyList from "./pages/orders/OrderCopyList";
import OrderPrinted from "./pages/orders/OrderPrinted";
import SellerManager from "./pages/Seller/SellerManager";
import StockManager from "./StockManager/StockManager";
import CustomerStockList from "./StockManager/CustomerStockList";
import ExpenseManager from "./pages/expenseManager/ExpenseManager";
import StaffManagement from "./pages/Staff/StaffManagement";
import DashboardHome from "./pages/report/DashboardHome";
import OverallReportComponent from "../../components/staff/OverallReportComponent";
const MainContent = ({ activeComponent }) => {
  const { currentUser } = useSelector((state) => state.user);

  const userRole = currentUser?.role;

  const renderContent = () => {
    // ✅ Reception → فقط Dashboard
    if (userRole === "reception") {
      if (activeComponent !== "home" && activeComponent !== "dashboard") {
        return <Dashboard />;
      }
    }

    // 👑 Admin → پیش فرض Orders
    if (userRole === "admin") {
      if (
        !activeComponent ||
        activeComponent === "home" ||
        activeComponent === "dashboard"
      ) {
        return <Orders />;
      }
    }

    switch (activeComponent) {
      case "report":
        return <Report />;

      case "CustomerManager":
        return <CustomerManager />;

      case "SellerManager":
        return <SellerManager />;

      case "StaffManager":
        return <StaffManagement />;

      case "Orders":
        return <Orders />;

      case "Order_Print_list":
        return <Order_list />;

      case "Order_Copy_list":
        return <OrderCopyList />;

      case "Order_Printed":
        return <OrderPrinted />;
      case "StaffReports":
        return <OverallReportComponent />;

      case "OrdersList":
        return <OrdersList />;

      case "StockManager":
        return <StockManager />;

      case "CustomerStock":
        return <CustomerStockList />;

      case "ExpenseManager":
        return <ExpenseManager />;

      case "AddUser":
        return <AddUser />;

      default:
        // ⭐ Default Page
        return userRole === "admin" ? <Orders /> : <DashboardHome />;
    }
  };

  return <div className="min-h-[90vh] bg-white">{renderContent()}</div>;
};

export default MainContent;
