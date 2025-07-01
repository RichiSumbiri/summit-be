import Users from "../../models/setup/users.mod.js";
import jwt from "jsonwebtoken";
import {
  QueryGetUserQcReftok,
  QueryGetUserQcReftok13,
} from "../../models/production/quality.mod.js";
import { QueryTypes, Op } from "sequelize";
import db from "../../config/database.js";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findAll({
      where: {
        USER_REF_TOKEN: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].USER_ID;
        const username = user[0].USER_NAME;
        const userDept = user[0].USER_DEP;
        const userUnit = user[0].UNIT_ID;
        const userLevel = user[0].USER_LEVEL;
        const userMode = user[0].USER_DARK_MODE;
        const userPath = user[0].USER_PATH;
        const accessToken = jwt.sign(
          {
            userId,
            username,
            userLevel,
            userUnit,
            userDept,
            userMode,
            userPath,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const refreshTokenQc = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const finduser = await db.query(QueryGetUserQcReftok, {
      replacements: {
        reftoken: refreshToken,
      },
      type: QueryTypes.SELECT,
    });

    if (!finduser[0]) return res.sendStatus(403);
    const user = finduser[0];
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
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
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const refreshTokenQc13 = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const finduser = await db.query(QueryGetUserQcReftok13, {
      replacements: {
        reftoken: refreshToken,
      },
      type: QueryTypes.SELECT,
    });

    if (!finduser[0]) return res.sendStatus(403);
    const user = finduser[0];
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
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
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
