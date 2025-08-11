import generateCustomId from "../../helpers/generateCustomId.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { getPagination } from "../../util/Query.js";
import eventMasterComment from "../../../models/tna/eventMasterComments.mod.js";
import db from "../../../config/database.js";
import eventMaster from "../../../models/tna/eventMaster.mod.js";

export const getEventMasterComments = async (req, res) => { 
  try {
    const { SEARCH_TEXT, page, limit, EVENT_ID } = req.query;

    const where = {EVENT_ID};

    // if (SEARCH_TEXT) {
    // where[Op.or] = [
    //   { SIZE_CODE: { [Op.like]: `%${SEARCH_TEXT}%` } },
    //   { SIZE_DESCRIPTION: { [Op.like]: `%${SEARCH_TEXT}%` } },
    //   { COMMENT_ID: { [Op.like]: `%${SEARCH_TEXT}%` } },
    // ];
    // }

    const eventMasterCommentData = await eventMasterComment.findAll({
      where,
      order: [["COMMENT_ID"]],
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      eventMasterCommentData,
      "Event master comments chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Event master comments data",
      500
    );
  }
};

export const createEventMasterComments = async (req, res) => {
  const t = await db.transaction();
  try {
    const eventMasterCommentData = req.body;

    const event = await eventMaster.findByPk(eventMasterCommentData.EVENT_ID);
    
    if (!event) {
      throw new Error(`Master event not found`);
    }

    const customId = await generateCustomId(
      eventMasterComment,
      "COMMENT_ID",
      "COI",
      { EVENT_ID: eventMasterCommentData.EVENT_ID }
    );

    eventMasterCommentData.COMMENT_ID = customId;
    await eventMasterComment.create(eventMasterCommentData, { transaction: t });
    await t.commit();

    return successResponse(
      res,
      {
        COMMENT_ID: customId,
      },
      "Event master comment created successfully",
      201
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to create Event master comment data",
      400
    );
  }
};

export const showEventMasterComments = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;

    const eventMasterCommentData = await eventMasterComment.findByPk(id);

    if (!eventMasterCommentData) {
      return errorResponse(res, null, "Event master comment not found", 404);
    }

    return successResponse(
      res,
      eventMasterCommentData,
      "Event master comment chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Event master comment data",
      500
    );
  }
};

export const editEventMasterComments = async (req, res) => {
  const t = await db.transaction();
  const { id } = req.params;
  const dataEventMaster = req.body;

  try {
    const eventMasterCommentData = await eventMasterComment.findByPk(id);

    if (!eventMasterCommentData) {
      return errorResponse(res, null, "Event master comment not found", 404);
    }

    await eventMasterCommentData.update(dataEventMaster, { transaction: t });

    await t.commit();

    return successResponse(
      res,
      null,
      "Event master comment updated successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to update Event master comment",
      400
    );
  }
};

export const deleteEventMasterComments = async (req, res) => {
  const t = await db.transaction();
  const { COMMENT_ID, DELETED_BY } = req.body;

  try {
    const eventMasterCommentData = await eventMasterComment.findByPk(
      COMMENT_ID
    );

    if (!eventMasterCommentData) {
      return errorResponse(res, null, "Event master comment not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await eventMasterCommentData.update({ DELETED_BY });
    await eventMasterCommentData.destroy({ transaction: t });

    await t.commit();

    return successResponse(
      res,
      null,
      "Event master comment deleted successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to delete Event master comment",
      500
    );
  }
};
