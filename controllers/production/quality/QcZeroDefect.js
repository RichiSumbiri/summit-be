import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

import {
  QryDataZdDeail,
  QryDataZdHeader,
  QryListLineZd,
  QryListSiteZd,
  QryPoNoSoruce,
  QryZdDetailForCombain,
  QueryListDefPvh,
  ZeroDefectDetail,
  ZeroDefectHeader,
} from "../../../models/production/qcZeroDefect.mod.js";

//get list site ZD
export const getListSiteZd = async (req, res) => {
  try {
    const llistSiteZd = await db.query(QryListSiteZd, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: llistSiteZd,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list site zd",
      data: error,
    });
  }
};

export const getListDefPvh = async (req, res) => {
  try {
    const defListPvh = await db.query(QueryListDefPvh, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    if (defListPvh.length > 0) {
      const defWithId = defListPvh.map((def, i) => ({ ...def, id: i + 1 }));
      return res.status(200).json({
        success: true,
        data: defWithId,
      });
    }

    return res.status(400).json({
      success: true,
      message: "NO Data Defect",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list def zd",
      data: error,
    });
  }
};

export const getListLineZd = async (req, res) => {
  try {
    const llistSiteZd = await db.query(QryListLineZd, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: llistSiteZd,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list line zd",
      data: error,
    });
  }
};

export const getPoSearchZd = async (req, res) => {
  try {
    const { search } = req.query;

    const listPoData = await db.query(QryPoNoSoruce, {
      replacements: { search: `%${search}%` },
      type: QueryTypes.SELECT,
    });

    let poWithId = [];
    if (listPoData.length > 0) {
      poWithId = listPoData.map((dta, i) => {
        return { ...dta, id: i + 1 };
      });
      return res.status(200).json({
        success: true,
        data: poWithId,
      });
    }
    return res.status(200).json({
      success: true,
      data: poWithId,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list po zd",
      data: error,
    });
  }
};

export const getDataHeaderZd = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const dataHeaderZd = await db.query(QryDataZdHeader, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    const dataDetail = await db.query(QryZdDetailForCombain, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    if (dataHeaderZd.length < 0) {
      return res.status(400).json({
        success: true,
        message: "Data Tidak Ditemukan",
      });
    }

    const reStruktur = dataDetail.reduce((acc, obj) => {
      const { ID_ZD, ZD_DEFECT_CODE, ZD_DEFECT_QTY } = obj;

      // Jika objek dengan ID_ZD tersebut sudah ada dalam hasil, tambahkan properti baru
      if (acc[ID_ZD]) {
        acc[ID_ZD][ZD_DEFECT_CODE] = parseInt(ZD_DEFECT_QTY);
      } else {
        // Jika belum, buat objek baru dengan properti ID_ZD
        acc[ID_ZD] = {
          ID_ZD: parseInt(ID_ZD),
          [ZD_DEFECT_CODE]: parseInt(ZD_DEFECT_QTY),
        };
      }

      return acc;
    }, {});

    // // Ubah hasil dari objek menjadi array
    // const finalResult = Object.values(reStruktur);

    const joinDataHeader = dataHeaderZd.map((head) => {
      const headIdString = head.ID_ZD.toString();
      const newDetail = reStruktur[headIdString];
      if (newDetail) {
        return { ...head, ...newDetail };
      } else {
        return head;
      }
    });

    return res.status(200).json({
      success: true,
      data: joinDataHeader,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list po zd",
      data: error,
    });
  }
};

export const getDataDetailZd = async (req, res) => {
  try {
    const { zdId } = req.params;

    const dataDetail = await db.query(QryDataZdDeail, {
      replacements: { zdId },
      type: QueryTypes.SELECT,
    });

    if (dataDetail.length < 0) {
      return res.status(400).json({
        success: true,
        message: "Data Tidak Ditemukan",
      });
    }
    return res.status(200).json({
      success: true,
      data: dataDetail,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data detail zd",
      data: error,
    });
  }
};

export const posDataZd = async (req, res) => {
  try {
    const { dataHeader, dataDetail } = req.body;

    if (!dataHeader)
      return res
        .status(400)
        .json({ message: "Tidak Ada Data Header Atau Detail " });

    const postDataHeader = await ZeroDefectHeader.create(dataHeader);

    if (postDataHeader && dataDetail) {
      const idHeader = postDataHeader.ID_ZD;
      const dataDetailWithId = dataDetail.map((dt) => ({
        ...dt,
        ID_ZD: idHeader,
      }));

      const postDetail = await ZeroDefectDetail.bulkCreate(dataDetailWithId);
      if (postDetail) {
        return res
          .status(200)
          .json({ status: "success", message: "Data Telah Ditambahkan" });
      }
    }

    return res
      .status(200)
      .json({ status: "success", message: "Data Telah Ditambahkan" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post data ZD",
      data: error,
    });
  }
};

export const deleteDataZd = async (req, res) => {
  try {
    const { zdId } = req.params;

    if (!zdId)
      return res
        .status(400)
        .json({ message: "Tidak Ada Data Header Atau Detail " });

    const delHeader = await ZeroDefectHeader.destroy({
      where: {
        ID_ZD: zdId,
      },
    });

    if (delHeader) {
      const deleteDetail = await ZeroDefectDetail.destroy({
        where: {
          ID_ZD: zdId,
        },
      });
      if (deleteDetail) {
        return res
          .status(200)
          .json({ status: "success", message: "Data Telah Didelete" });
      }
      return res
        .status(200)
        .json({ status: "success", message: "Data Telah Didelete" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post data ZD",
      data: error,
    });
  }
};

export const updateDataZd = async (req, res) => {
  try {
    const { dataHeader, dataDetail } = req.body;

    if (!dataHeader)
      return res
        .status(400)
        .json({ message: "Tidak Ada Data Header Atau Detail " });

    const updateHeader = await ZeroDefectHeader.update(dataHeader, {
      where: {
        ID_ZD: dataHeader.ID_ZD,
      },
    });

    if (updateHeader && dataDetail) {
      const idHeader = dataHeader.ID_ZD;
      await ZeroDefectDetail.destroy({
        where: {
          ID_ZD: idHeader,
        },
      });

      const dataDetailWithId = dataDetail.map((dt) => ({
        ...dt,
        ID_ZD: idHeader,
      }));

      const postDetail = await ZeroDefectDetail.bulkCreate(dataDetailWithId);
      if (postDetail) {
        return res
          .status(200)
          .json({ status: "success", message: "Data Telah Ditambahkan" });
      }
    }

    return res.status(400).json({
      success: true,
      message: "NO Data Defect",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post data ZD",
      data: error,
    });
  }
};
