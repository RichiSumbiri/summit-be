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
    Kualifikasi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TenggatWaktu: {
      type: DataTypes.DATE,
      allowNull: true
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    EndDate: {
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


export const getJobPostingActive = `SELECT * FROM sumbiri_job_posting WHERE StartDate <= DATE(NOW()) AND EndDate >= DATE(NOW())`;
export const getJobPostingById = `SELECT * FROM sumbiri_job_posting WHERE idPost = :idPost`;
export const putJobById = `
UPDATE 
  sumbiri_job_posting
SET 
  Posisi=:postPosisi,
  Kualifikasi=:postKualifikasi,
  TenggatWaktu=:postTenggatWaktu
WHERE 
  idPost = :idPost
`;