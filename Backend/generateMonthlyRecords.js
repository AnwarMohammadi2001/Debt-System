// scripts/generateMonthlyRecords.js
import readline from "readline";
import sequelize from "./dbconnection.js";
import Staff from "./Models/Staff.js";
import StaffMonthlyRecord from "./Models/StaffMonthlyRecord.js";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// محاسبه تعداد روزهای ماه شمسی
const getDaysInJalaliMonth = (year, month) => {
  return moment.jDaysInMonth(year, month - 1);
};

// محاسبه نرخ روزانه
const calculateDailyRate = (monthlySalary, daysInMonth) => {
  return parseFloat((monthlySalary / daysInMonth).toFixed(2));
};

const generateMonthlyRecords = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.\n");

    // دریافت بازه زمانی
    const startYear = parseInt(await askQuestion("سال شروع (مثلاً 1404): "));
    const startMonth = parseInt(await askQuestion("ماه شروع (1-12): "));
    const endYear = parseInt(await askQuestion("سال پایان (مثلاً 1405): "));
    const endMonth = parseInt(await askQuestion("ماه پایان (1-12): "));

    console.log("\n⏳ در حال دریافت لیست کارمندان...");

    // دریافت همه کارمندان
    const staffs = await Staff.findAll({
      attributes: ["id", "name", "baseSalary", "joinDate"],
    });

    if (staffs.length === 0) {
      console.log("❌ هیچ کارمندی یافت نشد!");
      return;
    }

    console.log(`✅ ${staffs.length} کارمند پیدا شد.\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    // برای هر کارمند
    for (const staff of staffs) {
      console.log(`\n👤 کارمند: ${staff.name} (ID: ${staff.id})`);

      // برای هر ماه در بازه زمانی
      for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;

        for (let month = monthStart; month <= monthEnd; month++) {
          // بررسی وجود رکورد
          const existingRecord = await StaffMonthlyRecord.findOne({
            where: {
              staffId: staff.id,
              year: year,
              month: month,
            },
          });

          if (existingRecord) {
            console.log(
              `  ⏺️ ماه ${month} سال ${year}: از قبل وجود دارد (skipped)`,
            );
            totalSkipped++;
            continue;
          }

          // محاسبه تعداد روزهای ماه
          const daysInMonth = getDaysInJalaliMonth(year, month);

          // محاسبه نرخ روزانه
          const dailySalaryRate = calculateDailyRate(
            staff.baseSalary,
            daysInMonth,
          );

          // بررسی تناسبی بودن حقوق (اگر کارمند در وسط ماه ثبت شده باشد)
          let totalPayable = staff.baseSalary;
          let remainingAmount = staff.baseSalary;

          // اگر این ماه، ماه ثبت‌نام کارمند است
          if (staff.joinDate) {
            const joinMoment = moment(staff.joinDate, "jYYYY-jMM-jDD");
            if (joinMoment.isValid()) {
              const joinYear = joinMoment.jYear();
              const joinMonth = joinMoment.jMonth() + 1;
              const joinDay = joinMoment.jDate();

              if (year === joinYear && month === joinMonth) {
                // محاسبه روزهای باقی‌مانده
                const remainingDays = daysInMonth - joinDay + 1;
                totalPayable = parseFloat(
                  (dailySalaryRate * remainingDays).toFixed(2),
                );
                remainingAmount = totalPayable;
                console.log(
                  `  📝 ماه ثبت‌نام: محاسبه تناسبی (${remainingDays} روز)`,
                );
              }
            }
          }

          // ایجاد رکورد جدید
          await StaffMonthlyRecord.create({
            staffId: staff.id,
            year: year,
            month: month,
            baseSalary: staff.baseSalary,
            daysInMonth: daysInMonth,
            dailySalaryRate: dailySalaryRate,
            overtimeHours: 0,
            overtimeAmount: 0,
            absenceDays: 0,
            absenceDeduction: 0,
            paidAmount: 0,
            totalPayable: totalPayable,
            remainingAmount: remainingAmount,
            status: "pending",
            isClosed: false,
          });

          console.log(`  ✅ ماه ${month} سال ${year}: ایجاد شد`);
          totalCreated++;
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 گزارش نهایی:");
    console.log(`✅ رکوردهای ایجاد شده: ${totalCreated}`);
    console.log(`⏺️ رکوردهای موجود: ${totalSkipped}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ خطا:", error.message);
  } finally {
    rl.close();
    await sequelize.close();
  }
};

console.log("🚀 اسکریپت تولید رکوردهای ماهانه\n");
generateMonthlyRecords();
