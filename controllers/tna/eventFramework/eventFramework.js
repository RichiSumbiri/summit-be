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
  CustomerProgramName,
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
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import { getPagination } from "../../util/Query.js";
import { MasterItemCategories } from "../../../models/setup/ItemCategories.mod.js";
import ProductItemModel from "../../../models/system/productItem.mod.js";
import {
  EventDiaryHeader,
  EventDiaryLine,
} from "../../../models/tna/eventDiary.mod.js";

export const getEventFramework = async (req, res) => {
  try {
    const { ORDER_ID, TEMPLATE_ID } = req.query;

    let eventFrameworkData = await eventFramework.findOne({
      where: { ORDER_ID, TEMPLATE_ID },
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

    if (!eventFrameworkData) {
      // Fetch order header and template separately
      const orderHeader = await ModelOrderPOHeader.findOne({
        where: { ORDER_ID },
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
            attributes: ["CTC_NAME"],
          },
          {
            model: CustomerProductDivision,
            as: "customer_product_division",
            attributes: ["CTPROD_DIVISION_NAME"],
          },
          {
            model: CustomerProductSeason,
            as: "customer_product_season",
            attributes: ["CTPROD_SESION_NAME"],
          },
        ],
      });

      const template = await eventTemplate.findOne({
        where: { TEMPLATE_ID },
        attributes: ["TEMPLATE_ID", "TEMPLATE_NAME"],
        include: [
          {
            model: eventTemplateLine,
            as: "event_template_lines",
            required: false,
            // separate: true,
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
                attributes: ["EVENT_ID", "EVENT_NAME"],
                required: false,
                include: [
                  {
                    model: modelMasterDepartmentFx,
                    as: "department",
                    attributes: ["NAME_DEPT"],
                    required: false,
                  },
                  {
                    model: MasterEventType,
                    as: "event_type",
                    attributes: ["EVENT_TYPE_NAME"],
                    required: false,
                  },
                  {
                    model: MasterEventGroup,
                    as: "event_group",
                    attributes: ["EVENT_GROUP_ID", "EVENT_GROUP_NAME"],
                    required: false,
                  },
                  {
                    model: masterProductionProcess,
                    as: "production_process",
                    attributes: ["PRODUCTION_PROCESS_NAME"],
                    required: false,
                  },
                ],
              },
              {
                model: masterOffsetLink,
                as: "master_offset_link",
                attributes: ["OFFSET_LINK_NAME"],
                required: false,
              },
            ],
          },
        ],
      });

      // Return in the same shape but ID null
      eventFrameworkData = {
        ID: null,
        ORDER_ID,
        TEMPLATE_ID,
        generated_by: null,
        order_po_header: orderHeader ? orderHeader.get({ plain: true }) : null,
        event_template: template ? template.get({ plain: true }) : null,
      };
    } else {
      eventFrameworkData = eventFrameworkData.get({ plain: true });
    }

    // if (!eventFrameworkData)
    //   return errorResponse(res, null, "Event framework not found", 404);

    let plainData = eventFrameworkData;
    const orders = await OrderPoListing.findAll({
      where: { ORDER_NO: plainData.ORDER_ID },
    });

    const orderMap = Object.fromEntries(
      orders.map((o) => [o.ORDER_PO_ID, o.get({ plain: true })])
    );

    // Precompute earliest dates
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

    // Bulk fetch all diaries for all EVENT_IDs and ORDER_PO_IDs
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

    // Flatten template lines with diaries
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

    return successResponse(
      res,
      plainData,
      "Event framework fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event framework data", 500);
  }
};

export const generatetEventFramework = async (req, res) => {
  try {
    const { ORDER_ID, TEMPLATE_ID, GENERATED_BY } = req.body;

    const duplicateCheck = await eventFramework.findOne({
      where: {
        ORDER_ID,
        TEMPLATE_ID,
      },
    });

    if (duplicateCheck) {
      return errorResponse(res, null, "Event framework already exists", 400);
    }

    const eventFrameworkData = await eventFramework.create({
      ORDER_ID,
      TEMPLATE_ID,
      GENERATED_AT: new Date(),
      GENERATED_BY,
    });

    return successResponse(
      res,
      eventFrameworkData,
      "Event framework generated successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to generate event framework", 500);
  }
};

export const getOrderManagementDropdown = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const listDetail = await ModelOrderPOHeader.findAndCountAll({
      attributes: [
        "ORDER_ID",
        "ORDER_STATUS",
        "ORDER_REFERENCE_PO_NO",
        "ORDER_STYLE_DESCRIPTION",
        "ORDER_TYPE_CODE",
        "ORDER_CONFIRMED_DATE",
        "CURRENCY_CODE",
        "CONTRACT_NO",
        "CONTRACT_CONFIRMED_DATE",
        "CONTRACT_EXPIRED_DATE",
        "PROJECTION_ORDER_ID",
      ],
      include: [
        {
          model: MasterItemIdModel,
          as: "ITEM",
          attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
          include: [
            {
              model: MasterItemCategories,
              as: "ITEM_CATEGORY",
              attributes: ["ITEM_CATEGORY_CODE"],
            },
          ],
        },
        {
          model: ProductItemModel,
          as: "PRODUCT",
          attributes: [
            "PRODUCT_TYPE_CODE",
            "PRODUCT_CAT_CODE",
            "PRODUCT_DESCRIPTION",
          ],
          required: false,
        },
        {
          model: CustomerDetail,
          as: "CUSTOMER",
          attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME"],
          required: false,
        },
        {
          model: CustomerProductDivision,
          as: "CUSTOMER_DIVISION",
          attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_NAME"],
          required: false,
        },
        {
          model: CustomerProductSeason,
          as: "CUSTOMER_SEASON",
          attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_NAME"],
          required: false,
        },
        {
          model: CustomerProgramName,
          as: "CUSTOMER_PROGRAM",
          attributes: ["CTPROG_ID", "CTPROG_NAME"],
          required: false,
        },
        {
          model: eventFramework,
          as: "EVENT_FRAMEWORK",
          required: false,
          include: [
            {
              model: eventTemplate,
              as: "event_template",
              attributes: ["TEMPLATE_ID", "TEMPLATE_NAME", "CREATED_AT"],
              include: [
                {
                  model: Users,
                  as: "created_by",
                  attributes: [["USER_INISIAL", "CREATED_BY"]],
                },
              ],
            },
            {
              model: Users,
              as: "generated_by",
              attributes: [["USER_INISIAL", "GENERATED_BY"]],
            },
          ],
        },
      ],
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      {
        rows: listDetail.rows,
        total: listDetail.count,
      },
      "Order dropdown fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch order dropdown data", 500);
  }
};
