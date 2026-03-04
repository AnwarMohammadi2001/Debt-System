import Employee from "./Employee.js";
import Wallet from "./Wallet.js";
import Loan from "./Loan.js";
import LoanPayment from "./LoanPayment.js";

export const setupAssociations = () => {
  Employee.hasOne(Wallet, { foreignKey: "employeeId" });
  Wallet.belongsTo(Employee, { foreignKey: "employeeId" });

  Employee.hasMany(Loan, { foreignKey: "employeeId" });
  Loan.belongsTo(Employee, { foreignKey: "employeeId" });

  Loan.hasMany(LoanPayment, { foreignKey: "loanId" });
  LoanPayment.belongsTo(Loan, { foreignKey: "loanId" });
};
