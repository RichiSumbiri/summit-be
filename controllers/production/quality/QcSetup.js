import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import bcryptjs from "bcryptjs";
import {
  listGroupShift,
  QcType,
  QcUsers,
  QueryGetListUserQc,
} from "../../../models/production/quality.mod.js";

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
