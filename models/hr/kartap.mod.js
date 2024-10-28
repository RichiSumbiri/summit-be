import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const sumbiriSPKT = dbSPL.define('sumbiri_spkt', {
    IDSPKT: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    DateSPKT: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CreateBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'sumbiri_spkt',
    timestamps: false,  // Set this to true if you have createdAt and updatedAt columns
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });