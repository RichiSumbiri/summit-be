// import moment from "moment";
import db from "../config/database.js";
import { QueryTypes, Op } from "sequelize";

import { totalCol } from "../controllers/util/Utility.js";
import {
  QryChckShiftById,
  QryCronPvsA,
  QueryGetOneDayliSch,
  WeeklyProSchd,
  WeekSchDetail,
} from "../models/planning/weekLyPlan.mod.js";
import { QueryGetHoliday } from "../models/setup/holidays.mod.js";
import moment from "moment";

export const funcReschedule = async () => {
  try {
    console.log("running a task reschedule");
    // ambil data schedule detail vs ouput hari sebelumnya
    const schdVsOutput = await db.query(QryCronPvsA, {
      //   replacements: {
      //     schDate: date,
      //   },
      type: QueryTypes.SELECT,
    });

    //jika tidak trdpt schd dan ouput
    if (schdVsOutput.length < 1) {
      console.log("No Schedule For Recap Cron Job");
    }

    //loopinh hasil query schd vs actual lalu patch
    for await (const [index, schd] of schdVsOutput.entries()) {
      //enteries untuk desructur dapatkan index
      //cari group
      const records = await db.query(QueryGetOneDayliSch, {
        replacements: {
          schId: schd.SCH_ID,
        },
        type: QueryTypes.SELECT,
      });

      //masukan darta output kedalam data group
      const forSorting = records.map((dataUpdate) => {
        if (dataUpdate.SCHD_ID === schd.SCHD_ID) {
          return {
            ...dataUpdate,
            SCHD_QTY: schd.TOTAL_OUTPUT,
            SCHD_STATUS_OUTPUT: "Y",
          };
        } else {
          return { ...dataUpdate };
        }
      });

      //lalu sorting untuk menemukan urutan
      const newSdetialAftrSort = forSorting.sort(
        (a, b) => new Date(a.SCHD_PROD_DATE) - new Date(b.SCHD_PROD_DATE)
      );

      // set number of days
      const newDnumber = newSdetialAftrSort.map((ds, i) => ({
        ...ds,
        SCHD_DAYS_NUMBER: i + 1,
        SCHD_HEAD_BALANCE: findSubValue(newSdetialAftrSort, ds, i + 1),
      }));

      newDnumber.forEach(async (newDet, i) => {
        await WeekSchDetail.update(newDet, {
          where: {
            SCHD_ID: newDet.SCHD_ID,
            SCH_ID: newDet.SCH_ID,
          },
        }).then((res) => {
          if (i + 1 === newDnumber.length) {
            if (newDet.SCHD_HEAD_BALANCE > 0) {
              createNewSchdl(newDet, newDnumber);
            } else {
              funcUpdateDate(newDnumber, newDet.SCH_ID);
            }
          }
        });
      });
      if (index + 1 === schdVsOutput.length) {
        console.log("success recon schedule");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//function untuk mendapatkan date berikutnnyna pada schedule yang memiliki balance
export const createNewSchdl = async (newDet, datas) => {
  try {
    //check shift dengan menggunakan id siteline maka akan mereturn
    const chcekShift = await db.query(QryChckShiftById, {
      replacements: {
        idSiteline: newDet.SCHD_ID_SITELINE,
      },
      type: QueryTypes.SELECT,
    });

    //dapatakan list holiday
    const listHoliday = await db.query(QueryGetHoliday, {
      replacements: {
        startYear: moment().format("YYYY"),
        endYear: moment().format("YYYY"),
      },
      type: QueryTypes.SELECT,
    });

    //tntukan hari libur untuk shift

    const shift =
      chcekShift[0].SHIFT === "Shift" ? ["Saturday", "Sunday"] : ["Sunday"]; //6hari kerja shift normal
    // const shift = ["Saturday", "Sunday"]; //untuk 5hari kerja
    const arryHoliday = listHoliday.map((hdet) => hdet.calendar_date); // array holiday
    let currDate = moment(newDet.SCHD_PROD_DATE, "YYYY-MM-DD").add(1, "days"); //hari dari props ditambah 1
    //gunakan while loop sampai ketemu hari yang tidak termasuk shift ataupun array holiday
    while (
      shift.includes(currDate.format("dddd")) ||
      arryHoliday.includes(currDate.format("YYYY-MM-DD"))
    ) {
      currDate.add(1, "days");
    }

    // console.log(currDate.format("dddd"));
    // console.log(currDate.format("YYYY-MM-DD"));

    const { SCHD_ID, ...newSchd } = newDet;

    const newBalance = {
      ...newSchd,
      SCHD_PROD_DATE: currDate.format("YYYY-MM-DD"),
      SCHD_QTY: newSchd.SCHD_HEAD_BALANCE,
      SCHD_HEAD_BALANCE: 0,
      SCHD_ADD_ID: 0,
      SCHD_STATUS_OUTPUT: "N",
    };

    await WeekSchDetail.create(newBalance).then((res) => {
      const newDatas = [...datas, newBalance];
      funcUpdateDate(newDatas, newDet.SCH_ID);
    });
  } catch (error) {
    console.log(error);
  }
};

//function untuk find sub total Header pada tiap detail
function findSubValue(arryDetail, objDetail, daysNum) {
  if (daysNum === 1) return objDetail.SCHD_HEADER_QTY - objDetail.SCHD_QTY;

  const groupHeaderSch = arryDetail.filter((det, i) => i + 1 <= daysNum);

  const nilaiGroupBefore = totalCol(groupHeaderSch, "SCHD_QTY");

  const subDetailValue = objDetail.SCHD_HEADER_QTY - nilaiGroupBefore;
  return subDetailValue;
}

//function untuk update data start dan end date
const funcUpdateDate = async (datas, schdId) => {
  try {
    if (datas.length > 0) {
      const dataWhOutNull = datas.filter((data) => data.SCHD_QTY !== null);
      const checkTotalSch = totalCol(dataWhOutNull, "SCHD_QTY");
      const startDay = dataWhOutNull[0];
      const finishDay = dataWhOutNull[dataWhOutNull.length - 1];
      let updateDate = {
        SCH_START_PROD: startDay.SCHD_PROD_DATE,
        SCH_FINISH_PROD: finishDay.SCHD_PROD_DATE,
      };

      if (finishDay.SCHD_HEADER_QTY - checkTotalSch !== 0) {
        updateDate.SCH_FINISH_PROD = null;
      }

      return await WeeklyProSchd.update(updateDate, {
        where: {
          SCH_ID: schdId,
        },
      });
    }
    const updateDate = {
      SCH_START_PROD: null,
      SCH_FINISH_PROD: null,
    };

    return await WeeklyProSchd.update(updateDate, {
      where: {
        SCH_ID: schdId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
