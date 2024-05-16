import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import { totalCol, CheckNilai } from "../../util/Utility.js";
import {
  QueryGetBuyerLis,
  QueryGetListStyleCap,
  QueryGetWeekSchPo,
  QueryListlineByStylePo,
  QueryPoByCap,
  getSizeAlocSize,
} from "../../../models/planning/poByCapacity.js";
import { SewingListSite } from "../../../models/production/sewing.mod.js";

//control get detail capacity
export const getPoCapDetailCap = async (req, res) => {
  try {
    let { startMonth, endMonth, siteName } = req.params;

    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    if (siteName === "%%") {
      siteName = siteList[0].SITE_NAME;
    }

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryPoByCap, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          siteName: siteName,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//control get detail sch weekly
export const getPoCapDetailWeekSch = async (req, res) => {
  try {
    let { startMonth, endMonth, siteName } = req.params;

    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    if (siteName === "%%") {
      siteName = siteList[0].SITE_NAME;
    }

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryGetWeekSchPo, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          siteName: siteName,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//control get grouping buyer for PObyCapcity
export const getPoCapListByer = async (req, res) => {
  try {
    let { startMonth, endMonth, siteName } = req.params;

    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    if (siteName === "%%") {
      siteName = siteList[0].SITE_NAME;
    }

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryGetBuyerLis, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          siteName: siteName,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//control get grouping buyer and then style for PObyCapcity
export const getPoCapListStyle = async (req, res) => {
  try {
    let { startMonth, endMonth, siteName } = req.params;

    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    if (siteName === "%%") {
      siteName = siteList[0].SITE_NAME;
    }

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryGetListStyleCap, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          siteName: siteName,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//control get grouping buyer and then style for PObyCapcity
export const getPoCapListLineStyle = async (req, res) => {
  try {
    let { startMonth, endMonth, siteName } = req.params;

    const siteList = await db.query(SewingListSite, {
      type: QueryTypes.SELECT,
    });

    if (siteName === "%%") {
      siteName = siteList[0].SITE_NAME;
    }

    if (startMonth && endMonth) {
      const capacity = await db.query(QueryListlineByStylePo, {
        replacements: {
          startMonth: startMonth,
          endMonth: endMonth,
          siteName: siteName,
        },
        type: QueryTypes.SELECT,
      });

      return res.json(capacity);
    }
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getSizeAlocPoCap = async (req, res) => {
  try {
    const { capId } = req.params;
    const codeCapId = decodeURIComponent(capId);
    // console.log(codeCapId);
    const getPoDelivSize = await db.query(getSizeAlocSize, {
      replacements: {
        capId: codeCapId,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(getPoDelivSize);
  } catch (err) {
    res.status(404).json({
      message: "something wrong",
      data: err,
    });
  }
};
