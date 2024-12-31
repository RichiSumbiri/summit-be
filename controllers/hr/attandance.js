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
import { getRandomTimeIn5Minute, getRandomTimeInRange } from "./absensi.js";

export const postDataLogAttd = async (req, res) => {
  try {
    const dataLog = req.body;

    const bulk = await LogAttandance.bulkCreate(dataLog, {
      updateOnDuplicate: ["log_date", "log_time", "mod_id"], //jika ada attd time tidak sesuai dengan rekap berarti ada edit
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

// export const punchAttdLog = async (req, res) => {
//   try {
//     const { dates } = req.body;
//     const arrDate = dates.map((st) => `'${st}'`).join(", ");

//     const queryAttd = qrySchAttdComp(arrDate);

//     //ambil schedule absen
//     const getSchAttd = await dbSPL.query(queryAttd, {
//       replacements: { arrDate },
//       type: QueryTypes.SELECT,
//     });

//     //ambil log attd hasil upload atau dari mesin
//     const getLogs = await LogAttandance.findAll({
//       where: {
//         log_date: {
//           [Op.in]: dates,
//         },
//       },
//       raw: true,
//     });

//     let logId = [];
//     //looping absen
//     const attdAbsens = getSchAttd.map((items, i) => {
//       //cari log scan in berdsarkan nik tanggal dan status
//       const findIn = getLogs.find(
//         (logItm) =>
//           logItm.Nik === items.Nik.toString() &&
//           logItm.log_date === items.scheduleDate &&
//           logItm.log_status === "IN"
//       );

//       const findOut = getLogs.find(
//         (logItm) =>
//           logItm.Nik === items.Nik.toString() &&
//           logItm.log_date === items.scanOutDate &&
//           logItm.log_status === "OUT"
//       );

//       //buat defaul scan in dan scan out
//       let scanInTime = findIn ? findIn.log_time : null;
//       let scanInKet = null;
//       let scanOutTime = findOut ? findOut.log_time : null;
//       let scanOutKet = null;

//       //jika terdapat scan in maka cek apakah ada dalam range
//       if (scanInTime) {
//         //masukan log id untuk update
//         logId.push(findIn.log_id);
//         const scanInAwa = moment(items.jk_scan_in_start, "HH:mm:ss");
//         const scanAkhirIn = moment(items.jk_scan_in_end, "HH:mm:ss");
//         const jamMasuk = moment(items.jk_in, "HH:mm:ss");

//         // Waktu yang akan diperiksa
//         const checkTime = moment(scanInTime, "HH:mm:ss");
//         const checkLate = checkTime.isAfter(jamMasuk);
//         //check apakah scan in ada dalam range
//         const isInRange = checkTime.isBetween(
//           scanInAwa,
//           scanAkhirIn,
//           undefined,
//           "[]"
//         ); // '[]' untuk inklusif

//         // jika tidak ada dalam range maka ubah scanIntime menjadi null
//         if (!isInRange) {
//           scanInTime = null;
//         }
//         if (checkLate) {
//           scanInKet = "LATE";
//         }
//       }

//       if (scanOutTime) {
//         logId.push(findOut.log_id);

//         const scanOutAwa = moment(items.jk_scan_out_start, "HH:mm:ss");
//         const scanAkhirOut = moment(items.jk_scan_out_end, "HH:mm:ss");
//         const jamKeluar = moment(items.jk_out, "HH:mm:ss");

//         // Waktu yang akan diperiksa
//         const checkTime = moment(scanOutTime, "HH:mm:ss");
//         const checkEarly = checkTime.isBefore(jamKeluar);

//         const isInRange = checkTime.isBetween(
//           scanOutAwa,
//           scanAkhirOut,
//           undefined,
//           "[]"
//         ); // '[]' untuk inklusif
//         // jika ada dalam range maka ubah scanIntime menjadi nilaitime
//         if (!isInRange) {
//           scanOutTime = null;
//         }
//         if (checkEarly) {
//           scanOutKet = "EARLY";
//         }
//       }

//       const dataAbsen = {
//         Nik: items.Nik,
//         groupId: items.groupId,
//         jk_id: items.jk_id,
//         tanggal_in: items.scheduleDate,
//         tanggal_out: items.scanOutDate,
//         scan_in: scanInTime,
//         scan_out: scanOutTime,
//         keterangan: scanInTime ? "H" : null,
//         ket_in: scanInKet,
//         ket_out: scanOutKet,
//       };
//       return dataAbsen;
//     });

//     const updateLog = await LogAttandance.update(
//       { log_punch: 1 },
//       {
//         where: {
//           log_id: logId,
//         },
//       }
//     );

//     const dataPostAbs = attdAbsens.filter((itm) => itm.scan_in && itm.jk_id);

//     const postAbsen = await Attandance.bulkCreate(dataPostAbs);

//     // console.log();
//     if (postAbsen) {
//       res.status(200).json({ message: "Success Punch Log Attandance" });
//     } else {
//       res.status(500).json({ message: "Gagal Punch Log Attandance" });
//     }
//   } catch (error) {
//     console.log(error);

//     res
//       .status(500)
//       .json({ error, message: "Terdapat error saat upload Log Attandance" });
//   }
// };

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

export const punchAttdLog = async (req, res) => {
  try {
    const dates = req.body;

    // const {start, end} = dates
    const stringStart = moment(dates.start)
      // .subtract(1, "days")
      .format("YYYY-MM-DD");
    const stringEnd = moment(dates.end).format("YYYY-MM-DD");

    //ambil schedule absen
    let getSchAttd = await dbSPL.query(qrySchAttdComp, {
      replacements: { startDate: stringStart, endDate: stringEnd },
      type: QueryTypes.SELECT,
    });
    // console.log(getSchAttd[0]);

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date: stringStart },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getSchAttd = getSchAttd.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    //ambil log attd hasil upload atau dari mesin
    const getLogs = await dbSPL.query(qryLogForPunch, {
      replacements: { startDate: stringStart, endDate: stringEnd },
      type: QueryTypes.SELECT,
    });
    // console.log(getLogs);

    if (getLogs.length > 0) {
      for (const [i, logs] of getLogs.entries()) {
        // loping log

        // if(i === 0) console.log(logs)
        const logDate = logs.logDate;
        const logTime = logs.logTime;

        //jika terdapat log status in makan lakukan logic IN
        if (logs.log_status === "IN") {
          //sebelum melakukan punch cek terlebih dahulu
          const checkExist = await Attandance.findOne({
            where: {
              tanggal_in: logDate,
              Nik: logs.Nik,
            },
          });

          if (checkExist) {
            await LogAttandance.update(
              { log_punch: 2 }, //kalo ada schedule id berarti double punch kd 2, klo tdk ada berarti kd 4 no schdule
              {
                where: {
                  log_id: logs.log_id,
                },
              }
            );
          } else {
            //kalo tidak ada coba cari schedule
            const findSch = getSchAttd.find(
              (items) =>
                logs.Nik === items.Nik.toString() &&
                logDate === items.scheduleDate
            );

            
            //jika schedule ada check time dan tidak ada keterangan
            if (findSch && findSch.jk_id !== null) {
              const objScanIn = correctionScanIn(logTime, findSch)

              
              const dataAbsen = {
                Nik: logs.Nik,
                groupId: findSch.groupId,
                jk_id: findSch.jk_id,
                tanggal_in: findSch.scheduleDate,
                tanggal_out: findSch.scanOutDate,
                keterangan: "H",
                ...objScanIn
                // scan_in: isInRange ? logTime : null,
                // ket_in: ket_in ? ket_in : checkLate ? "LATE" : null, //harus cek lembur
              };

              // console.log(dataAbsen);

              const postAbsen = await Attandance.create(dataAbsen);

              if (postAbsen) {
                const updateLog = await LogAttandance.update(
                  { log_punch: 1 }, // log punch 1 success
                  {
                    where: {
                      log_id: logs.log_id,
                    },
                  }
                );
              }
            } else {
              const updateLog = await LogAttandance.update(
                { log_punch: 4 }, // klo tdk ada berarti kd 4 no schdule
                {
                  where: {
                    log_id: logs.log_id,
                  },
                }
              );
            }
          }
        }
        if (logs.log_status === "OUT") {
          //jika log status OUT
          const findSch = getSchAttd.find(
            (items) =>
              logs.Nik === items.Nik.toString() && logDate === items.scanOutDate
          );

          if (findSch && !findSch.scan_out) {
  
            const dataAbsen = correctionScanOut(logTime, findSch)

            const postAbsen = await Attandance.update(dataAbsen, {
              where: {
                tanggal_out: findSch.scanOutDate,
                Nik: logs.Nik,
              },
            });
            if (postAbsen) {
              const updateLog = await LogAttandance.update(
                { log_punch: 1 },
                {
                  where: {
                    log_id: logs.log_id,
                  },
                }
              );
            }
          } else {
            const updateLog = await LogAttandance.update(
              { log_punch: findSch?.scan_out ? 2 : 4 }, //kalo ada scan out berarti double punch kd 2, klo tdk ada berarti kd 4 no schdule
              {
                where: {
                  log_id: logs.log_id,
                },
              }
            );
          }
        }

        if (i + 1 === getLogs.length) {
          res.status(200).json({ message: "Success Punch Log Attandance" });
        }
      }
    } else {
      res.status(202).json({ message: "Belum ada data logs" });
    }

    // console.log();
    // if (postAbsen) {
    //   res.status(200).json({ message: "Success Punch Log Attandance" });
    // } else {
    //   res.status(500).json({ message: "Gagal Punch Log Attandance" });
    // }
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
  let scan_in = null
  const jamPulang = moment(findSch.jk_scan_out_start, "HH:mm:ss");
  const jamMasuk = moment(findSch.jk_in, "HH:mm:ss");
  const jamMasukAudit = moment(findSch.jk_scan_in_audit, "HH:mm:ss");

  // Waktu yang akan diperiksa
  const checkTime = moment(logTime, "HH:mm:ss");
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

  //jika ada lembur sebelum jam kerja maka jam nya langsung di eksekusi
  if (findSch.spl_type === "BH" && findSch.jam) {
    return {scan_in : logTime, ket_in};
  }

  //jika tidak ada lembur maka check apakah log sebelum jam audit jika iya maka get randome tima
  if (checkTime.isBefore(jamMasukAudit)) {
    const rdmScanInTime = getRandomTimeIn5Minute(
      findSch.jk_scan_in_audit,
      // findSch.jk_in
    );
    return {scan_in : rdmScanInTime, ket_in};
  }

  if (isInRange) {
    return {scan_in : logTime, ket_in};
  } else {
    return {scan_in , ket_in};
  }
}


function correctionScanOut(logTime, findSch) {
  // const scanInAwa = moment(findSch.jk_scan_in_start, "HH:mm:ss");
  // console.log('jalan');
  
  let scan_out = null
  const jamPulang = moment(findSch.jk_out, "HH:mm:ss");
  const jamOutAudit = moment(findSch.jk_scan_out_end, "HH:mm:ss");

  // Waktu yang akan diperiksa
  const checkTime = moment(logTime, "HH:mm:ss");
  const checkEarly = checkTime.isBefore(jamPulang);
  const chkLogLebihJamAudit = checkTime.isAfter(jamOutAudit);

  //check late dan jangan ganggu ket in manual
  let ket_out = null;
  if (findSch.ket_in) {
    ket_out = findSch.ket_out;
  } else {
    ket_out = checkEarly ? "EARLY" : null;
  }

  //jika ada lembur dan jam kerja melebihi jam scan out maka langsung return
  // if(findSch.Nik.toString() === '20110124' ) {
  //   console.log(findSch);
    
  // }
  if (findSch.spl_type === "AH" && findSch.jam && chkLogLebihJamAudit) {
    return {scan_out : logTime, ket_out};
  }

  //jika tidak ada lembur maka check apakah log sesudah jam audit jika iya maka get randome time
  if (chkLogLebihJamAudit && !findSch.jam) {
    const rdmScanInTime = getRandomTimeIn5Minute(
      findSch.jk_out,
      // findSch.jk_in
    );
    return {scan_out : rdmScanInTime, ket_out};
  }else{
    return {scan_out : logTime, ket_out};
  }


}
