import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryDefRetDash,
  QueryGet3Part,
  QueryGet3topDef,
  QueryMainSewDash,
  QueryMainSewDashPast,
} from "../../../models/dashAnalitycs/mainDashSew.js";
import { CheckNilai, findRTT, totalCol } from "../../util/Utility.js";
import moment from "moment/moment.js";
import { dbSlave1 } from "../../../config/dbAudit.js";

//query get data All size dash
export const getDataAllSiteDash = async (req, res, next) => {
  try {
    const { date, site, shift, customers } = req.query;
    // const dynamicParams = req.query;
    // const schDate = date;

    const sites = site ? site.split(",") : false;
    const shifts = shift ? shift.split(",") : false;
    let customerx = false;
    // console.log(req.query);

    if (customers) {
      customerx = customers.split("-");
    }
    // console.log(customerx);

    // console.log(date);
    // console.log(sites);
    // console.log(shifts);
    // console.log(customers);

    const today = moment().format("YYYY-MM-DD");

    let queryEff = today === date ? QueryMainSewDash : QueryMainSewDashPast;

    const detailDataDash = await dbSlave1.query(queryEff, {
      replacements: {
        schDate: date,
      },
      type: QueryTypes.SELECT,
    });

    // console.log(detailDataDash);
    if (detailDataDash.length > 0) {
      const resultFilter = filtersData(
        detailDataDash,
        sites,
        shifts,
        customerx
      );
      // console.log(detailDataDash);

      req.resultFilter = resultFilter;
      return next();
    } else {
      return res.status(200).json({
        success: false,
        dataCards: [],
        dataBySite: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};

function compareLine(a, b) {
  if (a.ID_SITELINE < b.ID_SITELINE) {
    return -1;
  }
  if (a.ID_SITELINE > b.ID_SITELINE) {
    return 1;
  }
  return 0;
}

//get data summary by line, untuk mencari nilai RTT tiap line sehingga bisa mencari eff berdasarkan line
export const sumByLine = async (req, res, next) => {
  try {
    const dataDash = req.resultFilter;
    const dataByLine = [
      ...dataDash
        .reduce((distLine, current) => {
          const { ID_SITELINE } = current;
          const grouped = distLine.get(ID_SITELINE);
          // console.log(grouped);
          if (!grouped) {
            distLine.set(ID_SITELINE, {
              ...current,
              RTT: chkNilaFlt(current.RTT),
              RTT_OT: chkNilaFlt(current.RTT_OT),
              RTT_X_OT: chkNilaFlt(current.RTT_X_OT),
              ACTUAL_EH: chkNilaFlt(current.ACTUAL_EH),
              ACTUAL_EH_OT: chkNilaFlt(current.ACTUAL_EH_OT),
              ACTUAL_EH_X_OT: chkNilaFlt(current.ACTUAL_EH_X_OT),
              ACTUAL_AH: chkNilaFlt(current.ACTUAL_AH),
              ACTUAL_AH_OT: chkNilaFlt(current.ACTUAL_AH_OT),
              ACTUAL_AH_X_OT: chkNilaFlt(current.ACTUAL_AH_X_OT),
              ACT_TARGET: chkNilaFlt(current.ACT_TARGET),
              TPPM_NORMAL: chkNilaFlt(current.TPPM_NORMAL),
              TOTAL_TARGET: chkNilaFlt(current.TOTAL_TARGET),
              TOTAL_OUTPUT: chkNilaFlt(current.TOTAL_OUTPUT),
            });
          } else {
            distLine.set(ID_SITELINE, {
              ...grouped,
              RTT: chkNilaFlt(grouped.RTT) + chkNilaFlt(current.RTT),
              RTT_OT: chkNilaFlt(grouped.RTT_OT) + chkNilaFlt(current.RTT_OT),
              RTT_X_OT:
                chkNilaFlt(grouped.RTT_X_OT) + chkNilaFlt(current.RTT_X_OT),
              ACTUAL_EH:
                chkNilaFlt(grouped.ACTUAL_EH) + chkNilaFlt(current.ACTUAL_EH),
              ACTUAL_EH_OT:
                chkNilaFlt(grouped.ACTUAL_EH_OT) +
                chkNilaFlt(current.ACTUAL_EH_OT),
              ACTUAL_EH_X_OT:
                chkNilaFlt(grouped.ACTUAL_EH_X_OT) +
                chkNilaFlt(current.ACTUAL_EH_X_OT),
              ACTUAL_AH:
                chkNilaFlt(grouped.ACTUAL_AH) + chkNilaFlt(current.ACTUAL_AH),
              ACTUAL_AH_OT:
                chkNilaFlt(grouped.ACTUAL_AH_OT) +
                chkNilaFlt(current.ACTUAL_AH_OT),
              ACTUAL_AH_X_OT:
                chkNilaFlt(grouped.ACTUAL_AH_X_OT) +
                chkNilaFlt(current.ACTUAL_AH_X_OT),
              ACT_TARGET:
                chkNilaFlt(grouped.ACT_TARGET) + chkNilaFlt(current.ACT_TARGET),
              TPPM_NORMAL:
                chkNilaFlt(grouped.TPPM_NORMAL) +
                chkNilaFlt(current.TPPM_NORMAL),
              TOTAL_TARGET:
                chkNilaFlt(grouped.TOTAL_TARGET) +
                chkNilaFlt(current.TOTAL_TARGET),
              TOTAL_OUTPUT:
                chkNilaFlt(grouped.TOTAL_OUTPUT) +
                chkNilaFlt(current.TOTAL_OUTPUT),
            });
          }

          return distLine;
        }, new Map())
        .values(),
    ];

    //maping untuk mencari RTT
    // const dataDasrboard = dataByLine.map((site) => ({
    //   ...site,
    //   RTT: findRTT(
    //     site.SHIFT,
    //     site.STARTH,
    //     site.ENDH,
    //     site.SCHD_PROD_DATE,
    //     site.ACT_TARGET,
    //     site.TPPM_NORMAL
    //   ),
    // }));

    //get total manpower
    //filter data yang hanya memiliki act manpower
    const filterOnlyActMp = dataDash.filter((line) => line.ACT_MP !== null);
    //distinc atau ambil data tunggal tiap line
    let distSiteline = [
      ...new Map(
        filterOnlyActMp.map((item) => [item["ID_SITELINE"], item])
      ).values(),
    ];
    //lalu jumlahkan manpower
    const actlMp = totalCol(distSiteline, "ACT_MP");
    const planMp = totalCol(distSiteline, "PLAN_MP");
    req.ttlMP = { actlMp, planMp };
    req.dataDash = dataByLine;
    next();
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};

export const splitDataDashboard = async (req, res) => {
  try {
    const dataDash = req.dataDash;
    const resultCards = makeSumAll(dataDash);

    const dataBySite = [
      ...req.dataDash
        .reduce((distSite, current) => {
          const { SITE_NAME } = current;
          const grouped = distSite.get(SITE_NAME);
          // console.log(grouped);
          if (!grouped) {
            distSite.set(SITE_NAME, {
              ...current,
              RTT: chkNilaFlt(current.RTT),
              RTT_OT: chkNilaFlt(current.RTT_OT),
              RTT_X_OT: chkNilaFlt(current.RTT_X_OT),
              EH: chkNilaFlt(current.ACTUAL_EH),
              EH_OT: chkNilaFlt(current.ACTUAL_EH_OT),
              EH_XOT: chkNilaFlt(current.ACTUAL_EH_X_OT),
              AH: chkNilaFlt(current.ACTUAL_AH),
              AH_OT: chkNilaFlt(current.ACTUAL_AH_OT),
              AH_XOT: chkNilaFlt(current.ACTUAL_AH_X_OT),
              TOTAL_TARGET: chkNilaFlt(current.TOTAL_TARGET),
              TOTAL_OUTPUT: chkNilaFlt(current.TOTAL_OUTPUT),
            });
          } else {
            distSite.set(SITE_NAME, {
              ...grouped,
              RTT: chkNilaFlt(grouped.RTT) + chkNilaFlt(current.RTT),
              RTT_OT: chkNilaFlt(grouped.RTT_OT) + chkNilaFlt(current.RTT_OT),
              RTT_X_OT:
                chkNilaFlt(grouped.RTT_X_OT) + chkNilaFlt(current.RTT_X_OT),
              EH: chkNilaFlt(grouped.EH) + chkNilaFlt(current.ACTUAL_EH),
              EH_OT:
                chkNilaFlt(grouped.EH_OT) + chkNilaFlt(current.ACTUAL_EH_OT),
              EH_XOT:
                chkNilaFlt(grouped.EH_XOT) + chkNilaFlt(current.ACTUAL_EH_X_OT),
              AH: chkNilaFlt(grouped.AH) + chkNilaFlt(current.ACTUAL_AH),
              AH_OT:
                chkNilaFlt(grouped.AH_OT) + chkNilaFlt(current.ACTUAL_AH_OT),
              AH_XOT:
                chkNilaFlt(grouped.AH_XOT) + chkNilaFlt(current.ACTUAL_AH_X_OT),
              TOTAL_TARGET:
                chkNilaFlt(grouped.TOTAL_TARGET) +
                chkNilaFlt(current.TOTAL_TARGET),
              TOTAL_OUTPUT:
                chkNilaFlt(grouped.TOTAL_OUTPUT) +
                chkNilaFlt(current.TOTAL_OUTPUT),
            });
          }

          return distSite;
        }, new Map())
        .values(),
    ].map((site) => ({
      SITE_NAME: site.SITE_NAME,
      CUS_NAME: site.CUS_NAME,
      // ID_SITELINE: site.ID_SITELINE,
      TOTAL_RTT: site.RTT + site.RTT_OT + site.RTT_X_OT,
      TOTAL_EH: chkNilaiMin(site.EH + site.EH_OT + site.EH_XOT),
      TOTAL_AH: chkNilaiMin(site.AH + site.AH_OT + site.AH_XOT),
      TOTAL_TARGET: site.TOTAL_TARGET,
      TOTAL_OUTPUT: site.TOTAL_OUTPUT,
      VARIANCE:
        CheckNilai(site.TOTAL_TARGET) -
        (CheckNilai(site.RTT) +
          CheckNilai(site.RTT_OT) +
          CheckNilai(site.RTT_X_OT)),
    }));

    dataBySite.sort(compare);
    // console.log(dataBySite);

    return res.status(200).json({
      success: true,
      dataCards: resultCards,
      dataBySite: dataBySite,
      ttlMP: req.ttlMP,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};

// get data eff yesterday
export const getEffYtdOverAll = async (req, res) => {
  try {
    const { date, site, shift, customers } = req.query;

    const sites = site ? site.split(",") : false;
    const shifts = shift ? shift.split(",") : false;
    let customerx = false;

    if (customers) {
      customerx = customers.split("-");
    }

    const schdDateYes = findYesDate(date);

    const dataRefYes = await dbSlave1.query(QueryMainSewDashPast, {
      replacements: {
        schDate: schdDateYes,
      },
      type: QueryTypes.SELECT,
    });

    if (dataRefYes.length > 0) {
      const filterResult = filtersData(dataRefYes, sites, shifts, customerx);
      if (filterResult.length > 0) {
        const result = makeSumAll(filterResult);
        return res.status(200).json({
          success: true,
          dataYes: result,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        dataYes: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get yesterday",
      data: error,
    });
  }
};

// get data defrate
export const getDefRate = async (req, res) => {
  try {
    const { date, site, shift, customers } = req.query;

    const sites = site ? site.split(",") : false;
    const shifts = shift ? shift.split(",") : false;
    let customerx = false;

    if (customers) {
      customerx = customers.split("-");
    }

    const dataQCCheck = await dbSlave1.query(QueryDefRetDash, {
      replacements: {
        schDate: date,
      },
      type: QueryTypes.SELECT,
    });

    if (dataQCCheck.length > 0) {
      const filterResult = filtersData(dataQCCheck, sites, shifts, customerx);
      if (filterResult.length > 0) {
        const result = qcCheckSum(filterResult);
        return res.status(200).json({
          success: true,
          defRate: result,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        defRate: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get defrate",
      data: error,
    });
  }
};
// get data 3 topPart 3 top defect
export const getThreeTop = async (req, res) => {
  try {
    const { date, site, shift, customers } = req.query;

    const sites = site ? site.split(",") : false;
    const shifts = shift ? shift.split(",") : false;
    let customerx = false;

    if (customers) {
      customerx = customers.split("-");
    }

    const top3Def = await dbSlave1.query(QueryGet3topDef, {
      replacements: {
        schDate: date,
      },
      type: QueryTypes.SELECT,
    });
    const top3Part = await dbSlave1.query(QueryGet3Part, {
      replacements: {
        schDate: date,
      },
      type: QueryTypes.SELECT,
    });

    if (top3Def.length > 0) {
      const filterResultDef = filtersData(top3Def, sites, shifts, customerx);
      const filterResultPart = filtersData(top3Part, sites, shifts, customerx);
      if (filterResultDef.length > 0) {
        const resultDef = checkSumtTopDef(filterResultDef);
        const resultPart = checkSumtTopPart(filterResultPart);

        return res.status(200).json({
          success: true,
          topDef: resultDef,
          topPart: resultPart,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        topDef: [],
        topPart: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get defrate",
      data: error,
    });
  }
};

const chkNilaFlt = (nilai) => {
  const newNilai = parseFloat(nilai);
  if (!newNilai || isNaN(newNilai)) {
    return 0;
  } else {
    return newNilai;
  }
};

const chkNilaInt = (nilai) => {
  const newNilai = parseInt(nilai);
  if (!newNilai || isNaN(newNilai)) {
    return 0;
  } else {
    return newNilai;
  }
};
const chkNilaiMin = (nilai) => {
  const newNilai = chkNilaInt(nilai);
  if (newNilai < 0) {
    return 0;
  } else {
    return newNilai;
  }
};

//for sort line
function compare(a, b) {
  if (a.SITE_NAME < b.SITE_NAME) {
    return -1;
  }
  if (a.SITE_NAME > b.SITE_NAME) {
    return 1;
  }
  return 0;
}

//fin date yesterdaye
function findYesDate(tanggal) {
  const dayName = moment(tanggal).format("dddd");
  let newDate;

  if (dayName === "Monday") {
    newDate = moment(tanggal).subtract(2, "days");
  } else {
    newDate = moment(tanggal).subtract(1, "days");
  }

  return newDate.format("YYYY-MM-DD");
}

//funtion summery data overall
function makeSumAll(dataDash) {
  const dataCards = dataDash.reduce(
    (accumulator, current) => {
      const RTT = chkNilaFlt(accumulator.RTT) + chkNilaFlt(current.RTT);
      const RTT_OT =
        chkNilaFlt(accumulator.RTT_OT) + chkNilaFlt(current.RTT_OT);
      const RTT_X_OT =
        chkNilaFlt(accumulator.RTT_X_OT) + chkNilaFlt(current.RTT_X_OT);
      const EH = chkNilaFlt(accumulator.EH) + chkNilaFlt(current.ACTUAL_EH);
      const EH_OT =
        chkNilaFlt(accumulator.EH_OT) + chkNilaFlt(current.ACTUAL_EH_OT);
      const EH_XOT =
        chkNilaFlt(accumulator.EH_XOT) + chkNilaFlt(current.ACTUAL_EH_X_OT);
      const AH = chkNilaFlt(accumulator.AH) + chkNilaFlt(current.ACTUAL_AH);
      const AH_OT =
        chkNilaFlt(accumulator.AH_OT) + chkNilaFlt(current.ACTUAL_AH_OT);
      const AH_XOT =
        chkNilaFlt(accumulator.AH_XOT) + chkNilaFlt(current.ACTUAL_AH_X_OT);
      const TOTAL_TARGET =
        chkNilaFlt(accumulator.TOTAL_TARGET) + chkNilaFlt(current.TOTAL_TARGET);
      const TOTAL_OUTPUT =
        chkNilaInt(accumulator.TOTAL_OUTPUT) + chkNilaInt(current.TOTAL_OUTPUT);

      return {
        RTT: RTT,
        RTT_OT: RTT_OT,
        RTT_X_OT: RTT_X_OT,
        EH: EH,
        EH_OT: EH_OT,
        EH_XOT: EH_XOT,
        AH: AH,
        AH_OT: AH_OT,
        AH_XOT: AH_XOT,
        TOTAL_TARGET: TOTAL_TARGET,
        TOTAL_OUTPUT: TOTAL_OUTPUT,
        VARIANCE: TOTAL_OUTPUT - TOTAL_TARGET,
      };
    },
    {
      RTT: 0,
      RTT_OT: 0,
      RTT_X_OT: 0,
      EH: 0,
      EH_OT: 0,
      EH_XOT: 0,
      AH: 0,
      AH_OT: 0,
      AH_XOT: 0,
      TOTAL_TARGET: 0,
      TOTAL_OUTPUT: 0,
      VARIANCE: 0,
    }
  );

  return {
    TOTAL_RTT: dataCards.RTT + dataCards.RTT_OT + dataCards.RTT_X_OT,
    TOTAL_EH: dataCards.EH + dataCards.EH_OT + dataCards.EH_XOT,
    TOTAL_AH: dataCards.AH + dataCards.AH_OT + dataCards.AH_XOT,
    TOTAL_TARGET: dataCards.TOTAL_TARGET,
    TOTAL_OUTPUT: dataCards.TOTAL_OUTPUT,
    VARIANCE:
      CheckNilai(dataCards.TOTAL_OUTPUT) -
      (CheckNilai(dataCards.RTT) +
        CheckNilai(dataCards.RTT_OT) +
        CheckNilai(dataCards.RTT_X_OT)),
  };
}

//function filters
export function filtersData(data, sites, shifts, customerx) {
  if (data.length > 0) {
    if (sites && shifts && customerx) {
      const dataFilters = data.filter(
        (datadash) =>
          sites.includes(datadash.SITE_NAME) &&
          shifts.includes(datadash.SHIFT) &&
          customerx.includes(datadash.CUSTOMER_NAME)
      );
      return dataFilters;
    }
    if (sites && shifts) {
      const dataFilters = data.filter(
        (datadash) =>
          sites.includes(datadash.SITE_NAME) && shifts.includes(datadash.SHIFT)
      );
      return dataFilters;
    }

    if (sites) {
      const dataFilters = data.filter((datadash) =>
        sites.includes(datadash.SITE_NAME)
      );
      return dataFilters;
    }
    if (shifts) {
      const dataFilters = data.filter((datadash) =>
        shifts.includes(datadash.SHIFT)
      );
      return dataFilters;
    }
    if (customerx) {
      const dataFilters = data.filter((datadash) =>
        customerx.includes(datadash.CUSTOMER_NAME)
      );
      return dataFilters;
    }

    const result = data;
    return result;
  } else {
    return [];
  }
}

//function sum qc Check
function qcCheckSum(dataQC) {
  const defRate = dataQC.reduce(
    (accumulator, current) => {
      const GOOD = chkNilaInt(accumulator.GOOD) + chkNilaInt(current.GOOD);
      const CHECKED =
        chkNilaInt(accumulator.CHECKED) + chkNilaInt(current.CHECKED);
      const RFT = chkNilaInt(accumulator.RFT) + chkNilaInt(current.RFT);
      const DEFECT =
        chkNilaInt(accumulator.DEFECT) + chkNilaInt(current.DEFECT);
      const REPAIRED =
        chkNilaInt(accumulator.REPAIRED) + chkNilaInt(current.REPAIRED);
      const BS = chkNilaInt(accumulator.BS) + chkNilaInt(current.BS);

      return {
        GOOD: GOOD,
        CHECKED: CHECKED,
        RFT: RFT,
        DEFECT: DEFECT,
        REPAIRED: REPAIRED,
        BS: BS,
      };
    },
    {
      GOOD: 0,
      RFT: 0,
      DEFECT: 0,
      CHECKED: 0,
      REPAIRED: 0,
      BS: 0,
    }
  );

  return {
    DEFECT_RATE: chkNilaFlt((defRate.DEFECT / defRate.CHECKED) * 100)?.toFixed(
      2
    ),
  };
}

//function sum qc top def
function checkSumtTopDef(dataQC) {
  const dataTop = [
    ...dataQC
      .reduce((disDef, current) => {
        const { DEFECT_CODE } = current;
        const grouped = disDef.get(DEFECT_CODE);
        // console.log(grouped);
        if (!grouped) {
          disDef.set(DEFECT_CODE, {
            ...current,
            DEFECT_QTY: chkNilaInt(current.DEFECT_QTY),
          });
        } else {
          disDef.set(DEFECT_CODE, {
            ...grouped,
            DEFECT_QTY:
              chkNilaInt(grouped.DEFECT_QTY) + chkNilaInt(current.DEFECT_QTY),
          });
        }

        return disDef;
      }, new Map())
      .values(),
  ].map((def) => ({
    DEFECT_NAME: def.DEFECT_NAME,
    DEFECT_CODE: def.DEFECT_CODE,
    DEFECT_QTY: def.DEFECT_QTY,
  }));

  const shortTop = dataTop.sort((a, b) => {
    return b.DEFECT_QTY - a.DEFECT_QTY;
  });

  return shortTop.slice(0, 3);
}
//function sum qc top def
function checkSumtTopPart(dataQC) {
  const dataTop = [
    ...dataQC
      .reduce((disDef, current) => {
        const { PART_CODE } = current;
        const grouped = disDef.get(PART_CODE);
        // console.log(grouped);
        if (!grouped) {
          disDef.set(PART_CODE, {
            ...current,
            DEFECT_QTY: chkNilaInt(current.DEFECT_QTY),
          });
        } else {
          disDef.set(PART_CODE, {
            ...grouped,
            DEFECT_QTY:
              chkNilaInt(grouped.DEFECT_QTY) + chkNilaInt(current.DEFECT_QTY),
          });
        }

        return disDef;
      }, new Map())
      .values(),
  ].map((def) => ({
    PART_NAME: def.PART_NAME,
    PART_CODE: def.PART_CODE,
    DEFECT_QTY: def.DEFECT_QTY,
  }));

  const shortTop = dataTop.sort((a, b) => {
    return b.DEFECT_QTY - a.DEFECT_QTY;
  });

  return shortTop.slice(0, 3);
}
