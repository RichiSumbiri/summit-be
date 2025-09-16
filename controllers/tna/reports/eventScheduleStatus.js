import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";

export const getEventSheduleStatusEvent = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
      DATE_TYPE,
      DATE_FROM,
      DATE_TO,
    } = req.query;

    let whereClauses = [];
    let outerWhereClauses = [];
    // let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`e.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`e.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`e.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (PRODUCTION_MONTH) {
      const [year, month] = PRODUCTION_MONTH.split("-");
      const monthName = new Date(`${year}-${month}-01`).toLocaleString(
        "en-US",
        { month: "long" }
      );
      whereClauses.push(`f.PRODUCTION_MONTH = '${monthName}/${year}'`);
    }

    if (OFFSET_LINK) {
      whereClauses.push(`i.OFFSET_LINK_ID = '${OFFSET_LINK}'`);
    }
    if (EXECUTION_DEPARTMENT) {
      whereClauses.push(
        `b.EXECUTION_DEPARTMENT_ID = '${EXECUTION_DEPARTMENT}'`
      );
    }

    if (DATE_FROM && DATE_TO && DATE_TYPE) {
      const from = `${DATE_FROM} 00:00:00`;
      const to = `${DATE_TO} 23:59:59`;

      if (DATE_TYPE === "target") {
        outerWhereClauses.push(`WHERE TARGET_DATE BETWEEN '${from}' AND '${to}'`);
      } else if (DATE_TYPE === "commitment") {
        outerWhereClauses.push(`WHERE COMMITMENT_DATE BETWEEN '${from}' AND '${to}'`);
      }
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = getQueryScheduleStatus("EVENT_NAME", whereSQL, outerWhereClauses);

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event schedule status event fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event schedule status event data",
      500
    );
  }
};

export const getEventSheduleStatusDepartment = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
      DATE_TYPE,
      DATE_FROM,
      DATE_TO,
    } = req.query;

    let whereClauses = [];
    let outerWhereClauses = [];

    // let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`e.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`e.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`e.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (PRODUCTION_MONTH) {
      const [year, month] = PRODUCTION_MONTH.split("-");
      const monthName = new Date(`${year}-${month}-01`).toLocaleString(
        "en-US",
        { month: "long" }
      );
      whereClauses.push(`f.PRODUCTION_MONTH = '${monthName}/${year}'`);
    }

    if (OFFSET_LINK) {
      whereClauses.push(`i.OFFSET_LINK_ID = '${OFFSET_LINK}'`);
    }
    if (EXECUTION_DEPARTMENT) {
      whereClauses.push(
        `b.EXECUTION_DEPARTMENT_ID = '${EXECUTION_DEPARTMENT}'`
      );
    }

    if (DATE_FROM && DATE_TO && DATE_TYPE) {
      const from = `${DATE_FROM} 00:00:00`;
      const to = `${DATE_TO} 23:59:59`;

      if (DATE_TYPE === "target") {
        outerWhereClauses.push(`WHERE TARGET_DATE BETWEEN '${from}' AND '${to}'`);
      } else if (DATE_TYPE === "commitment") {
        outerWhereClauses.push(`WHERE COMMITMENT_DATE BETWEEN '${from}' AND '${to}'`);
      }
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = getQueryScheduleStatus("EXECUTION_DEPARTMENT", whereSQL, outerWhereClauses);

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event schedule status department fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event schedule status department data",
      500
    );
  }
};

export const getEventSheduleStatusDetail = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
      DATE_TYPE,
      DATE_FROM,
      DATE_TO,
    } = req.query;

    let whereClauses = [];

    if (ORDER_ID) {
      whereClauses.push(`ORDER_ID = '${ORDER_ID}'`);
    }
    if (CUSTOMER_ID) {
      whereClauses.push(`CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }
    if (PRODUCTION_MONTH) {
      const [year, month] = PRODUCTION_MONTH.split("-");
      const monthName = new Date(`${year}-${month}-01`).toLocaleString(
        "en-US",
        {
          month: "long",
        }
      );
      whereClauses.push(`PRODUCTION_MONTH = '${monthName}/${year}'`);
    }
    if (OFFSET_LINK) {
      whereClauses.push(`OFFSET_LINK_ID = '${OFFSET_LINK}'`);
    }
    if (EXECUTION_DEPARTMENT) {
      whereClauses.push(`EXECUTION_DEPARTMENT_ID = '${EXECUTION_DEPARTMENT}'`);
    }

    if (DATE_FROM && DATE_TO && DATE_TYPE) {
      const from = `${DATE_FROM} 00:00:00`;
      const to = `${DATE_TO} 23:59:59`;

      if (DATE_TYPE === "target") {
        whereClauses.push(`TARGET_DATE BETWEEN '${from}' AND '${to}'`);
      } else if (DATE_TYPE === "commitment") {
        whereClauses.push(`COMMITMENT_DATE BETWEEN '${from}' AND '${to}'`);
      }
    }

    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    const finalQuery = `
      WITH base AS (
        SELECT
          c.EVENT_GROUP_NAME, 
          d.EVENT_TYPE_NAME, 
          f.CUSTOMER_NAME,
          f.CUSTOMER_DIVISION,
          f.CUSTOMER_SEASON,
          a.ORDER_ID, 
          e.ORDER_REFERENCE_PO_NO, 
          e.ORDER_STYLE_DESCRIPTION,
          f.ORDER_PO_ID,
          b.EVENT_NAME,
          a.EVENT_STATUS,
          CONCAT(j.OFFSET_LINK_NAME, " (", i.EVENT_OFFSET_DAYS ,")") AS OFFSET_LINK,
          DATE_ADD(
              CASE 
                  WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
                      THEN e.ORDER_CONFIRMED_DATE
                  WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
                      THEN f.FINAL_DELIVERY_DATE
                  WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
                      THEN f.PLAN_EXFACTORY_DATE
                  WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
                      THEN MIN(f.FINAL_DELIVERY_DATE) OVER (PARTITION BY e.ORDER_ID)
                  WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
                      THEN MIN(f.PLAN_EXFACTORY_DATE) OVER (PARTITION BY e.ORDER_ID)
                  WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
                      THEN e.PLAN_CUT_DATE
                  WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
                      THEN e.PLAN_SEW_DATE
              END,
              INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
          ) AS TARGET_DATE,
          a.COMMITMENT_DATE,
          a.COMPLETED_AT,
          k.NAME_DEPT AS EXECUTION_DEPARTMENT,
          o.USER_INISIAL AS COMPLETED_BY,
          n.PRODUCTION_PROCESS_NAME,
          b.IS_R2P_VALIDATE,
          a.EVENT_NOTE,
          e.CUSTOMER_ID,
          e.CUSTOMER_SEASON_ID,
          e.CUSTOMER_DIVISION_ID,
          f.PRODUCTION_MONTH,
          i.OFFSET_LINK_ID,
          b.EXECUTION_DEPARTMENT_ID
        FROM event_diary_header a
        INNER JOIN event_master b ON a.EVENT_ID = b.EVENT_ID
        INNER JOIN master_event_group c ON c.EVENT_GROUP_ID = b.EVENT_GROUP_ID
        INNER JOIN master_event_type d ON d.EVENT_TYPE_ID = b.EVENT_TYPE_ID
        INNER JOIN order_po_header e ON e.ORDER_ID = a.ORDER_ID
        LEFT JOIN (
          SELECT l.*
          FROM (
              SELECT l.*,
                      ROW_NUMBER() OVER (PARTITION BY l.ORDER_NO ORDER BY l.ORDER_PO_ID) AS rn
              FROM order_po_listing l
          ) l
          WHERE l.rn = 1
        ) f ON f.ORDER_NO = a.ORDER_ID
        INNER JOIN event_framework h ON h.ORDER_ID = a.ORDER_ID 
        INNER JOIN event_template_line i ON i.TEMPLATE_ID = h.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
        LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
        INNER JOIN master_department k ON k.ID_DEPT = b.EXECUTION_DEPARTMENT_ID
        INNER JOIN master_production_process n ON n.PRODUCTION_PROCESS_ID = b.PRODUCTION_PROCESS_ID
        LEFT JOIN xref_user_web o ON o.USER_ID = a.COMPLETED_BY
      )
      SELECT *
      FROM base
      ${whereSQL};
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event schedule status detail fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event schedule status detail data",
      500
    );
  }
};

function getQueryScheduleStatus(type, whereSQL, outerWhereClauses) {
  const query = `
    WITH event_calculated AS (
        SELECT 
            c.EVENT_GROUP_NAME, 
            b.EVENT_NAME, 
            k.NAME_DEPT AS EXECUTION_DEPARTMENT, 
            d.EVENT_TYPE_NAME, 
            n.PRODUCTION_PROCESS_NAME, 
            a.EVENT_STATUS,
            a.COMPLETED_AT,
            DATE_ADD(
                CASE 
                    WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date', 'Order (Style) Confirmed Date') THEN e.ORDER_CONFIRMED_DATE
                    WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date' THEN f.FINAL_DELIVERY_DATE
                    WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date' THEN f.PLAN_EXFACTORY_DATE
                    WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date' THEN MIN(f.FINAL_DELIVERY_DATE) OVER (PARTITION BY e.ORDER_ID)
                    WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date' THEN MIN(f.PLAN_EXFACTORY_DATE) OVER (PARTITION BY e.ORDER_ID)
                    WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)' THEN e.PLAN_CUT_DATE
                    WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)' THEN e.PLAN_SEW_DATE
                END, INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
            ) AS TARGET_DATE,
            a.COMMITMENT_DATE
        FROM event_diary_header a
        INNER JOIN event_master b ON a.EVENT_ID = b.EVENT_ID
        INNER JOIN master_event_group c ON c.EVENT_GROUP_ID = b.EVENT_GROUP_ID
        INNER JOIN master_event_type d ON d.EVENT_TYPE_ID = b.EVENT_TYPE_ID
        INNER JOIN order_po_header e ON e.ORDER_ID = a.ORDER_ID
        LEFT JOIN (
            SELECT * FROM (
                SELECT l.*, ROW_NUMBER() OVER (PARTITION BY l.ORDER_NO ORDER BY l.ORDER_PO_ID) AS rn
                FROM order_po_listing l
            ) x
            WHERE rn = 1 OR x.ORDER_PO_ID IS NOT NULL
        ) f ON f.ORDER_NO = a.ORDER_ID AND (a.ORDER_PO_ID IS NULL OR f.ORDER_PO_ID = a.ORDER_PO_ID)
        INNER JOIN event_framework h ON h.ORDER_ID = a.ORDER_ID
        INNER JOIN event_template_line i ON i.TEMPLATE_ID = h.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
        LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
        INNER JOIN master_department k ON k.ID_DEPT = b.EXECUTION_DEPARTMENT_ID
        INNER JOIN master_production_process n ON n.PRODUCTION_PROCESS_ID = b.PRODUCTION_PROCESS_ID
        ${whereSQL}
    )
    SELECT 
        EVENT_GROUP_NAME, 
        EVENT_NAME, 
        EXECUTION_DEPARTMENT, 
        EVENT_TYPE_NAME, 
        PRODUCTION_PROCESS_NAME, 
        COUNT(*) AS 'TOTAL_NO_OF_EVENTS',
        SUM(CASE WHEN EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_OPEN_EVENTS',
        SUM(CASE WHEN EVENT_STATUS = 'Complete' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_COMPLETED_EVENTS',
        SUM(CASE WHEN EVENT_STATUS = 'Complete' AND DATE(TARGET_DATE) >= DATE(COMPLETED_AT) THEN 1 ELSE 0 END) AS 'NO_OF_ACHIEVEMENT_EVENTS',
        ROUND(100.0 * SUM(CASE WHEN EVENT_STATUS = 'Complete' AND DATE(TARGET_DATE) >= DATE(COMPLETED_AT) THEN 1 ELSE 0 END) / COUNT(*), 0) AS TARGET_VS_ACHIEVEMENT,
        SUM(CASE WHEN EVENT_STATUS = 'Complete' AND DATE(TARGET_DATE) < DATE(COMPLETED_AT) THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_LATE_COMPLETION_EVENTS',
        ROUND(100.0 * SUM(CASE WHEN EVENT_STATUS = 'Complete' AND DATE(TARGET_DATE) < DATE(COMPLETED_AT) THEN 1 ELSE 0 END) / COUNT(*), 0) AS TARGET_VS_LATE_COMPLETION_EVENTS
    FROM event_calculated
    ${outerWhereClauses}
    GROUP BY ${type}
    ORDER BY ${type}
  `;

  return query;
}
