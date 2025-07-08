import Users from "../../models/setup/users.mod.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  QcUsers,
  QryGetUserQcWhGroup,
  QueryGetUserQc,
} from "../../models/production/quality.mod.js";
import { QueryTypes, Op } from "sequelize";
import db from "../../config/database.js";
import moment from "moment/moment.js";
// export const getUserLogin = async (req, res) =>{
//   const users = await Users.findAll();
//   res.json(users);
// }

export const Login = async (req, res) => {
  try {
    const { USER_NAME, USER_PASS } = req.body;
    const user = await Users.findOne({
      where: {
        USER_NAME: USER_NAME,
      },
    });
    const match = await bcryptjs.compare(USER_PASS, user.USER_PASS);
    // res.json(match);
    if (!match)
      return res
        .status(400)
        .json({ message: "User Name or Password Incorrect" });
    const userId = user.USER_ID;
    const username = user.USER_NAME;
    const userLevel = user.USER_LEVEL;
    const userUnit = user.USER_UNIT;
    const userDept = user.USER_DEP;
    const userPath = user.USER_PATH;
    const userMode = user.USER_DARK_MODE;
    const accessToken = jwt.sign(
      { userId, username, userLevel, userDept, userUnit, userMode, userPath },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );
    const refreshToken = jwt.sign(
      { userId, username, userLevel, userDept, userUnit, userMode, userPath },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    await Users.update(
      { USER_REF_TOKEN: refreshToken },
      {
        where: {
          USER_ID: userId,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ message: "User Name or Password Incorrect" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  //ambil token di client
  if (!refreshToken) return res.sendStatus(204);
  //jika tidak ada kasih respons forbiden
  const user = await Users.findAll({
    where: {
      USER_REF_TOKEN: refreshToken,
    },
  });
  //ambil token di server
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].USER_ID;
  await Users.update({ USER_REF_TOKEN: null }, { where: { USER_ID: userId } });
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

export const LoginQc = async (req, res) => {
  try {
    const { QC_USERNAME, QC_USER_PASSWORD } = req.body;
    const finduser = await db.query(QueryGetUserQc, {
      replacements: {
        userNameQc: QC_USERNAME,
      },
      type: QueryTypes.SELECT,
    });

    if (finduser.length === 0) {
      return res
        .status(400)
        .json({ message: "User Name or Password Incorrect" });
    }

    const user = finduser[0];

    const format = "HH:mm:ss";

    const now_time = moment().format("HH:mm:ss");

    const start = moment(user.START_TIME, format);
    const end = moment(user.END_TIME, format);
    const now = moment(now_time, format);

    // Periksa apakah now_time berada di antara start_time dan end_time
    if (now.isBetween(start, end) || user.QC_BYPASS_LOGIN === "Y") {
      const match = await bcryptjs.compare(
        QC_USER_PASSWORD,
        user.QC_USER_PASSWORD
      );

      if (!match)
        return res
          .status(400)
          .json({ message: "User Name or Password Incorrect" });
      const userId = user.QC_USER_ID;
      const username = user.QC_USERNAME;
      const qcName = user.QC_NAME;
      const qcType = user.QC_TYPE_NAME;
      const siteName = user.SITE_NAME;
      const lineName = user.LINE_NAME;
      const idSiteLine = user.ID_SITELINE;
      const shift = user.SHIFT;
      const accessToken = jwt.sign(
        {
          userId,
          username,
          qcName,
          qcType,
          siteName,
          lineName,
          idSiteLine,
          shift,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      const refreshToken = jwt.sign(
        {
          userId,
          username,
          qcName,
          qcType,
          siteName,
          lineName,
          idSiteLine,
          shift,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      await QcUsers.update(
        { QC_USER_REF_TOKEN: refreshToken },
        {
          where: {
            QC_USER_ID: userId,
          },
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } else {
      return res.status(400).json({
        message: "User anda tidak sesuai dengan rentang waktu Shift saat ini!",
      });
    }
  } catch (error) {
    res.status(404).json({ message: "User Name or Password Incorrect" });
  }
};

export const LogoutQc = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    //ambil token di client
    if (!refreshToken) return res.sendStatus(204);
    //jika tidak ada kasih respons forbiden
    const user = await QcUsers.findAll({
      where: {
        QC_USER_REF_TOKEN: refreshToken,
      },
    });
    //ambil token di server
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].QC_USER_ID;
    await QcUsers.update(
      { QC_USER_REF_TOKEN: null },
      { where: { QC_USER_ID: userId } }
    );
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (err) {
    res.status(404).json({ message: "logout error Incorrect", msg: err });
  }
};

export const LoginQc13 = async (req, res) => {
  try {
    const { QC_USERNAME, QC_USER_PASSWORD } = req.body;
    const finduser = await QcUsers.findOne({
      where: { QC_USERNAME: QC_USERNAME },
    });

    if (!finduser) {
      return res.status(400).json({ message: "User Atau Password Salah" });
    }

    const findSchedule = await db.query(QryGetUserQcWhGroup, {
      replacements: {
        userNameQc: QC_USERNAME,
      },
      type: QueryTypes.SELECT,
    });

    if (findSchedule.length === 0) {
      return res.status(400).json({
        message: "Anda tidak memiliki Jadwal Login, harap hubungi Adm QC",
      });
    }

    const user = findSchedule[0];

    const format = "HH:mm:ss";

    const now_time = moment().format(format);

    const start = moment(user.START_TIME, format);
    const end = moment(user.END_TIME, format);
    const now = moment(now_time, format);

    // Periksa apakah now_time berada di antara start_time dan end_time
    if (now.isBetween(start, end) || user.QC_BYPASS_LOGIN === "Y") {
      const match = await bcryptjs.compare(
        QC_USER_PASSWORD,
        user.QC_USER_PASSWORD
      );

      if (!match)
        return res
          .status(400)
          .json({ message: "User Name or Password Incorrect" });
      const userId = user.QC_USER_ID;
      const username = user.QC_USERNAME;
      const qcName = user.QC_NAME;
      const qcType = user.QC_TYPE_NAME;
      const siteName = user.SITE_NAME;
      const lineName = user.LINE_NAME;
      const idSiteLine = user.ID_SITELINE;
      const shift = user.SHIFT;
      const groupId = user.GROUP_ID;
      const accessToken = jwt.sign(
        {
          userId,
          username,
          qcName,
          qcType,
          siteName,
          lineName,
          idSiteLine,
          shift,
          groupId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      const refreshToken = jwt.sign(
        {
          userId,
          username,
          qcName,
          qcType,
          siteName,
          lineName,
          idSiteLine,
          shift,
          groupId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      await QcUsers.update(
        { QC_USER_REF_TOKEN: refreshToken },
        {
          where: {
            QC_USER_ID: userId,
          },
        }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken });
    } else {
      return res.status(400).json({
        message: "User anda tidak sesuai dengan rentang waktu Shift saat ini!",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({ message: "User Name or Password Incorrect" });
  }
};
