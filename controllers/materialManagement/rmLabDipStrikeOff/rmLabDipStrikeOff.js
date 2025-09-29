import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import {
  dynamicCreateDeleteAction,
  getRawPagination,
} from "../../util/Query.js";
import db from "../../../config/database.js";
import { RMLabDipStrikeOff } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOff.mod.js";
import { RMLabDipStrikeOffSubmission } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffSubmission.mod.js";
import { RMLabDipStrikeOffApproval } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffApproval.mod.js";
import { RMLabDipStrikeOffStyle } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffStyle.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import colorChart from "../../../models/system/colorChart.mod.js";
import { Op, QueryTypes } from "sequelize";
import masterStatus from "../../../models/system/masterStatus.js";
import { MasterItemGroup } from "../../../models/setup/ItemGroups.mod.js";
import { ModelVendorDetail } from "../../../models/system/VendorDetail.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
  CustomerProgramName,
} from "../../../models/system/customer.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import { MasterItemCategories } from "../../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../../models/setup/ItemTypes.mod.js";

export const getRMLabDipStrikeOff = async (req, res) => {
  try {
    const {
      ITEM_TYPE,
      ITEM_CATEGORY,
      MATERIAL_ITEM_ID,
      FG_ITEM_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      CUSTOMER_SEASON_ID,
      CUSTOMER_PROGRAM_ID,
      APPROVAL_STATUS,
      EXPIRED_STATUS,
      page,
      limit,
    } = req.query;

    let whereClauses = [`a.DELETED_AT IS NULL`, `a.DELETED_BY IS NULL`];

    if (ITEM_TYPE) {
      whereClauses.push(`e.ITEM_TYPE_ID = '${ITEM_TYPE}'`);
    }
    if (ITEM_CATEGORY) {
      whereClauses.push(`e.ITEM_CATEGORY_ID = '${ITEM_CATEGORY}'`);
    }
    if (MATERIAL_ITEM_ID) {
      whereClauses.push(`a.MATERIAL_ITEM_ID = '${MATERIAL_ITEM_ID}'`);
    }
    if (FG_ITEM_ID) {
      whereClauses.push(`o.ITEM_ID = '${FG_ITEM_ID}'`);
    }
    if (CUSTOMER_ID) {
      whereClauses.push(`a.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`a.DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`a.SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_PROGRAM_ID) {
      whereClauses.push(`a.PROGRAM_ID = '${CUSTOMER_PROGRAM_ID}'`);
    }
    if (APPROVAL_STATUS) {
      whereClauses.push(`a.STATUS = '${APPROVAL_STATUS}'`);
    }
    if (EXPIRED_STATUS) {
      whereClauses.push(`a.EXPIRED_DATE < a.COMPLETED_AT`);
    }else {
      whereClauses.push(`a.EXPIRED_DATE >= a.COMPLETED_AT`);
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    const query = `
      SELECT 
          a.ID,
          a.CODE,
          a.MATERIAL_ITEM_ID,
          e.ITEM_CODE MATERIAL_ITEM_CODE,
          e.ITEM_DESCRIPTION MATERIAL_ITEM_DESCRIPTION,
          f.SERIAL_NO,
          n.COLOR_CODE,
          n.COLOR_DESCRIPTION, 
          a.PANTONE_COLOR,
          g.CTC_CODE CUSTOMER_CODE,
          i.CTPROD_DIVISION_CODE DIVISION_CODE,
          h.CTPROD_SESION_CODE SEASON_CODE,
          j.CTPROG_CODE PROGRAM_CODE,
          GROUP_CONCAT(DISTINCT o.ITEM_CODE SEPARATOR '/') AS STYLE_FG_ITEM,
          GROUP_CONCAT(DISTINCT p.COLOR_DESCRIPTION SEPARATOR '/') AS STYLE_FG_ITEM_COLOR,
          a.VENDOR_REF,
          k.VENDOR_NAME,
          a.IS_LAB_DIPS,
          a.IS_STRIKE_OFF,
          a.STATUS,
          a.COMPLETED_AT,
          l.USER_INISIAL COMPLETED_BY,
          a.EXPIRED_DATE,
          a.CUSTOMER_NOTE,
          m.USER_INISIAL CREATED_BY,
          a.CREATED_AT
      FROM rm_lab_dip_strike_off a
      INNER JOIN master_item_id e ON a.MATERIAL_ITEM_ID = e.ITEM_ID
      INNER JOIN master_item_dimension f ON a.DIM_ID = f.ID 
      INNER JOIN customer_detail g ON a.CUSTOMER_ID = g.CTC_ID
      INNER JOIN customer_product_season h ON a.SEASON_ID = h.CTPROD_SESION_ID
      INNER JOIN customer_product_division i ON a.DIVISION_ID = i.CTPROD_DIVISION_ID 
      INNER JOIN customer_program_name j ON a.PROGRAM_ID = j.CTPROG_ID 
      INNER JOIN vendor_detail k ON a.VENDOR_ID = k.VENDOR_ID
      LEFT JOIN xref_user_web l ON a.COMPLETED_BY = l.USER_ID
      INNER JOIN xref_user_web m ON a.CREATED_BY = m.USER_ID
      INNER JOIN master_color_chart n ON f.COLOR_ID = n.COLOR_ID 
      LEFT JOIN rm_lab_dip_strike_off_style s ON a.ID = s.RM_LAB_STRIKE_ID 
      LEFT JOIN master_item_id o ON s.FG_ITEM_ID = o.ITEM_ID
      LEFT JOIN master_color_chart p ON s.FG_COLOR_ID = p.COLOR_ID
      ${whereSQL}
      GROUP BY 
          a.ID, a.CODE, a.MATERIAL_ITEM_ID, e.ITEM_CODE, e.ITEM_DESCRIPTION,
          f.SERIAL_NO, n.COLOR_CODE, n.COLOR_DESCRIPTION, a.PANTONE_COLOR,
          g.CTC_CODE, i.CTPROD_DIVISION_CODE, h.CTPROD_SESION_CODE,
          j.CTPROG_CODE, a.VENDOR_REF, k.VENDOR_NAME, a.IS_LAB_DIPS,
          a.IS_STRIKE_OFF, a.STATUS, a.COMPLETED_AT, l.USER_INISIAL,
          a.EXPIRED_DATE, a.CUSTOMER_NOTE, m.USER_INISIAL
          ${getRawPagination(page, limit)}
    `;

    const rmLabDipStrikeOffData = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      rmLabDipStrikeOffData,
      "RM Lab Dip Strike Offs fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch RM Lab Dip Strike Offs data",
      500
    );
  }
};

export const createRMLabDipStrikeOff = async (req, res) => {
  const t = await db.transaction();
  try {
    const { header, user_id } = req.body;

    //header
    header.CREATED_BY = user_id;
    header.UPDATED_BY = user_id;
    await RMLabDipStrikeOff.create(header, {
      transaction: t,
    });

    await t.commit();

    return successResponse(
      res,
      [],
      "RM Lab Dip Strike Off created successfully",
      201
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to create RM Lab Dip Strike Off data",
      400
    );
  }
};

export const showRMLabDipStrikeOff = async (req, res) => {
  const t = await db.transaction();
  try {
    const { ID } = req.params;

    const rmLabDipStrikeOffData = await RMLabDipStrikeOff.findOne({
      where: { ID: ID },
      attributes: [
        "ID",
        "STATUS",
        "CODE",
        "IS_LAB_DIPS",
        "IS_STRIKE_OFF",
        "EXPIRED_DATE",
        "PANTONE_COLOR",
        "VENDOR_REF",
        "CUSTOMER_NOTE",
        "COMPLETED_AT",
        "CREATED_AT",
      ],
      include: [
        {
          model: MasterItemGroup,
          as: "group",
          required: true,
          attributes: ["ITEM_GROUP_ID", "ITEM_GROUP_DESCRIPTION"],
        },
        {
          model: MasterItemTypes,
          as: "type",
          required: true,
          attributes: ["ITEM_TYPE_ID", "ITEM_TYPE_DESCRIPTION"],
        },
        {
          model: MasterItemCategories,
          as: "category",
          required: true,
          attributes: ["ITEM_CATEGORY_ID", "ITEM_CATEGORY_DESCRIPTION"],
        },
        {
          model: MasterItemIdModel,
          as: "material",
          required: true,
          attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
        },
        {
          model: MasterItemDimensionModel,
          as: "dim",
          required: true,
          attributes: ["ID"],
          include: {
            model: colorChart,
            as: "MASTER_COLOR",
            required: true,
            attributes: ["COLOR_CODE", "COLOR_DESCRIPTION"],
          },
        },
        {
          model: CustomerDetail,
          as: "customer",
          required: true,
          attributes: ["CTC_ID", "CTC_CODE"],
        },
        {
          model: CustomerProductDivision,
          as: "division",
          required: true,
          attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE"],
        },
        {
          model: CustomerProductSeason,
          as: "season",
          required: true,
          attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE"],
        },
        {
          model: CustomerProgramName,
          as: "program",
          required: true,
          attributes: ["CTPROG_ID", "CTPROG_CODE"],
        },
        {
          model: ModelVendorDetail,
          as: "vendor",
          required: true,
          attributes: ["VENDOR_ID", "VENDOR_CODE", "VENDOR_NAME"],
        },
        {
          model: RMLabDipStrikeOffStyle,
          as: "styles",
          required: false,
          attributes: ["ID", "RM_LAB_STRIKE_ID", "FG_ITEM_ID", "FG_COLOR_ID"],
          include: [
            {
              model: MasterItemIdModel,
              as: "item",
              required: false,
              attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
            },
            {
              model: colorChart,
              as: "color",
              required: false,
              attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
            },
          ],
        },
        {
          model: RMLabDipStrikeOffApproval,
          as: "approvals",
          required: false,
          attributes: [
            "ID",
            "RM_LAB_STRIKE_ID",
            "SERIES_ID",
            "SERIES_NOTE",
            "SUBMISSION_DATE",
            "COMMENT_EXCPECT_DATE",
            "COMMENT_RECIEVED_DATE",
            "COMPLETED_AT",
          ],
          include: [
            {
              model: Users,
              as: "completed_by",
              required: false,
              attributes: [["USER_INISIAL", "COMPLETED_BY"]],
            },
            {
              model: RMLabDipStrikeOffSubmission,
              as: "submissions",
              required: false,
              attributes: [
                "ID",
                "RM_LAB_STRIKE__APPROVAL_ID",
                "SUBMIT_ID",
                "SUBMIT_CODE",
                "COMMENT_STATUS",
                "OBTAIN_COMMENT",
                "COMMENT_NOTE",
              ],
            },
          ],
        },
        {
          model: Users,
          as: "completed_by",
          required: false,
          attributes: [["USER_INISIAL", "COMPLETED_BY"]],
        },
        {
          model: Users,
          as: "created_by",
          required: true,
          attributes: [["USER_INISIAL", "CREATED_BY"]],
        },
      ],
    });

    if (!rmLabDipStrikeOffData) {
      return errorResponse(res, null, "RM Lab Dip Strike Off not found", 404);
    }

    return successResponse(
      res,
      rmLabDipStrikeOffData,
      "RM Lab Dip Strike Off fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch RM Lab Dip Strike Off data",
      500
    );
  }
};

export const editRMLabDipStrikeOff = async (req, res) => {
  const t = await db.transaction();
  const { ID } = req.params;

  try {
    const { header, styles, user_id } = req.body;

    //header
    header.UPDATED_BY = user_id;
    const headerData = await RMLabDipStrikeOff.findByPk(ID);
    await headerData.update(header, { transaction: t });

    //style
    await dynamicCreateDeleteAction({
      parentId: ID,
      userId: user_id,
      payload: styles,
      model: RMLabDipStrikeOffStyle,
      whereKeys: ["FG_ITEM_ID", "FG_COLOR_ID"],
      parentKey: "RM_LAB_STRIKE_ID",
    });

    await t.commit();

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off updated successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to update RM Lab Dip Strike Off",
      400
    );
  }
};

export const deleteRMLabDipStrikeOff = async (req, res) => {
  const t = await db.transaction();
  const { ID, DELETED_BY } = req.body;

  try {
    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    // Main record
    const rmLabDipStrikeOffData = await RMLabDipStrikeOff.findByPk(ID, {
      include: [
        {
          model: RMLabDipStrikeOffApproval,
          as: "approvals",
          include: [
            {
              model: RMLabDipStrikeOffSubmission,
              as: "submissions",
            },
          ],
        },
      ],
    });

    if (!rmLabDipStrikeOffData) {
      return errorResponse(res, null, "RM Lab Dip Strike Off not found", 404);
    }

    // Related deletes (styles)
    await RMLabDipStrikeOffStyle.update(
      { DELETED_BY },
      { where: { RM_LAB_STRIKE_ID: ID }, transaction: t }
    );
    await RMLabDipStrikeOffStyle.destroy({
      where: { RM_LAB_STRIKE_ID: ID },
      transaction: t,
    });

    // Delete approvals + their submissions
    for (const approval of rmLabDipStrikeOffData.approvals || []) {
      // Mark submissions deleted
      await RMLabDipStrikeOffSubmission.update(
        { DELETED_BY },
        { where: { RM_LAB_STRIKE__APPROVAL_ID: approval.ID }, transaction: t }
      );
      await RMLabDipStrikeOffSubmission.destroy({
        where: { RM_LAB_STRIKE__APPROVAL_ID: approval.ID },
        transaction: t,
      });

      // Mark approval deleted
      await RMLabDipStrikeOffApproval.update(
        { DELETED_BY },
        { where: { ID: approval.ID }, transaction: t }
      );
      await RMLabDipStrikeOffApproval.destroy({
        where: { ID: approval.ID },
        transaction: t,
      });
    }

    // Main delete
    await rmLabDipStrikeOffData.update({ DELETED_BY }, { transaction: t });
    await rmLabDipStrikeOffData.destroy({ transaction: t });

    await t.commit();

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off deleted successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to delete RM Lab Dip Strike Off",
      500
    );
  }
};

export const updateRMLabDipStrikeOffApprovalSubmission = async (req, res) => {
  const t = await db.transaction();
  const { ID } = req.params;

  try {
    const { approvals, user_id } = req.body;

    const submissionLoop = async (data, approvalID) => {
      const existingSubs = await RMLabDipStrikeOffSubmission.findAll({
        where: { RM_LAB_STRIKE__APPROVAL_ID: approvalID },
        transaction: t,
      });

      let counter =
        existingSubs.length > 0
          ? Math.max(...existingSubs.map((s) => s.SUBMIT_ID || 0)) + 1
          : 1;

      for (const submission of data) {
        submission.UPDATED_BY = user_id;

        const child = await RMLabDipStrikeOffSubmission.findByPk(
          submission.ID,
          { transaction: t }
        );

        if (child) {
          await child.update(submission, { transaction: t });
        } else {
          submission.CREATED_BY = user_id;
          submission.RM_LAB_STRIKE__APPROVAL_ID = approvalID;
          submission.SUBMIT_ID = counter++;
          await RMLabDipStrikeOffSubmission.create(submission, {
            transaction: t,
          });
        }
      }
    };

    // Loop through approvals
    for (const approval of approvals) {
      approval.UPDATED_BY = user_id;

      const exist = await RMLabDipStrikeOffApproval.findByPk(approval.ID, {
        transaction: t,
      });

      if (exist) {
        await exist.update(approval, { transaction: t });

        if (approval.submissions && approval.submissions.length) {
          await submissionLoop(approval.submissions, exist.ID);
        }
      } else {
        approval.CREATED_BY = user_id;
        approval.RM_LAB_STRIKE_ID = ID;

        const existingApprovals = await RMLabDipStrikeOffApproval.findAll({
          where: { RM_LAB_STRIKE_ID: ID },
          transaction: t,
        });

        let seriesCounter =
          existingApprovals.length > 0
            ? Math.max(...existingApprovals.map((a) => a.SERIES_ID || 0)) + 1
            : 1;

        approval.SERIES_ID = seriesCounter;

        const newData = await RMLabDipStrikeOffApproval.create(approval, {
          transaction: t,
        });

        if (approval.submissions && approval.submissions.length) {
          await submissionLoop(approval.submissions, newData.ID);
        }
      }
    }

    await t.commit();

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off updated successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to update RM Lab Dip Strike Off",
      400
    );
  }
};

export const deleteRMLabDipStrikeOffApprovalSubmission = async (req, res) => {
  const t = await db.transaction();
  try {
    const { approval_id, DELETED_BY } = req.body;

    const parent = await RMLabDipStrikeOffApproval.findByPk(approval_id);
    if (parent) {
      parent.update({ DELETED_BY }, { transaction: t });
      parent.destroy({ transaction: t });
    }

    await RMLabDipStrikeOffSubmission.update(
      { DELETED_BY },
      { where: { RM_LAB_STRIKE__APPROVAL_ID: approval_id }, transaction: t }
    );
    await RMLabDipStrikeOffSubmission.destroy({
      where: { RM_LAB_STRIKE__APPROVAL_ID: approval_id },
      transaction: t,
    });

    await t.commit();

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off approval deleted successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to delete RM Lab Dip Strike Off approval",
      400
    );
  }
};

export const approveRMLabDipStrikeOff = async (req, res) => {
  const t = await db.transaction();
  const { ID } = req.params;

  try {
    const { user_id } = req.body;

    const approvals = await RMLabDipStrikeOffApproval.findAll({
      where: { RM_LAB_STRIKE_ID: ID },
      include: [
        {
          model: RMLabDipStrikeOffSubmission,
          as: "submissions",
        },
      ],
      transaction: t,
    });

    // If no approvals or no submissions at all -> block
    if (
      approvals.length === 0 ||
      approvals.every((a) => (a.submissions || []).length === 0)
    ) {
      throw new Error(
        "Cannot approve: please add at least one approval with a submission"
      );
    }

    // Check if at least one submission has approved status
    const hasAnyApproved = approvals.some((approval) =>
      (approval.submissions || []).some(
        (sub) => sub.COMMENT_STATUS === "SID0000014"
      )
    );

    if (!hasAnyApproved) {
      throw new Error(
        "Cannot approve: at least one submission across all approvals must be approved"
      );
    }

    // Header update
    const headerData = await RMLabDipStrikeOff.findByPk(ID);
    await headerData.update(
      { STATUS: "Approved", COMPLETED_BY: user_id, COMPLETED_AT: Date.now() },
      { transaction: t }
    );

    await t.commit();

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off approved successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to approve RM Lab Dip Strike Off",
      400
    );
  }
};

export const verifyRMLabDipStrikeOffApproval = async (req, res) => {
  const t = await db.transaction();
  const { ID } = req.params;

  try {
    const { user_id } = req.body;

    const newHeader = await RMLabDipStrikeOffApproval.update(
      {
        COMPLETED_BY: user_id,
        COMPLETED_AT: new Date(),
      },
      {
        where: {
          ID,
        },
      },
      { transaction: t }
    );

    return successResponse(
      res,
      null,
      "RM Lab Dip Strike Off verified successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to verify RM Lab Dip Strike Off",
      400
    );
  }
};
