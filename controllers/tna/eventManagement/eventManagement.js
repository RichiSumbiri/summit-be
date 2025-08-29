import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import MasterEventType from "../../../models/system/masterEventType.mod.js";
import eventFramework from "../../../models/tna/eventFramework.mod.js";
import eventTemplate from "../../../models/tna/eventTemplate.mod.js";
import Users from "../../../models/setup/users.mod.js";
import eventTemplateLine from "../../../models/tna/eventTemplateLine.mod.js";
import eventMaster from "../../../models/tna/eventMaster.mod.js";
import { modelMasterDepartmentFx } from "../../../models/setup/departmentFx.mod.js";
import MasterEventGroup from "../../../models/system/masterEventGroup.mod.js";
import masterProductionProcess from "../../../models/system/masterProductionProcess.mod.js";
import masterOffsetLink from "../../../models/system/masterOffsetLink.mod.js";
import { ModelOrderPOHeader } from "../../../models/orderManagement/orderManagement.mod.js";
import { OrderPoListing } from "../../../models/production/order.mod.js";
import { EventDiaryHeader } from "../../../models/tna/eventDiary.mod.js";
import { Op, or } from "sequelize";

export const getEventManagement = async (req, res) => {
  try {
    const {
      CUSTOMER_ORDER_TYPE,
      CUSTOMER_ORDER_TYPE_FROM,
      CUSTOMER_ORDER_TYPE_TO,
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      EVENT_TYPE_ID,
      EVENT_GROUP_ID,
      COMMITMENT_DATE_FROM,
      COMMITMENT_DATE_TO,
      DISPARITY,
      IS_COMPLETE,
      IS_IN_PROGRESS,
      IS_OVERDUE,
      PRODUCTION_MONTH,
    } = req.query;

    //event framework filter
    const whereFramework = {};

    if (ORDER_ID) {
      whereFramework.ORDER_ID = ORDER_ID;
    }

    //po header filter
    const wherePOHeader = {};

    if (
      CUSTOMER_ORDER_TYPE_FROM &&
      CUSTOMER_ORDER_TYPE_TO &&
      CUSTOMER_ORDER_TYPE
    ) {
      const range = {
        [Op.between]: [
          new Date(CUSTOMER_ORDER_TYPE_FROM).setHours(0, 0, 0, 0),
          new Date(CUSTOMER_ORDER_TYPE_TO).setHours(23, 59, 59, 999),
        ],
      };

      if (CUSTOMER_ORDER_TYPE.toLowerCase() === "all") {
        wherePOHeader[Op.or] = [
          { PLAN_CUT_DATE: range },
          { PLAN_SEW_DATE: range },
          { PLAN_FIN_DATE: range },
          { PLAN_PP_MEETING: range },
          { ORDER_CONFIRMED_DATE: range },
        ];
      } else {
        wherePOHeader[CUSTOMER_ORDER_TYPE] = range;
      }
    }

    if (CUSTOMER_ID) {
      wherePOHeader.CUSTOMER_ID = CUSTOMER_ID;
    }

    if (CUSTOMER_SEASON_ID) {
      wherePOHeader.CUSTOMER_SEASON_ID = CUSTOMER_SEASON_ID;
    }

    if (CUSTOMER_DIVISION_ID) {
      wherePOHeader.CUSTOMER_DIVISION_ID = CUSTOMER_DIVISION_ID;
    }

    //event master filter
    const whereEventMaster = {};

    if (EVENT_TYPE_ID) {
      whereEventMaster.EVENT_TYPE_ID = EVENT_TYPE_ID;
    }

    if (EVENT_GROUP_ID) {
      whereEventMaster.EVENT_GROUP_ID = EVENT_GROUP_ID;
    }

    //diary header filter
    const whereEventDiary = {};

    if (COMMITMENT_DATE_FROM && COMMITMENT_DATE_TO) {
      whereEventDiary.COMMITMENT_DATE = {
        [Op.between]: [
          new Date(COMMITMENT_DATE_FROM),
          new Date(COMMITMENT_DATE_TO),
        ],
      };
    }

    const eventFrameworkData = await eventFramework.findAll({
      attributes: ["ID", "ORDER_ID", "TEMPLATE_ID"],
      where: whereFramework,
      include: [
        {
          model: ModelOrderPOHeader,
          as: "order_po_header",
          required: true,
          attributes: [
            "ORDER_ID",
            "ORDER_CONFIRMED_DATE",
            "PLAN_CUT_DATE",
            "PLAN_SEW_DATE",
            "ORDER_REFERENCE_PO_NO",
            "ORDER_STYLE_DESCRIPTION",
          ],
          where: wherePOHeader,
        },
        {
          model: eventTemplate,
          as: "event_template",
          required: true,
          attributes: ["TEMPLATE_ID"],
          include: [
            {
              model: eventTemplateLine,
              as: "event_template_lines",
              required: true,
              separate: true,
              where: { IS_ACTIVE: 1 },
              attributes: [
                "TEMPLATE_LINE_ID",
                "TEMPLATE_ID",
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
                  where: whereEventMaster,
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

      const wherePoLine = {};

      wherePoLine.ORDER_NO = plainData.ORDER_ID;

      if (PRODUCTION_MONTH) {
        const [year, month] = PRODUCTION_MONTH.split("-");
        const monthName = new Date(`${year}-${month}-01`).toLocaleString(
          "en-US",
          { month: "long" }
        );
        wherePoLine.PRODUCTION_MONTH = `${monthName}/${year}`;
      }

      const orders = await OrderPoListing.findAll({
        where: wherePoLine,
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
        attributes: [
          "EVENT_DIARY_ID",
          "ORDER_PO_ID",
          "ORDER_ID",
          "EVENT_ID",
          "EVENT_NOTE",
          "EVENT_STATUS",
          "COMMITMENT_DATE",
          "COMPLETED_AT",
        ],
        where: {
          ORDER_PO_ID: orderIds,
          EVENT_ID: eventIds,
          ORDER_ID: plainData.ORDER_ID,
          ...whereEventDiary,
        },
        include: [
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

      plainData.order_po_header.FINAL_DELIVERY_DATE = earliestDeliveryDate;
      plainData.order_po_header.CUSTOMER_NAME = orders[0]?.CUSTOMER_NAME;
      plainData.order_po_header.CUSTOMER_DIVISION =
        orders[0]?.CUSTOMER_DIVISION;
      plainData.order_po_header.CUSTOMER_SEASON = orders[0]?.CUSTOMER_SEASON;

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

          const now = new Date();
          let status = null;

          if (data?.diary) {
            status = "In Progress";

            if (data?.diary?.EVENT_STATUS?.toLowerCase() === "complete") {
              status = "Completed";
            } else if (targetDate && now > targetDate) {
              status = "Overdue";
            }
          }

          data.main_status = status;
        } else {
          data.variance_days = null;
          data.target_date = null;
          data.main_status = null;
        }
      }

      plainData.event_template.event_template_lines =
        plainData.event_template.event_template_lines.filter((line) => {
          if (!line.diary) return false;

          // Status check
          let statusOk = true;
          if (IS_COMPLETE || IS_IN_PROGRESS || IS_OVERDUE) {
            statusOk = false;
            switch (line.main_status) {
              case "Completed":
                if (IS_COMPLETE === "true") statusOk = true;
                break;
              case "In Progress":
                if (IS_IN_PROGRESS === "true") statusOk = true;
                break;
              case "Overdue":
                if (IS_OVERDUE === "true") statusOk = true;
                break;
            }
          }

          // Disparity check
          let disparityOk = true;
          if (DISPARITY) {
            const commitmentDate = line.diary?.COMMITMENT_DATE
              ? new Date(line.diary.COMMITMENT_DATE)
              : null;
            const targetDate = line.target_date;

            if (!commitmentDate || !targetDate) disparityOk = false;

            if (
              DISPARITY === "commitment_late" &&
              !(commitmentDate > targetDate)
            )
              disparityOk = false;
            if (DISPARITY === "target_late" && !(targetDate > commitmentDate))
              disparityOk = false;
          }

          return statusOk && disparityOk;
        });

      // Only push plainData if there are remaining lines
      if (plainData.event_template.event_template_lines.length > 0) {
        results.push(plainData);
      }
    }

    return successResponse(
      res,
      results,
      "Event management fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event management data",
      500
    );
  }
};
