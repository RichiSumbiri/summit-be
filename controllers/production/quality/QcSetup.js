import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import bcryptjs from "bcryptjs";
import {
  listGroupShift,
  QcType,
  QcUsers,
  QcUsersSchedule,
  QueryCheckSchQc,
  QueryGetListGroupSch,
  QueryGetListUserQc,
} from "../../../models/production/quality.mod.js";
import { getRangeDate } from "../../util/Utility.js";
import Moment from "moment";
import momentRange from "moment-range";
const moment = momentRange.extendMoment(Moment);

//Get List qc type
export const getListQcType = async (req, res) => {
  try {
    const listQcType = await QcType.findAll({});

    return res.status(200).json(listQcType);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getListGroupShift = async (req, res) => {
  try {
    const listgroup = await listGroupShift.findAll({});

    return res.status(200).json(listgroup);
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//create group shift
export const createGroupShift = async (req, res) => {
  const dataGroup = req.body;
  if (!dataGroup) return res.status(404).json({ message: "tidak ada data" });
  await listGroupShift.create(dataGroup);
  const newGroup = await listGroupShift.findAll({});

  res.json({
    data: newGroup,
    message: "Group Added",
  });
};

export const updateGroupShift = async (req, res) => {
  const dataGroup = req.body;
  if (!dataGroup) return res.status(404).json({ message: "tidak ada data" });
  await listGroupShift.update(dataGroup, {
    where: {
      GROUP_SHIFT_ID: dataGroup.GROUP_SHIFT_ID,
    },
  });
  const newGroup = await listGroupShift.findAll({});

  res.json({
    data: newGroup,
    message: "Group update",
  });
};

//controller Create User
export const createUserQC = async (req, res) => {
  const dataUser = req.body;
  const cekUsername = await QcUsers.findAll({
    attributes: ["QC_USERNAME"],
    where: {
      QC_USERNAME: dataUser.QC_USERNAME,
    },
  });
  // res.json(cekUsername);
  if (cekUsername.length !== 0)
    return res.status(400).json({ message: "Username sudah ada" });
  const hashPassword = await bcryptjs.hash(dataUser.QC_USER_PASSWORD, 10);
  dataUser.QC_USER_PASSWORD = hashPassword;
  await QcUsers.create(dataUser);
  res.json({
    // datanew: resData,
    message: "User Added",
  });
};

//update user
//controller Update User
export const updateUserQc = async (req, res) => {
  const dataUser = req.body;
  const hashPassword = await bcryptjs.hash(dataUser.QC_USER_PASSWORD, 10);
  dataUser.QC_USER_PASSWORD = hashPassword;
  await QcUsers.update(dataUser, {
    where: {
      QC_USER_ID: dataUser.QC_USER_ID,
    },
  });
  res.json({
    message: "User Updated",
  });
};

export const updateUserGroup = async (req, res) => {
  const listDataUser = req.body;

  await QcUsers.bulkCreate(listDataUser, {
    updateOnDuplicate: ["GROUP_SHIFT_ID"],
    where: {
      QC_USER_ID: ["QC_USER_ID"],
    },
  });

  const listUserQc = await db.query(QueryGetListUserQc, {
    type: QueryTypes.SELECT,
  });

  res.json({
    message: "User Updated",
    data: listUserQc,
  });
};

//controller Delete User QC
export const deleteUserQC = async (req, res) => {
  try {
    await QcUsers.update(req.body, {
      where: {
        QC_USER_ID: req.params.id,
      },
    });
    res.json({
      message: "User Delete",
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//controller Delete User QC
export const deleteUserGroup = async (req, res) => {
  try {
    const checkExist = await QcUsers.findAll({
      where: {
        GROUP_SHIFT_ID: req.params.id,
        QC_USER_ACTIVE: 1,
        QC_USER_DEL: 0,
      },
    });
    if (checkExist.length > 0)
      return res
        .status(404)
        .json({ message: "Can't Delete Pls Remove Group From User" });

    await listGroupShift.destroy({
      where: {
        GROUP_SHIFT_ID: req.params.id,
      },
    });

    const newGroup = await listGroupShift.findAll({});

    res.json({
      message: "Group Delete",
      data: newGroup,
    });
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//getlist user QC
export const getListUserQc = async (req, res) => {
  try {
    const listUserQc = await db.query(QueryGetListUserQc, {
      type: QueryTypes.SELECT,
    });

    return res.json(listUserQc);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//POST schedule user qc group
export const postScheduleQcGroup = async (req, res) => {
  try {
    const data = req.body;

    const today = moment().startOf("day");
    const start = moment(data.START_DATE).startOf("day");
    if (start.isBefore(today)) {
      return res.status(200).json({
        status: "fail",
        message: "Tidak Bisa Input schedule dihari sebelumnya",
      });
    }

    const checkExist = await db.query(QueryCheckSchQc, {
      replacements: {
        startDate: data.START_DATE,
        endDate: data.END_DATE,
        groupId: data.GROUP_ID,
        shift: data.SHIFT,
      },
      type: QueryTypes.SELECT,
    });

    if (checkExist.length > 0) {
      return res.status(200).json({
        status: "fail",
        message:
          "Schedule dengan group, shift, dengan rentang tanggal tersebut sudah ada",
      });
    }

    const listUserQc = await QcUsersSchedule.create(data);
    if (listUserQc) {
      return res.json({
        status: "success",
        message: "Success add schedule",
        data: listUserQc,
      });
    } else {
      return res.status(500).json({ message: "Faild add" });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//patch schedule user qc group
export const updateScheduleQcGroup = async (req, res) => {
  try {
    const data = req.body;

    const today = moment().startOf("day");
    const start = moment(data.START_DATE).startOf("day");
    if (start.isBefore(today)) {
      return res.status(200).json({
        status: "fail",
        message: "Tidak Bisa set schedule dihari sebelumnya",
      });
    }

    const checkExist = await db.query(QueryCheckSchQc, {
      replacements: {
        startDate: data.START_DATE,
        endDate: data.END_DATE,
        groupId: data.GROUP_ID,
        shift: data.SHIFT,
      },
      type: QueryTypes.SELECT,
    });

    //jika terdapat schedule
    if (checkExist.length > 0) {
      // check apakah idpostnya sama atau tidak, jika sama rejekct
      const checkId = checkExist.find((item) => item.id.toString() === data.ID);
      // console.log({ checkExist, data, checkId });

      if (!checkId) {
        return res.status(200).json({
          status: "fail",
          message:
            "Schedule dengan group, shift, dengan rentang tanggal tersebut sudah ada",
        });
      }
    }

    const listsch = await QcUsersSchedule.update(data, {
      where: {
        ID: data.ID,
      },
    });

    if (listsch) {
      return res.json({
        status: "success",
        message: "Success update schedule",
      });
    } else {
      return res.status(500).json({ message: "Faild add" });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//delete schedule qc shift
export const deleteScheduleQcGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "ID tidak" });

    const checkData = await QcUsersSchedule.findOne({
      where: {
        ID: id,
      },
    });

    if (!checkData)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    const start = moment(checkData.START_DATE);
    const end = moment(checkData.END_DATE);
    const ambilRange = getRangeDate({ start, end });
    const today = moment();

    const checkTglSebelumnya = ambilRange.filter((item) =>
      moment(item).isBefore(today)
    );
    // console.log(checkTglSebelumnya);

    if (checkTglSebelumnya.length > 0) {
      return res.status(200).json({
        status: "fail",
        message: "Tidak Bisa Delete schedule dihari sebelumnya",
      });
    }

    const deletesch = await QcUsersSchedule.destroy({
      where: {
        ID: id,
      },
    });

    if (deletesch) {
      return res.json({
        status: "success",
        message: "Success delete schedule",
      });
    } else {
      return res.status(500).json({ message: "Faild delete" });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//getlist group user qc schedule
export const getListSchGroupQc = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const listGroupSch = await db.query(QueryGetListGroupSch, {
      replacements: {
        startDate,
        endDate,
      },
      type: QueryTypes.SELECT,
    });

    //masukan ke object agar bisa masuk ke getRangeDate
    const insertDate = { start: moment(startDate), end: moment(endDate) };
    const rangeDate = getRangeDate(insertDate);

    const listGrpWRange = listGroupSch?.map((item) => {
      const dates = {
        start: moment(item.startDate),
        end: moment(item.endDate),
      };

      const itemRangeDate = getRangeDate(dates);

      const arrDate = itemRangeDate.filter((dt) => rangeDate.includes(dt));

      return {
        ...item,
        itemRangeDate,
        firstDate: arrDate[0],
        totalCell: arrDate.length,
      };
    });

    // Contoh penggunaan
    const dataWithIndex = addIndexByCategory(listGrpWRange);

    return res.json(dataWithIndex);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

function addIndexByCategory(data) {
  // Urutkan data berdasarkan category
  const sortedData = data.sort((a, b) => a.category.localeCompare(b.category));

  // Buat objek untuk menyimpan index per kategori
  const categoryIndexes = {};

  // Map data yang sudah diurutkan dan tambahkan index berdasarkan kategori
  return sortedData.map((item) => {
    // Jika category belum pernah ditemui, mulai dari index 1
    if (!categoryIndexes[item.category]) {
      categoryIndexes[item.category] = 0;
    }

    // Tambahkan atribut index ke item
    const newItem = {
      ...item,
      index: categoryIndexes[item.category],
    };

    // Increment index untuk kategori tersebut
    categoryIndexes[item.category] += 1;

    return newItem;
  });
}
