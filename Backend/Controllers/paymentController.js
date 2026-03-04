import { LoanPayment, Loan, Employee, Wallet } from "../Models/index.js";
import  sequelize  from "../config/database.js";
import { updateWalletAfterPayment } from "../utils/walletUpdater.js";

// @desc    Make loan payment
// @route   POST /api/payments
// @access  Public
export const makePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { loanId, amount, paymentDate } = req.body;

    // Find loan with employee and wallet
    const loan = await Loan.findByPk(loanId, {
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
        error: "این قرضه قبلاً بسته شده است",
      });
    }

    if (amount > parseFloat(loan.remainingAmount)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: `مبلغ پرداخت نمی‌تواند از باقی‌مانده قرضه (${loan.remainingAmount}) بیشتر باشد`,
      });
    }

    // Create payment record
    const payment = await LoanPayment.create(
      {
        loanId,
        amount,
        paymentDate,
      },
      { transaction },
    );

    // Update loan remaining amount
    const newRemainingAmount =
      parseFloat(loan.remainingAmount) - parseFloat(amount);
    loan.remainingAmount = newRemainingAmount;

    // Check if loan should be closed
    if (newRemainingAmount === 0) {
      loan.status = "Closed";
    }

    await loan.save({ transaction });

    // Update wallet
    const wallet = loan.Employee.Wallet;
    await updateWalletAfterPayment(wallet, amount, transaction);

    await transaction.commit();

    // Prepare response message
    const message =
      newRemainingAmount === 0
        ? "قرضه با موفقیت تسویه شد"
        : "پرداخت با موفقیت ثبت شد";

    res.status(200).json({
      success: true,
      message,
      data: {
        payment,
        loan: {
          id: loan.id,
          remainingAmount: loan.remainingAmount,
          status: loan.status,
        },
        wallet: {
          totalPaid: wallet.totalPaid,
          remainingBalance: wallet.remainingBalance,
        },
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

// @desc    Get all payments for a loan
// @route   GET /api/payments/loan/:loanId
// @access  Public
export const getLoanPayments = async (req, res) => {
  try {
    const { loanId } = req.params;

    const payments = await LoanPayment.findAll({
      where: { loanId },
      include: [
        {
          model: Loan,
          attributes: ["id", "amount", "status"],
          include: [
            {
              model: Employee,
              attributes: ["id", "fullName"],
            },
          ],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmount: totalPaid,
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

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Public
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await LoanPayment.findByPk(id, {
      include: [
        {
          model: Loan,
          include: [
            {
              model: Employee,
              attributes: ["id", "fullName"],
            },
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "پرداخت یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Public
export const updatePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, paymentDate } = req.body;

    const payment = await LoanPayment.findByPk(id, {
      include: [
        {
          model: Loan,
          include: [
            {
              model: Employee,
              include: [Wallet],
            },
          ],
        },
      ],
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "پرداخت یافت نشد",
      });
    }

    const loan = payment.Loan;
    const wallet = loan.Employee.Wallet;
    const oldAmount = parseFloat(payment.amount);
    const newAmount = parseFloat(amount);
    const amountDifference = newAmount - oldAmount;

    // Check if new amount is valid
    if (newAmount > parseFloat(loan.remainingAmount) + oldAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "مبلغ جدید نامعتبر است",
      });
    }

    // Update payment
    payment.amount = newAmount;
    payment.paymentDate = paymentDate || payment.paymentDate;
    await payment.save({ transaction });

    // Update loan remaining amount
    loan.remainingAmount = parseFloat(loan.remainingAmount) - amountDifference;

    // Check if loan status should change
    if (loan.remainingAmount === 0) {
      loan.status = "Closed";
    } else if (loan.remainingAmount > 0 && loan.status === "Closed") {
      loan.status = "Active";
    }

    await loan.save({ transaction });

    // Update wallet
    wallet.totalPaid = parseFloat(wallet.totalPaid) + amountDifference;
    wallet.remainingBalance =
      parseFloat(wallet.remainingBalance) - amountDifference;
    await wallet.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "پرداخت با موفقیت به‌روزرسانی شد",
      data: {
        payment,
        loan: {
          id: loan.id,
          remainingAmount: loan.remainingAmount,
          status: loan.status,
        },
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

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Public
export const deletePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const payment = await LoanPayment.findByPk(id, {
      include: [
        {
          model: Loan,
          include: [
            {
              model: Employee,
              include: [Wallet],
            },
          ],
        },
      ],
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "پرداخت یافت نشد",
      });
    }

    const loan = payment.Loan;
    const wallet = loan.Employee.Wallet;
    const paymentAmount = parseFloat(payment.amount);

    // Update loan
    loan.remainingAmount = parseFloat(loan.remainingAmount) + paymentAmount;
    if (loan.status === "Closed") {
      loan.status = "Active";
    }
    await loan.save({ transaction });

    // Update wallet
    wallet.totalPaid = parseFloat(wallet.totalPaid) - paymentAmount;
    wallet.remainingBalance =
      parseFloat(wallet.remainingBalance) + paymentAmount;
    await wallet.save({ transaction });

    // Delete payment
    await payment.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "پرداخت با موفقیت حذف شد",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
