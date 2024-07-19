import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryEmployeAktif = `SELECT a.Nik, a.NamaLengkap, a.NamaDepartemen, a.TanggalMasuk, 
		CASE WHEN  a.JenisKelamin = 1 THEN 'PEREMPUAN' ELSE 'LAKI-LAKI' END AS JenisKelamin,
		a.Posisi
FROM sumbiri_employee a 
WHERE a.StatusAktif = 0`;
