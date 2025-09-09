import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";

export const getEventAchievementAnalysisEvent = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      EVENT_COMPLETED_FROM,
      EVENT_COMPLETED_TO,
    } = req.query;

    let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`k.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`n.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`n.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (EVENT_COMPLETED_FROM && EVENT_COMPLETED_TO) {
      const from = `${EVENT_COMPLETED_FROM} 00:00:00`;
      const to = `${EVENT_COMPLETED_TO} 23:59:59`;

      whereClauses.push(`a.COMPLETED_AT BETWEEN '${from}' AND '${to}'`);
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = `
      WITH base AS (
      SELECT
        a.EVENT_STATUS,
        a.COMMITMENT_DATE,
        c.EVENT_NAME,
        d.NAME_DEPT,
        e.EVENT_TYPE_NAME,
        f.PRODUCTION_PROCESS_NAME,
        j.OFFSET_LINK_ID,
        DATE_ADD(
          CASE 
            WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
                THEN k.ORDER_CONFIRMED_DATE
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
                THEN k.PLAN_CUT_DATE
            WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
                THEN k.PLAN_SEW_DATE
          END,
          INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
        ) AS TARGET_DATE,
        o.EVENT_GROUP_NAME
      FROM event_diary_header a
      INNER JOIN event_framework b ON a.ORDER_ID = b.ORDER_ID
      INNER JOIN event_master c ON a.EVENT_ID = c.EVENT_ID
      INNER JOIN master_department d ON c.EXECUTION_DEPARTMENT_ID = d.ID_DEPT
      INNER JOIN master_event_type e ON c.EVENT_TYPE_ID = e.EVENT_TYPE_ID
      INNER JOIN master_production_process f ON f.PRODUCTION_PROCESS_ID = c.PRODUCTION_PROCESS_ID
      INNER JOIN event_template_line i ON i.TEMPLATE_ID = b.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
      LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
      INNER JOIN order_po_header k ON k.ORDER_ID = a.ORDER_ID
      LEFT JOIN order_po_listing l ON l.ORDER_NO = a.ORDER_ID AND l.ORDER_PO_ID = a.ORDER_PO_ID
      LEFT JOIN (
        SELECT m.ORDER_NO,
              MIN(m.CUSTOMER_NAME) AS CUSTOMER_NAME,
              MIN(m.CUSTOMER_DIVISION) AS CUSTOMER_DIVISION,
              MIN(m.CUSTOMER_SEASON) AS CUSTOMER_SEASON,
              MIN(m.FINAL_DELIVERY_DATE) AS FINAL_DELIVERY_DATE,
              MIN(m.PLAN_EXFACTORY_DATE) AS PLAN_EXFACTORY_DATE
        FROM order_po_listing m
        GROUP BY m.ORDER_NO
      ) n ON n.ORDER_NO = a.ORDER_ID
      INNER JOIN master_event_group o ON o.EVENT_GROUP_ID = c.EVENT_GROUP_ID
      ${whereSQL}
    )
    SELECT
      EVENT_NAME,
      NAME_DEPT,
      EVENT_TYPE_NAME,
      PRODUCTION_PROCESS_NAME,
      EVENT_GROUP_NAME,
      MIN(TARGET_DATE) AS TARGET_DATE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END) AS TOTAL_EVENT_COMPLETED,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) AS TARGET_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS TARGET_DATE_PERCENTAGE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) AS COMMITMENT_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS COMMITMENT_DATE_PERCENTAGE
    FROM base
    GROUP BY EVENT_NAME, NAME_DEPT, EVENT_TYPE_NAME, PRODUCTION_PROCESS_NAME, EVENT_GROUP_NAME
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event achievement fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event achievement data",
      500
    );
  }
};

export const getEventAchievementAnalysisOwner = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      EVENT_COMPLETED_FROM,
      EVENT_COMPLETED_TO,
    } = req.query;

    let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`k.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`n.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`n.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (EVENT_COMPLETED_FROM && EVENT_COMPLETED_TO) {
      const from = `${EVENT_COMPLETED_FROM} 00:00:00`;
      const to = `${EVENT_COMPLETED_TO} 23:59:59`;

      whereClauses.push(`a.COMPLETED_AT BETWEEN '${from}' AND '${to}'`);
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = `
      WITH base AS (
      SELECT
        p.USER_INISIAL AS COMPLETED_BY,
        a.EVENT_STATUS,
        a.COMMITMENT_DATE,
        c.EVENT_NAME,
        d.NAME_DEPT,
        e.EVENT_TYPE_NAME,
        f.PRODUCTION_PROCESS_NAME,
        j.OFFSET_LINK_ID,
        DATE_ADD(
          CASE 
            WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
                THEN k.ORDER_CONFIRMED_DATE
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
                THEN k.PLAN_CUT_DATE
            WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
                THEN k.PLAN_SEW_DATE
          END,
          INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
        ) AS TARGET_DATE,
        o.EVENT_GROUP_NAME
      FROM event_diary_header a
      INNER JOIN event_framework b ON a.ORDER_ID = b.ORDER_ID
      INNER JOIN event_master c ON a.EVENT_ID = c.EVENT_ID
      INNER JOIN master_department d ON c.EXECUTION_DEPARTMENT_ID = d.ID_DEPT
      INNER JOIN master_event_type e ON c.EVENT_TYPE_ID = e.EVENT_TYPE_ID
      INNER JOIN master_production_process f ON f.PRODUCTION_PROCESS_ID = c.PRODUCTION_PROCESS_ID
      INNER JOIN event_template_line i ON i.TEMPLATE_ID = b.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
      LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
      INNER JOIN order_po_header k ON k.ORDER_ID = a.ORDER_ID
      LEFT JOIN order_po_listing l ON l.ORDER_NO = a.ORDER_ID AND l.ORDER_PO_ID = a.ORDER_PO_ID
      LEFT JOIN (
        SELECT m.ORDER_NO,
              MIN(m.CUSTOMER_NAME) AS CUSTOMER_NAME,
              MIN(m.CUSTOMER_DIVISION) AS CUSTOMER_DIVISION,
              MIN(m.CUSTOMER_SEASON) AS CUSTOMER_SEASON,
              MIN(m.FINAL_DELIVERY_DATE) AS FINAL_DELIVERY_DATE,
              MIN(m.PLAN_EXFACTORY_DATE) AS PLAN_EXFACTORY_DATE
        FROM order_po_listing m
        GROUP BY m.ORDER_NO
      ) n ON n.ORDER_NO = a.ORDER_ID
      INNER JOIN master_event_group o ON o.EVENT_GROUP_ID = c.EVENT_GROUP_ID
      INNER JOIN xref_user_web p ON p.USER_ID = a.COMPLETED_BY
      ${whereSQL}
    )
    SELECT
      COMPLETED_BY,
      EVENT_NAME,
      NAME_DEPT,
      EVENT_TYPE_NAME,
      PRODUCTION_PROCESS_NAME,
      EVENT_GROUP_NAME,
      MIN(TARGET_DATE) AS TARGET_DATE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END) AS TOTAL_EVENT_COMPLETED,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) AS TARGET_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS TARGET_DATE_PERCENTAGE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) AS COMMITMENT_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS COMMITMENT_DATE_PERCENTAGE
    FROM base
    GROUP BY EVENT_NAME, NAME_DEPT, EVENT_TYPE_NAME, PRODUCTION_PROCESS_NAME, EVENT_GROUP_NAME, COMPLETED_BY
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event achievement fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch owner achievement data",
      500
    );
  }
};

export const getEventAchievementAnalysisDepartment = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      EVENT_COMPLETED_FROM,
      EVENT_COMPLETED_TO,
    } = req.query;

    let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`k.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`n.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`n.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (EVENT_COMPLETED_FROM && EVENT_COMPLETED_TO) {
      const from = `${EVENT_COMPLETED_FROM} 00:00:00`;
      const to = `${EVENT_COMPLETED_TO} 23:59:59`;

      whereClauses.push(`a.COMPLETED_AT BETWEEN '${from}' AND '${to}'`);
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = `
      WITH base AS (
      SELECT
        p.USER_INISIAL AS COMPLETED_BY,
        a.EVENT_STATUS,
        a.COMMITMENT_DATE,
        c.EVENT_NAME,
        d.NAME_DEPT,
        e.EVENT_TYPE_NAME,
        f.PRODUCTION_PROCESS_NAME,
        j.OFFSET_LINK_ID,
        DATE_ADD(
          CASE 
            WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
                THEN k.ORDER_CONFIRMED_DATE
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
                THEN COALESCE(l.FINAL_DELIVERY_DATE, n.FINAL_DELIVERY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
                THEN COALESCE(l.PLAN_EXFACTORY_DATE, n.PLAN_EXFACTORY_DATE)
            WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
                THEN k.PLAN_CUT_DATE
            WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
                THEN k.PLAN_SEW_DATE
          END,
          INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
        ) AS TARGET_DATE,
        o.EVENT_GROUP_NAME
      FROM event_diary_header a
      INNER JOIN event_framework b ON a.ORDER_ID = b.ORDER_ID
      INNER JOIN event_master c ON a.EVENT_ID = c.EVENT_ID
      INNER JOIN master_department d ON c.EXECUTION_DEPARTMENT_ID = d.ID_DEPT
      INNER JOIN master_event_type e ON c.EVENT_TYPE_ID = e.EVENT_TYPE_ID
      INNER JOIN master_production_process f ON f.PRODUCTION_PROCESS_ID = c.PRODUCTION_PROCESS_ID
      INNER JOIN event_template_line i ON i.TEMPLATE_ID = b.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
      LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
      INNER JOIN order_po_header k ON k.ORDER_ID = a.ORDER_ID
      LEFT JOIN order_po_listing l ON l.ORDER_NO = a.ORDER_ID AND l.ORDER_PO_ID = a.ORDER_PO_ID
      LEFT JOIN (
        SELECT m.ORDER_NO,
              MIN(m.CUSTOMER_NAME) AS CUSTOMER_NAME,
              MIN(m.CUSTOMER_DIVISION) AS CUSTOMER_DIVISION,
              MIN(m.CUSTOMER_SEASON) AS CUSTOMER_SEASON,
              MIN(m.FINAL_DELIVERY_DATE) AS FINAL_DELIVERY_DATE,
              MIN(m.PLAN_EXFACTORY_DATE) AS PLAN_EXFACTORY_DATE
        FROM order_po_listing m
        GROUP BY m.ORDER_NO
      ) n ON n.ORDER_NO = a.ORDER_ID
      INNER JOIN master_event_group o ON o.EVENT_GROUP_ID = c.EVENT_GROUP_ID
      INNER JOIN xref_user_web p ON p.USER_ID = a.COMPLETED_BY
      ${whereSQL}
    )
    SELECT
      COMPLETED_BY,
      EVENT_NAME,
      NAME_DEPT,
      EVENT_TYPE_NAME,
      PRODUCTION_PROCESS_NAME,
      EVENT_GROUP_NAME,
      MIN(TARGET_DATE) AS TARGET_DATE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END) AS TOTAL_EVENT_COMPLETED,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) AS TARGET_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND OFFSET_LINK_ID IS NOT NULL THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS TARGET_DATE_PERCENTAGE,
      COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) AS COMMITMENT_DATE_ACHIEVEMENT,
      ROUND(
        COUNT(CASE WHEN EVENT_STATUS = 'complete' AND TARGET_DATE IS NOT NULL AND COMMITMENT_DATE > TARGET_DATE THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_STATUS = 'complete' THEN 1 END), 0), 0
      ) AS COMMITMENT_DATE_PERCENTAGE
    FROM base
    GROUP BY EVENT_NAME, NAME_DEPT, EVENT_TYPE_NAME, PRODUCTION_PROCESS_NAME, EVENT_GROUP_NAME, COMPLETED_BY
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event achievement fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch owner achievement data",
      500
    );
  }
};

export const getEventAchievementAnalysisDetail = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      EVENT_COMPLETED_FROM,
      EVENT_COMPLETED_TO,
    } = req.query;

    let whereClauses = [`a.EVENT_STATUS = 'Complete'`];

    if (ORDER_ID) {
      whereClauses.push(`a.ORDER_ID = '${ORDER_ID}'`);
    }

    if (CUSTOMER_ID) {
      whereClauses.push(`e.CUSTOMER_ID = '${CUSTOMER_ID}'`);
    }
    if (CUSTOMER_SEASON_ID) {
      whereClauses.push(`g.CUSTOMER_SEASON_ID = '${CUSTOMER_SEASON_ID}'`);
    }
    if (CUSTOMER_DIVISION_ID) {
      whereClauses.push(`g.CUSTOMER_DIVISION_ID = '${CUSTOMER_DIVISION_ID}'`);
    }

    if (EVENT_COMPLETED_FROM && EVENT_COMPLETED_TO) {
      const from = `${EVENT_COMPLETED_FROM} 00:00:00`;
      const to = `${EVENT_COMPLETED_TO} 23:59:59`;

      whereClauses.push(`a.COMPLETED_AT BETWEEN '${from}' AND '${to}'`);
    }

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";      

    // base query + filters
    const finalQuery = `
      WITH base AS (
      SELECT
        c.EVENT_GROUP_NAME, 
      d.EVENT_TYPE_NAME, 
      COALESCE(f.CUSTOMER_NAME, g.CUSTOMER_NAME) AS CUSTOMER_NAME,
        COALESCE(f.CUSTOMER_DIVISION, g.CUSTOMER_DIVISION) AS CUSTOMER_DIVISION,
        COALESCE(f.CUSTOMER_SEASON, g.CUSTOMER_SEASON) AS CUSTOMER_SEASON ,
      a.ORDER_ID, 
      e.ORDER_REFERENCE_PO_NO, 
      e.ORDER_STYLE_DESCRIPTION,
      f.ORDER_PO_ID,
      b.EVENT_NAME,
      CONCAT(j.OFFSET_LINK_NAME, " (", i.EVENT_OFFSET_DAYS ,")") AS OFFSET_LINK,
      DATE_ADD(
        CASE 
          WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
              THEN e.ORDER_CONFIRMED_DATE
          WHEN j.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
              THEN COALESCE(f.FINAL_DELIVERY_DATE, g.FINAL_DELIVERY_DATE)
          WHEN j.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
              THEN COALESCE(f.PLAN_EXFACTORY_DATE, g.PLAN_EXFACTORY_DATE)
          WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
              THEN COALESCE(MIN(f.FINAL_DELIVERY_DATE) OVER (PARTITION BY e.ORDER_ID),
                            MIN(g.FINAL_DELIVERY_DATE) OVER (PARTITION BY e.ORDER_ID))
          WHEN j.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
              THEN COALESCE(MIN(f.PLAN_EXFACTORY_DATE) OVER (PARTITION BY e.ORDER_ID),
                            MIN(g.PLAN_EXFACTORY_DATE) OVER (PARTITION BY e.ORDER_ID))
          WHEN j.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
              THEN e.PLAN_CUT_DATE
          WHEN j.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
              THEN e.PLAN_SEW_DATE
        END,
        INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
      ) AS TARGET_DATE,
      a.COMMITMENT_DATE,
      a.COMPLETED_AT,
      k.NAME_DEPT,
      m.USER_INISIAL AS COMPLETED_BY,
      n.PRODUCTION_PROCESS_NAME,
      i.IS_R2P_VALIDATE,
      a.EVENT_NOTE
      FROM event_diary_header a
      INNER JOIN event_master b ON a.EVENT_ID = b.EVENT_ID
      INNER JOIN master_event_group c ON c.EVENT_GROUP_ID = b.EVENT_GROUP_ID
      INNER JOIN master_event_type d ON d.EVENT_TYPE_ID = b.EVENT_TYPE_ID
      INNER JOIN order_po_header e ON e.ORDER_ID = a.ORDER_ID
      LEFT JOIN order_po_listing f ON f.ORDER_NO = a.ORDER_ID AND f.ORDER_PO_ID = a.ORDER_PO_ID
      LEFT JOIN (
          SELECT l.ORDER_NO, l.CUSTOMER_NAME, l.CUSTOMER_DIVISION, l.CUSTOMER_SEASON, l.FINAL_DELIVERY_DATE, l.PLAN_EXFACTORY_DATE
          FROM order_po_listing l
          GROUP BY l.ORDER_NO 
          LIMIT 1
      ) g  ON g.ORDER_NO = a.ORDER_ID
      INNER JOIN event_framework h ON h.ORDER_ID = a.ORDER_ID 
      INNER JOIN event_template_line i ON i.TEMPLATE_ID = h.TEMPLATE_ID AND i.EVENT_ID = a.EVENT_ID
      LEFT JOIN master_offset_link j ON j.OFFSET_LINK_ID = i.OFFSET_LINK_ID
      INNER JOIN master_department k ON k.ID_DEPT = b.EXECUTION_DEPARTMENT_ID
      LEFT JOIN xref_user_web m ON m.USER_ID = a.COMPLETED_BY
      INNER JOIN master_production_process n ON n.PRODUCTION_PROCESS_ID = b.PRODUCTION_PROCESS_ID
      ${whereSQL}
    )
    SELECT
      base.*,
      (DATEDIFF(CURDATE(), base.TARGET_DATE) + 1) AS TARGET_DATE_ACHIEVEMENT,
      (DATEDIFF(CURDATE(), base.COMMITMENT_DATE) + 1) AS COMMITMENT_DATE_ACHIEVEMENT
    FROM base
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event detail fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch event detail data", 500);
  }
};
