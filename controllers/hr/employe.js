import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { qryEmployeAktif } from "../../models/hr/employe.mod.js";
import { dbSPL } from "../../config/dbAudit.js";

export const getEmployeAktif = async (req, res) => {
  try {
    const listKaryawan = await dbSPL.query(qryEmployeAktif, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listKaryawan,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list employee",
    });
  }
};
