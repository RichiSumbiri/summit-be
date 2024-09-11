import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const jobPosting = dbSPL.define('SumbiriJobPosting', {
    idPost: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    Posisi: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    TenggatWaktu: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'sumbiri_job_posting',
    timestamps: false,  // Disables Sequelize's automatic createdAt/updatedAt columns
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });


export const getJobPostingActive = `SELECT * FROM sumbiri_job_posting WHERE TenggatWaktu >= DATE(NOW())`;