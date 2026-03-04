// components/charts/RevenueChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// ثبت کامپوننت‌های Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
);

// چارت درآمد روزانه (Bar Chart)
export const RevenueBarChart = ({ dailyStats }) => {
  const labels = dailyStats.map((day) => `روز ${day.day.split("-")[2]}`);
  const revenues = dailyStats.map((day) => parseFloat(day.dailyRevenue) || 0);
  const orders = dailyStats.map((day) => parseInt(day.orderCount) || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "درآمد (افغانی)",
        data: revenues,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "تعداد سفارشات",
        data: orders,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "درآمد (افغانی)",
          font: {
            family: "Vazir, sans-serif",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("fa-AF").format(value);
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "تعداد سفارشات",
          font: {
            family: "Vazir, sans-serif",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("fa-AF").format(value);
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        rtl: true,
        titleFont: {
          family: "Vazir, sans-serif",
        },
        bodyFont: {
          family: "Vazir, sans-serif",
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (label.includes("درآمد")) {
                label +=
                  new Intl.NumberFormat("fa-AF").format(context.parsed.y) +
                  " افغانی";
              } else {
                label += new Intl.NumberFormat("fa-AF").format(
                  context.parsed.y,
                );
              }
            }
            return label;
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} height={300} />;
};

// چارت خطی روند درآمد (Line Chart)
export const RevenueLineChart = ({ dailyStats }) => {
  const labels = dailyStats.map((day) => `روز ${day.day.split("-")[2]}`);
  const revenues = dailyStats.map((day) => parseFloat(day.dailyRevenue) || 0);
  const received = dailyStats.map((day) => parseFloat(day.dailyReceived) || 0);

  // محاسبه میانگین متحرک
  const movingAverage = (data, windowSize = 3) => {
    return data.map((_, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const end = index + 1;
      const slice = data.slice(start, end);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
  };

  const avgRevenues = movingAverage(revenues);

  const data = {
    labels,
    datasets: [
      {
        label: "درآمد روزانه",
        data: revenues,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "دریافتی روزانه",
        data: received,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "میانگین متحرک (3 روز)",
        data: avgRevenues,
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      tooltip: {
        rtl: true,
        titleFont: {
          family: "Vazir, sans-serif",
        },
        bodyFont: {
          family: "Vazir, sans-serif",
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("fa-AF").format(value);
          },
          font: {
            family: "Vazir, sans-serif",
          },
        },
        title: {
          display: true,
          text: "مبلغ (افغانی)",
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
  };

  return <Line data={data} options={options} height={300} />;
};

// چارت کیکی برای توزیع سفارشات (Pie Chart)
export const OrdersPieChart = ({
  digitalOrders,
  offsetOrders,
  totalOrders,
}) => {
  const data = {
    labels: ["چاپ", "کاپی"],
    datasets: [
      {
        data: [digitalOrders, offsetOrders],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(139, 92, 246, 0.8)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(139, 92, 246)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        rtl: true,
        titleFont: {
          family: "Vazir, sans-serif",
        },
        bodyFont: {
          family: "Vazir, sans-serif",
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = Math.round((value / totalOrders) * 100);
            return `${label}: ${new Intl.NumberFormat("fa-AF").format(value)} سفارش (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} height={250} />;
};

// چارت مقایسه درآمد و مصارف (Dual Axis)
export const RevenueExpenseChart = ({ dailyStats, dailyExpenses }) => {
  const labels = dailyStats.map((day) => `روز ${day.day.split("-")[2]}`);
  const revenues = dailyStats.map((day) => parseFloat(day.dailyRevenue) || 0);

  // Map expenses to corresponding days
  const expenses = labels.map((_, index) => {
    const dayNum = index + 1;
    const expenseDay = dailyExpenses.find((e) => {
      const day = e.day?.split("-")[2];
      return parseInt(day) === dayNum;
    });
    return parseFloat(expenseDay?.dailyExpense) || 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "درآمد",
        data: revenues,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "مصارف",
        data: expenses,
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: "y",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("fa-AF").format(value);
          },
          font: {
            family: "Vazir, sans-serif",
          },
        },
        title: {
          display: true,
          text: "مبلغ (افغانی)",
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} height={300} />;
};

// چارت پیشرفت (Gauge Chart)
export const ProgressGaugeChart = ({ value, maxValue, title }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [
          percentage >= 70
            ? "rgba(16, 185, 129, 0.8)"
            : percentage >= 40
              ? "rgba(245, 158, 11, 0.8)"
              : "rgba(239, 68, 68, 0.8)",
          "rgba(229, 231, 235, 0.5)",
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: "80%",
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    events: [],
  };

  const plugins = [
    {
      id: "centerText",
      afterDraw: (chart) => {
        const { ctx, chartArea } = chart;
        const x = chartArea.left + (chartArea.right - chartArea.left) / 2;
        const y = chartArea.top + (chartArea.bottom - chartArea.top) / 2 + 20;

        ctx.save();
        ctx.font = "bold 24px Vazir";
        ctx.fillStyle =
          percentage >= 70
            ? "#10b981"
            : percentage >= 40
              ? "#f59e0b"
              : "#ef4444";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${percentage.toFixed(1)}%`, x, y);

        ctx.font = "14px Vazir";
        ctx.fillStyle = "#6b7280";
        ctx.fillText(title, x, y + 30);
        ctx.restore();
      },
    },
  ];

  return (
    <div style={{ position: "relative", height: "200px" }}>
      <Pie data={data} options={options} plugins={plugins} />
    </div>
  );
};
