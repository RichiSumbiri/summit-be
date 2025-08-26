import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import MasterEventType from "../../../models/system/masterEventType.mod.js";
import eventFramework from "../../../models/tna/eventFramework.mod.js";
import eventTemplate from "../../../models/tna/eventTemplate.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
} from "../../../models/system/customer.mod.js";
import Users from "../../../models/setup/users.mod.js";
import eventTemplateLine from "../../../models/tna/eventTemplateLine.mod.js";
import eventMaster from "../../../models/tna/eventMaster.mod.js";
import { modelMasterDepartmentFx } from "../../../models/setup/departmentFx.mod.js";
import MasterEventGroup from "../../../models/system/masterEventGroup.mod.js";
import masterProductionProcess from "../../../models/system/masterProductionProcess.mod.js";
import masterOffsetLink from "../../../models/system/masterOffsetLink.mod.js";
import { ModelOrderPOHeader } from "../../../models/orderManagement/orderManagement.mod.js";
import { OrderPoListing } from "../../../models/production/order.mod.js";
import {
  EventDiaryHeader,
  EventDiaryLine,
} from "../../../models/tna/eventDiary.mod.js";

export const getEventManagement = async (req, res) => {
  try {
    // const { ORDER_ID, TEMPLATE_ID } = req.query;

    const eventFrameworkData = await eventFramework.findAll({
      include: [
        {
          model: Users,
          as: "generated_by",
          required: true,
          attributes: [["USER_INISIAL", "GENERATED_BY"]],
        },
        {
          model: ModelOrderPOHeader,
          as: "order_po_header",
          required: true,
          attributes: [
            "ORDER_ID",
            "ORDER_CONFIRMED_DATE",
            "PLAN_CUT_DATE",
            "PLAN_SEW_DATE",
          ],
          include: [
            {
              model: CustomerDetail,
              as: "customer_detail",
              required: true,
              attributes: ["CTC_NAME"],
            },
            {
              model: CustomerProductDivision,
              as: "customer_product_division",
              required: true,
              attributes: ["CTPROD_DIVISION_NAME"],
            },
            {
              model: CustomerProductSeason,
              as: "customer_product_season",
              required: true,
              attributes: ["CTPROD_SESION_NAME"],
            },
          ],
        },
        {
          model: eventTemplate,
          as: "event_template",
          required: true,
          attributes: ["TEMPLATE_ID", "TEMPLATE_NAME"],
          include: [
            {
              model: eventTemplateLine,
              as: "event_template_lines",
              required: true,
              separate: true,
              where: { IS_ACTIVE: 1 },
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
                      attributes: ["NAME_DEPT"],
                    },
                    {
                      model: MasterEventType,
                      as: "event_type",
                      required: true,
                      attributes: ["EVENT_TYPE_NAME"],
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
                      attributes: ["PRODUCTION_PROCESS_NAME"],
                    },
                  ],
                },
                {
                  model: masterOffsetLink,
                  as: "master_offset_link",
                  required: false,
                  attributes: ["OFFSET_LINK_NAME"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!eventFrameworkData || eventFrameworkData.length === 0) {
      return successResponse(res, [], "No event framework found", 200);
    }

    const results = [];
    for (const record of eventFrameworkData) {
      const plainData = record.get({ plain: true });

      const orders = await OrderPoListing.findAll({
        where: { ORDER_NO: plainData.ORDER_ID },
      });

      const orderMap = Object.fromEntries(
        orders.map((o) => [o.ORDER_PO_ID, o.get({ plain: true })])
      );

      const earliestDeliveryDate =
        orders
          .map((o) => o.FINAL_DELIVERY_DATE)
          .filter(Boolean)
          .sort()[0] || null;
      const earliestExFactoryDate =
        orders
          .map((o) => o.PLAN_EXFACTORY_DATE)
          .filter(Boolean)
          .sort()[0] || null;

      const eventIds = plainData.event_template.event_template_lines.map(
        (line) => line.event_master.EVENT_ID
      );
      const orderIds = orders.map((o) => o.ORDER_PO_ID).concat(null);

      const diaries = await EventDiaryHeader.findAll({
        where: {
          ORDER_PO_ID: orderIds,
          EVENT_ID: eventIds,
          ORDER_ID: plainData.ORDER_ID,
        },
        include: [
          { model: EventDiaryLine, as: "event_diary_lines", required: false },
          {
            model: Users,
            as: "completed_by",
            required: false,
            attributes: [["USER_INISIAL", "COMPLETED_BY"]],
          },
        ],
      });

      const diaryMap = Object.fromEntries(
        diaries.map((d) => [
          d.ORDER_PO_ID + "|" + d.EVENT_ID,
          d.get({ plain: true }),
        ])
      );

      const new_template_line = [];
      for (const line of plainData.event_template.event_template_lines) {
        if (line.IS_SPLIT_EVENT) {
          for (const order of orders) {
            const key = order.ORDER_PO_ID + "|" + line.event_master.EVENT_ID;
            new_template_line.push({
              ...line,
              ORDER_PO_ID: order.ORDER_PO_ID,
              diary: diaryMap[key] || null,
            });
          }
        } else {
          const key = "null|" + line.event_master.EVENT_ID;
          new_template_line.push({
            ...line,
            ORDER_PO_ID: null,
            diary: diaryMap[key] || null,
          });
        }
      }

      plainData.order_po_header.FINAL_DELIVERY_DATE =
        orders[0]?.FINAL_DELIVERY_DATE;

      plainData.event_template.event_template_lines = new_template_line;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const poHeader = plainData.order_po_header;

      for (const data of plainData.event_template.event_template_lines) {
        const poRecord = data.ORDER_PO_ID ? orderMap[data.ORDER_PO_ID] : null;

        let offset_linked_date = null;
        switch (data.master_offset_link?.OFFSET_LINK_NAME) {
          case "Customer PO Confirmed Date":
          case "Order (Style) Confirmed Date":
            offset_linked_date = poHeader.ORDER_CONFIRMED_DATE;
            break;
          case "Customer PO Delivery Date":
            offset_linked_date = poRecord?.FINAL_DELIVERY_DATE || null;
            break;
          case "Customer PO Ex-Factory Date":
            offset_linked_date = poRecord?.PLAN_EXFACTORY_DATE || null;
            break;
          case "Earliest Customer PO Delivery Date":
            offset_linked_date = earliestDeliveryDate;
            break;
          case "Earliest Customer PO Ex-Factory Date":
            offset_linked_date = earliestExFactoryDate;
            break;
          case "Plan Cut Date (PCD)":
            offset_linked_date = poHeader.PLAN_CUT_DATE;
            break;
          case "Plan Sewing Date (PSD)":
            offset_linked_date = poHeader.PLAN_SEW_DATE;
            break;
        }

        data.offset_linked_date = offset_linked_date;

        if (offset_linked_date) {
          const offsetDate = new Date(offset_linked_date);
          offsetDate.setHours(0, 0, 0, 0);

          data.variance_days = Math.floor(
            (tomorrow - offsetDate) / (1000 * 60 * 60 * 24)
          );

          const targetDate = new Date(offsetDate);
          targetDate.setDate(targetDate.getDate() + data.EVENT_OFFSET_DAYS);
          data.target_date = targetDate;
        } else {
          data.variance_days = null;
          data.target_date = null;
        }
      }

      results.push(plainData);
    }

    return successResponse(
      res,
      results,
      "Event framework fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event framework data", 500);
  }
};
