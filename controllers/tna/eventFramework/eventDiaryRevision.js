import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import {
  EventDiaryHeader,
  EventDiaryLine,
} from "../../../models/tna/eventDiary.mod.js";
import db from "../../../config/database.js";
import Users from "../../../models/setup/users.mod.js";
import EventDiaryRevision from "../../../models/tna/eventDiaryRevision.mod.js";

export const showEventDiaryRevision = async (req, res) => {
  try {
    const { EVENT_DIARY_ID } = req.params;

    const eventDiaryData = await EventDiaryRevision.findAll({
      attributes: [
        "ID",
        "EVENT_REV_ID",
        "EVENT_DIARY_ID",
        "COMMITMENT_DATE",
        "NOTE",
        "CREATED_AT",
      ],
      where: {
        EVENT_DIARY_ID,
      },
      include: [
        {
          model: Users,
          as: "created_by",
          required: false,
          attributes: [["USER_INISIAL", "CREATED_BY"]],
        },
      ],
    });

    return successResponse(
      res,
      eventDiaryData,
      "Event diary revision fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event diary revision data",
      500
    );
  }
};

export const createEventDiaryRevision = async (req, res) => {
  const t = await db.transaction();

  const { EVENT_DIARY_ID, USER_ID, ...payload } = req.body;

  try {
    let headerPayload = {
      COMMITMENT_DATE: payload.COMMITMENT_DATE,
      EVENT_NOTE: payload.NOTE,
      UPDATED_BY: USER_ID,
    };
    const header = await EventDiaryHeader.findByPk(EVENT_DIARY_ID);
    header.update(headerPayload, {
      transaction: t,
    });

    let revisionPayload = {
      EVENT_DIARY_ID,
      COMMITMENT_DATE: payload.COMMITMENT_DATE,
      NOTE: payload.NOTE,
      CREATED_BY: USER_ID,
      UPDATED_BY: USER_ID,
    };
    await EventDiaryRevision.create(revisionPayload, {
      transaction: t,
    });

    await t.commit();

    return successResponse(
      res,
      null,
      "Event diary revision created successfully",
      201
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to create event diary revision",
      400
    );
  }
};
