import { Op, QueryTypes, DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const MasterJamKerja = dbSPL.define(
  "master_jam_kerja",
  {
    jk_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jk_nama: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
    jk_in: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_out: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_in_day: {
      type: DataTypes.ENUM("C", "N"),
      allowNull: true,
      defaultValue: null,
      comment: "C for current N for Next day",
    },
    jk_out_day: {
      type: DataTypes.ENUM("C", "N"),
      allowNull: true,
      defaultValue: null,
      comment: "C for current N for Next day",
    },
    jk_toleransi_in: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_toleransi_out: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_in_start: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_in_end: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_out_start: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_out_end: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_duration_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "hitungan satuan hari",
    },
    jk_duration_minute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "hitungan satuan menit",
    },
    jk_duration_hour: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_start_rest: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_end_rest: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_start_rest_ot: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_end_rest_ot: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_ot_type: {
      type: DataTypes.ENUM("BH", "AH"),
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_ot_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    add_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    mod_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "master_jam_kerja",
    timestamps: true,
  }
);
