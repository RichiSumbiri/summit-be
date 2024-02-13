import { QueryTypes, where } from "sequelize";
import db from "../../../config/database.js";
import {
  qryViewSchSewingForCutting,
  getSewingSchSize,
  CutingLoadingSchedule,
  CutingLoadingSchSize,
  queryGetSchCutLoad,
  qryGetCutSchSize,
  qryCutingSchDetail,
  CuttingSchDetails,
  qryCekQtyCutSch,
  findOneScanIn,
} from "../../../models/planning/cuttingplan.mod.js";
import { CuttinScanSewingIn } from "../../../models/production/cutting.mod.js";
import Moment from "moment";
import momentRange from "moment-range";
const moment = momentRange.extendMoment(Moment);

export const getSchSewForCut = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(qryViewSchSewingForCutting, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(getSewingSchSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: { weekSchHead, weekSchSize } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getCuttingSchedule = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(queryGetSchCutLoad, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(qryGetCutSchSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const getSchDetail = await db.query(qryCutingSchDetail, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchDetail =
      getSchDetail?.map((sch) => ({
        ...sch,
        LOAD_STATUS: sch.LOADING_QTY ? true : false,
      })) || [];

    return res.json({ data: { weekSchHead, weekSchSize, weekSchDetail } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

export const postSewToCutSchd = async (req, res) => {
  try {
    const { arrPlanSew, arrPlanSize } = req.body;

    if (!arrPlanSew)
      return res.status(404).json({
        message: "Tidak ada data schedule untuk di post",
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
        CUT_ADD_ID: arr.CUT_ADD_ID,
        CUT_MOD_ID: arr.CUT_MOD_ID,
      };

      if (!arr.CUT_ID) {
        const creatData = await CutingLoadingSchedule.create(dataCutSch);
        await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, creatData.CUT_ID);
      } else {
        await CutingLoadingSchedule.update(dataCutSch, {
          where: {
            CUT_ID: arr.CUT_ID,
          },
        });
        await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, arr.CUT_ID);
      }

      if (i + 1 === arrPlanSew.length) {
        return res.status(200).json({ message: "Success Post" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika post data schedule",
      data: error,
    });
  }
};

//controler post data schedule size
async function postSewToCutSchdSize(arraySize, schId, cutId) {
  try {
    const filterArrSize = arraySize.filter(
      (arrSize) => arrSize.SCH_ID === schId
    );

    if (filterArrSize.length === 0) return [];

    const arrPlan = filterArrSize.map((arrSize) => ({
      CUT_ID: cutId,
      CUT_ID_SIZE: arrSize.CUT_ID_SIZE || null,
      CUT_SCH_ID_SIZE: arrSize.SCH_SIZE_ID,
      CUT_SCH_ID: arrSize.SCH_ID,
      CUT_ID_SITELINE: arrSize.SCH_ID_SITELINE,
      CUT_SEW_SCH_QTY: arrSize.SCH_SIZE_QTY,
      CUT_SEW_SIZE_CODE: arrSize.SIZE_CODE,
      CUT_ADD_ID: arrSize.CUT_ADD_ID,
      CUT_MOD_ID: arrSize.CUT_MOD_ID,
    }));

    for (const [i, arr] of arrPlan.entries()) {
      if (!arr.CUT_ID_SIZE) {
        await CutingLoadingSchSize.create(arr);
      } else {
        await CutingLoadingSchSize.update(arr, {
          where: {
            CUT_ID_SIZE: arr.CUT_ID_SIZE,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const PostDetailCutSch = async (req, res) => {
  try {
    const dataPost = req.body;
    const findDataAll = await CuttingSchDetails.findAll({
      where: {
        CUT_SCH_ID: dataPost.CUT_SCH_ID,
        // CUT_LOAD_DATE: dataPost.CUT_LOAD_DATE,
        CUT_ID_SIZE: dataPost.CUT_ID_SIZE,
      },
      attributes: [
        "CUT_ID_DETAIL",
        "CUT_LOAD_DATE",
        "CUT_ID_SIZE",
        "CUT_SCH_ID",
        "CUT_SCH_QTY",
      ],
      raw: true, // <--- HERE
    });

    const findSizes = await CutingLoadingSchSize.findOne({
      where: {
        CUT_ID_SIZE: dataPost.CUT_ID_SIZE,
      },
    });

    let sewSchQty = findSizes.CUT_SEW_SCH_QTY ? findSizes.CUT_SEW_SCH_QTY : 0;
    let cutSchQty =
      findDataAll.reduce((sum, item) => sum + item["CUT_SCH_QTY"], 0) || 0;

    //check jumlah yang sudah di sew schd dan jmlh cutting sch
    let findData =
      findDataAll.filter(
        (dts) => dts.CUT_LOAD_DATE === dataPost.CUT_LOAD_DATE
      )[0] || null;

    //untuk kompare waktu
    const schDate = moment(dataPost.CUT_LOAD_DATE, "YYYY-MM-DD").add(
      1,
      "hours"
    );
    const currentDate = moment();
    currentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }); // untuk menghindari tidak bisa input schedule hari ini

    // jika terdapat data schdid size
    if (findDataAll.length > 0) {
      if (dataPost.CUT_SCH_QTY === "" && findData.CUT_ID_DETAIL) {
        if (schDate.isBefore(currentDate))
          return res.status(404).json({
            message: "Tidak Bisa Delete Schedule ditanggal sebelum hari ini",
          });

        await CuttingSchDetails.destroy({
          where: {
            CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
          },
        });
        //delete start and finish
        funcUpdateDate(dataPost.CUT_SCH_ID);
        return res
          .status(200)
          .json({ status: "delete", message: "success delete" });
      }

      // jika update
      if (findData && dataPost.CUT_SCH_QTY) {
        //jumlah oSchd cutting yang ada di kurang-findData

        const currentQty =
          parseInt(cutSchQty) -
          findData.CUT_SCH_QTY +
          parseInt(dataPost.CUT_SCH_QTY);
        console.log(currentQty);
        if (currentQty > sewSchQty)
          return res.status(404).json({
            message: "Tidak Bisa melebihi QTY Schedule Sewing",
          });

        await CuttingSchDetails.update(dataPost, {
          where: {
            CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
          },
        });
        funcUpdateDate(dataPost.CUT_SCH_ID);

        return res.status(200).json({
          status: "modify",
          message: "Successfully modified",
        });
      }
    }

    const currentQty = parseInt(cutSchQty) + parseInt(dataPost.CUT_SCH_QTY);
    // console.log(currentQty);

    if (currentQty > sewSchQty)
      return res.status(404).json({
        message: "Tidak Bisa melebihi QTY Schedule Sewing",
      });

    if (schDate.isBefore(currentDate))
      return res.status(404).json({
        message: "Tidak Bisa Add Schedule ditanggal sebelum hari ini",
      });

    await CuttingSchDetails.create(dataPost);
    funcUpdateDate(dataPost.CUT_SCH_ID);
    return res
      .status(200)
      .json({ status: "create", message: "success tambahkan data" });
  } catch (error) {
    res.status(404).json({
      message: "Terdapat error ketika post data detail schedule",
      data: error,
    });
  }
};

//function untuk update data start dan end date
const funcUpdateDate = async (schdId) => {
  try {
    // Mendapatkan baris pertama
    const firstRow = await CuttingSchDetails.findOne({
      where: {
        CUT_SCH_ID: schdId,
      },
      order: [["CUT_LOAD_DATE", "ASC"]],
    });

    // Mendapatkan baris terakhir
    const lastRow = await CuttingSchDetails.findOne({
      where: {
        CUT_SCH_ID: schdId,
      },
      order: [["CUT_LOAD_DATE", "DESC"]],
    });

    let updateDate = {
      CUT_LOADING_START: firstRow.CUT_LOAD_DATE ? firstRow.CUT_LOAD_DATE : null,
      CUT_LOADING_FINISH: lastRow.CUT_LOAD_DATE ? lastRow.CUT_LOAD_DATE : null,
    };

    // console.log(schdId);

    return await CutingLoadingSchedule.update(updateDate, {
      where: {
        CUT_SCH_ID: schdId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const delHeadCutSch = async (req, res) => {
  try {
    const { cutSch } = req.params;
    if (!cutSch)
      return res.status(404).json({ message: "Tidak ada id schedule" });

    const checkLoading = await CuttinScanSewingIn.findOne({
      where: { SCH_ID: cutSch },
    });

    if (checkLoading)
      return res
        .status(404)
        .json({ message: "Tidak dapat di delete, Sudah terdapat loading" });

    const deleteSchHead = await CutingLoadingSchedule.destroy({
      where: {
        CUT_SCH_ID: cutSch,
      },
    });

    if (deleteSchHead) {
      await CuttingSchDetails.destroy({
        where: {
          CUT_SCH_ID: cutSch,
        },
      });
      await CutingLoadingSchSize.destroy({
        where: {
          CUT_SCH_ID: cutSch,
        },
      });
    }

    return res.json({ message: "Schedule Telah Di Hapus" });
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "Terdapat error ketika Delete schedule",
      data: error,
    });
  }
};

export const delHeadCutSchSize = async (req, res) => {
  try {
    const { cutSch, sizeCode } = req.params;

    if (!cutSch)
      return res.status(404).json({ message: "Tidak ada id schedule" });

    const checkLoading = await db.query(findOneScanIn, {
      replacements: { cutSch, sizeCode },
      type: QueryTypes.SELECT,
    });

    if (checkLoading.length > 0)
      return res
        .status(404)
        .json({ message: "Tidak dapat di delete, Sudah terdapat loading" });

    const findIdSize = await CutingLoadingSchSize.findAll({
      where: {
        CUT_SCH_ID: cutSch,
        CUT_SEW_SIZE_CODE: sizeCode,
      },
      raw: true, // <--- HERE
    });

    //cari list id size untuk delete detail karena detail tidak memiliki sizecode
    const listIdSize = findIdSize.map((schZ) => schZ.CUT_ID_SIZE);
    const deleteSchZ = await CutingLoadingSchSize.destroy({
      where: {
        CUT_ID_SIZE: listIdSize,
      },
    });

    if (deleteSchZ) {
      await CuttingSchDetails.destroy({
        where: {
          CUT_ID_SIZE: listIdSize,
        },
      });
    }

    return res.json({ message: "Schedule Telah Di Hapus" });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika Delete schedule",
      data: error,
    });
  }
};
