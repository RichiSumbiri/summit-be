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
} from "../../../models/planning/cuttingplan.mod.js";

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
        const updatData = await CutingLoadingSchedule.update(dataCutSch, {
          where: {
            CUT_ID: arr.CUT_ID,
          },
        });
        await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, updatData.CUT_ID);
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
    const findData = await CuttingSchDetails.findOne({
      where: {
        CUT_SCH_ID: dataPost.CUT_SCH_ID,
        CUT_LOAD_DATE: dataPost.CUT_LOAD_DATE,
        CUT_ID_SIZE: dataPost.CUT_ID_SIZE,
      },
    });

    if (dataPost.CUT_SCH_QTY === "" && findData.CUT_ID_DETAIL) {
      console.log("lewat delete");
      await CuttingSchDetails.destroy({
        where: {
          CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
        },
      });
      return res
        .status(200)
        .json({ status: "delete", message: "success delete" });
    }

    if (findData && dataPost.CUT_SCH_QTY) {
      await CuttingSchDetails.update(dataPost, {
        where: {
          CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
        },
      });
      return res.status(200).json({
        status: "modify",
        message: "Successfully modified",
      });
    }
    await CuttingSchDetails.create(dataPost);
    return res
      .status(200)
      .json({ status: "create", message: "success tambahkan data" });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika post data detail schedule",
      data: error,
    });
  }
};
