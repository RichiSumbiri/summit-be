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

export const createOrEditEventDiary = async (req, res) => {
  const t = await db.transaction();
  try {
    const { DIARY_LINE, ...headerData } = req.body;

    let header = await EventDiaryHeader.findByPk(headerData.EVENT_DIARY_ID);

    headerData.UPDATED_BY = headerData.USER_ID;
    
    if (!header) {
      headerData.CREATED_BY = headerData.USER_ID;
      header = await EventDiaryHeader.create(headerData, {
        transaction: t,
      });
    } else {
      await header.update(headerData, { transaction: t });
    }

    for (const diary of DIARY_LINE) {
      diary.UPDATED_BY = headerData.USER_ID;
      const data2 = await EventDiaryLine.findByPk(diary.EVENT_DIARY_LINE_ID, {
        transaction: t,
      });

      if (data2) {
        await data2.update(diary, { transaction: t });
      } else {
        diary.CREATED_BY = headerData.USER_ID;
        diary.EVENT_DIARY_ID = header.EVENT_DIARY_ID;
        await EventDiaryLine.create(diary, { transaction: t });
      }
    }

    await t.commit();

    return successResponse(res, null, "Event diary updated successfully", 201);
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to create event diary data", 400);
  }
};

export const showEventDiary = async (req, res) => {
  const t = await db.transaction();
  try {
    const { ORDER_PO_ID, ORDER_ID, EVENT_ID } = req.params;

    const eventDiaryData = await EventDiaryHeader.findOne({
      where: {
        ORDER_PO_ID: ORDER_PO_ID,
        ORDER_ID: ORDER_ID,
        EVENT_ID: EVENT_ID,
      },
      include: [
        {
          model: EventDiaryLine,
          as: "event_diary_lines",
          required: false,
          include: [
            {
              model: Users,
              as: "created_by",
              required: false,
              attributes: [["USER_INISIAL", "CREATED_BY"]],
            },
            {
              model: Users,
              as: "completed_by",
              required: false,
              attributes: [["USER_INISIAL", "COMPLETED_BY"]],
            },
          ],
        },
      ],
    });

    // if (!eventDiaryData) {
    //   return errorResponse(res, null, "Event diary not found", 404);
    // }

    return successResponse(
      res,
      eventDiaryData,
      "Event diary chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event diary data", 500);
  }
};

export const deleteEventDiary = async (req, res) => {
  const t = await db.transaction();
  const { EVENT_DIARY_LINE_ID, DELETED_BY } = req.body;

  try {
    const eventDiaryData = await EventDiaryLine.findByPk(EVENT_DIARY_LINE_ID);

    if (!eventDiaryData) {
      return errorResponse(res, null, "Event diary not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await eventDiaryData.update({ DELETED_BY });
    await eventDiaryData.destroy({ transaction: t });

    await t.commit();

    return successResponse(res, null, "Event diary deleted successfully", 200);
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to delete event diary", 500);
  }
};

export const changeEventDiaryStatus = async (req, res) => {
  const t = await db.transaction();
  const { DIARY_HEADER_ID, DIARY_LINE_ID, EVENT_STATUS, USER_ID } =
    req.body || {};

  try {
    const model = DIARY_HEADER_ID
      ? EventDiaryHeader
      : DIARY_LINE_ID
      ? EventDiaryLine
      : null;
    const id = DIARY_HEADER_ID || DIARY_LINE_ID;

    if (!model || !id) {
      await t.rollback();
      return errorResponse(res, null, "No valid identifier provided", 400);
    }

    const record = await model.findByPk(id, { transaction: t });
    if (!record) {
      await t.rollback();
      return errorResponse(res, null, `${model.name} not found`, 404);
    }

    const updateData = { EVENT_STATUS, UPDATED_BY: USER_ID };
    if (EVENT_STATUS?.toLowerCase() === "complete") {
      updateData.COMPLETED_BY = USER_ID;
      updateData.COMPLETED_AT = new Date();
    }

    await record.update(updateData, { transaction: t });

    await t.commit();
    return successResponse(
      res,
      null,
      "Event diary status updated successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to update event diary status", 500);
  }
};
