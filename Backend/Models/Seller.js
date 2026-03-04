import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";

const Seller = sequelize.define(
  "Seller",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentBalance: {
      type: DataTypes.FLOAT,
      defaultValue: 0, 
    },
  },
  {
    tableName: "sellers",
    timestamps: true,
  },
);

export default Seller;
