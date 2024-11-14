import { LogAttandance } from "../../models/hr/attandance.mod.js";

export const postDataLogAttd = async (req, res) => {
  try {
    const dataLog = req.body;

    const bulk = await LogAttandance.bulkCreate(dataLog, {
      updateOnDuplicate: ["log_date", "log_time", "mod_id"],
      where: {
        jadwalId: ["log_id"],
      },
    });

    if (bulk) {
      res.status(200).json({ message: "Success upload Log Attandance" });
    } else {
      res.status(400).json({ message: "Gagal upload Log Attandance" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};
