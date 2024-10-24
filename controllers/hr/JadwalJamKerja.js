import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { MasterJamKerja } from "../../models/hr/JadwalDanJam.mod.js";

export const postNewJamKerja = async (req, res) => {
  try {
    const dataJk = req.body;

    const createNewJk = await MasterJamKerja.create(dataJk);

    if (createNewJk) {
      res.status(200).json({ message: "Success Menambahkan Jam Kerja" });
    } else {
      res.status(400).json({ message: "Gagal Menambahkan Jam Kerja" });
    }
  } catch (error) {
    res.status(500).json({ error, message: "Gagal Menambahkan Jam Kerja" });
  }
};
