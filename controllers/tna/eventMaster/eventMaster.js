import generateCustomId from "../../helpers/generateCustomId.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { Op, Sequelize } from "sequelize";
import Users from "../../../models/setup/users.mod.js";
import { getPagination } from "../../util/Query.js";
import eventMaster from "../../../models/tna/eventMaster.mod.js";
import db from "../../../config/database.js";
import MasterEventType from "../../../models/system/masterEventType.mod.js";
import MasterEventGroup from "../../../models/system/masterEventGroup.mod.js";
import { modelMasterDepartmentFx } from "../../../models/setup/departmentFx.mod.js";
import masterProductionProcess from "../../../models/system/masterProductionProcess.mod.js";

export const getEventMaster = async (req, res) => {
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

    const eventMasterData = await eventMaster.findAll({
      where,
      include: [
        {
          model: MasterEventType,
          as: "event_type",
          required: true,
          attributes: ["EVENT_TYPE_ID", "EVENT_TYPE_NAME"],
        },
        {
          model: MasterEventGroup,
          as: "event_group",
          required: true,
          attributes: ["EVENT_GROUP_ID", "EVENT_GROUP_NAME"],
        },
        {
          model: modelMasterDepartmentFx,
          as: "department",
          required: true,
          attributes: ["ID_DEPT", "NAME_DEPT"],
        },
        {
          model: modelMasterDepartmentFx,
          as: "section",
          required: true,
          attributes: ["ID_DEPT", "NAME_DEPT"],
        },
        {
          model: masterProductionProcess,
          as: "production_process",
          required: true,
          attributes: [
            "PRODUCTION_PROCESS_ID",
            "PRODUCTION_PROCESS_CODE",
            "PRODUCTION_PROCESS_NAME",
          ],
        },
      ],
      order: [["EVENT_ID"]],
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      eventMasterData,
      "Event masters chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event masters data", 500);
  }
};

export const createEventMaster = async (req, res) => {
  const t = await db.transaction();
  try {
    const eventMasterData = req.body;

    const customId = await generateCustomId(eventMaster, "EVENT_ID", "EID");

    eventMasterData.EVENT_ID = customId;
    await eventMaster.create(eventMasterData, { transaction: t });
    await t.commit();

    return successResponse(
      res,
      {
        EVENT_ID: customId,
      },
      "Event master created successfully",
      201
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to create event master data", 400);
  }
};

export const showEventMaster = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;

    const eventMasterData = await eventMaster.findOne({
      where: { EVENT_ID: id },
    });

    if (!eventMasterData) {
      return errorResponse(res, null, "Event master not found", 404);
    }

    return successResponse(
      res,
      eventMasterData,
      "Event master chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event master data", 500);
  }
};

export const editEventMaster = async (req, res) => {
  const t = await db.transaction();
  const { id } = req.params;
  const dataEventMaster = req.body;

  try {
    const eventMasterData = await eventMaster.findByPk(id);

    if (!eventMasterData) {
      return errorResponse(res, null, "Event master not found", 404);
    }

    await eventMasterData.update(dataEventMaster, { transaction: t });

    await t.commit();

    return successResponse(res, null, "Event master updated successfully", 200);
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to update event master", 400);
  }
};

export const deleteEventMaster = async (req, res) => {
  const t = await db.transaction();
  const { EVENT_ID, DELETED_BY } = req.body;

  try {
    const eventMasterData = await eventMaster.findByPk(EVENT_ID);

    if (!eventMasterData) {
      return errorResponse(res, null, "Event master not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await eventMasterData.update({ DELETED_BY });
    await eventMasterData.destroy({ transaction: t });

    await t.commit();

    return successResponse(res, null, "Event master deleted successfully", 200);
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to delete event master", 500);
  }
};
