// import moment from "moment";
import db from "../config/database.js";
import { QueryTypes, Op, where, DataTypes } from "sequelize";
import {
  CutingLoadingSchSize,
  CutingLoadingSchedule,
  CuttingSchDetails,
  qryCutSchVsAct,
  qryGetNoCutId,
  qrySchNoPost,
  qrySchNoPostSize,
} from "../models/planning/cuttingplan.mod.js";
import {
  funcUpdateDate,
  postSewToCutSchdSize,
} from "../controllers/production/planning/CutSchedule.js";
import {
  LogCuttingDept,
  queryLogCutDept,
} from "../models/production/cutting.mod.js";
import moment from "moment";
import pkg from "moment-range";

const { extendMoment } = pkg;

// Extend moment dengan moment-range
const momentRange = extendMoment(moment);

export async function mainCutReSchedule() {
  try {
    console.log("running a task Cutting reschedule");

    //ambul data ada SCH ID loading tapi tidak ada schedule loading
    const dataNoCutId = await db.query(qryGetNoCutId, {
      type: QueryTypes.SELECT,
    });

    //jika tidak trdpt schd dan loading
    if (dataNoCutId.length < 1) {
      console.log("No Schedule For Recap Cron Job");
    }

    // pisahkan data yang belum ada schedul cutting namun sudah loading
    const noCutID = dataNoCutId.filter((x) => x.CUT_ID === null);

    if (noCutID.length > 0) {
      //buatkan arr sch id untuk post schedule
      const arrSchId = noCutID.map((item) => item.CUT_SCH_ID);

      //   console.log(distinctSchId);
      //post schedule yang tidak ada dan plan cutting
      await funcPlanSewToCuting(arrSchId);
      console.log("success buat CUT ID");
    }

    // ambil data cutting schedule detail size vs ouput loading hari sebelumnya
    const schVsActualDetail = await db.query(qryCutSchVsAct, {
      type: QueryTypes.SELECT,
    });

    if (schVsActualDetail.length === 0)
      return console.log("tidak ada data detail loading output");

    //ambil yang tidak ada id detail untuk memastikan ada sizenya ada
    const noIdDetail = schVsActualDetail.filter((x) => !x.CUT_ID_DETAIL);

    const withIdDetail = schVsActualDetail.filter(
      (x) => x.CUT_ID_DETAIL !== null
    );
    // jika ada maka kita cek
    if (noIdDetail.length > 0) {
      await resSchDataNoSize(noIdDetail);
    }

    for await (const [i, arr] of withIdDetail.entries()) {
      const dataDetail = {
        ...arr,
        CUT_SCH_QTY: arr.LOADING_QTY,
        CUT_STATUS: "Y",
        CUT_MOD_ID: 0,
      };
      await CuttingSchDetails.update(dataDetail, {
        where: { CUT_ID_DETAIL: arr.CUT_ID_DETAIL },
      });
      funcUpdateDate(arr.CUT_SCH_ID);
    }

    // return console.log('finish');
  } catch (error) {
    console.log(error);
  }
}

async function funcPlanSewToCuting(arrSchId) {
  try {
    if (arrSchId.length === 0) return console.log("No Data new");
    const stringArrSch = arrSchId.map((items) => `'${items}'`).join(", ");
    const stringWhere = ` a.SCH_ID IN (${stringArrSch})`;
    const getQry = qrySchNoPost(stringWhere);

    const arrPlanSew = await db.query(getQry, {
      type: QueryTypes.SELECT,
    });

    const qrySize = qrySchNoPostSize(stringWhere);
    const arrPlanSize = await db.query(qrySize, {
      type: QueryTypes.SELECT,
    });

    for (const [i, arr] of arrPlanSew.entries()) {
      const dataCutSch = {
        CUT_SCH_ID: arr.SCH_ID,
        CUT_ID_CAPACITY: arr.SCH_CAPACITY_ID,
        CUT_ID_SITELINE: arr.SCH_ID_SITELINE,
        CUT_SEW_SCH_QTY: arr.SCH_QTY,
        CUT_SITE_NAME: arr.SITE_NAME,
        CUT_SIZE_TYPE: arr.SIZE,
        CUT_SEW_START: arr.SCH_START_PROD,
        CUT_SEW_FINISH: arr.SCH_FINISH_PROD,
        CUT_ADD_ID: 0,
        CUT_MOD_ID: 0,
      };
      const creatData = await CutingLoadingSchedule.create(dataCutSch);
      await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, creatData.CUT_ID);
      if (i + 1 === arrPlanSew.length) {
        return console.log("Success create log");
      }
    }
  } catch (error) {
    console.log(error);
    console.log("Error post plan sewing to new plan cutting");
  }
}

async function resSchDataNoSize(arrOfObjDtlSize) {
  try {
    if (arrOfObjDtlSize.length === 0) return;
    for (const [i, arr] of arrOfObjDtlSize.entries()) {
      const checkSchSize = await CutingLoadingSchSize.findOne({
        where: {
          CUT_SCH_ID: arr.CUT_SCH_ID,
          CUT_SEW_SIZE_CODE: arr.CUT_SEW_SIZE_CODE,
        },
        raw: true,
      });

      if (!checkSchSize) {
        const stringQuery = `a.SCH_ID = '${arr.CUT_SCH_ID}' AND  b.SIZE_CODE = '${arr.CUT_SEW_SIZE_CODE}'`;
        // console.log(stringQuery);
        const qrySize = qrySchNoPostSize(stringQuery);
        const arrPlanSize = await db.query(qrySize, {
          type: QueryTypes.SELECT,
        });

        const dataSize = {
          CUT_ID: arr.CUT_ID,
          CUT_ID_SIZE: null,
          CUT_SCH_ID_SIZE: arrPlanSize[0].SCH_SIZE_ID,
          CUT_SCH_ID: arrPlanSize[0].SCH_ID,
          CUT_ID_SITELINE: arrPlanSize[0].SCH_ID_SITELINE,
          CUT_SEW_SCH_QTY: arrPlanSize[0].SCH_SIZE_QTY,
          CUT_SEW_SIZE_CODE: arrPlanSize[0].SIZE_CODE,
          CUT_ADD_ID: 0,
          CUT_MOD_ID: 0,
        };

        const postCutSize = await CutingLoadingSchSize.create(dataSize);

        if (postCutSize) {
          const dataDetail = {
            ...arr,
            CUT_ID_SIZE: postCutSize.CUT_ID_SIZE,
            CUT_SCH_QTY: arr.LOADING_QTY,
            CUT_STATUS: "Y",
            CUT_ADD_ID: 0,
          };
          await CuttingSchDetails.create(dataDetail);
          funcUpdateDate(arr.CUT_SCH_ID);
        }
      } else {
        const dataDetail = {
          ...arr,
          CUT_ID_SIZE: checkSchSize.CUT_ID_SIZE,
          CUT_SCH_QTY: arr.LOADING_QTY,
          CUT_STATUS: "Y",
          CUT_ADD_ID: 0,
        };
        await CuttingSchDetails.create(dataDetail);
        funcUpdateDate(arr.CUT_SCH_ID);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function recapLogDepCut(date) {
  try {
    // const today = moment().format('YYYY-MM-DD')
    const getSampleData = await LogCuttingDept.findOne({
      where: {
        TRANS_DATE: date,
      },
      raw: true,
    });

    if (getSampleData) {
      await LogCuttingDept.destroy({
        where: {
          TRANS_DATE: date,
        },
      });
    }

    const today = moment(date, "YYYY-MM-DD");
    const startDateTime = today.format("YYYY-MM-DD") + " 06:00:00";
    const endDateTime = today.add(1, "days").format("YYYY-MM-DD") + " 05:59:59";
    // const startDate = today.format("YYYY-MM-DD");
    // console.log({startDateTime, endDateTime, date});
    
    const getCutLogs = await db.query(queryLogCutDept, {
      replacements: {
        startDateTime,
        endDateTime,
        startDate : date,
      },
      type: QueryTypes.SELECT,
    });

    if (getCutLogs.length > 0) {
      await LogCuttingDept.bulkCreate(getCutLogs);

      console.log("success recap cuting dept log "+date);
    }
  } catch (error) {
    console.log(error);
  }
}

function getDatesInMonth(monthYear) {
  const format = "MMMM/YYYY";
  const startOfMonth = moment(monthYear, format).startOf("month");
  const endOfMonth = moment(monthYear, format).endOf("month");

  if (!startOfMonth.isValid()) {
    throw new Error(
      'Format bulan/tahun tidak valid. Gunakan format "MMMM/YYYY", seperti "October/2024".'
    );
  }

  // Buat range dan hasilkan array tanggal
  const range = momentRange.range(startOfMonth, endOfMonth);
  return Array.from(range.by("day")).map((date) => date.format("YYYY-MM-DD"));
}

export async function recapCutDepManual(monthString) {
  const arrDate = getDatesInMonth(monthString);
// console.log(arrDate);

  if (arrDate.length) {
    for (const [i, date] of arrDate.entries()) {
      await recapLogDepCut(date);
      if (i + 1 === arrDate.length) {
        return console.log(`Success recap bulan ${monthString}`);
      }
    }
  }
}
