import { Employee, Wallet, Loan, LoanPayment } from "../Models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import {
  updateWalletAfterLoan,
  updateWalletAfterPayment,
} from "../utils/walletUpdater.js";

// @desc    Create new employee with auto wallet creation
// @route   POST /api/employees
// @access  Public
export const createEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { fullName, phone, position } = req.body;

    // Validate required fields
    if (!fullName || !phone || !position) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "لطفاً تمام فیلدهای ضروری (نام، شماره تماس، وظیفه) را پر کنید",
      });
    }

    // Create employee
    const employee = await Employee.create(
      {
        fullName,
        phone,
        position,
      },
      { transaction },
    );

    // Auto create wallet for employee
    const wallet = await Wallet.create(
      {
        employeeId: employee.id,
        totalLoans: 0,
        totalPaid: 0,
        remainingBalance: 0,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: {
        ...employee.toJSON(),
        wallet,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating employee:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all employees with their wallets
// @route   GET /api/employees
// @access  Public
export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    // Build where condition properly
    let whereCondition = {};

    if (search && search.trim() !== "") {
      whereCondition = {
        [Op.or]: [
          { fullName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { position: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    console.log("Fetching employees with params:", { page, limit, search });

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Wallet,
          attributes: ["totalLoans", "totalPaid", "remainingBalance"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    console.log(`Found ${count} employees`);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in getEmployees:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all employees without pagination (for dropdowns)
// @route   GET /api/employees/all
// @access  Public
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: Wallet,
          attributes: ["totalLoans", "totalPaid", "remainingBalance"],
          required: false,
        },
      ],
      order: [["fullName", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single employee with details
// @route   GET /api/employees/:id
// @access  Public
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
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
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "کارمند یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error in getEmployeeById:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, position } = req.body; // 👈 Removed salary and hireDate

    // Validate required fields
    if (!fullName || !phone || !position) {
      return res.status(400).json({
        success: false,
        error: "لطفاً تمام فیلدهای ضروری (نام، شماره تماس، وظیفه) را پر کنید",
      });
    }

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "کارمند یافت نشد",
      });
    }

    await employee.update({
      fullName,
      phone,
      position,
    });

    // Get updated employee with wallet
    const updatedEmployee = await Employee.findByPk(id, {
      include: [Wallet],
    });

    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error in updateEmployee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
export const deleteEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, { transaction });

    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "کارمند یافت نشد",
      });
    }

    // Check if employee has active loans
    const activeLoan = await Loan.findOne({
      where: {
        employeeId: id,
        status: "Active",
      },
      transaction,
    });

    if (activeLoan) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "امکان حذف کارمند با قرضه فعال وجود ندارد",
      });
    }

    await employee.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "کارمند با موفقیت حذف شد",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteEmployee:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
