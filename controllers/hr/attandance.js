import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import {
  Attandance,
  getLemburForAbsen,
  LogAttandance,
  LogFromWdms,
  qryLogForPunch,
  qrySbrLogAttd,
  qrySchAttdComp,
  qrySplData,
  SchedulePunchAttd,
} from "../../models/hr/attandance.mod.js";
import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import moment from "moment";
import {
  getRandomTimeIn5Minute,
  getRandomTimeInMinus5,
  getRandomTimeInRange,
} from "./absensi.js";

export const postDataLogAttd = async (req, res) => {
  try {
    const dataLog = req.body;

    const bulk = await LogAttandance.bulkCreate(dataLog, {
      updateOnDuplicate: ["log_date", "log_time"], //jika ada attd time tidak sesuai dengan rekap berarti ada edit
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

export const getWdmsToAmano = async (req, res) => {
  try {
    const { start, end } = req.params;
    // console.log({start, end});

    const getLog = await dbWdms.query(LogFromWdms, {
      replacements: { startDateTime: start, endDateTime: end },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLog.length > 0) {
      const dataLog = getLog.map((item) => {
        const baseTime = moment(item.punch_time, "DD-MMM-YY h:mm A");

        const noMesin = (item.terminal_id + 20).toString().padStart(4, "0");
        const log_status = item.punch_state === "1" ? "IN" : "OUT";
        return {
          log_id: `31${baseTime.format("YYYYMMDD")}${baseTime.format(
            "HHmm"
          )}000${item.punch_state}${item.emp_code.padStart(10, "0")}${noMesin}`,
          log_date: baseTime.format("YYYY-MM-DD HH:mm:ss"),
          // log_time: baseTime.format("HH:mm"),
          log_status: log_status,
          Nik: item.emp_code,
          log_machine_id: item.terminal_id + 20,
          log_machine_name: item.terminal_alias,
          NamaLengkap: item.first_name,
          log_by: "S",
          add_id: 0,
          mod_id: 0,
        };
      });
      return res.json({ data: dataLog, message: "succcess get" });
    }

    res.json({ data: getLog, message: "succcess get data tapi kosong" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};

export const getLogAttdSummit = async (req, res) => {
  try {
    const { start, end } = req.params;

    const getLog = await dbSPL.query(qrySbrLogAttd, {
      replacements: { startDateTime: start, endDateTime: end },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    return res.json({ data: getLog, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};


export const getWdmsToSummit = async (req, res) => {
  try {
    const { start, end } = req.params;
    // console.log({start, end});

    const getLog = await dbWdms.query(LogFromWdms, {
      replacements: { startDateTime: start, endDateTime: end },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLog.length > 0) {
      const dataLog = getLog.map((item) => {
        const baseTime = moment(item.punch_time, "DD-MMM-YY h:mm A");

        const noMesin = item.terminal_id.toString().padStart(4, "0");
        const log_status = item.punch_state === "1" ? "IN" : "OUT";
        return {
          log_id: `31${baseTime.format("YYYYMMDD")}${baseTime.format(
            "HHmm"
          )}000${item.punch_state}${item.emp_code.padStart(10, "0")}${noMesin}`,
          log_date: baseTime.format("YYYY-MM-DD HH:mm:ss"),
          // log_time: baseTime.format("HH:mm"),
          log_status: log_status,
          Nik: item.emp_code,
          log_machine_id: item.terminal_id,
          log_machine_name: item.terminal_alias,
          NamaLengkap: item.first_name,
          log_by: "S",
          add_id: 0,
          mod_id: 0,
        };
      });
      const bulk = await LogAttandance.bulkCreate(dataLog, {
        updateOnDuplicate: ["mod_id"], //jika ada attd time tidak sesuai dengan rekap berarti ada edit
        where: {
          jadwalId: ["log_id"],
        },
      });

      if (bulk) {
        return res.json({ message: "succcess Sync" });
      }
    } else {
      res.status(202).json({ data: getLog, message: "tidak ada data log" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat upload Log Attandance" });
  }
};

// schedule Punch Attd
export const getSchPunchAttd = async (req, res) => {
  try {
    const getSch = await SchedulePunchAttd.findAll({});

    res.json({ data: getSch });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error get data schedule attd" });
  }
};

export const getListMasterPunch = async (req, res) => {
  try {
    const listMasterPunch = await dbSPL.query(
      "SELECT * FROM master_log_punch",
      {
        type: QueryTypes.SELECT,
      }
    );

    res.json({ data: listMasterPunch });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error get list master punch" });
  }
};

export const postSchPunchAttd = async (req, res) => {
  try {
    const data = req.body;
    const postSch = await SchedulePunchAttd.upsert(data);

    if (postSch) {
      return res.json({ message: "succcess create/update schedule attd" });
    } else {
      return res.status(202).json({ message: "gagal create schedule attd" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error post data schedule attd" });
  }
};

export const deltSchPunchAttd = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSch = await SchedulePunchAttd.destroy({
      where: {
        id: id,
      },
    });

    if (deleteSch) {
      return res.json({ message: "succcessdelete schedule attd" });
    } else {
      return res.status(202).json({ message: "gagal delete schedule attd" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error delete  schedule attd" });
  }
};

function correctionScanIn(logTime, findSch) {
  // const scanInAwa = moment(findSch.jk_scan_in_start, "HH:mm:ss");
  let scan_in = null;
  const jamPulang = moment(
    `${findSch.scanOutDate} ${findSch.jk_scan_out_start}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const jamMasuk = moment(
    `${findSch.scheduleDate} ${findSch.jk_in}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const jamMasukAudit = moment(
    `${findSch.scheduleDate} ${findSch.jk_scan_in_audit}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  // Waktu yang akan diperiksa
  const checkTime = moment(
    `${findSch.scheduleDate} ${logTime}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  // console.log({
  //   jamLog : checkTime.format("YYYY-MM-DD HH:mm:ss"),
  //   jamMasuk : jamMasuk.format("YYYY-MM-DD HH:mm:ss"),
  //   jamPulang : jamPulang.format("YYYY-MM-DD HH:mm:ss"),

  // });

  const checkLate = checkTime.isAfter(jamMasuk);

  //check apakah scan in ada dalam range
  const isInRange = checkTime.isBefore(jamPulang);

  //check late dan jangan ganggu ket in manual
  let ket_in = null;
  if (findSch.ket_in) {
    ket_in = findSch.ket_in;
  } else {
    ket_in = checkLate ? "LATE" : null;
  }

  //jika ada lembur sebelum jam kerja maka jam nya langsung di eksekusi //findSch.jam ini dari getlembur
  if (findSch.spl_type === "BH" && findSch.jam && findSch.ttlLembur) {
    //JIKA TERDAPATA LEMBUR AKTUAL MAKA UBAH SCAN IN
    const scanInLembur = getRandomTimeInMinus5(findSch.start);
    return { scan_in: scanInLembur, ket_in };
  }

  //jika tidak ada lembur maka check apakah log sebelum jam audit jika iya maka get randome tima
  if (checkTime.isBefore(jamMasukAudit)) {
    const rdmScanInTime = getRandomTimeIn5Minute(
      findSch.jk_scan_in_audit
      // findSch.jk_in
    );
    return { scan_in: rdmScanInTime, ket_in };
  }

  if (isInRange) {
    return { scan_in: logTime, ket_in };
  } else {
    return { scan_in, ket_in };
  }
}

function correctionScanOut(logTime, findSch) {
  // const scanInAwa = moment(findSch.jk_scan_in_start, "HH:mm:ss");
  // console.log('jalan');

  let scan_out = null;
  const jamPulang = moment(findSch.jk_out, "HH:mm:ss");
  const jamOutAudit = moment(findSch.jk_scan_out_end, "HH:mm:ss");

  // Waktu yang akan diperiksa
  const checkTime = moment(logTime, "HH:mm:ss");
  const checkEarly = checkTime.isBefore(jamPulang);
  const chkLogLebihJamAudit = checkTime.isAfter(jamOutAudit);

  //check late dan jangan ganggu ket in manual
  let ket_out = null;
  if (findSch.ket_out) {
    ket_out = findSch.ket_out;
  } else {
    ket_out = checkEarly ? "EARLY" : null;
  }

  //jika ada lembur dan jam kerja melebihi jam scan out maka langsung return
  // if(findSch.Nik.toString() === '20110124' ) {
  //   console.log(findSch);

  // }
  if (findSch.spl_type === "AH" && findSch.jam && chkLogLebihJamAudit) {
    return { scan_out: getRandomTimeIn5Minute(findSch.finish), ket_out };
  }

  //jika tidak ada lembur maka check apakah log sesudah jam audit jika iya maka get randome time
  if (chkLogLebihJamAudit && !findSch.jam) {
    const rdmScanInTime = getRandomTimeIn5Minute(
      findSch.jk_out
      // findSch.jk_in
    );
    return { scan_out: rdmScanInTime, ket_out };
  } else {
    return { scan_out: logTime, ket_out };
  }
}




export const setNoPunch = async (req, res) => {
  try {
    const { arrayIdlog, userId } = req.body;

    if (!arrayIdlog)
      return res.status(404).json({ message: "Tida teradapat Log Id" });

    const updateLog = await LogAttandance.update(
      { log_punch: 0, mod_id: userId },
      {
        where: {
          log_id: {
            [Op.in]: arrayIdlog,
          },
        },
      }
    );

    if (updateLog) {
      return res.status(200).json({ message: "Success Set No Punch" });
    } else {
      return res
        .status(505)
        .json({ message: "Terdapat kesalahan saat update log" });
    }
  } catch (error) {
    res.status(500);
    json({ message: "Terdapat kesalahan saat update log" });
  }
};
