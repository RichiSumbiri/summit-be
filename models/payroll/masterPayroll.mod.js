import { DataTypes } from "sequelize";
import {dbSPL} from "../../config/dbAudit.js";

export const MasterSalType = dbSPL.define(
    "master_salary_type",
    {
        IDSalType : {
        type: DataTypes.INTEGER,
        // allowNull: false,
        primaryKey: true,
      },
      NameSalType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DescSalType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      PrefixNIK: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      typePay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Nominal: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      add_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mod_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
    }
  );