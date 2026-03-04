import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "expenses", label: "ثبت مصرف", icon: "➕" },
    { id: "expense-list", label: "لیست مصارف", icon: "📋" },
    { id: "categories", label: "کتگوری‌ها", icon: "🏷️" },
  ];

  return (
    <div className="mb-6">
      <div className=" border-gray-200">
        <nav className="flex gap-x-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-3 cursor-pointer  text-sm font-medium  rounded-md transition-colors
                flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? " bg-cyan-700  text-gray-100"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                }
              `}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
