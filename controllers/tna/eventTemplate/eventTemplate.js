import generateCustomId from "../../helpers/generateCustomId.js";
import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import eventTemplate from "../../../models/tna/eventTemplate.mod.js";
import db from "../../../config/database.js";
import eventTemplateLine from "../../../models/tna/eventTemplateLine.mod.js";
import masterOrderType from "../../../models/system/masterOrderType.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
} from "../../../models/system/customer.mod.js";
import masterOffsetLink from "../../../models/system/masterOffsetLink.mod.js";
import eventMaster from "../../../models/tna/eventMaster.mod.js";
import Users from "../../../models/setup/users.mod.js";
import { modelMasterDepartmentFx } from "../../../models/setup/departmentFx.mod.js";
import MasterEventType from "../../../models/system/masterEventType.mod.js";
import MasterEventGroup from "../../../models/system/masterEventGroup.mod.js";
import masterProductionProcess from "../../../models/system/masterProductionProcess.mod.js";
import { getPagination } from "../../util/Query.js";
import eventMasterComment from "../../../models/tna/eventMasterComments.mod.js";

export const getEventTemplate = async (req, res) => {
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
    const eventTemplateData = await eventTemplate.findAll({
      where,
      attributes: [
        "TEMPLATE_ID",
        "TEMPLATE_NAME",
        "IS_ACTIVE",
        "CREATED_AT",
        "UPDATED_AT",
      ],
      include: [
        {
          model: masterOrderType,
          as: "order_type",
          required: true,
          attributes: ["TYPE_ID", "TYPE_CODE", "TYPE_DESC"],
        },
        {
          model: CustomerDetail,
          as: "customer_detail",
          required: true,
          attributes: ["CTC_ID", "CTC_CODE"],
        },
        {
          model: CustomerProductDivision,
          as: "customer_product_division",
          required: true,
          attributes: [
            "CTPROD_DIVISION_ID",
            "CTPROD_DIVISION_CODE",
            "CTPROD_DIVISION_NAME",
          ],
        },
        {
          model: Users,
          as: "created_by",
          required: true,
          attributes: [["USER_INISIAL", "CREATED_BY"]],
        },
        {
          model: Users,
          as: "updated_by",
          required: true,
          attributes: [["USER_INISIAL", "UPDATED_BY"]],
        },
      ],
      order: [["TEMPLATE_ID"]],
      ...getPagination(page, limit),
    });
    return successResponse(
      res,
      eventTemplateData,
      "Event templates fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event templates data", 500);
  }
};

export const showEventTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const eventTemplateData = await eventTemplate.findOne({
      where: { TEMPLATE_ID: id },
      attributes: [
        "TEMPLATE_ID",
        "TEMPLATE_NAME",
        "IS_ACTIVE",
        "CREATED_AT",
        "UPDATED_AT",
      ],
      include: [
        {
          model: masterOrderType,
          as: "order_type",
          required: true,
          attributes: ["TYPE_ID", "TYPE_CODE", "TYPE_DESC"],
        },
        {
          model: CustomerDetail,
          as: "customer_detail",
          required: true,
          attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME"],
        },
        {
          model: CustomerProductDivision,
          as: "customer_product_division",
          required: true,
          attributes: [
            "CTPROD_DIVISION_ID",
            "CTPROD_DIVISION_CODE",
            "CTPROD_DIVISION_NAME",
          ],
        },
        {
          model: Users,
          as: "created_by",
          required: true,
          attributes: [["USER_INISIAL", "CREATED_BY"]],
        },
        {
          model: Users,
          as: "updated_by",
          required: true,
          attributes: [["USER_INISIAL", "UPDATED_BY"]],
        },
        {
          model: eventTemplateLine,
          as: "event_template_lines",
          required: true,
          attributes: [
            "TEMPLATE_LINE_ID",
            "EVENT_OFFSET_DAYS",
            "IS_ACTIVE",
            "IS_SPLIT_EVENT",
            "IS_COMPULSORY",
            "IS_AUTO_UPDATED",
            "IS_R2P_VALIDATE",
          ],
          include: [
            {
              model: eventMaster,
              as: "event_master",
              required: true,
              attributes: ["EVENT_ID", "EVENT_NAME"],
              include: [
                {
                  model: modelMasterDepartmentFx,
                  as: "department",
                  required: true,
                  attributes: ["ID_DEPT", "NAME_DEPT"],
                },
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
                  model: masterProductionProcess,
                  as: "production_process",
                  required: true,
                  attributes: [
                    "PRODUCTION_PROCESS_ID",
                    "PRODUCTION_PROCESS_CODE",
                    "PRODUCTION_PROCESS_NAME",
                  ],
                },
                {
                  model: eventMasterComment,
                  as: "event_master_comments",
                  required: false,
                  attributes: [
                    "EVENT_ID",
                    "COMMENT_ID",
                    "COMMENT_NAME",
                    "OFFSET_DAYS",
                    "IS_COMPULSORY",
                    "IS_ACTIVE",
                  ],
                },
              ],
            },
            {
              model: masterOffsetLink,
              as: "master_offset_link",
              required: false,
              attributes: ["OFFSET_LINK_ID", "OFFSET_LINK_NAME"],
            },
          ],
        },
      ],
    });
    if (!eventTemplateData) {
      return errorResponse(res, null, "Event template not found", 404);
    }
    return successResponse(
      res,
      eventTemplateData,
      "Event template chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event template data", 500);
  }
};

export const updateOrCreateEventTemplate = async (req, res) => {
  const t = await db.transaction();
  const { EVENTS, ...data } = req.body;

  try {
    data.UPDATED_BY = data.USER_ID;

    if (!data.TEMPLATE_ID) {
      data.TEMPLATE_ID = await generateCustomId(
        eventTemplate,
        "TEMPLATE_ID",
        "TTP"
      );
      data.CREATED_BY = data.USER_ID;
      await eventTemplate.create(data, { transaction: t });
    } else {
      const header = await eventTemplate.findByPk(data.TEMPLATE_ID, {
        transaction: t,
      });
      await header.update(data, { transaction: t });
    }

    for (const event of EVENTS) {
      event.TEMPLATE_ID = data.TEMPLATE_ID;
      event.UPDATED_BY = data.USER_ID;

      const existingLine = await eventTemplateLine.findOne({
        where: {
          TEMPLATE_ID: event.TEMPLATE_ID,
          EVENT_ID: event.EVENT_ID,
        },
        transaction: t,
      });

      if (existingLine) {
        await existingLine.update(event, { transaction: t });
      } else {
        event.CREATED_BY = data.USER_ID;
        await eventTemplateLine.create(event, { transaction: t });
      }
    }

    await t.commit();
    return successResponse(res, null, "Event template saved successfully", 200);
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to save event template", 400);
  }
};
