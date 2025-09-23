import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { getPagination } from "../../util/Query.js";
import db from "../../../config/database.js";
import { RMLabDipStrikeOff } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOff.mod.js";
import { RMLabDipStrikeOffSubmission } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffSubmission.mod.js";
import { RMLabDipStrikeOffApproval } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffApproval.mod.js";
import { RMLabDipStrikeOffStyle } from "../../../models/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOffStyle.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import colorChart from "../../../models/system/colorChart.mod.js";

export const getRMLabDipStrikeOff = async (req, res) => {
  try {
    const { SEARCH_TEXT, page, limit } = req.query;

    const where = {};

    // if (SEARCH_TEXT) {
    // where[Op.or] = [
    //   { SIZE_CODE: { [Op.like]: `%${SEARCH_TEXT}%` } },
    //   { SIZE_DESCRIPTION: { [Op.like]: `%${SEARCH_TEXT}%` } },
    //   { EVENT_ID: { [Op.like]: `%${SEARCH_TEXT}%` } },
    // ];
    // }

    const rmLabDipStrikeOffData = await RMLabDipStrikeOff.findAll({
      where,
      include: [
        {
          model: RMLabDipStrikeOffStyle,
          as: "styles",
          required: true,
          attributes: ["ID", "RM_LAB_STRIKE_ID", "FG_ITEM_ID", "FG_COLOR_ID"],
          include: [
            {
              model: MasterItemIdModel,
              as: "item",
              required: true,
              attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
            },
            {
              model: colorChart,
              as: "color",
              required: true,
              attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
            },
          ],
        },
        {
          model: RMLabDipStrikeOffApproval,
          as: "approvals",
          required: true,
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
          ],
        },
        {
          model: RMLabDipStrikeOffSubmission,
          as: "submissions",
          required: true,
          attributes: [
            "ID",
            "RM_LAB_STRIKE_ID",
            "SUBMIT_ID",
            "SUBMIT_CODE",
            "COMMENT_STATUS",
            "OBTAIN_COMMENT",
            "COMMENT_NOTE",
          ],
        },
        {
          model: Users,
          as: "completed_by",
          required: false,
          attributes: [["USER_INISIAL", "COMPLETED_BY"]],
        },
      ],
      order: [["ID"]],
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      rmLabDipStrikeOffData,
      "RM Lab Dip Strike Offs chart fetched successfully",
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
    const { header, styles, approvals, submissions, user_id } = req.body;

    //header
    header.CREATED_BY = user_id;
    header.UPDATED_BY = user_id;
    const createdHeader = await RMLabDipStrikeOff.create(header, {
      transaction: t,
    });

    //style
    for (const style of styles) {
      style.CREATED_BY = user_id;
      style.UPDATED_BY = user_id;
      style.RM_LAB_STRIKE_ID = createdHeader.ID;
      await RMLabDipStrikeOffStyle.create(style, { transaction: t });
    }

    //approval
    let approvalCounter = 1;
    for (const approval of approvals) {
      approval.CREATED_BY = user_id;
      approval.UPDATED_BY = user_id;
      approval.RM_LAB_STRIKE_ID = createdHeader.ID;
      approval.SERIES_ID = approvalCounter++;
      await RMLabDipStrikeOffApproval.create(approval, { transaction: t });
    }

    //submission
    let submissionCounter = 1;
    for (const submission of submissions) {
      submission.CREATED_BY = user_id;
      submission.UPDATED_BY = user_id;
      submission.RM_LAB_STRIKE_ID = createdHeader.ID;
      submission.SUBMIT_ID = submissionCounter++;
      await RMLabDipStrikeOffSubmission.create(submission, { transaction: t });
    }

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
      include: [
        {
          model: RMLabDipStrikeOffStyle,
          as: "styles",
          required: true,
          attributes: ["ID", "RM_LAB_STRIKE_ID", "FG_ITEM_ID", "FG_COLOR_ID"],
          include: [
            {
              model: MasterItemIdModel,
              as: "item",
              required: true,
              attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
            },
            {
              model: colorChart,
              as: "color",
              required: true,
              attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
            },
          ],
        },
        {
          model: RMLabDipStrikeOffApproval,
          as: "approvals",
          required: true,
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
          ],
        },
        {
          model: RMLabDipStrikeOffSubmission,
          as: "submissions",
          required: true,
          attributes: [
            "ID",
            "RM_LAB_STRIKE_ID",
            "SUBMIT_ID",
            "SUBMIT_CODE",
            "COMMENT_STATUS",
            "OBTAIN_COMMENT",
            "COMMENT_NOTE",
          ],
        },
        {
          model: Users,
          as: "completed_by",
          required: false,
          attributes: [["USER_INISIAL", "COMPLETED_BY"]],
        },
      ],
    });

    if (!rmLabDipStrikeOffData) {
      return errorResponse(res, null, "RM Lab Dip Strike Off not found", 404);
    }

    return successResponse(
      res,
      rmLabDipStrikeOffData,
      "RM Lab Dip Strike Off chart fetched successfully",
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
  const { id } = req.params;
  const dataEventMaster = req.body;

  try {
    const rmLabDipStrikeOffData = await RMLabDipStrikeOff.findByPk(id);

    if (!rmLabDipStrikeOffData) {
      return errorResponse(res, null, "RM Lab Dip Strike Off not found", 404);
    }

    await rmLabDipStrikeOffData.update(dataEventMaster, { transaction: t });

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
    const rmLabDipStrikeOffData = await RMLabDipStrikeOff.findByPk(ID);
    if (!rmLabDipStrikeOffData) {
      return errorResponse(res, null, "RM Lab Dip Strike Off not found", 404);
    }

    // Related deletes
    await RMLabDipStrikeOffStyle.update(
      { DELETED_BY },
      { where: { RM_LAB_STRIKE_ID: ID }, transaction: t }
    );
    await RMLabDipStrikeOffStyle.destroy({
      where: { RM_LAB_STRIKE_ID: ID },
      transaction: t,
    });

    await RMLabDipStrikeOffApproval.update(
      { DELETED_BY },
      { where: { RM_LAB_STRIKE_ID: ID }, transaction: t }
    );
    await RMLabDipStrikeOffApproval.destroy({
      where: { RM_LAB_STRIKE_ID: ID },
      transaction: t,
    });

    await RMLabDipStrikeOffSubmission.update(
      { DELETED_BY },
      { where: { RM_LAB_STRIKE_ID: ID }, transaction: t }
    );
    await RMLabDipStrikeOffSubmission.destroy({
      where: { RM_LAB_STRIKE_ID: ID },
      transaction: t,
    });

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
