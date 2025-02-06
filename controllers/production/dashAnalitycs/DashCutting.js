import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
//dashboard cutting
import { CheckNilai, CheckNilaiToint, totalCol } from "../../util/Utility.js";
import moment from "moment/moment.js";
import {
  createQueryDash,
  findSiteLineLowWipPrep,
  qryBaseDtailBanner,
  qryGetCutLastDate,
  qryGetDtlWipMolSite,
  qryGetDtlWipSupSite,
  qryGetTargetLoading,
  qryGetWipSite,
  qryLoadingPlanVsActual,
  qryPrepBalance,
  qrySewInSiePerLine,
  qrySiteLineCount,
  qryWipQtyDept,
} from "../../../models/production/cutting.mod.js";
import { SumByColoum } from "./DashYtd.js";
import { qryGetWipPrepDtl } from "../../../models/reports/sewWipMonitor.mod.js";

export const getDataDashCutting = async (req, res) => {
  try {
    const { date, site, shift, customers, style, line } = req.query;

    //gunakan query untuk mendapatkan string query params(handle filter site dll)
    const queryString = getQueryStringCutDept(req.query);
    //dapatkan full query
    const whereQuery = createQueryDash(queryString);

    //dapatkan data hari ini
    const dataDash = await db.query(whereQuery, {
      type: QueryTypes.SELECT,
    });

    //destruct data yang didapat
    const currentData = getDataBanner(dataDash);

    //dapatkan tanggal transaksi terakhir
    const getLastDate = await db.query(qryGetCutLastDate, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    //masukan menjadi sting
    const lastDate = getLastDate[0].TRANS_DATE;
    //ulangi seperti diatas
    const queryStringLast = getQueryStringCutDept({
      ...req.query,
      date: lastDate,
    });
    const whereQueryLast = createQueryDash(queryStringLast);

    const dataDashLast = await db.query(whereQueryLast, {
      type: QueryTypes.SELECT,
    });

    const getDatLastDate = getDataBanner(dataDashLast);
    const lastDateData = {
      lastcutOutQty: getDatLastDate.cutOutQty,
      lastmolOutQty: getDatLastDate.molOutQty,
      lastsupOutQty: getDatLastDate.supOutQty,
      lastsewIn: getDatLastDate.sewIn,
      lastmolInQty: getDatLastDate.molInQty,
      lastsupInQty: getDatLastDate.supInQty,
      lastbraInQty: getDatLastDate.braInQty,
      lastnonBraInQty: getDatLastDate.nonBraInQty,
    };

    const cutOutDiff =
      CheckNilai((currentData.cutOutQty / lastDateData.lastcutOutQty) * 100) -
      100;
    const molOutDiff =
      CheckNilai((currentData.molOutQty / lastDateData.lastmolOutQty) * 100) -
      100;
    const supOutDiff =
      CheckNilai((currentData.supOutQty / lastDateData.lastsupOutQty) * 100) -
      100;
    const sewInDiff =
      CheckNilai((currentData.sewIn / lastDateData.lastsewIn) * 100) - 100;

    const joinDataDash = {
      ...currentData,
      ...lastDateData,
      cutOutDiff,
      molOutDiff,
      supOutDiff,
      sewInDiff,
    };

    return res.status(200).json({
      dataCards: joinDataDash,
    });
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard",
      data: error,
    });
  }
};

export function getQueryStringCutDept(query) {
  const { date, site, type, customers, style, line } = query;

  let queryString = `lcd.TRANS_DATE = '${date}'`;

  if (site) {
    const sites = site
      .split(",")
      .map((st) => `'${st}'`)
      .join(",");
    queryString = queryString + ` AND lcd.SITE_NAME IN (${sites})`;
  }
  if (type) {
    if (type === "Molding Output") {
      queryString =
        queryString +
        ` AND lcd.CATEGORY = 'OUT' AND lcd.TRANSACTION = 'MOLDING'`;
    }
    if (type === "Spr.Mrkt Output") {
      queryString =
        queryString +
        ` AND lcd.CATEGORY = 'OUT' AND lcd.TRANSACTION = 'SUPERMARKET'`;
    }
    if (type === "Sewing In") {
      queryString =
        queryString +
        ` AND lcd.CATEGORY = 'IN' AND lcd.TRANSACTION = 'SEWING_IN'`;
    }
  }
  if (customers) {
    const customerx = customers
      .split("-")
      .map((cust) => `'${decodeURIComponent(cust)}'`)
      .join(",");
    queryString = queryString + ` AND lcd.CUSTOMER_NAME IN (${customerx})`;
  }
  if (style) {
    const styles = style
      .split(",")
      .map((stl) => `'${decodeURIComponent(stl)}'`)
      .join(",");
    queryString = queryString + ` AND lcd.PRODUCT_ITEM_CODE IN (${styles})`;
  }
  if (line) {
    const lines = line
      .split(",")
      .map((st) => `'${st}'`)
      .join(",");
    queryString = queryString + ` AND lcd.ID_SITELINE IN (${lines})`;
  }
  return queryString;
}

function getDataBanner(dataDash) {
  const productTypeMol = ["BRA", "SHAPEWEAR", "BODY"];

  const dataIn = dataDash.filter((item) => item.CATEGORY === "IN");
  const dataOut = dataDash.filter((item) => item.CATEGORY === "OUT");

  //cari data cutting output = (molidng in(bra) + supermaket in )
  const globalCutOutput = dataIn.filter((item) => {
    if (
      item.TRANSACTION === "SUPERMARKET" &&
      !productTypeMol.includes(item.PRODUCT_TYPE)
    ) {
      return item;
    }
    if (
      item.TRANSACTION === "MOLDING"
      //  &&
      // productTypeMol.includes(item.PRODUCT_TYPE)
    ) {
      return item;
    }
  });
  // console.log(globalCutOutput);

  const arrBra = globalCutOutput.filter(
    (item) => !productTypeMol.includes(item.PRODUCT_TYPE)
  );
  const arrNonBra = globalCutOutput.filter((item) =>
    productTypeMol.includes(item.PRODUCT_TYPE)
  );

  const dataMoldingIn = dataIn.filter((item) => item.TRANSACTION === "MOLDING");
  const dataSupIn = dataIn.filter((item) => item.TRANSACTION === "SUPERMARKET");
  const dataSewingIn = dataIn.filter(
    (item) => item.TRANSACTION === "SEWING_IN"
  );
  const dataMoldingOut = dataOut.filter(
    (item) => item.TRANSACTION === "MOLDING"
  );
  const dataSupOut = dataOut.filter(
    (item) => item.TRANSACTION === "SUPERMARKET"
  );

  const cutOutQty = SumByColoum(globalCutOutput, "ORDER_QTY");
  const molOutQty = SumByColoum(dataMoldingOut, "ORDER_QTY");
  const supOutQty = SumByColoum(dataSupOut, "ORDER_QTY");
  const sewIn = SumByColoum(dataSewingIn, "ORDER_QTY");

  const molInQty = SumByColoum(dataMoldingIn, "ORDER_QTY");
  const supInQty = SumByColoum(dataSupIn, "ORDER_QTY");

  const braInQty = SumByColoum(arrNonBra, "ORDER_QTY");
  const nonBraInQty = SumByColoum(arrBra, "ORDER_QTY");

  const dataBaner = {
    cutOutQty,
    molOutQty,
    supOutQty,
    sewIn,
    molInQty,
    supInQty,
    braInQty,
    nonBraInQty,
  };

  return dataBaner;
}

export const getLoadPlanVsActual = async (req, res) => {
  try {
    const { date, site } = req.query;
    let stringQryPlan = `a.CUT_LOAD_DATE = '${date}'`;
    let stringQryActual = `lcd.TRANS_DATE = '${date}'`;

    if (site) {
      stringQryPlan = stringQryPlan + ` a.CUT_SITE_NAME '${site}'`;
      stringQryActual = stringQryActual + ` lcd.CUT_SITE '${site}' `;
    }

    const qryPlanActual = qryLoadingPlanVsActual(
      stringQryPlan,
      stringQryActual
    );

    const getPlanVsAct = await db.query(qryPlanActual, {
      type: QueryTypes.SELECT,
    });

    if (getPlanVsAct) {
      const actualQty = SumByColoum(getPlanVsAct, "ACTUAL_QTY");
      const planQty = SumByColoum(getPlanVsAct, "PLAN_QTY");

      const dataResp = {
        actualQty,
        planQty,
        percent: (CheckNilai(actualQty) / CheckNilai(planQty)) * 100,
        planVsActual: getPlanVsAct,
      };

      return res.status(200).json({
        data: dataResp,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard",
      data: error,
    });
  }
};

export const getCutDeptSewingWip = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) return res.status(404).json({ message: "Pls select date" });

    const getSewingWip = await db.query(qryGetWipSite, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    if (getSewingWip.length > 0) {
      let dataChart = [
        {
          name: "Pcs",
          data: getSewingWip.map((item) => ({
            x: item.SITE,
            y: item.WIP,
          })),
        },
      ];

      const arrColor = getSewingWip.map((item) =>
        CheckNilaiToint(item.WIP) < CheckNilaiToint(item.TARGET_WIP)
          ? "#ffc521"
          : "#2164ff"
      );

      return res.status(200).json({
        data: { dataChart, arrColor },
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data wip sewing",
      data: error,
    });
  }
};

export const getCutDeptPrepWip = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) return res.status(404).json({ message: "Pls select date" });

    const prepBlc = await db.query(qryPrepBalance, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    if (prepBlc.length > 0) {
      let dataChart = [
        {
          name: "Pcs",
          data: prepBlc.map((item) => ({
            x: item.SITE,
            y: CheckNilaiToint(item.WIP),
            goals: [
              {
                name: "Min Qty",
                value: parseInt(item.TARGET_WIP),
                strokeHeight: 5,
                strokeColor: "#ff1010",
              },
            ],
          })),
        },
      ];

      const arrColor = prepBlc.map((item) =>
        CheckNilaiToint(item.WIP) < CheckNilaiToint(item.TARGET_WIP)
          ? "#ffc521"
          : "#2164ff"
      );

      return res.status(200).json({
        data: { dataChart, arrColor },
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data wip sewing",
      data: error,
    });
  }
};

export const getCutDeptWipProccess = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) return res.status(404).json({ message: "Pls select date" });

    const getCutWip = await db.query(qryWipQtyDept, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    if (getCutWip.length > 0) {
      const wipMol = SumByColoum(getCutWip, "MOL_WIP");
      const supWip = SumByColoum(getCutWip, "SUP_WIP");
      const loadMol = SumByColoum(getCutWip, "LOAD_WIP");

      let dataChart = [
        {
          name: "Pcs",
          data: [
            {
              x: "Molding",
              y: wipMol,
            },
            {
              x: "Spr.Mrkt",
              y: supWip,
            },
            {
              x: "Preparation",
              y: loadMol,
            },
          ],
        },
      ];

      const arrColor = dataChart.map((item) => "#2164ff");

      return res.status(200).json({
        data: { dataChart, arrColor, wipBySite: getCutWip },
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data wip sewing",
      data: error,
    });
  }
};

export const getLowWipLoad = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) return res.status(404).json({ message: "Pls select date" });


    const getWipLoadLine = await db.query(findSiteLineLowWipPrep, {
      replacements: { ldate : date },
      type: QueryTypes.SELECT,
    });
    const siteLine = await db.query(qrySiteLineCount, {
      type: QueryTypes.SELECT,
    });

    if (getWipLoadLine.length > 0) {
      let dataChart = [
        {
          name: "Pcs",
          data: siteLine.map((st) => ({
            x: st.SITE,
            y:
              getWipLoadLine.find((item) => item.SITE === st.SITE)
                ?.COUNT_LINE || 0,
          })),
        },
      ];

      const countLine = Math.max(...getWipLoadLine.map((item) => item.LINE));

      const arrColor = dataChart.map((item) => "#FFAE22");

      return res.status(200).json({
        data: { dataChart, arrColor, countLine },
      });
    }else{
      return res.status(201).json({
        message: 'No Data',
      });
      
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data wip loading line",
      data: error,
    });
  }
};

export const getDetailCutOutput = async (req, res) => {
  try {
    // const { date, site, shift, customers, style, line } = req.query;

    //gunakan query untuk mendapatkan string query params(handle filter site dll)
    const queryString = getQueryStringCutDept(req.query);
    //dapatkan full query
    const whereQuery = qryBaseDtailBanner(queryString);

    //dapatkan data hari ini
    const dataDash = await db.query(whereQuery, {
      type: QueryTypes.SELECT,
    });

    if (dataDash.length > 0) {
      const productTypeMol = ["BRA", "SHAPEWEAR", "BODY"];
      const globalCutOutput = dataDash.filter((item) => {
        if (
          item.TRANSACTION === "SUPERMARKET" &&
          !productTypeMol.includes(item.PRODUCT_TYPE)
        ) {
          return item;
        }
        if (
          item.TRANSACTION === "MOLDING"
          //  &&
          // productTypeMol.includes(item.PRODUCT_TYPE)
        ) {
          return item;
        }
      });

      return res.status(200).json({
        data: globalCutOutput,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard detail",
      data: error,
    });
  }
};

export const getMolSupSewDtl = async (req, res) => {
  try {
    // const { date, site, shift, customers, style, line } = req.query;

    //gunakan query untuk mendapatkan string query params(handle filter site dll)
    const queryString = getQueryStringCutDept(req.query);
    //dapatkan full query
    const whereQuery = createQueryDash(queryString);

    //dapatkan data hari ini
    const dataDash = await db.query(whereQuery, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      data: dataDash,
    });
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard detail",
      data: error,
    });
  }
};

export const getPlanVSactDtl = async (req, res) => {
  try {
    const { date, site } = req.query;
    let stringQryPlan = `cs.CUT_LOAD_DATE = '${date}'`;
    let stringQryActual = `lcd.TRANS_DATE = '${date}'`;

    if (site) {
      stringQryPlan = stringQryPlan + ` AND csl.CUT_SITE_NAME = '${site}'`;
      stringQryActual = stringQryActual + ` AND lcd.CUT_SITE ='${site}' `;
    }

    const qryPlanActual = qrySewInSiePerLine(stringQryPlan, stringQryActual);

    const getPlanVsAct = await db.query(qryPlanActual, {
      type: QueryTypes.SELECT,
    });

    if (getPlanVsAct.length > 0) {
      const baseD = getPlanVsAct.map((item) => ({
        x: item.LINE_NAME,
        y: item.ACTUAL_QTY,
        fillColor:
          parseInt(CheckNilai(item.ACTUAL_QTY)) <
          parseInt(CheckNilai(item.PLAN_QTY))
            ? "#D7263D"
            : "#4CAF50",
      }));

      const dataTarget = getPlanVsAct.map((item) => ({
        x: item.SITE,
        y: item.PLAN_QTY,
        fillColor: "#4CAF50",
      }));

      const dataChart = [
        {
          name: "Sewing IN QTY",
          type: "column",
          data: baseD,
        },
        {
          name: "Target Qty",
          type: "scatter",
          data: dataTarget,
        },
      ];
      return res.status(200).json({
        data: dataChart,
      });
    } else {
      return res.status(404).json({
        message: "Data not found",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard detail",
      data: error,
    });
  }
};

export const getWipPrepDtl = async (req, res) => {
  try {
    const { date, site } = req.query;

    const getWipPrepDtl = await db.query(qryGetWipPrepDtl, {
      replacements: {
        date,
        site,
      },
      type: QueryTypes.SELECT,
    });

    if (getWipPrepDtl.length > 0) {
      const dataCategory = getWipPrepDtl.map((item) => item.LINE_NAME);
      const dataSerWip = getWipPrepDtl.map((item) => ({
        x: "WIP Preparation",
        y: CheckNilaiToint(item.WIP),
        fillColor: parseInt(CheckNilai(item.WIP)) <= 50 ? "#D7263D" : "#FEB019",
      }));

      const dataSerWipSew = getWipPrepDtl.map((item) => ({
        x: "WIP Sewing",
        y: CheckNilaiToint(item.WIP_SEWING),
        fillColor:
          parseInt(CheckNilai(item.WIP_SEWING)) <= 50 ? "#D7263D" : "#008FFB",
      }));

      const series = [
        {
          name: "WIP Preparation",
          data: dataSerWip,
        },
        {
          name: "WIP Sewing",
          data: dataSerWipSew,
        },
      ];
      getWipPrepDtl.sort((a, b) => a.WIP - b.WIP);

      return res.status(200).json({
        data: { series, dataCategory, sourceData: getWipPrepDtl },
      });
    } else {
      return res.status(404).json({
        message: "Data not found",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data cut dashboard detail",
      data: error,
    });
  }
};

// get view when click wip molding bar

export const getWipMolChartClick = async (req, res) => {
  try {
    const { date, type } = req.query;

    if (!date) return res.status(404).json({ message: "Pls select date" });
    if (!type) return res.status(404).json({ message: "Pls select type" });

    let queryWip = qryGetDtlWipMolSite; //default molding

    if (type === "supermarket") {
      queryWip = qryGetDtlWipSupSite;
    }

    if (type === "preparation") {
      queryWip = qryGetDtlWipSupSite;
    }

    const getWipLoadLine = await db.query(queryWip, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    const siteLine = await db.query(qrySiteLineCount, {
      type: QueryTypes.SELECT,
    });

    if (getWipLoadLine.length > 0) {
      let dataChart = [
        {
          name: "Qty",
          data: siteLine.map((st) => ({
            x: st.SITE,
            y:
              CheckNilaiToint(
                getWipLoadLine.find((item) => item.SITE === st.SITE)?.WIP
              ) || 0,
          })),
        },
      ];

      // const countLine = Math.max(...getWipLoadLine.map((item) => item.LINE));

      const arrColor = dataChart.map((item) => "#FFAE22");

      return res.status(200).json({
        data: { dataChart, arrColor },
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      success: false,
      message: "error request get data wip cut",
      data: error,
    });
  }
};
