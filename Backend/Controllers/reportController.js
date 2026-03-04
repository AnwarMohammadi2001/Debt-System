import { Employee, Loan, LoanPayment, Wallet } from "../Models/index.js";
import  sequelize from "../config/database.js";

// @desc    Get company summary report
// @route   GET /api/reports/summary
// @access  Public
export const getCompanySummary = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.count();

    // Get wallet statistics
    const walletStats = await Wallet.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalLoans")), "totalLoans"],
        [sequelize.fn("SUM", sequelize.col("totalPaid")), "totalPaid"],
        [
          sequelize.fn("SUM", sequelize.col("remainingBalance")),
          "totalRemaining",
        ],
      ],
    });

    // Get active loans count
    const activeLoansCount = await Loan.count({
      where: { status: "Active" },
    });

    // Get recent activities
    const recentLoans = await Loan.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Employee,
          attributes: ["fullName"],
        },
      ],
    });

    const recentPayments = await LoanPayment.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Loan,
          include: [
            {
              model: Employee,
              attributes: ["fullName"],
            },
          ],
        },
      ],
    });

    // Calculate averages
    const avgLoanPerEmployee =
      totalEmployees > 0
        ? (
            parseFloat(walletStats[0]?.dataValues.totalLoans || 0) /
            totalEmployees
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalActiveLoans: activeLoansCount,
          totalLoanAmount: parseFloat(
            walletStats[0]?.dataValues.totalLoans || 0,
          ),
          totalPaidAmount: parseFloat(
            walletStats[0]?.dataValues.totalPaid || 0,
          ),
          totalRemainingBalance: parseFloat(
            walletStats[0]?.dataValues.totalRemaining || 0,
          ),
          averageLoanPerEmployee: parseFloat(avgLoanPerEmployee),
        },
        recentActivities: {
          loans: recentLoans,
          payments: recentPayments,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get employee loan history
// @route   GET /api/reports/employee/:employeeId/loans
// @access  Public
export const getEmployeeLoanHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findByPk(employeeId, {
      attributes: ["id", "fullName", "phone", "position"],
      include: [
        {
          model: Wallet,
          attributes: ["totalLoans", "totalPaid", "remainingBalance"],
        },
        {
          model: Loan,
          include: [
            {
              model: LoanPayment,
              attributes: ["id", "amount", "paymentDate", "createdAt"],
            },
          ],
          order: [["loanDate", "DESC"]],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "کارمند یافت نشد",
      });
    }

    // Calculate additional statistics
    const loanStats = employee.Loans.reduce(
      (stats, loan) => {
        stats.totalLoans++;
        stats.totalAmount += parseFloat(loan.amount);
        stats.totalPaid += loan.LoanPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount),
          0,
        );

        if (loan.status === "Active") {
          stats.activeLoans++;
        } else {
          stats.closedLoans++;
        }

        return stats;
      },
      {
        totalLoans: 0,
        activeLoans: 0,
        closedLoans: 0,
        totalAmount: 0,
        totalPaid: 0,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        employee,
        statistics: loanStats,
        loans: employee.Loans,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get payments report by date range
// @route   GET /api/reports/payments
// @access  Public
export const getPaymentsReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const whereCondition = {};

    if (startDate && endDate) {
      whereCondition.paymentDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const includeCondition = [
      {
        model: Loan,
        include: [
          {
            model: Employee,
            attributes: ["id", "fullName"],
          },
        ],
      },
    ];

    if (employeeId) {
      includeCondition[0].where = { employeeId };
    }

    const payments = await LoanPayment.findAll({
      where: whereCondition,
      include: includeCondition,
      order: [["paymentDate", "DESC"]],
    });

    // Group payments by date
    const groupedByDate = payments.reduce((groups, payment) => {
      const date = payment.paymentDate;
      if (!groups[date]) {
        groups[date] = {
          date,
          count: 0,
          total: 0,
          payments: [],
        };
      }
      groups[date].count++;
      groups[date].total += parseFloat(payment.amount);
      groups[date].payments.push(payment);
      return groups;
    }, {});

    // Calculate totals
    const totalPayments = payments.length;
    const totalAmount = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          period: {
            start: startDate || "All",
            end: endDate || "All",
          },
          totalPayments,
          totalAmount,
          averagePayment:
            totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : 0,
        },
        groupedByDate: Object.values(groupedByDate),
        payments,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get loans report with filters
// @route   GET /api/reports/loans
// @access  Public
export const getLoansReport = async (req, res) => {
  try {
    const { status, startDate, endDate, employeeId } = req.query;

    const whereCondition = {};

    if (status) {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      whereCondition.loanDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (employeeId) {
      whereCondition.employeeId = employeeId;
    }

    const loans = await Loan.findAll({
      where: whereCondition,
      include: [
        {
          model: Employee,
          attributes: ["id", "fullName", "position"],
        },
        {
          model: LoanPayment,
          attributes: ["id", "amount"],
        },
      ],
      order: [["loanDate", "DESC"]],
    });

    // Calculate statistics
    const stats = loans.reduce(
      (acc, loan) => {
        acc.totalLoans++;
        acc.totalAmount += parseFloat(loan.amount);
        acc.totalRemaining += parseFloat(loan.remainingAmount);

        const paidAmount = loan.LoanPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount),
          0,
        );
        acc.totalPaid += paidAmount;

        if (loan.status === "Active") {
          acc.activeLoans++;
        } else {
          acc.closedLoans++;
        }

        return acc;
      },
      {
        totalLoans: 0,
        activeLoans: 0,
        closedLoans: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalRemaining: 0,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        statistics: stats,
        loans,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Public
export const getDashboardStats = async (req, res) => {
  try {
    // Get current month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await Employee.count();

    // Active loans count and amount
    const activeLoans = await Loan.findAll({
      where: { status: "Active" },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [
          sequelize.fn("SUM", sequelize.col("remainingAmount")),
          "totalRemaining",
        ],
      ],
    });

    // Monthly payments
    const monthlyPayments = await LoanPayment.sum("amount", {
      where: {
        paymentDate: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Monthly loans
    const monthlyLoans = await Loan.count({
      where: {
        loanDate: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Top 5 employees with highest remaining balance
    const topEmployees = await Wallet.findAll({
      attributes: ["employeeId", "remainingBalance"],
      include: [
        {
          model: Employee,
          attributes: ["fullName", "position"],
        },
      ],
      order: [["remainingBalance", "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeLoans: {
          count: parseInt(activeLoans[0]?.dataValues.count || 0),
          totalAmount: parseFloat(
            activeLoans[0]?.dataValues.totalRemaining || 0,
          ),
        },
        monthlyStats: {
          payments: parseFloat(monthlyPayments || 0),
          newLoans: monthlyLoans,
        },
        topEmployees,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
