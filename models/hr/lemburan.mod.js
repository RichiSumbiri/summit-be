import { QueryTypes, DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";


export const sumbiriUserSummitNIK = dbSPL.define('sumbiri_user_summit_nik', {
    USER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    UserLevel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
}, {
    tableName: 'sumbiri_user_summit_nik',
    timestamps: false,
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});