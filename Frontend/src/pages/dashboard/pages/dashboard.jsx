import React from "react";
import FinancialReports from "./report/FinancialReports"; // Adjust the import path as needed
import DashboardHome from "./report/DashboardHome";
import AnalyticsDashboard from "./report/AnalyticsDashboard";

const Dashboard = () => {
  return (
    <div className=" bg-gray-200 p-6 min-h-screen text-right" dir="rtl">
      {/* Main Dashboard Title */}
      <div className="bg-white rounded-md   border-gray-100 overflow-hidden">
        {/* Render the FinancialReports component */}
        <div className="">
          <DashboardHome />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
