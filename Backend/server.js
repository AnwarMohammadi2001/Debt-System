import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

// ---------------------------------------------------------
// 1. تنظیمات سیستم لاگ‌گیری خطاهای بحرانی
// ---------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = path.join(__dirname, "server_error.txt");

// تابع برای نوشتن وضعیت و خطاها در یک فایل متنی
function logMessage(msg) {
  const time = new Date().toLocaleString("fa-IR");
  fs.appendFileSync(logFilePath, `[${time}] ${msg}\n`, "utf8");
}

// برای اینکه لاگ‌های قدیمی پاک شوند، در شروع برنامه فایل قبلی را حذف می‌کنیم
if (fs.existsSync(logFilePath)) {
  fs.unlinkSync(logFilePath);
}

logMessage("🚀 شروع اجرای سرور (حالت عیب‌یابی)...");

// ---------------------------------------------------------
// 2. تنظیمات اولیه Express و CORS
// ---------------------------------------------------------
dotenv.config();
const app = express();

const corsOptions = {
  origin: "https://tamadon.tet-soft.com",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
    "Accept",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

const uploadsDirectory = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDirectory));

// ---------------------------------------------------------
// 3. بارگذاری هوشمند فایل‌ها برای پیدا کردن منبع خطای 503
// ---------------------------------------------------------
async function startServer() {
  try {
    logMessage("⏳ در حال خواندن فایل database.js ...");
    const dbModule = await import("./config/database.js");
    const sequelize = dbModule.default;
    logMessage("✅ فایل دیتابیس با موفقیت خوانده شد.");

    logMessage("⏳ در حال بارگذاری فایل‌های روت (Routes) ...");
    const userRout = (await import("./routes/userRout.js")).default;
    const employeeRoutes = (await import("./routes/employeeRoutes.js")).default;
    const loanRoutes = (await import("./routes/loanRoutes.js")).default;
    const paymentRoutes = (await import("./routes/paymentRoutes.js")).default;
    const reportRoutes = (await import("./routes/reportRoutes.js")).default;
    const walletRoutes = (await import("./routes/walletRoutes.js")).default;
    logMessage("✅ تمام فایل‌های روت با موفقیت پیدا و خوانده شدند.");

    // اعمال روت‌ها به سرور
    app.use("/users", userRout);
    app.use("/api/employees", employeeRoutes);
    app.use("/api/loans", loanRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/wallets", walletRoutes);

    logMessage("⏳ در حال اتصال به دیتابیس MySQL ...");
    await sequelize.authenticate();
    logMessage("✅ اتصال به دیتابیس MySQL با موفقیت انجام شد.");

    await sequelize.sync();
    logMessage("✅ دیتابیس سینک شد.");

    app.get("/", (req, res) => {
      res.send("API is Running Perfectly!");
    });
  } catch (error) {
    // اگر سرور کرش کند، خطای دقیق در فایل ثبت می‌شود
    logMessage(
      `❌ خطای بحرانی (دلیل کرش کردن سرور):\n${error.stack || error.message}`,
    );

    // اگر کسی سایت را باز کند، به جای خطای 503، می‌گوییم فایل لاگ را بخواند
    app.use((req, res) => {
      res
        .status(500)
        .send(
          "Server Crashed! Please check the server_error.txt file in cPanel File Manager.",
        );
    });
  } finally {
    // در هر حالتی سرور را روشن می‌کنیم تا Passenger خطای 503 ندهد
    const port = process.env.PORT || 8038;
    app.listen(port, () => {
      logMessage(`🌐 سرور با موفقیت روی پورت ${port} روشن شد.`);
    });
  }
}

startServer();
