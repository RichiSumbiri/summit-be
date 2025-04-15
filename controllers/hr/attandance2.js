import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import {
  getRandomTimeIn5Minute,
  getRandomTimeInMinus5,
  getRandomTimeInRange,
} from "./absensi.js";
import { JamKerjaDetail } from "../../models/hr/JadwalDanJam.mod.js";
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
import moment from "moment";

//fungsi untuk mencari jam sesuai ketentuan
const findScanTime = (dataArray, scanTime) => {
  if (!dataArray) return false;
  const scanMoment = moment(scanTime, "HH:mm");

  for (const item of dataArray) {
    const startScan = moment(item.jk_dtl_start, "HH:mm");
    const endScan = moment(item.jk_dtl_end, "HH:mm");

    if (scanMoment.isBetween(startScan, endScan, "null", "[]")) {
      const startRandom = moment(item.jk_dtl_rdm_st, "HH:mm");
      const endRandom = moment(item.jk_dtl_rdm_end, "HH:mm");

      // Generate random time within the start_random and end_random range
      const diffMinutes = endRandom.diff(startRandom, "minutes");
      const randomMinutes = Math.floor(Math.random() * diffMinutes);
      const randomTime = startRandom.clone().add(randomMinutes, "minutes");
      const objResult = {
        scan_time: randomTime.format("HH:mm"),
        ot: item.jk_dtl_ot,
      };
      return objResult;
    }
  }

  return false; // Return null jika tidak ada range yang cocok
};

function correctionScanIn(logTime, findSch, arrJkDetail) {
  // const scanInAwa = moment(findSch.jk_scan_in_start, "HH:mm:ss");
  let scan_in = null;
  let ot = null;
  const arrKetentuan = arrJkDetail?.filter(
    (item) => item.jk_id === findSch.jk_id && item.type_scan === "IN"
  );

  //jika terdapat array Ketentuan
  const objResult = findScanTime(arrKetentuan, logTime);

  const jamPulang = moment(
    `${findSch.scanOutDate} ${findSch.jk_scan_out_start}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const jamMulaiScanMasuk = moment(
    `${findSch.scheduleDate} ${findSch.jk_scan_in_start}`,
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
  const isInRange = checkTime.isBetween(
    jamMulaiScanMasuk,
    jamPulang,
    null,
    "[]"
  );

  //check late dan jangan ganggu ket in manual
  let ket_in = null;
  if (findSch.ket_in) {
    ket_in = findSch.ket_in;
  } else {
    ket_in = checkLate ? "LATE" : null;
  }

  //jika ada objResult berarti ada lembur
  if (objResult) {
    scan_in = objResult.scan_time;
    ot = objResult.ot;
    return { scan_in, ket_in, ot };
  }

  //jika tidak ada lembur maka check apakah log sebelum jam audit jika iya maka get randome tima
  if (checkTime.isBefore(jamMasukAudit) && isInRange) {
    const rdmScanInTime = getRandomTimeIn5Minute(
      findSch.jk_scan_in_audit
      // findSch.jk_in
    );
    return { scan_in: rdmScanInTime, ket_in };
  }

  if (isInRange) {
    return { scan_in: logTime, ket_in };
  } else {
    false;
  }
}

function correctionScanOut(logTime, checkTime, findSch, arrJkDetail) {
  let scan_out = null;
  let ot = null;
  const arrKetentuan = arrJkDetail?.filter(
    (item) => item.jk_id === findSch.jk_id && item.type_scan === "OUT"
  );

  const jamPulang = moment(
    `${findSch.scanOutDate} ${findSch.jk_out}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const jamOutAudit = moment(
    `${findSch.scanOutDate} ${findSch.jk_scan_out_audit}`,
    "YYYY-MM-DD HH:mm:ss"
  );

  

  const checkEarly = checkTime.isBefore(jamPulang);
  const chkLogLebihJamAudit = checkTime.isAfter(jamOutAudit);
  // console.log({findSch, chkLogLebihJamAudit});

  //check late dan jangan ganggu ket in manual
  let ket_out = null;
  if (findSch.ket_out) {
    ket_out = findSch.ket_out;
  } else {
    ket_out = checkEarly ? "EARLY" : null;
  }

  const objResult = findScanTime(arrKetentuan, logTime);

  //jika ada objResult berarti ada lembur
  if (objResult) {
    // console.log({'lewat Objt reult' : objResult});

    scan_out = objResult.scan_time;
    ot = objResult.ot;
    return { scan_out: scan_out, ket_out, ot };
  } else {
    //jika tidak ada lembur maka check apakah log sesudah jam audit jika iya maka get randome time
    if (chkLogLebihJamAudit && !findSch.jam) {
      const rdmScanInTime = getRandomTimeIn5Minute(
        findSch.jk_out
        // findSch.jk_in
      );
      // console.log({'lewat randome' : rdmScanInTime});
      return { scan_out: rdmScanInTime, ket_out };
    } else {
      // console.log({'tidak lewat randome' : logTime});

      return { scan_out: logTime, ket_out };
    }
  }
}

export const punchAttdLog2 = async (req, res) => {
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

    //ambil jam kerja detail untuk mendapatkan jam kerja sesuai ketentuan perushaan dan jumlah ot
    const lisJkDetail = await JamKerjaDetail.findAll({
      raw: true,
      order: [["jk_dtl_id", "ASC"]],
    });

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date: stringStart },
      type: QueryTypes.SELECT,
      // logging: console.log
    });
    // const filterLembur = getLembur.filter(item => item.Nik === 202011073)
    // console.log({lembur : filterLembur});

    if (getLembur.length > 0) {
      getSchAttd = getSchAttd.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          // let ttlLembur = "";
          // if (lembur.type === "BH") {
          //   const scanin = moment(item.scan_in, "HH:mm:ss");
          //   const jam_in = moment(item.jk_in, "HH:mm:ss");
          //   ttlLembur = scanin.diff(jam_in, "hours");
          // } else {
          //   const scanout = moment(item.scan_out, "HH:mm:ss");
          //   let jam_out = moment(item.jk_out, "HH:mm:ss");

          //   // if (scanout.isBefore(jam_out)) {
          //   //   jam_out.add(1, "day");
          //   // }
          //   ttlLembur = scanout.diff(jam_out, "hours");
          // }
          return { ...item, ...lembur };
          // return { ...item, ...lembur, ttlLembur };
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
            raw: true,
          });

          //jika sudah ada absen dengan scan in atau ada keterangan cuti dll maka double punch
          if (checkExist && checkExist.scan_in || checkExist?.keterangan) {
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
              //bisa masukan find ketentuan ini dari get detail/tabel baru

              const objScanIn = correctionScanIn(logTime, findSch, lisJkDetail);

              //jika tidak ada scan in berarti worng schedule
              if (!objScanIn) {
                const updateLog = await LogAttandance.update(
                  { log_punch: 5 }, // log punch 1 success
                  {
                    where: {
                      log_id: logs.log_id,
                    },
                  }
                );
              } else {
                const dataAbsen = {
                  Nik: logs.Nik,
                  groupId: findSch.groupId,
                  jk_id: findSch.jk_id,
                  tanggal_in: findSch.scheduleDate,
                  tanggal_out: findSch.scanOutDate,
                  calendar: findSch.calendar,
                  keterangan: "H",
                  id: findSch.id, // untuk handle jika fatanan keburu edit tabel absen jadi bisa di update
                  ...objScanIn,
                  // scan_in: isInRange ? logTime : null,
                  // ket_in: ket_in ? ket_in : checkLate ? "LATE" : null, //harus cek lembur
                };

                const postAbsen = await Attandance.upsert(dataAbsen);

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
          const logtimeAccurate = moment(
            `${logDate} ${logTime}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          //cari terlebih dahulu schedulnya
          const filterSch = getSchAttd.filter((items) =>logs.Nik === items.Nik.toString() &&  logDate === items.scanOutDate    );
         
            //jika hasil cari melebihi 2 maka filter berdasarkan jamnya 
            //checek apakah out time ada dalam range
            const findSch = filterSch.length > 1 ? filterSch.find((items) => {
              const scanStart = moment(`${items.scheduleDate} ${items.jk_in}`, "YYYY-MM-DD HH:mm:ss");
              const scanEnd = moment(`${items.scanOutDate} ${items.jk_scan_out_end}`, "YYYY-MM-DD HH:mm:ss");
  
              return (
                logtimeAccurate.isBetween(scanStart, scanEnd, "second", "[]")
              );
            }) : filterSch[0]
            
  
          //jika ada schedule maka check apakah sudah scan in dengan cara cek id nya
          if (findSch && !findSch.scan_out && findSch.id) {
            
            const dataAbsen = correctionScanOut(logTime, logtimeAccurate, findSch, lisJkDetail);
  
            const postAbsen = await Attandance.update(dataAbsen, {
              where: {
                id : findSch.id
                // tanggal_out: findSch.scanOutDate,
                // Nik: logs.Nik,
              },
            });
            
            if (postAbsen[0] === 1) {
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
