import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
// import { setupAssociations } from "./Models/associations.js";
// setupAssociations();
import sequelize from "./dbconnection.js";
// روت‌ها
import userRout from "./routes/userRout.js";

// تنظیمات محیطی
import dotenv from "dotenv";
dotenv.config();

const FRONT_URL = process.env.FRONT_URL || "http://localhost:3000"; // مقدار پیش‌فرض برای اطمینان
const port = 8038;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ تنظیمات CORS
const allowedOrigins = [
  `${FRONT_URL}`, // آدرس فرانت‌اند از فایل env
  "http://localhost:3000", // آدرس لوکال برای توسعه
  "http://localhost:5173", // آدرس پیش‌فرض Vite (اگر استفاده می‌کنید)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // اگر اوریجین وجود نداشت (مثل درخواست‌های سرور به سرور) یا در لیست مجاز بود
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("CORS policy: Access denied from this origin."));
      }
    },
    credentials: true, // اجازه ارسال کوکی و هدرهای احراز هویت
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// هندل کردن خطاهای CORS
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

// میدل‌ورها
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// سرو کردن فایل‌های استاتیک (عکس‌های آپلود شده)
const uploadsDirectory = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDirectory));

// --- تعریف مسیرها (Routes) ---
app.use("/users", userRout);

sequelize
  // گزینه alter: true جدول‌ها را بر اساس مدل‌های جدید آپدیت می‌کند
  .sync({ alter: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`📡 CORS enabled for: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((error) => {
    console.error("❌ Unable to connect to the database:", error);
  });
