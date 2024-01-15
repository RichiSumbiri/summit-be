import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import {
  QueryWeekRep,
  queryFindStyle,
} from "../../../models/dashAnalitycs/sewYtdDash.js";
import db from "../../../config/database.js";
import {
  CheckNilai,
  ChkNilaFlt,
  CompareBy,
  // JmlEff,
  // SumByColoum,
  getRangeDate,
  roundNumber,
} from "../../util/Utility.js";

// hitung eff
export function JmlEff(eh, ah) {
  const Eff = (ChkNilaFlt(eh) / ChkNilaFlt(ah)) * 100;
  if (!Number.isFinite(Eff)) return 0;
  return Eff;
}

//sumby colom
export const SumByColoum = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) => ChkNilaFlt(sum) + ChkNilaFlt(item[namecol]),
    0
  );
};

// Get List We
export const getYtdListWe = async (req, res) => {
  try {
    const yr = req.params.year;
    let we = 0;
    let arrWeek = [];
    let thisYear = moment(yr).get("year") + 1;
    let weekEndYear = moment(yr).get("year");

    while (parseInt(weekEndYear) < thisYear) {
      let theWeek = moment(yr).week(we + 1);
      let startDate = theWeek
        .day("Saturday")
        .day("Saturday")
        .subtract(5, "days")
        .format("YYYY-MM-DD");
      let endDate = theWeek.day("Saturday").format("YYYY-MM-DD");
      let startWeek = theWeek
        .day("Saturday")
        .subtract(5, "days")
        .format("DD-MMM");
      let dateWeek = theWeek
        .day("Saturday")
        // .subtract(7, "days")
        .format("DD-MMM");
      //   let monthWeek = theWeek.day("Saturday").format("MM");
      let idx = we < 9 ? `0${we + 1}` : we;
      arrWeek.push({
        id: we,
        value: { startDate, endDate },
        name: `W${idx} (${startWeek}/${dateWeek})`,
      });
      we++;

      weekEndYear = theWeek.day("Saturday").format("YYYY");
    }
    res.json(arrWeek);
  } catch (error) {
    res.json({ message: "Data List WeekEnding Tidak Ditemukan", error });
  }
};

// get data weekly
export const getDataWeekly = async (req, res) => {
  try {
    const { rangeDate, site, shift, customers, style, line } = req.query;

    const dates = rangeDate.split(",");
    const currentDate = moment().format("YYYY-MM-DD");

    let queryString = `a.SCHD_PROD_DATE BETWEEN '${dates[0]}' AND '${dates[1]}'`;

    if (site) {
      const sites = site
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.SITE_NAME IN (${sites})`;
    }
    if (shift) {
      const shifts = shift
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.SHIFT IN (${shifts})`;
    }
    if (customers) {
      const customerx = customers
        .split("-")
        .map((cust) => `'${decodeURIComponent(cust)}'`)
        .join(",");
      queryString = queryString + ` AND a.CUSTOMER_NAME IN (${customerx})`;
    }
    if (style) {
      const styles = style
        .split(",")
        .map((stl) => `'${decodeURIComponent(stl)}'`)
        .join(",");
      queryString = queryString + ` AND a.PRODUCT_ITEM_CODE IN (${styles})`;
    }
    if (line) {
      const lines = line
        .split(",")
        .map((st) => `'${st}'`)
        .join(",");
      queryString = queryString + ` AND a.ID_SITELINE IN (${lines})`;
    }
    // console.log(queryString);

    const whereQuery = QueryWeekRep(queryString);
    const weeklyDataS = await db.query(whereQuery, {
      // replacements: {
      //   capId: capData.ID_CAPACITY,
      // },
      type: QueryTypes.SELECT,
    });

    //buang current date
    const weeklyData = weeklyDataS.filter(
      (datas) => datas.SCHD_PROD_DATE !== currentDate
    );

    const totalSchQty = SumByColoum(weeklyData, "SCHD_QTY");
    const totalTarget = SumByColoum(weeklyData, "TOTAL_TARGET");
    const totalOuput = SumByColoum(weeklyData, "TOTAL_OUTPUT");
    const totalEh = SumByColoum(weeklyData, "TOTAL_EH");
    const totalAh = SumByColoum(weeklyData, "TOTAL_AH");
    const totalNormal = SumByColoum(weeklyData, "NORMAL_OUTPUT");
    const totalOt = SumByColoum(weeklyData, "OT_OUTPUT");
    const totalXot = SumByColoum(weeklyData, "X_OT_OUTPUT");
    const totalAllot = SumByColoum(weeklyData, "ALL_OUTPUT_OT");
    const totalNormalEh = SumByColoum(weeklyData, "ACTUAL_EH");
    const totalOtEh = SumByColoum(weeklyData, "ACTUAL_EH_OT");
    const totalXotEh = SumByColoum(weeklyData, "ACTUAL_EH_X_OT");
    const totalEhAllOt = SumByColoum(weeklyData, "TOTAL_ALL_EH_OT");
    const totalNormalAh = SumByColoum(weeklyData, "ACTUAL_AH");
    const totalOtAh = SumByColoum(weeklyData, "ACTUAL_AH_OT");
    const totalXotAh = SumByColoum(weeklyData, "ACTUAL_AH_X_OT");
    const totalAhAllot = SumByColoum(weeklyData, "TOTAL_ALL_AH_OT");
    const totalNormalEff = JmlEff(totalNormalEh, totalNormalAh);
    const totalOtEff = JmlEff(totalOtEh, totalOtAh);
    const totalXOtEff = JmlEff(totalXotEh, totalXotAh);
    const totalEff = JmlEff(totalEh, totalAh);
    const totalEffAllot = JmlEff(totalEhAllOt, totalAhAllot);
    const varTarget = totalOuput - totalTarget;
    const varSchedule = totalOuput - totalSchQty;

    const dataByDate = await sumData(weeklyData, ["SCHD_PROD_DATE"]);
    const dataBySite = await sumData(weeklyData, ["SITE_NAME"]);
    const dataByLine = (await sumData(weeklyData, ["ID_SITELINE"])).map(
      (line) => ({
        ...line,
        CUS_LINE_NAME:
          line.SHIFT === "Shift_B"
            ? `${line.CUS_NAME}-${line.LINE_NAME}B`
            : `${line.CUS_NAME}-${line.LINE_NAME}`,
        LINE_NAME_SHIFT:
          line.SHIFT === "Shift_B" ? `${line.LINE_NAME}B` : `${line.LINE_NAME}`,
      })
    );
    const dataByCustomer = (
      await sumData(weeklyData, ["CUSTOMER_NAME"])
    ).filter((style) => style.CUSTOMER_NAME !== null);
    const dataByStyle = (
      await sumData(weeklyData, ["PRODUCT_ITEM_CODE"])
    ).filter((stl) => stl.EFF !== 0);
    const dataByDateAndSite = await sumData(weeklyData, [
      "SCHD_PROD_DATE",
      "SITE_NAME",
    ]);
    const dataByLineDate = (
      await sumData(weeklyData, ["SCHD_PROD_DATE", "ID_SITELINE"])
    )?.map((line) => ({
      ID_SITELINE: line.ID_SITELINE,
      SCHD_PROD_DATE: line.SCHD_PROD_DATE,
      EFF: line.EFF,
      TOTAL_OUTPUT: line.TOTAL_OUTPUT,
      ACT_MP: line.ACT_MP,
    }));

    const filterNoMp = weeklyData.filter((wMp) => wMp.ACT_MP !== null);
    const weekForMp = await sumData(filterNoMp, [
      "SCHD_PROD_DATE",
      "ID_SITELINE",
    ]);

    let topTenStyle = [];
    let bottomStyle = [];
    //jika data by style lebih dari 10 maka slice untuk top ten dan bottom ten
    if (dataByStyle.length > 0) {
      const dataStyleSortEffTop = [
        ...dataByStyle.sort((a, b) => CompareBy(b, a, "EFF")),
      ];
      const dataStyleSortEffBotom = [
        ...dataByStyle.sort((a, b) => CompareBy(a, b, "EFF")),
      ];

      topTenStyle = dataStyleSortEffTop?.slice(0, 9);
      bottomStyle = dataStyleSortEffBotom?.slice(0, 9);
    }
    const colorsList = [
      { SITE_NAME: "SBR_01", colorSite: "#2983FF" },
      { SITE_NAME: "SBR_02A", colorSite: "#00E396" },
      { SITE_NAME: "SBR_02B", colorSite: "#FEB019" },
      { SITE_NAME: "SBR_03", colorSite: "#FF4560" },
      { SITE_NAME: "SBR_04", colorSite: "#775DD0" },
    ];
    // cari data berdasarkan site untuk chart weekly eff per date per site
    const arrySeriesSite = dataBySite.map((site) => ({
      name: site.CUS_NAME,
      type: "column",
      color: colorsList.filter((clr) => clr.SITE_NAME === site.SITE_NAME)[0]
        .colorSite,
      data: dataByDateAndSite
        .filter((dateNsite) => dateNsite.SITE_NAME === site.SITE_NAME)
        .map((val) => val.EFF?.toFixed(2)),
    }));

    //cari daata berdasarkan date
    const arrayDateEff = {
      name: "OVERALL EFF",
      type: "line",
      color: "#008FFB",
      data: dataByDate.map((dataDate) => dataDate.EFF?.toFixed(2)),
    };
    //join data series antara by site dan summary eff per date
    const dataSeriesWeek = [...arrySeriesSite, arrayDateEff];

    //list date berdasarkan scheddule
    const listDate = dataByDate.map((dataDate) => dataDate.SCHD_PROD_DATE);

    // ############### for table weekly summary ##############
    const startDate = moment(dates[0]);
    const endDate = moment(dates[1]);
    const rangesDates = { start: startDate, end: endDate };

    //get range date
    const weekRangeDate = getRangeDate(rangesDates);

    const joinDataLineWeek = dataByLine.map((line) => {
      //filter berdasarkanline
      const dataEachDate = dataByLineDate.filter(
        (dataDate) => dataDate.ID_SITELINE === line.ID_SITELINE
      );
      const weekForMpTot = weekForMp.filter(
        (dataDate) => dataDate.ID_SITELINE === line.ID_SITELINE
      );

      // cari total manpower table weekl to date
      const mp = SumByColoum(weekForMpTot, "ACT_MP");
      const mpAllOt = SumByColoum(weekForMpTot, "ACT_MP_ALL_OT");
      const newLineData = {
        ...line,
        dataLineDate: dataEachDate,
        TOTAL_MP: mp,
        TOTAL_ALL_MP: mpAllOt,
      };
      return newLineData;
    });

    // ############### end for table weekly summary ##############

    res.json({
      dataByDate,
      dataBySite,
      dataByCustomer,
      dataByLine,
      dataSeriesWeek,
      dataByStyle,
      listDate,
      topTenStyle,
      bottomStyle,
      weekRangeDate,
      joinDataLineWeek,
      dataTotal: {
        totalSchQty,
        totalTarget,
        totalOuput,
        totalEh,
        totalAh,
        totalEhAllOt,
        totalAhAllot,
        totalEff,
        varTarget,
        varSchedule,
        totalNormal,
        totalOt,
        totalXot,
        totalAllot,
        totalNormalEh,
        totalOtEh,
        totalXotEh,
        totalNormalAh,
        totalOtAh,
        totalXotAh,
        totalNormalEff,
        totalOtEff,
        totalXOtEff,
        totalEffAllot,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ message: "Data weekly Ditemukan", error });
  }
};

//sumary data by line
// export const sumData = async (data, key) => {
//   const dataByLine = [
//     ...data
//       .reduce((distLine, current) => {
//         const attrib = current[key];
//         const grouped = distLine.get(attrib);
//         // console.log(grouped);
//         if (!grouped) {
//           distLine.set(attrib, {
//             ...current,
//             SCHD_QTY: CheckNilai(current.SCHD_QTY),
//             TOTAL_TARGET: ChkNilaFlt(current.TOTAL_TARGET),
//             TOTAL_OUTPUT: CheckNilai(current.TOTAL_OUTPUT),
//             TOTAL_EH: ChkNilaFlt(current.TOTAL_EH),
//             TOTAL_AH: CheckNilai(current.TOTAL_AH),
//             ACT_TARGET: ChkNilaFlt(current.ACT_TARGET),
//             ACT_TARGET_OT: ChkNilaFlt(current.ACT_TARGET_OT),
//             ACT_TARGET_X_OT: ChkNilaFlt(current.ACT_TARGET_X_OT),
//             NORMAL_OUTPUT: CheckNilai(current.NORMAL_OUTPUT),
//             OT_OUTPUT: CheckNilai(current.OT_OUTPUT),
//             X_OT_OUTPUT: CheckNilai(current.X_OT_OUTPUT),
//           });
//         } else {
//           distLine.set(attrib, {
//             ...grouped,
//             SCHD_QTY:
//               CheckNilai(grouped.SCHD_QTY) + CheckNilai(current.SCHD_QTY),
//             TOTAL_TARGET:
//               ChkNilaFlt(grouped.TOTAL_TARGET) +
//               ChkNilaFlt(current.TOTAL_TARGET),
//             TOTAL_OUTPUT:
//               CheckNilai(grouped.TOTAL_OUTPUT) +
//               CheckNilai(current.TOTAL_OUTPUT),
//             TOTAL_EH:
//               ChkNilaFlt(grouped.TOTAL_EH) + ChkNilaFlt(current.TOTAL_EH),
//             TOTAL_AH:
//               CheckNilai(grouped.TOTAL_AH) + CheckNilai(current.TOTAL_AH),
//             ACT_TARGET:
//               ChkNilaFlt(grouped.ACT_TARGET) + ChkNilaFlt(current.ACT_TARGET),
//             ACT_TARGET_OT:
//               ChkNilaFlt(grouped.ACT_TARGET_OT) +
//               ChkNilaFlt(current.ACT_TARGET_OT),
//             ACT_TARGET_X_OT:
//               ChkNilaFlt(grouped.ACT_TARGET_X_OT) +
//               ChkNilaFlt(current.ACT_TARGET_X_OT),
//             NORMAL_OUTPUT:
//               CheckNilai(grouped.NORMAL_OUTPUT) +
//               CheckNilai(current.NORMAL_OUTPUT),
//             OT_OUTPUT:
//               CheckNilai(grouped.OT_OUTPUT) + CheckNilai(current.OT_OUTPUT),
//             X_OT_OUTPUT:
//               CheckNilai(grouped.X_OT_OUTPUT) + CheckNilai(current.X_OT_OUTPUT),
//           });
//         }

//         return distLine;
//       }, new Map())
//       .values(),
//   ].map((sum) => ({
//     ...sum,
//     VAR_SCHD: CheckNilai(sum.TOTAL_OUTPUT - sum.SCHD_QTY),
//     VAR_TARGET: ChkNilaFlt(sum.TOTAL_OUTPUT - sum.TOTAL_TARGET),
//     EFF: JmlEff(sum.TOTAL_EH, sum.TOTAL_AH),
//   }));

//   dataByLine.sort((a, b) => CompareBy(a, b, key));
//   return dataByLine;
// };

export const sumData = async (data, keys) => {
  const dataSum = [
    ...data
      .reduce((distLine, current) => {
        const groupKey = keys.map((key) => current[key]).join("_"); // Create a combined key
        const grouped = distLine.get(groupKey);
        // console.log(grouped);
        if (!grouped) {
          distLine.set(groupKey, {
            ...current,
            SCHD_QTY: CheckNilai(current.SCHD_QTY),
            TOTAL_TARGET: ChkNilaFlt(current.TOTAL_TARGET),
            TOTAL_OUTPUT: CheckNilai(current.TOTAL_OUTPUT),
            TOTAL_EH: ChkNilaFlt(current.TOTAL_EH),
            TOTAL_AH: CheckNilai(current.TOTAL_AH),
            TOTAL_ALL_EH_OT: ChkNilaFlt(current.TOTAL_ALL_EH_OT),
            TOTAL_ALL_AH_OT: CheckNilai(current.TOTAL_ALL_AH_OT),
            ACT_TARGET: ChkNilaFlt(current.ACT_TARGET),
            ACT_TARGET_OT: ChkNilaFlt(current.ACT_TARGET_OT),
            ACT_TARGET_X_OT: ChkNilaFlt(current.ACT_TARGET_X_OT),
            ACT_TARGET_ALL_OT: ChkNilaFlt(current.ACT_TARGET_ALL_OT),
            NORMAL_OUTPUT: CheckNilai(current.NORMAL_OUTPUT),
            OT_OUTPUT: CheckNilai(current.OT_OUTPUT),
            X_OT_OUTPUT: CheckNilai(current.X_OT_OUTPUT),
            ALL_OUTPUT_OT: CheckNilai(current.ALL_OUTPUT_OT),
          });
        } else {
          distLine.set(groupKey, {
            ...grouped,
            SCHD_QTY:
              CheckNilai(grouped.SCHD_QTY) + CheckNilai(current.SCHD_QTY),
            TOTAL_TARGET:
              ChkNilaFlt(grouped.TOTAL_TARGET) +
              ChkNilaFlt(current.TOTAL_TARGET),
            TOTAL_OUTPUT:
              CheckNilai(grouped.TOTAL_OUTPUT) +
              CheckNilai(current.TOTAL_OUTPUT),
            TOTAL_EH:
              ChkNilaFlt(grouped.TOTAL_EH) + ChkNilaFlt(current.TOTAL_EH),
            TOTAL_AH:
              CheckNilai(grouped.TOTAL_AH) + CheckNilai(current.TOTAL_AH),
            TOTAL_ALL_EH_OT:
              ChkNilaFlt(grouped.TOTAL_ALL_EH_OT) +
              ChkNilaFlt(current.TOTAL_ALL_EH_OT),
            TOTAL_ALL_AH_OT:
              CheckNilai(grouped.TOTAL_ALL_AH_OT) +
              CheckNilai(current.TOTAL_ALL_AH_OT),
            ACT_TARGET:
              ChkNilaFlt(grouped.ACT_TARGET) + ChkNilaFlt(current.ACT_TARGET),
            ACT_TARGET_OT:
              ChkNilaFlt(grouped.ACT_TARGET_OT) +
              ChkNilaFlt(current.ACT_TARGET_OT),
            ACT_TARGET_X_OT:
              ChkNilaFlt(grouped.ACT_TARGET_X_OT) +
              ChkNilaFlt(current.ACT_TARGET_X_OT),
            ACT_TARGET_ALL_OT:
              ChkNilaFlt(grouped.ACT_TARGET_ALL_OT) +
              ChkNilaFlt(current.ACT_TARGET_ALL_OT),
            NORMAL_OUTPUT:
              CheckNilai(grouped.NORMAL_OUTPUT) +
              CheckNilai(current.NORMAL_OUTPUT),
            OT_OUTPUT:
              CheckNilai(grouped.OT_OUTPUT) + CheckNilai(current.OT_OUTPUT),
            X_OT_OUTPUT:
              CheckNilai(grouped.X_OT_OUTPUT) + CheckNilai(current.X_OT_OUTPUT),
            ALL_OUTPUT_OT:
              CheckNilai(grouped.ALL_OUTPUT_OT) +
              CheckNilai(current.ALL_OUTPUT_OT),
          });
        }

        return distLine;
      }, new Map())
      .values(),
  ].map((sum) => ({
    ...sum,
    VAR_SCHD: CheckNilai(sum.TOTAL_OUTPUT - sum.SCHD_QTY),
    VAR_TARGET: ChkNilaFlt(sum.TOTAL_OUTPUT - sum.TOTAL_TARGET),
    VAR_TARGET_AOT: ChkNilaFlt(sum.ACT_TARGET_ALL_OT - sum.ALL_OUTPUT_OT),
    EFF_NORMAL: JmlEff(sum.ACTUAL_EH, sum.ACTUAL_AH),
    EFF_ALL_OT: JmlEff(sum.TOTAL_ALL_EH_OT, sum.TOTAL_ALL_AH_OT),
    EFF: JmlEff(sum.TOTAL_EH, sum.TOTAL_AH),
  }));

  keys.forEach((key) => {
    dataSum.sort((a, b) => CompareBy(a, b, key));
  });

  return dataSum;
};

export const findStyleCode = async (req, res) => {
  try {
    const { rangeDate, style } = req.query;
    const dates = rangeDate.split(",");

    const decStyle = decodeURIComponent(style);
    const qry = `%${decStyle}%`;

    const stylFind = await db.query(queryFindStyle, {
      replacements: { qry, startDate: dates[0], endDate: dates[1] },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: stylFind });
  } catch (error) {
    console.log(error);
    res.json({ message: "Data style tidak", error });
  }
};
