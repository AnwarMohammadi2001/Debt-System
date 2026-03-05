import express from "express";
import bodyParser from "body-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

import { setupAssociations } from "./Models/associations.js";

import userRout from "./routes/userRout.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

dotenv.config();
setupAssociations();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
==================================================
✅ PRODUCTION CORS (BEST FOR SUBDOMAINS)
==================================================
*/

const allowedOrigins = [
  "https://tamadon.tet-soft.com",
  "https://tamadonback.tet-soft.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/*
==================================================
✅ MIDDLEWARES
==================================================
*/

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

/*
==================================================
✅ STATIC FILES
==================================================
*/

const uploadsDirectory = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDirectory));

/*
==================================================
✅ ROUTES
==================================================
*/

app.use("/users", userRout);
app.use("/api/employees", employeeRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/wallets", walletRoutes);

/*
==================================================
✅ DATABASE + SERVER START
==================================================
*/

const port = process.env.PORT || 8038;

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(port, () => {
      console.log("✅ Server running on port:", port);
      console.log("✅ Production CORS Enabled");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
