import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import {
  Attandance,
  LogAttandance,
  LogFromWdms,
  qrySchAttdComp,
} from "../../models/hr/attandance.mod.js";
import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import moment from "moment";

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

export const punchAttdLog = async (req, res) => {
  try {
    const { dates } = req.body;
    const arrDate = dates.map((st) => `'${st}'`).join(", ");

    const queryAttd = qrySchAttdComp(arrDate);

    //ambil schedule absen
    const getSchAttd = await dbSPL.query(queryAttd, {
      replacements: { arrDate },
      type: QueryTypes.SELECT,
    });

    //ambil log attd hasil upload atau dari mesin
    const getLogs = await LogAttandance.findAll({
      where: {
        log_date: {
          [Op.in]: dates,
        },
      },
      raw: true,
    });

    let logId = [];
    //looping absen
    const attdAbsens = getSchAttd.map((items, i) => {
      //cari log scan in berdsarkan nik tanggal dan status
      const findIn = getLogs.find(
        (logItm) =>
          logItm.Nik === items.Nik.toString() &&
          logItm.log_date === items.scheduleDate &&
          logItm.log_status === "IN"
      );

      const findOut = getLogs.find(
        (logItm) =>
          logItm.Nik === items.Nik.toString() &&
          logItm.log_date === items.scanOutDate &&
          logItm.log_status === "OUT"
      );

      //buat defaul scan in dan scan out
      let scanInTime = findIn ? findIn.log_time : null;
      let scanInKet = null;
      let scanOutTime = findOut ? findOut.log_time : null;
      let scanOutKet = null;

      //jika terdapat scan in maka cek apakah ada dalam range
      if (scanInTime) {
        //masukan log id untuk update
        logId.push(findIn.log_id);
        const scanInAwa = moment(items.jk_scan_in_start, "HH:mm:ss");
        const scanAkhirIn = moment(items.jk_scan_in_end, "HH:mm:ss");
        const jamMasuk = moment(items.jk_in, "HH:mm:ss");

        // Waktu yang akan diperiksa
        const checkTime = moment(scanInTime, "HH:mm:ss");
        const checkLate = checkTime.isAfter(jamMasuk);
        //check apakah scan in ada dalam range
        const isInRange = checkTime.isBetween(
          scanInAwa,
          scanAkhirIn,
          undefined,
          "[]"
        ); // '[]' untuk inklusif

        // jika tidak ada dalam range maka ubah scanIntime menjadi null
        if (!isInRange) {
          scanInTime = null;
        }
        if (checkLate) {
          scanInKet = "LATE";
        }
      }

      if (scanOutTime) {
        logId.push(findOut.log_id);

        const scanOutAwa = moment(items.jk_scan_out_start, "HH:mm:ss");
        const scanAkhirOut = moment(items.jk_scan_out_end, "HH:mm:ss");
        const jamKeluar = moment(items.jk_out, "HH:mm:ss");

        // Waktu yang akan diperiksa
        const checkTime = moment(scanOutTime, "HH:mm:ss");
        const checkEarly = checkTime.isBefore(jamKeluar);

        const isInRange = checkTime.isBetween(
          scanOutAwa,
          scanAkhirOut,
          undefined,
          "[]"
        ); // '[]' untuk inklusif
        // jika ada dalam range maka ubah scanIntime menjadi nilaitime
        if (!isInRange) {
          scanOutTime = null;
        }
        if (checkEarly) {
          scanOutKet = "EARLY";
        }
      }

      const dataAbsen = {
        Nik: items.Nik,
        groupId: items.groupId,
        jk_id: items.jk_id,
        tanggal_in: items.scheduleDate,
        tanggal_out: items.scanOutDate,
        scan_in: scanInTime,
        scan_out: scanOutTime,
        keterangan: scanInTime ? "H" : null,
        ket_in: scanInKet,
        ket_out: scanOutKet,
      };
      return dataAbsen;
    });

    const updateLog = await LogAttandance.update(
      { log_punch: 1 },
      {
        where: {
          log_id: logId,
        },
      }
    );

    const dataPostAbs = attdAbsens.filter((itm) => itm.scan_in && itm.jk_id);

    const postAbsen = await Attandance.bulkCreate(dataPostAbs);

    // console.log();
    if (postAbsen) {
      res.status(200).json({ message: "Success Punch Log Attandance" });
    } else {
      res.status(500).json({ message: "Gagal Punch Log Attandance" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};

export const getWdmsToAmano = async (req, res) => {
  try {
    const { start, end } = req.params;

    const getLog = await dbWdms.query(LogFromWdms, {
      replacements: { startDateTime: start, endDateTime: end },
      type: QueryTypes.SELECT,
    });

    if (getLog.length > 0) {
      const newData = getLog
        .map((item) => ({
          TIME: moment(item.punch_time),
          NIK: item.emp_code,
          STATUS: item.punch_state,
        }))
 

      const arrConvert = newData.map(
        (items) =>
          `31${items.TIME.format("YYYYMMDD")}${items.TIME.format("HHmm")}000${
            items.STATUS
          }${items.NIK.padStart(10, "0")}0001`
      );

      return  res.json({ data: arrConvert, message: "succcess get data" });
    }

    res.json({ data: getLog, message: "succcess get data tapi kosong" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};
