import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import { QueryMonthRep } from "../../../models/dashAnalitycs/sewYtdDash.js";
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
import { sumData } from "./DashYtd.js";

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

// get data weekly
export const getDataMtd = async (req, res) => {
  try {
    const { rangeDate, site, shift, customers, style, line } = req.query;

    const dates = rangeDate.split(",");
    const currentDate = moment().format("YYYY-MM-DD");
    const theYear = moment(dates[0]).format("YYYY");
    const listWeekOneYear = await getListWe(theYear);

    let queryString = `MONTH(a.SCHD_PROD_DATE) = MONTH('${dates[0]}')`;

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

    const whereQuery = QueryMonthRep(queryString);
    const monthlyDatas = await db.query(whereQuery, {
      // replacements: {
      //   capId: capData.ID_CAPACITY,
      // },
      type: QueryTypes.SELECT,
    });

    //buang current date
    const monthWithOutCurDate = monthlyDatas.filter(
      (datas) => datas.SCHD_PROD_DATE !== currentDate
    );

    //menambahan we identitas ke tiap monthdata
    const monthData = monthWithOutCurDate.map((data) => {
      const matchingWeek = listWeekOneYear.find((week) =>
        week.rangeDate.includes(data.SCHD_PROD_DATE)
      );
      const WE = matchingWeek
        ? {
            WE: matchingWeek.id,
            WE_NAME: matchingWeek.name,
            ID_WE: matchingWeek.WE,
          }
        : {};
      return { ...data, ...WE };
    });

    const totalSchQty = SumByColoum(monthData, "SCHD_QTY");
    const totalTarget = SumByColoum(monthData, "TOTAL_TARGET");
    const totalOuput = SumByColoum(monthData, "TOTAL_OUTPUT");
    const totalEh = SumByColoum(monthData, "TOTAL_EH");
    const totalAh = SumByColoum(monthData, "TOTAL_AH");
    const totalNormal = SumByColoum(monthData, "NORMAL_OUTPUT");
    const totalOt = SumByColoum(monthData, "OT_OUTPUT");
    const totalXot = SumByColoum(monthData, "X_OT_OUTPUT");
    const totalAllot = SumByColoum(monthData, "ALL_OUTPUT_OT");
    const totalNormalEh = SumByColoum(monthData, "ACTUAL_EH");
    const totalOtEh = SumByColoum(monthData, "ACTUAL_EH_OT");
    const totalXotEh = SumByColoum(monthData, "ACTUAL_EH_X_OT");
    const totalEhAllOt = SumByColoum(monthData, "TOTAL_ALL_EH_OT");
    const totalNormalAh = SumByColoum(monthData, "ACTUAL_AH");
    const totalOtAh = SumByColoum(monthData, "ACTUAL_AH_OT");
    const totalXotAh = SumByColoum(monthData, "ACTUAL_AH_X_OT");
    const totalAhAllot = SumByColoum(monthData, "TOTAL_ALL_AH_OT");
    const totalNormalEff = JmlEff(totalNormalEh, totalNormalAh);
    const totalOtEff = JmlEff(totalOtEh, totalOtAh);
    const totalXOtEff = JmlEff(totalXotEh, totalXotAh);
    const totalEff = JmlEff(totalEh, totalAh);
    const totalEffAllot = JmlEff(totalEhAllOt, totalAhAllot);
    const varTarget = totalOuput - totalTarget;
    const varSchedule = totalOuput - totalSchQty;

    const dataByWeek = await sumData(monthData, ["WE"]);
    const dataByDate = await sumData(monthData, ["SCHD_PROD_DATE"]);
    const dataBySite = await sumData(monthData, ["SITE_NAME"]);
    const dataByLine = (await sumData(monthData, ["ID_SITELINE"])).map(
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
    const dataByCustomer = (await sumData(monthData, ["CUSTOMER_NAME"])).filter(
      (style) => style.CUSTOMER_NAME !== null
    );
    const dataByStyle = (
      await sumData(monthData, ["PRODUCT_ITEM_CODE"])
    ).filter((stl) => stl.EFF !== 0);
    const dataByDateAndSite = await sumData(monthData, ["WE", "SITE_NAME"]);
    const dataByLineDate = (
      await sumData(monthData, ["SCHD_PROD_DATE", "ID_SITELINE"])
    )?.map((line) => ({
      ID_SITELINE: line.ID_SITELINE,
      SCHD_PROD_DATE: line.SCHD_PROD_DATE,
      EFF: line.EFF,
      TOTAL_OUTPUT: line.TOTAL_OUTPUT,
      ACT_MP: line.ACT_MP,
    }));

    const filterNoMp = monthData.filter((wMp) => wMp.ACT_MP !== null);
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
      data: dataByWeek.map((dataDate) => dataDate.EFF?.toFixed(2)),
    };
    //join data series antara by site dan summary eff per date
    const dataSeriesWeek = [...arrySeriesSite, arrayDateEff];

    //list date berdasarkan scheddule listWeek
    const listDate = dataByWeek.map((dataDate) => dataDate.WE_NAME);

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
      const newLineData = {
        ...line,
        dataLineDate: dataEachDate,
        TOTAL_MP: mp,
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
      dataByWeek,
      listDate, // listWeek,
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

// Get List We
export const getListWe = async (year) => {
  try {
    const yr = year;
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
      const rangesDates = { start: startDate, end: endDate };

      //get range date
      const weekRangeDate = getRangeDate(rangesDates);
      arrWeek.push({
        id: we,
        value: { startDate, endDate },
        rangeDate: weekRangeDate,
        WE: `W${idx}`,
        name: `W${idx} (${startWeek}/${dateWeek})`,
      });
      we++;

      weekEndYear = theWeek.day("Saturday").format("YYYY");
    }
    return arrWeek;
  } catch (error) {
    return [];
  }
};
