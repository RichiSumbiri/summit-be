import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
//dashboard cutting
import { CheckNilai, totalCol } from "../../util/Utility.js";
import moment from "moment/moment.js";
import {
  createQueryDash,
  qryGetCutLastDate,
} from "../../../models/production/cutting.mod.js";
import { SumByColoum } from "./DashYtd.js";

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


    const joinDataDash = {
      ...currentData,
      ...lastDateData,
      // cutOutDiff : (currentData.cutOutQty/lastDateData.cutOutQty)
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
  const { date, site, shift, customers, style, line } = query;

  let queryString = `lcd.TRANS_DATE = '${date}'`;

  if (site) {
    const sites = site
      .split(",")
      .map((st) => `'${st}'`)
      .join(",");
    queryString = queryString + ` AND lcd.SITE_NAME IN (${sites})`;
  }
  if (shift) {
    const shifts = shift
      .split(",")
      .map((st) => `'${st}'`)
      .join(",");
    queryString = queryString + ` AND lcd.SHIFT IN (${shifts})`;
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
      item.TRANSACTION === "MOLDING" &&
      productTypeMol.includes(item.PRODUCT_TYPE)
    ) {
      return item;
    }
  });
  console.log(globalCutOutput);

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
