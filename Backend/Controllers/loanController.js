import { Loan, Employee, Wallet, LoanPayment } from "../Models/index.js";
import sequelize from "../config/database.js";
import {
  updateWalletAfterLoan,
  updateWalletAfterPayment,
} from "../utils/walletUpdater.js";

// @desc    Create new loan
// @route   POST /api/loans
// @access  Public
export const createLoan = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { employeeId, amount, loanDate, description } = req.body;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId, { transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "کارمند یافت نشد",
      });
    }

    // Check for active loan
    const activeLoan = await Loan.findOne({
      where: {
        employeeId,
        status: "Active",
      },
      transaction,
    });

    if (activeLoan) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error:
          "کارمند دارای قرضه فعال است. لطفاً ابتدا قرضه قبلی را تسویه کنید.",
      });
    }

    // Create loan
    const loan = await Loan.create(
      {
        employeeId,
        amount,
        remainingAmount: amount,
        loanDate,
        description,
        status: "Active",
      },
      { transaction },
    );

    // Update wallet
    const wallet = await Wallet.findOne({
      where: { employeeId },
      transaction,
    });

    await updateWalletAfterLoan(wallet, amount, "create", transaction);

    await transaction.commit();

    // Fetch updated wallet
    const updatedWallet = await Wallet.findOne({
      where: { employeeId },
    });

    res.status(201).json({
      success: true,
      data: {
        ...loan.toJSON(),
        wallet: updatedWallet,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all active loans
// @route   GET /api/loans/active
// @access  Public
export const getActiveLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { status: "Active" },
      include: [
        {
          model: Employee,
          attributes: ["id", "fullName", "phone", "position"],
        },
        {
          model: LoanPayment,
          attributes: ["id", "amount", "paymentDate"],
          limit: 5,
          order: [["paymentDate", "DESC"]],
        },
      ],
      order: [["loanDate", "DESC"]],
    });

    const totalAmount = loans.reduce(
      (sum, loan) => sum + parseFloat(loan.remainingAmount),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        loans,
        summary: {
          totalLoans: loans.length,
          totalRemainingAmount: totalAmount,
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

// @desc    Get all closed loans
// @route   GET /api/loans/closed
// @access  Public
export const getClosedLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: loans } = await Loan.findAndCountAll({
      where: { status: "Closed" },
      include: [
        {
          model: Employee,
          attributes: ["id", "fullName"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: loans,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get loan by ID
// @route   GET /api/loans/:id
// @access  Public
export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByPk(id, {
      include: [
        {
          model: Employee,
          attributes: ["id", "fullName", "phone", "position"],
        },
        {
          model: LoanPayment,
          order: [["paymentDate", "DESC"]],
        },
      ],
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: "قرضه یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Close loan manually
// @route   PUT /api/loans/:id/close
// @access  Public
export const closeLoan = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const loan = await Loan.findByPk(id, {
      include: [
        {
          model: Employee,
          include: [Wallet],
        },
      ],
      transaction,
    });

    if (!loan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "قرضه یافت نشد",
      });
    }

    if (loan.status === "Closed") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "قرضه قبلاً بسته شده است",
      });
    }

    // Update loan status
    loan.status = "Closed";
    loan.remainingAmount = 0;
    await loan.save({ transaction });

    // Update wallet (remove remaining balance)
    const wallet = loan.Employee.Wallet;
    wallet.remainingBalance =
      parseFloat(wallet.remainingBalance) - parseFloat(loan.remainingAmount);
    await wallet.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "قرضه با موفقیت بسته شد",
      data: loan,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
