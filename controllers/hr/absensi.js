import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, QueryTypes } from "sequelize";
import {
  Attandance,
  qryAbsenIndividu,
  getLemburForAbsen,
  getLemburForEmpOne,
  qryAbsVerif,
  qryDailyAbsensi,
  queryPureVerifAbs,
  VerifAbsen,
  qryGetVerifByNik,
  getLemburForAbsNik,
  queryGetDtlLog,
  LogAttandance,
  getBaseAbsMonth,
  getListSecAndSubDeptByAbsen,
  queryRecapAbsMonth,
  SumbiriAbsensSum,
  qrygetSumAbsen,
} from "../../models/hr/attandance.mod.js";
import moment from "moment";
import { IndividuJadwal } from "../../models/hr/JadwalDanJam.mod.js";
import Users from "../../models/setup/users.mod.js";
import { QueryGetHolidayByDate } from "../../models/setup/holidays.mod.js";
import db from "../../config/database.js";
import { getRangeDate } from "../util/Utility.js";

export const getAbsenDaily = async (req, res) => {
  try {
    const { date } = req.params;

    let getAbsen = await dbSPL.query(qryDailyAbsensi, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getAbsen = getAbsen.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);
        if (lembur) {
          let ttlLembur = "";
          if (lembur.type === "BH") {
            const scanin = moment(item.scan_in, "HH:mm:ss");
            const jam_in = moment(item.jk_in, "HH:mm:ss");
            ttlLembur = scanin.diff(jam_in, "hours");
          } else {
            const scanout = moment(item.scan_out, "HH:mm:ss");
            let jam_out = moment(item.jk_out, "HH:mm:ss");

            // if(lembur.Nik === 201603119){
            //   console.log(scanout.format("HH:mm:ss"))
            //   console.log(jam_out.format("HH:mm:ss"))
            // }

            if (scanout.isBefore(jam_out)) {
              jam_out.add(1, "day");
            }
            ttlLembur = scanout.diff(jam_out, "hours");
          }
          return {
            ...item,
            ...lembur,
            ttlLembur,
            verif: lembur.jam === item.ot ? 1 : 2,
          };
        } else {
          return { ...item, verif: item.ot ? 3 : "" };
        }
      });
    }

    const getUserId = getAbsen.map((items) => items.mod_id);

    if (getUserId.length > 0) {
      const getListUser = await Users.findAll({
        where: {
          USER_ID: {
            [Op.in]: getUserId,
          },
        },
        attributes: ["USER_ID", "USER_INISIAL"],
        raw: true,
      });

      getAbsen = getAbsen.map((item) => {
        const userName = getListUser.find((emp) => emp.USER_ID === item.mod_id);

        if (userName) {
          return { ...item, ...userName };
        } else {
          return item;
        }
      });
    }

    return res.json({ data: getAbsen, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

export async function updateAbsen(req, res) {
  try {
    // console.log(dataUpdate);
    const { objEdit, arrAbs, tanggal_in, userId, autoIn, autoOut } = req.body;

    if (objEdit.jam_kerja[0].jk_id) {
      // const momentTglIn = moment(tanggal_in, "YYYY-MM-DD");
      // const tanggal_out =
      //   objEdit.jam_kerja[0].jk_out_day === "N"
      //     ? momentTglIn.add(1, "day").format("YYYY-MM-DD")
      //     : tanggal_in;

      // console.log(objEdit.keterangan);

      let updateArrAbs = arrAbs.map((item) => {
        const momentTglIn = moment(item.scheduleDate, "YYYY-MM-DD"); // || moment(tanggal_in, "YYYY-MM-DD");
        const tanggal_out =
          objEdit.jam_kerja[0].jk_out_day === "N"
            ? momentTglIn.add(1, "day").format("YYYY-MM-DD")
            : item.scheduleDate;

        const dataAbs = {
          ...item,
          scan_in: objEdit.scan_in === "00:00" ? item.scan_in : objEdit.scan_in,
          scan_out:
            objEdit.scan_out === "00:00" ? item.scan_out : objEdit.scan_out,
          jk_id: objEdit.jam_kerja[0].jk_id || null,
          ket_in: objEdit.ket_in || null,
          ket_out: objEdit.ket_out || null,
          ot: objEdit.ot ? objEdit.ot : null,
          keterangan: objEdit.keterangan[0].code_absen || null,
          tanggal_in: item.scheduleDate,
          tanggal_out: tanggal_out,
          scheduleDate_inv: item.scheduleDate,
          calendar: objEdit.calendar || item.calendar,
          mod_id: userId,
        };
        return dataAbs;
      });

      if (arrAbs.length > 1 && objEdit.keterangan[0].code_absen === "H") {
        updateArrAbs = updateArrAbs.map((item) => ({
          ...item,
          ot: objEdit.ot ? objEdit.ot : item.ot,
          scan_in: !autoIn
            ? item.scan_in
            : findScanTime(arrAbs.length, objEdit, "IN", autoIn),
          scan_out: !autoOut
            ? item.scan_out
            : findScanTime(arrAbs.length, objEdit, "OUT", autoOut),
        }));
        
      }

      const updateJadwal = await IndividuJadwal.bulkCreate(updateArrAbs, {
        updateOnDuplicate: ["Nik", "scheduleDate_inv", "jk_id", "calendar"],
        where: {
          jadwalId: ["jadwalId_inv"],
        },
      });

      const updatedAbsen = await Attandance.bulkCreate(updateArrAbs, {
        updateOnDuplicate: [
          "scan_in",
          "scan_out",
          "ot",
          "calendar",
          "jk_id",
          "ket_in",
          "ket_out",
          "keterangan",
          "tanggal_in",
          "tanggal_out",
          "mod_id",
        ],

        where: {
          id: ["id"],
        },
      });

      if (updatedAbsen) {
        return res.json({
          // data: absObj,
          message: "succcess update data",
        });
      } else {
        return res.status(500).json({ message: "Gagal Update" });
      }
    } else {
      return res.status(404).json({ message: "Mohon set Jam kerja" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
}

//delete
export async function deleteAbsen(req, res) {
  try {
    // console.log(dataUpdate);
    const { arrAbs, tanggal_in } = req.body;

    const arrAbsId = arrAbs.map((item) => item.Nik);
    const deleteAbsen = await Attandance.destroy({
      where: {
        Nik: arrAbsId,
        tanggal_in: tanggal_in,
      },
    });
    if (deleteAbsen) {
      return res.json({
        message: "succcess delete data",
      });
    } else {
      return res.status(500).json({ message: "Gagal Delete" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
}

function timeToMilliseconds(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
}

// Fungsi untuk mengonversi milidetik kembali ke waktu (HH:mm:ss)
function millisecondsToTime(milliseconds) {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  return [hours, minutes, seconds]
    .map((val) => String(val).padStart(2, "0"))
    .join(":");
}

// Fungsi untuk mendapatkan waktu random dalam rentang
export function getRandomTimeInRange(startTime, endTime) {
  const start = timeToMilliseconds(startTime);
  const end = timeToMilliseconds(endTime);
  const randomTime = Math.floor(Math.random() * (end - start + 1)) + start;
  return millisecondsToTime(randomTime);
}

// Fungsi untuk mendapatkan waktu random dalam rentang dengan endTime = startTime + 5 menit
export function getRandomTimeIn5Minute(startTime) {
  const start = timeToMilliseconds(startTime);
  const end = start + 5 * 60 * 1000; // Tambah 5 menit dalam milidetik
  const randomTime = Math.floor(Math.random() * (end - start + 1)) + start;
  return millisecondsToTime(randomTime);
}

// Fungsi untuk mendapatkan waktu random dalam rentang dengan endTime = startTime - 5 menit
export function getRandomTimeInMinus5(startTime) {
  const start = timeToMilliseconds(startTime);
  const end = (start - 5) * 60 * 1000; // Tambah 5 menit dalam milidetik
  const randomTime = Math.floor(Math.random() * (end - start + 1)) + start;
  return millisecondsToTime(randomTime);
}

const arrKet = [
  "A",
  "CD",
  "I",
  "CT",
  "CM",
  "CH",
  "CK1",
  "CK2",
  "CK3",
  "CK4",
  "CK5",
  "CK6",
  "CK7",
  "CG",
  "DL",
];

export const getVerifAbsenDaily = async (req, res) => {
  try {
    const { date } = req.params;

    let getAbsen = await dbSPL.query(qryAbsVerif, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    getAbsen = getAbsen.filter((item) => !item.scan_in || !item.scan_out);

    getAbsen = getAbsen.filter((item) => !arrKet.includes(item.keterangan));
    const getUserId = getAbsen.map((items) => items.mod_id);

    if (getUserId.length > 0) {
      const getListUser = await Users.findAll({
        where: {
          USER_ID: {
            [Op.in]: getUserId,
          },
        },
        attributes: ["USER_ID", "USER_INISIAL"],
        raw: true,
      });

      getAbsen = getAbsen.map((item) => {
        const userName = getListUser.find((emp) => emp.USER_ID === item.mod_id);

        if (userName) {
          return { ...item, ...userName };
        } else {
          return item;
        }
      });
    }

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getAbsen = getAbsen.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    return res.json({ data: getAbsen, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

export const getTblConfirm = async (req, res) => {
  try {
    const { date } = req.params;

    let getConfirmAbsen = await dbSPL.query(queryPureVerifAbs, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getConfirmAbsen = getConfirmAbsen.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    return res.json({ data: getConfirmAbsen, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data confirm" });
  }
};

//for view detail log absen di absen daily
export const getViewDetailLog = async (req, res) => {
  try {
    const { nik, date } = req.params;
    const { jk_out_day } = req.query;

    const tanggal_in = date;
    let tanggal_out = date;

    if (jk_out_day === "N") {
      tanggal_out = moment(date, "YYYY-MM-DD")
        .add(1, "days")
        .format("YYYY-MM-DD");
    }

    const listLogDetail = await dbSPL.query(queryGetDtlLog, {
      replacements: { Nik: nik, startDate: tanggal_in, endDate: tanggal_out },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    return res
      .status(200)
      .json({ data: listLogDetail, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

export async function verifAbsenCtr(req, res) {
  try {
    // console.log(dataUpdate);
    const { objEdit, arrAbs, tanggal_in, userId, autoIn, autoOut } = req.body;

    if (objEdit.jam_kerja[0].jk_id) {
      const momentTglIn = moment(tanggal_in, "YYYY-MM-DD");
      const tanggal_out =
        objEdit.jam_kerja[0].jk_out_day === "N"
          ? momentTglIn.add(1, "day").format("YYYY-MM-DD")
          : tanggal_in;

      // console.log(objEdit.keterangan);

      let updateArrAbs = arrAbs.map((item) => ({
        ...item,
        id: item.id_verif,
        id_absen: item.id_absen,
        scan_in: objEdit.scan_in === "00:00" ? null : objEdit.scan_in,
        scan_out: objEdit.scan_out === "00:00" ? null : objEdit.scan_out,
        jk_id: objEdit.jam_kerja[0].jk_id || null,
        ket_in: objEdit.ket_in || null,
        ket_out: objEdit.ket_out || null,
        remark: objEdit.remark || null,
        keterangan: objEdit.keterangan[0].code_absen || null,
        tanggal_in: tanggal_in,
        tanggal_out: tanggal_out,
        scheduleDate_inv: tanggal_in,
        add_id: !item.id_verif ? userId : null,
        mod_id: item.id_verif ? userId : null,
      }));

      if (arrAbs.length > 1 && objEdit.keterangan[0].code_absen === "H") {
        updateArrAbs = updateArrAbs.map((item) => ({
          ...item,
          scan_in: autoIn
            ? getRandomTimeIn5Minute(
                objEdit.jam_kerja[0].jk_scan_in_audit
                // objEdit.jam_kerja[0].jk_in
              )
            : item.scan_in,
          scan_out: autoOut
            ? getRandomTimeIn5Minute(
                objEdit.jam_kerja[0].jk_out
                // objEdit.jam_kerja[0].jk_scan_out_end
              )
            : item.scan_out,
        }));
      }

      // const updateJadwal = await IndividuJadwal.bulkCreate(updateArrAbs, {
      //   updateOnDuplicate: ["Nik", "scheduleDate_inv", "jk_id"],
      //   where: {
      //     jadwalId: ["jadwalId_inv"],
      //   },
      // });

      const verifAbsenProsess = await VerifAbsen.bulkCreate(updateArrAbs, {
        updateOnDuplicate: [
          "id_absen",
          "scan_in",
          "scan_out",
          "jk_id",
          "ket_in",
          "ket_out",
          "remark",
          "keterangan",
          "tanggal_in",
          "tanggal_out",
          "mod_id",
        ],
      });

      if (verifAbsenProsess) {
        return res.json({
          // data: absObj,
          message: "succcess save data",
        });
      } else {
        return res.status(500).json({ message: "Gagal save" });
      }
    } else {
      return res.status(404).json({ message: "Mohon set Jam kerja" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
}

//revisi absen baru
export async function verifAbsenCtr1(req, res, next) {
  try {
    // console.log(dataUpdate);
    const { objEdit, arrAbs, tanggal_in, userId, autoIn, autoOut } = req.body;
    if (!arrAbs) return res.status(404).json({ message: "No data post" });

    for (const [i, item] of arrAbs.entries()) {
      const momentTglIn = moment(tanggal_in, "YYYY-MM-DD");
      const tanggal_out =
        objEdit.jam_kerja[0]?.jk_out_day === "N"
          ? momentTglIn.add(1, "day").format("YYYY-MM-DD")
          : tanggal_in;

      let updateArrAbs = {
        ...item,
        id: item.id_verif,
        id_absen: item.id_absen,
        scan_in:
          objEdit.scan_in === "00:00"
            ? item.scan_in
            : findScanTime(arrAbs.length, objEdit, "IN", autoIn),
        scan_out:
          objEdit.scan_out === "00:00"
            ? item.scan_out
            : findScanTime(arrAbs.length, objEdit, "OUT", autoOut),
        jk_id: objEdit.jam_kerja[0]?.jk_id || item.jk_id,
        ket_in: objEdit.ket_in || null,
        ket_out: objEdit.ket_out || null,
        remark: objEdit.remark || null,
        keterangan: objEdit.keterangan[0].code_absen || null,
        tanggal_in: tanggal_in,
        tanggal_out: tanggal_out,
        scheduleDate_inv: tanggal_in,
        add_id: !item.id_verif ? userId : null,
        mod_id: item.id_verif ? userId : null,
        verifikasi: null
      };

      const verifAbsenProsess = await VerifAbsen.upsert(updateArrAbs);
      if (!verifAbsenProsess)
        return res
          .status(500)
          .json({ message: `Terdapat Error Saat Prosess Nik ${item.Nik}` });

      if (i + 1 === arrAbs.length) {
        const arrNik = arrAbs.map((item) => item.Nik);
        req.data = { date: tanggal_in, arrNik };
        next();
        // return res.json({
        //   // data: absObj,
        //   message: "succcess save data",
        // });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
}

export function findScanTime(lenghAbs, objEdit, type, auto) {
  if (lenghAbs > 1 && objEdit.keterangan[0].code_absen === "H") {
    if (type === "IN") {
      if (auto) {
        return getRandomTimeIn5Minute(objEdit.jam_kerja[0].jk_scan_in_audit);
      } else {
        return objEdit.scan_in;
      }
    }
    if (type === "OUT") {
      if (auto) {
        return getRandomTimeIn5Minute(objEdit.jam_kerja[0].jk_out);
      } else {
        return objEdit.scan_out;
      }
    }
  } else {
    if (type === "IN") {
      return objEdit.scan_in;
    }
    if (type === "OUT") {
      return objEdit.scan_out;
    }
  }
}

export const delteHrVerifAbs = async (req, res) => {
  try {
    const arrIdVer = req.body.IDVerif;

    if (!arrIdVer)
      return res.status(202).json({ message: "No Data ID for Delete" });

    const deleteArrIdVerif = await VerifAbsen.destroy({
      where: {
        id: arrIdVer,
      },
    });

    if (deleteArrIdVerif) {
      return res.json({ message: "Success Deleted Data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
};

export const ConfirmVerifAbs = async (req, res) => {
  try {
    const { arrConfirm, userId } = req.body;

    if (!arrConfirm)
      return res.status(202).json({ message: "No Data ID for Confirm" });

    const dataPost = arrConfirm.map((item) => {
      let datas = { ...item, mod_id: userId };
      if (item.id_absen) {
        datas.id = item.id_absen;
      }
      return datas;
    });

    const updatedAbsen = await Attandance.bulkCreate(dataPost, {
      updateOnDuplicate: [
        "scan_in",
        "scan_out",
        "jk_id",
        "ket_in",
        "ket_out",
        "keterangan",
        "tanggal_in",
        "tanggal_out",
        "mod_id",
      ],

      where: {
        id: ["id"],
      },
    });

    if (updatedAbsen) {
      const idVerif = arrConfirm.map((item) => item.id_verif);

      const updateVerif = await VerifAbsen.update(
        { verifikasi: 1 },
        {
          where: {
            id: idVerif,
          },
        }
      );
      if (updateVerif) {
        return res.json({ message: "Success Verifikasi Absen" });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat confirm absen" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
};

//absensi individu
//get jadwal individu
export const getAbsenIndividu = async (req, res) => {
  try {
    const { nik, startDate, endDate } = req.params;

    if (!nik || !startDate || !endDate)
      return res.status(400).json({ message: "Tidak Terdapat Parameter" });

    const start = moment(startDate);
    const end = moment(endDate);

    const holidays = await db.query(QueryGetHolidayByDate, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    let indvAbs = await dbSPL.query(qryAbsenIndividu, {
      replacements: { startDate, endDate, nik },
      type: QueryTypes.SELECT,
    });

    const getLembur = await dbSPL.query(getLemburForEmpOne, {
      replacements: { startDate, endDate, nik },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      indvAbs = indvAbs.map((item) => {
        const lembur = getLembur.find(
          (lembur) =>
            lembur.Nik === item.Nik && lembur.spl_date === item.scheduleDate
        );

        if (lembur) {
          // let ttlLembur = "";
          // if (lembur.type === "BH") {
          //   const scanin = moment(item.scan_in, "HH:mm:ss");
          //   const jam_in = moment(item.jk_in, "HH:mm:ss");
          //   ttlLembur = scanin.diff(jam_in, "hours");
          // } else {
          //   const scanout = moment(item.scan_out, "HH:mm:ss");
          //   let jam_out = moment(item.jk_out, "HH:mm:ss");

          //   if (scanout.isBefore(jam_out)) {
          //     jam_out.add(1, "day");
          //   }
          //   ttlLembur = scanout.diff(jam_out, "hours");
          // }
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    const checkHolidays = (date, data) => {
      const dayName = moment(date).format("dddd");
      if (holidays.length > 0) {
        const findDate = holidays.find((item) => item.calendar_date === date);
        if (findDate)
          return {
            calendar: findDate.calendar_holiday_type,
            calendarName: findDate.calendar_holiday_reason,
            color: "#ca2129",
          };
      }
      if (dayName === "Sunday")
        return {
          calendar: data.calendar ? data.calendar : "HL",
          calendarName: null,
          colorDay: "#ca2129",
          color: data.calendar_color ? data.calendar_color : "#ec0000",
        };
      if (dayName === "Saturday")
        return {
          calendar: data.calendar ? data.calendar : "WD",
          calendarName: null,
          colorDay: "#0144B7",
          color: data.calendar_color ? data.calendar_color : "#97f65a",
        };
      return {
        calendar: data.calendar ? data.calendar : "WD",
        calendarName: null,
        colorDay: "#000000",
        color: data.calendar_color ? data.calendar_color : "#97f65a",
      };
    };

    const today = moment().startOf("day");

    const listDates = Array.from(moment.range(start, end).by("days")).map(
      (day) => {
        const dateFormat = day.format("YYYY-MM-DD");
        let dataExist = { Nik: nik };

        if (indvAbs.length > 0) {
          const checkIdx = indvAbs.findIndex(
            (items) => items.scheduleDate === dateFormat
          );

          if (checkIdx >= 0) {
            dataExist = indvAbs[checkIdx];
          }
        }
        const objHoliday = checkHolidays(dateFormat, dataExist);

        return {
          allowEdit: day.isSame(today, "day") || day.isAfter(today, "day"),
          scheduleDate: dateFormat,
          sortDate: day.format("MM-DD"),
          days: day.format("ddd"),
          ...objHoliday,
          ...dataExist,
        };
      }
    );

    res.json({ data: listDates });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Mendapatakan data jadwal" });
  }
};

export const getVerifAbsDayNik = async (req, res) => {
  try {
    const { arrNik, date } = req.data;

    const query = qryGetVerifByNik(date, arrNik);

    let getAbsen = await dbSPL.query(query, {
      // replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    getAbsen = getAbsen.filter((item) => !item.scan_in || !item.scan_out);

    getAbsen = getAbsen.filter((item) => !arrKet.includes(item.keterangan));
    const getUserId = getAbsen.map((items) => items.mod_id);

    if (getUserId.length > 0) {
      const getListUser = await Users.findAll({
        where: {
          USER_ID: {
            [Op.in]: getUserId,
          },
        },
        attributes: ["USER_ID", "USER_INISIAL"],
        raw: true,
      });

      getAbsen = getAbsen.map((item) => {
        const userName = getListUser.find((emp) => emp.USER_ID === item.mod_id);

        if (userName) {
          return { ...item, ...userName };
        } else {
          return item;
        }
      });
    }

    const queryLembur = getLemburForAbsNik(date, arrNik);
    const getLembur = await dbSPL.query(queryLembur, {
      // replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getAbsen = getAbsen.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    return res.json({ data: getAbsen, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

//delete absen individu
export async function deleteIndvAbsen(req, res) {
  try {
    // console.log(dataUpdate);
    const { objEdit, arrAbs, userId } = req.body;

    const skipZeroId = arrAbs.filter((item) => item.id);
    const arrAbsId = skipZeroId.map((item) => item.id);

    const deleteAbsen = await Attandance.destroy({
      where: {
        id: arrAbsId,
      },
    });
    if (deleteAbsen) {
      return res.json({
        message: "succcess delete data",
      });
    } else {
      return res.status(500).json({ message: "Gagal Delete" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Terjadi kesalahan" });
  }
}

/// list control for absen monthly
export const getListSecAndSubdept = async (req, res) => {
  try {
    const { monthNum, yearNum } = req.params;

    const listSecAndSubDept = await dbSPL.query(getListSecAndSubDeptByAbsen, {
      replacements: {
        monthNum,
        yearNum,
      },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    return res.status(200).json({ data: listSecAndSubDept });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil list section" });
  }
};

export const getMonthAttd = async (req, res) => {
  try {
    const { monthNum, yearNum, idSection, idSubDept } = req.params;
    const valArray = Object.values(req.params);

    if (valArray.some((value) => !value || value === undefined))
      return res
        .status(404)
        .json({ message: "Paramter yang dibutuhkan belum lengkap" });

    // Mendapatkan tanggal awal dan akhir bulan menggunakan Moment.js
    const startDate = moment([yearNum, monthNum - 1])
      .startOf("month")
      .toDate();
    const endDate = moment([yearNum, monthNum - 1])
      .endOf("month")
      .toDate();

    const objDateMoment = {
      start: startDate,
      end: endDate,
    };

    const rangeDate = getRangeDate(objDateMoment);

    const getMonthAbsen = await dbSPL.query(getBaseAbsMonth, {
      replacements: {
        monthNum,
        yearNum,
        idSection,
        idSubDept,
      },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    let groupedData = {};

    getMonthAbsen.forEach((row) => {
      const {
        Nik,
        NamaLengkap,
        tanggal_in,
        keterangan,
        scan_in,
        scan_out,
        ot,
        calendar,
        jk_id,
        ket_in,
        ket_out,
        id,
      } = row;

      // Jika Nik belum ada di objek, inisialisasi
      if (!groupedData[Nik]) {
        groupedData[Nik] = {
          Nik,
          NamaLengkap,
          jumlah_HK: 0,
          jumlah_A: 0,
          total_ot: 0,
          detail: {}, // Gunakan objek agar mudah dicocokkan berdasarkan tanggal
        };
      }

      // Hitung jumlah HK (keterangan bukan A dan I)
      if (keterangan !== "A" && keterangan !== "I" && keterangan != null) {
        groupedData[Nik].jumlah_HK += 1;
      }

      // Hitung jumlah A (keterangan A atau I)
      if (keterangan === "A" || keterangan === "I") {
        groupedData[Nik].jumlah_A += 1;
      }

      // Hitung total ot
      groupedData[Nik].total_ot += ot;

      // Tambahkan detail absensi berdasarkan tanggal
      groupedData[Nik].detail[tanggal_in] = {
        id,
        tanggal_in,
        keterangan,
        scan_in,
        scan_out,
        ot,
        calendar,
        jk_id,
        ket_in,
        ket_out,
      };
    });

    // Konversi hasil dari objek ke array & lengkapi tanggal yang kosong
    const responseData = Object.values(groupedData).map((data) => {
      return {
        ...data,
        detail: rangeDate.map((date) => {
          return data.detail[date] || { tanggal_in: date };
        }),
      };
    });

    res.status(200).json({ data: responseData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data monthly" });
  }
};

//generate summary
export const genSumAbsen = async (req, res) => {
  try {
    const { monthYear } = req.params;

    const parsing = moment(monthYear, "YYYY-MM", true);
    if (!parsing.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const startDate = parsing.clone().startOf("month").format("YYYY-MM-DD");
    const endDate = parsing.clone().endOf("month").format("YYYY-MM-DD");

    const yearNum = parsing.year()
    const monthNum = parsing.month()+1

    const destroy = await SumbiriAbsensSum.destroy({
      where : { 
        sum_year : yearNum,
        sum_month : monthNum
      }
    });


    const recapAbsSum = await dbSPL.query(queryRecapAbsMonth, {
      replacements: {
        startDate,
        endDate,
      },
      type: QueryTypes.SELECT,
    });

    if(recapAbsSum.length === 0 ){
      return res.status(400).json({ error: "Data Absen tidak ditemukan" });
    }

    const recapWithOtPro = recapAbsSum.map(recap => {
      const {ot_wd, ot_h, ot_days_wd}  = recap
      const ot_wdInt = parseInt(ot_wd)
      const ot_hInt = parseInt(ot_h)
      const ot_days_wdInt = parseInt(ot_days_wd)
      let ot_1 = 0
      let ot_2 = 0
      let ot_3 = 0
      let ot_total = 0
      let ot_prorate = 0

      if(ot_wdInt){
        ot_1 = ot_days_wdInt // ot_1 diambil dari jumlah hari lembur hari norlmal (WD)
        ot_2 = ot_wdInt-ot_days_wdInt
      }
      if(ot_h){
        ot_2 += ot_hInt // jika ada ot_H berarti tambahkan semuanya
      }
      ot_total = ot_wdInt + ot_hInt
      ot_prorate = (ot_1*1.5)+(ot_2*2)

      return {
        ...recap,
            ot_1,
            ot_2,
            ot_3,
            ot_total,
            ot_prorate,
      }
    })

    const storeRecap = await SumbiriAbsensSum.bulkCreate(recapWithOtPro);

    if (storeRecap) {
      res.json({ message: "success generate" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data monthly" });
  }
};

export const getSumAbsen = async (req, res) => {
  try {
    const { monthNum, yearNum } = req.params;
    const valArray = Object.values(req.params);

    if (valArray.some((value) => !value || value === undefined))
      return res
        .status(404)
        .json({ message: "Paramter yang dibutuhkan belum lengkap" });

    const dataSumAbsen = await dbSPL.query(qrygetSumAbsen, {
      replacements: {
        monthNum,
        yearNum,
      },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    res.status(200).json({ data: dataSumAbsen });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data summary absen" });
  }
};
