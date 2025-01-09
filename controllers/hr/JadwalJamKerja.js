import { Op, or, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import {
  EmpGroup,
  getGroupSCh,
  GroupJadwal,
  GroupShift,
  IndividuJadwal,
  MasterJamKerja,
  MasterTypeCal,
  qryGetEmpRef,
  qryGetMemberGroup,
  qryListEmpActv,
  qrySchIndividu,
} from "../../models/hr/JadwalDanJam.mod.js";
import Users from "../../models/setup/users.mod.js";
import Moment from "moment";
import momentRange from "moment-range";
import { QueryGetHolidayByDate } from "../../models/setup/holidays.mod.js";
import db from "../../config/database.js";

const moment = momentRange.extendMoment(Moment);

export const postNewJamKerja = async (req, res) => {
  try {
    const dataJk = req.body;

    const findName = await MasterJamKerja.findOne({
      where: { jk_nama: dataJk.jk_nama },
    });

    if (findName) {
      return res.status(400).json({ message: "Nama Jam Kerja sudah ada" });
    }
    const createNewJk = await MasterJamKerja.create(dataJk);

    if (createNewJk) {
      res.status(200).json({ message: "Success Menambahkan Jam Kerja" });
    } else {
      res.status(400).json({ message: "Gagal Menambahkan Jam Kerja" });
    }
  } catch (error) {
    // console.log(error);

    res.status(500).json({ error, message: "Gagal Menambahkan Jam Kerja" });
  }
};

export const getAllJamKerja = async (req, res) => {
  try {
    const listJamKerja = await MasterJamKerja.findAll({
      raw: true,
      order: [["jk_nama", "ASC"]],
    });
    if (listJamKerja.length > 0) {
      const listUserId = listJamKerja
        .map((item) => [item.add_id, item.mod_id])
        .flat();

      const listNuixUsr = [...new Set(listUserId)];

      const listUser = await Users.findAll({
        where: {
          USER_ID: {
            [Op.in]: listNuixUsr,
          },
        },
      });

      const jamKerjaWithUser = listJamKerja.map((items) => {
        const user = listUser.find((item) => item.USER_ID === items.add_id);
        const userMOd = listUser.find((item) => item.USER_ID === items.mod_id);

        return {
          ...items,
          add_name: user.USER_NAME,
          mod_name: userMOd?.USER_NAME,
        };
      });
      res.status(200).json({
        data: jamKerjaWithUser,
        message: "Success Menambahkan Jam Kerja",
      });
    } else {
      res.status(200).json({ data: [], message: "Belum Ada Jam Kerja" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Menambahkan Jam Kerja" });
  }
};

//update jam kerja
export const patchJamKerja = async (req, res) => {
  try {
    const dataJk = req.body;

    const findName = await MasterJamKerja.findOne({
      where: {
        jk_nama: dataJk.jk_nama,
        jk_id: {
          [Op.not]: dataJk.jk_id,
        },
      },
    });

    if (findName) {
      return res.status(400).json({ message: "Nama Jam Kerja sudah ada" });
    }

    const updateJk = await MasterJamKerja.update(dataJk, {
      where: {
        jk_id: dataJk.jk_id,
      },
    });

    if (updateJk) {
      res.status(200).json({ message: "Success Update Jam Kerja" });
    } else {
      res.status(400).json({ message: "Gagal Update Jam Kerja" });
    }
  } catch (error) {
    // console.log(error);

    res.status(500).json({ error, message: "Gagal Update Jam Kerja" });
  }
};

//delete jam kerja
export const deleteJamKerja = async (req, res) => {
  try {
    const { jkId } = req.params;

    const delteJk = await MasterJamKerja.destroy({
      where: {
        jk_id: jkId,
      },
    });

    if (delteJk) {
      res.status(200).json({ message: "Success Delete Jam Kerja" });
    } else {
      res.status(400).json({ message: "Gagal Delete Jam Kerja" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Delete Jam Kerja" });
  }
};

//get calendar type
export const getCldrType = async (req, res) => {
  try {
    const allCalType = await MasterTypeCal.findAll({});

    res.json({ data: allCalType });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: "Gagal Amnil Calender type" });
  }
};

/// get all group

export const getAllGroup = async (req, res) => {
  try {
    const listGroup = await GroupShift.findAll({
      raw: true,
    });

    if (listGroup.length > 0) {
      const listUserId = listGroup
        .map((item) => [item.add_id, item.mod_id])
        .flat();
      const listNuixUsr = [...new Set(listUserId)];

      const listUser = await Users.findAll({
        where: {
          USER_ID: {
            [Op.in]: listNuixUsr,
          },
        },
      });

      const listGroupNew = listGroup.map((items) => {
        const user = listUser.find((item) => item.USER_ID === items.add_id);
        const userMOd = listUser.find((item) => item.USER_ID === items.mod_id);

        return {
          ...items,
          add_name: user.USER_NAME,
          mod_name: userMOd?.USER_NAME,
        };
      });

      res.status(200).json({
        data: listGroupNew,
      });
    } else {
      res.status(200).json({ data: [], message: "Belum Ada list group" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Menambahkan list group" });
  }
};

//post new group
export const postNewGroup = async (req, res) => {
  try {
    const dataGrp = req.body;

    const findName = await GroupShift.findOne({
      where: {
        [Op.or]: { groupName: dataGrp.groupName, groupCode: dataGrp.groupCode },
      },
    });

    if (findName) {
      return res.status(202).json({ message: "Nama Group sudah ada" });
    }
    const createGrp = await GroupShift.create(dataGrp);

    if (createGrp) {
      res.status(200).json({ message: "Success Menambahkan Group" });
    } else {
      res.status(400).json({ message: "Gagal Menambahkan Group" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Menambahkan Group" });
  }
};

//pacth group
export const patchGroup = async (req, res) => {
  try {
    const dataJk = req.body;

    const findName = await GroupShift.findOne({
      where: {
        groupId: {
          [Op.not]: dataJk.groupId,
        },
        [Op.or]: { groupName: dataJk.groupName, groupCode: dataJk.groupCode },
      },
    });

    if (findName) {
      return res.status(202).json({ message: "Nama group sudah ada" });
    }

    const updateJk = await GroupShift.update(dataJk, {
      where: {
        groupId: dataJk.groupId,
      },
    });

    if (updateJk) {
      res.status(200).json({ message: "Success Update group" });
    } else {
      res.status(400).json({ message: "Gagal Update group" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Update group" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const findExist = await GroupShift.findOne({
      where: {
        groupId,
      },
    });

    if (!findExist) {
      return res.status(202).json({ message: "Group Id tidak tedaftar" });
    }

    const updateJk = await GroupShift.destroy({
      where: {
        groupId,
      },
    });

    if (updateJk) {
      res.status(200).json({ message: "Success delete group" });
    } else {
      res.status(400).json({ message: "Gagal delete group" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal delete group" });
  }
};

export const getAllEmpForGrp = async (req, res) => {
  try {
    const listKaryawan = await dbSPL.query(qryListEmpActv, {
      type: QueryTypes.SELECT,
    });

    res.json({ data: listKaryawan });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Gagal Mendapatakan data employee" });
  }
};

//get list memberGroup
export const getMemberGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const listMemberGroup = await dbSPL.query(qryGetMemberGroup, {
      type: QueryTypes.SELECT,
      replacements: {
        groupId,
      },
    });

    res.json({ data: listMemberGroup });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Mendapatakan data member" });
  }
};

//post emp to group
export const empToGroup = async (req, res) => {
  try {
    const dataGrp = req.body;

    const addGrp = await EmpGroup.bulkCreate(dataGrp, {
      updateOnDuplicate: ["groupId"],
      where: {
        Nik: ["Nik"],
      },
    });

    if (addGrp) {
      res.status(200).json({ message: "Success Menambahkan Ke Group" });
    } else {
      res.status(400).json({ message: "Gagal Menambahkan ke Group" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Menambahkan ke Group" });
  }
};

//get jadwal group
export const getGroupSchedule = async (req, res) => {
  try {
    const { groupId, startDate, endDate } = req.params;

    if (!groupId || !startDate || !endDate)
      return res.status(400).json({ message: "Tidak Terdapat Parameter" });

    const start = moment(startDate);
    const end = moment(endDate);

    const holidays = await db.query(QueryGetHolidayByDate, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    const groupSch = await dbSPL.query(getGroupSCh, {
      replacements: { startDate, endDate, groupId },
      type: QueryTypes.SELECT,
    });

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
      if (dayName === "Saturday") {
        return {
          calendar: data.calendar ? data.calendar : "WD",
          calendarName: null,
          colorDay: "#0144B7",
          color: data.calendar_color ? data.calendar_color : "#97f65a",
        };
      }
      return {
        calendar: data.calendar ? data.calendar : "WD",
        calendarName: null,
        colorDay: "#000000",
        color: data.calendar_color ? data.calendar_color : "#97f65a",
      };
    };

    const today = moment().subtract(1, "days").startOf("day");

    const listDates = Array.from(moment.range(start, end).by("days")).map(
      (day) => {
        const dateFormat = day.format("YYYY-MM-DD");
        let dataExist = {};

        if (groupSch.length > 0) {
          const checkIdx = groupSch.findIndex(
            (items) => items.scheduleDate === dateFormat
          );

          if (checkIdx >= 0) {
            dataExist = groupSch[checkIdx];
          }
        }
        const objHoliday = checkHolidays(dateFormat, dataExist);

        return {
          allowEdit: day.isSame(today, 'day') || day.isAfter(today, 'day'),
          scheduleDate: dateFormat,
          sortDate: day.format("MM-DD"),
          days: day.format("ddd"),
          ...dataExist,
          ...objHoliday,
        };
      }
    );

    res.json({ data: listDates });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error, message: "Gagal Mendapatakan data jadwa;" });
  }
};

// post schedule group
export async function postGroupSch(req, res) {
  try {
    const dataArr = req.body;

    if (!dataArr) res.status(404).json({ message: "tidak ada data" });

    //cari jika tidak ada jam kerja tapi ada id maka destroy
    // let destroyCount = 0;
    // const arrDestroy = dataArr.filter((item) => !item.jk_id && item.jadwalId);
    // if (arrDestroy.length > 0) {
    //   const arrIdDestroy = arrDestroy.map((item) => item.jadwalId);
    //   const destData = GroupJadwal.destroy({
    //     where: {
    //       jadwalId: arrIdDestroy,
    //     },
    //   });
    //   destroyCount = destData;
    // }

    // jika ada jam kerja maka create or update
    const datapost = dataArr; //.filter((item) => item.jk_id);

    const bulk = await GroupJadwal.bulkCreate(datapost, {
      updateOnDuplicate: ["jk_id", "calendar"],
      where: {
        jadwalId: ["jadwalId"],
      },
    });

    if (bulk) return res.json({ message: "Success Save Schedule" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Terdapat error saat save schedule" });
  }
}

export const getRefEmpByQry = async (req, res) => {
  try {
    const { qrytext } = req.params;

    const qry = `%${qrytext}%`;

    const listEmpRef = await dbSPL.query(qryGetEmpRef, {
      replacements: {
        qry,
      },
      type: QueryTypes.SELECT,
    });

    res.json({ data: listEmpRef });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Terdapat error saat ambil emp ref" });
  }
};

//get jadwal individu
export const getSchIndividu = async (req, res) => {
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

    const groupSch = await dbSPL.query(qrySchIndividu, {
      replacements: { startDate, endDate, nik },
      type: QueryTypes.SELECT,
    });

    
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
        let dataExist = {Nik: nik};

        if (groupSch.length > 0) {
          const checkIdx = groupSch.findIndex(
            (items) => items.scheduleDate === dateFormat
          );

          if (checkIdx >= 0) {
            dataExist = groupSch[checkIdx];
          }
        }
        const objHoliday = checkHolidays(dateFormat, dataExist);

        return {
          allowEdit: day.isSame(today, 'day') || day.isAfter(today, 'day'),
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

// post schedule group
export async function postSchIndividu(req, res) {
  try {
    const dataArr = req.body;

    if (!dataArr) res.status(404).json({ message: "tidak ada data" });

    //cari jika tidak ada jam kerja tapi ada id maka destroy
    // let destroyCount = 0;
    // const arrDestroy = dataArr.filter(
    //   (item) => !item.jk_id && item.jadwalId_inv
    // );

    // if (arrDestroy.length > 0) {
    //   const arrIdDestroy = arrDestroy.map((item) => item.jadwalId_inv);
    //   const destData = IndividuJadwal.destroy({
    //     where: {
    //       jadwalId_inv: arrIdDestroy,
    //     },
    //   });
    //   destroyCount = destData;
    // }

    // jika ada jam kerja maka create or update
    const datapost = dataArr
      // .filter((item) => item.jk_id)
      .map((items) => ({
        ...items,
        scheduleDate_inv: items.scheduleDate,
      }));
      // console.log(datapost);
      
    const bulk = await IndividuJadwal.bulkCreate(datapost, {
      updateOnDuplicate: ["jk_id", "calendar"],
      where: {
        jadwalId: ["jadwalId_inv"],
      },
    });

    if (bulk) return res.json({ message: "Success Save Schedule" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Terdapat error saat save schedule" });
  }
}
