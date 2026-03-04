// components/charts/ShadcnCharts.jsx
import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap,
} from "recharts";

// فرمت ارز برای Tooltip
const formatCurrencyTooltip = (value) => {
  return new Intl.NumberFormat("fa-AF").format(value) + " افغانی";
};

const formatNumberTooltip = (value) => {
  return new Intl.NumberFormat("fa-AF").format(value);
};

// چارت مقایسه سفارشات چاپ و کاپی (Bar Chart)
export const PrintCopyComparisonChart = ({
  digitalData,
  offsetData,
  title,
}) => {
  const data = [
    {
      name: "در انتظار چاپ",
      چاپ: digitalData.pendingPrint || 0,
      کاپی: offsetData.pendingPrint || 0,
    },
    {
      name: "چاپ شده",
      چاپ: digitalData.completedPrint || 0,
      کاپی: offsetData.completedPrint || 0,
    },
    {
      name: "تحویل شده",
      چاپ: digitalData.deliveredPalet || 0,
      کاپی: 0, // افست معمولاً پالت ندارد
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumberTooltip(entry.value)} سفارش
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#374151" }} />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatNumberTooltip}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="چاپ"
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
            name="سفارشات چاپ"
          />
          <Bar
            dataKey="کاپی"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            name="سفارشات کاپی"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// چارت کیکی توزیع سفارشات (Pie Chart)
export const OrdersDistributionChart = ({
  digitalCount,
  offsetCount,
  title,
}) => {
  const data = [
    { name: "چاپ", value: digitalCount, color: "#0ea5e9" },
    { name: "کاپی", value: offsetCount, color: "#8b5cf6" },
  ];

  const totalOrders = digitalCount + offsetCount;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalOrders) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm">
            تعداد: {formatNumberTooltip(data.value)} سفارش
          </p>
          <p className="text-sm">درصد: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) =>
              `${entry.name}: ${formatNumberTooltip(entry.value)}`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          مجموع: {formatNumberTooltip(totalOrders)} سفارش
        </p>
      </div>
    </div>
  );
};

// چارت خطی روند سفارشات (Line Chart)
export const OrdersTrendChart = ({ dailyStats, title }) => {
  const data = dailyStats.map((day) => ({
    name: `روز ${day.day.split("-")[2]}`,
    سفارشات: parseInt(day.orderCount) || 0,
    تحویل‌شده: parseInt(day.deliveredCount) || 0,
    درآمد: parseFloat(day.dailyRevenue) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === "درآمد"
                ? `${entry.name}: ${formatCurrencyTooltip(entry.value)}`
                : `${entry.name}: ${formatNumberTooltip(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#374151" }} />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatNumberTooltip}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatCurrencyTooltip}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="سفارشات"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="تحویل‌شده"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="درآمد"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// چارت مشتریان برتر (Top Customers Chart)
export const TopCustomersChart = ({ customers, title, limit = 10 }) => {
  const topCustomers = customers
    .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
    .slice(0, limit);

  const data = topCustomers.map((customer) => ({
    name: customer.name?.substring(0, 15) || "نامشخص",
    سفارشات: customer.orderCount || 0,
    مبلغ: customer.totalSpent || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const customer = topCustomers.find(
        (c) =>
          c.name?.substring(0, 15) === label ||
          (c.name === "نامشخص" && label === "نامشخص"),
      );
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">
            {customer?.fullName || customer?.name || "نامشخص"}
          </p>
          <p className="text-sm text-cyan-700">
            سفارشات: {formatNumberTooltip(payload[0].value)}
          </p>
          <p className="text-sm text-green-700">
            مجموع خرید: {formatCurrencyTooltip(customer?.totalSpent || 0)}
          </p>
          {customer?.phone && (
            <p className="text-sm text-gray-600">تماس: {customer.phone}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatNumberTooltip}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="سفارشات"
            fill="#0ea5e9"
            radius={[0, 4, 4, 0]}
            name="تعداد سفارشات"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// چارت وضعیت سفارشات (Stacked Bar Chart)
export const OrderStatusChart = ({ stats, title }) => {
  const data = [
    {
      name: "چاپ",
      "در انتظار": stats.digital.pendingPrint || 0,
      "چاپ شده": stats.digital.completedPrint || 0,
      "تحویل شده": stats.digital.deliveredPalet || 0,
    },
    {
      name: "کاپی",
      "در انتظار": stats.offset.pendingPrint || 0,
      "چاپ شده": stats.offset.completedPrint || 0,
      "تحویل شده": 0,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">نوع: {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumberTooltip(entry.value)} سفارش
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#374151" }} />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatNumberTooltip}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="در انتظار"
            stackId="a"
            fill="#f59e0b"
            name="در انتظار چاپ"
          />
          <Bar dataKey="چاپ شده" stackId="a" fill="#10b981" name="چاپ شده" />
          <Bar
            dataKey="تحویل شده"
            stackId="a"
            fill="#8b5cf6"
            name="تحویل شده"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// چارت مقایسه درآمد (Area Chart)
export const RevenueComparisonChart = ({
  digitalRevenue,
  offsetRevenue,
  title,
}) => {
  const data = [
    { name: "هفته ۱", چاپ: digitalRevenue * 0.3, کاپی: offsetRevenue * 0.2 },
    { name: "هفته ۲", چاپ: digitalRevenue * 0.4, کاپی: offsetRevenue * 0.3 },
    { name: "هفته ۳", چاپ: digitalRevenue * 0.6, کاپی: offsetRevenue * 0.5 },
    { name: "هفته ۴", چاپ: digitalRevenue * 1, کاپی: offsetRevenue * 0.8 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrencyTooltip(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 mb-4 text-lg">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#374151" }} />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#374151" }}
            tickFormatter={formatCurrencyTooltip}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="چاپ"
            stackId="1"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="کاپی"
            stackId="1"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
