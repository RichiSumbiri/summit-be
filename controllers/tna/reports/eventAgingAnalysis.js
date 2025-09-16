import {
  successResponse,
  errorResponse,
} from "../../helpers/responseHelper.js";
import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";

export const getEventAgingAnalysisTarget = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
    } = req.query;

    let whereClauses = [];
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

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = `
      WITH event_calculated AS (
        SELECT 
            c.EVENT_GROUP_NAME, 
            b.EVENT_NAME, 
            k.NAME_DEPT AS EXECUTION_DEPARTMENT, 
            d.EVENT_TYPE_NAME, 
            n.PRODUCTION_PROCESS_NAME, 
            a.EVENT_STATUS, 
            DATE_ADD(
                CASE 
                    WHEN j.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date', 'Order (Style) Confirmed Date') 
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
                END, INTERVAL (i.EVENT_OFFSET_DAYS - 1) DAY
            ) AS TARGET_DATE
        FROM event_diary_header a
        INNER JOIN event_master b ON a.EVENT_ID = b.EVENT_ID
        INNER JOIN master_event_group c ON c.EVENT_GROUP_ID = b.EVENT_GROUP_ID
        INNER JOIN master_event_type d ON d.EVENT_TYPE_ID = b.EVENT_TYPE_ID
        INNER JOIN order_po_header e ON e.ORDER_ID = a.ORDER_ID
        LEFT JOIN (
            SELECT *
            FROM (
                SELECT 
                    l.*, 
                    ROW_NUMBER() OVER (PARTITION BY l.ORDER_NO ORDER BY l.ORDER_PO_ID) AS rn
                FROM order_po_listing l
            ) x
            WHERE rn = 1 OR x.ORDER_PO_ID IS NOT NULL
        ) f 
            ON f.ORDER_NO = a.ORDER_ID
          AND (a.ORDER_PO_ID IS NULL OR f.ORDER_PO_ID = a.ORDER_PO_ID)
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
          EVENT_STATUS, 
          TARGET_DATE, 
          SUM(CASE WHEN EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_OPEN_EVENTS',
          SUM(CASE WHEN TARGET_DATE < CURRENT_DATE() AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_TARGET_DUE_DATE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 1 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_1_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 2 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_2_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 3 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_3_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 4 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_4_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 5 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_5_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) = 6 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_6_DUE',
          SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), TARGET_DATE) >= 7 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'OVER_DAY_7_DUE'
      FROM event_calculated
      GROUP BY 
          EVENT_GROUP_NAME, 
          EVENT_NAME, 
          EXECUTION_DEPARTMENT, 
          EVENT_TYPE_NAME, 
          PRODUCTION_PROCESS_NAME, 
          EVENT_STATUS
      ORDER BY EVENT_NAME;
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event aging target due date fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event aging target due date data",
      500
    );
  }
};

export const getEventAgingAnalysisCommitment = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
    } = req.query;

    let whereClauses = [];
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

    // build WHERE
    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    // base query + filters
    const finalQuery = `
      WITH event_calculated AS (
        SELECT
            c.EVENT_GROUP_NAME,
            b.EVENT_NAME,
            k.NAME_DEPT AS EXECUTION_DEPARTMENT,
            d.EVENT_TYPE_NAME,
            n.PRODUCTION_PROCESS_NAME,
            a.EVENT_STATUS,
            a.COMMITMENT_DATE
        FROM event_diary_header a
        INNER JOIN event_master b ON a.EVENT_ID = b.EVENT_ID
        INNER JOIN master_event_group c ON c.EVENT_GROUP_ID = b.EVENT_GROUP_ID
        INNER JOIN master_event_type d ON d.EVENT_TYPE_ID = b.EVENT_TYPE_ID
        INNER JOIN order_po_header e ON e.ORDER_ID = a.ORDER_ID
        LEFT JOIN (
            SELECT l.*,
                  ROW_NUMBER() OVER (PARTITION BY l.ORDER_NO ORDER BY l.ORDER_PO_ID) AS rn
            FROM order_po_listing l
        ) f ON f.ORDER_NO = a.ORDER_ID
        AND ( (a.ORDER_PO_ID IS NULL AND f.rn = 1) OR f.ORDER_PO_ID = a.ORDER_PO_ID )
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
        EVENT_STATUS,
        COMMITMENT_DATE,
        SUM(CASE WHEN EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_OPEN_EVENTS',
        SUM(CASE WHEN COMMITMENT_DATE < CURRENT_DATE() AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'TOTAL_NO_OF_TARGET_DUE_DATE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 1 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_1_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 2 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_2_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 3 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_3_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 4 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_4_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 5 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_5_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) = 6 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'DAY_6_DUE',
        SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), COMMITMENT_DATE) >= 7 AND EVENT_STATUS = 'Open' THEN 1 ELSE 0 END) AS 'OVER_DAY_7_DUE'
    FROM event_calculated
    GROUP BY
        EVENT_GROUP_NAME,
        EVENT_NAME,
        EXECUTION_DEPARTMENT,
        EVENT_TYPE_NAME,
        PRODUCTION_PROCESS_NAME,
        EVENT_STATUS,
        COMMITMENT_DATE
    ORDER BY EVENT_NAME;
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event aging commitment due date fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event aging commitment due date data",
      500
    );
  }
};

export const getEventAgingAnalysisAging = async (req, res) => {
  try {
    const {
      CUSTOMER_SEASON_ID,
      CUSTOMER_ID,
      CUSTOMER_DIVISION_ID,
      ORDER_ID,
      PRODUCTION_MONTH,
      OFFSET_LINK,
      EXECUTION_DEPARTMENT,
    } = req.query;

    let whereClauses = [];
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
        f.CUSTOMER_NAME AS CUSTOMER_NAME,
        f.CUSTOMER_DIVISION AS CUSTOMER_DIVISION,
        f.CUSTOMER_SEASON AS CUSTOMER_SEASON,
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
        n.PRODUCTION_PROCESS_NAME
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
        ${whereSQL}
        )
        SELECT
          base.*,
          base.TARGET_DATE,
          CASE
          WHEN base.TARGET_DATE IS NULL THEN NULL
          WHEN DATE(base.TARGET_DATE) > CURDATE()
            THEN - (DATEDIFF(DATE(base.TARGET_DATE), CURDATE()) + 1)
          ELSE (DATEDIFF(CURDATE(), DATE(base.TARGET_DATE)) + 1)
        END AS TARGET_DUE_DAYS,
          CASE
          WHEN base.COMMITMENT_DATE IS NULL THEN NULL
          WHEN DATE(base.COMMITMENT_DATE) > CURDATE()
            THEN - (DATEDIFF(DATE(base.COMMITMENT_DATE), CURDATE()) + 1)
          ELSE (DATEDIFF(CURDATE(), DATE(base.COMMITMENT_DATE)) + 1)
        END AS COMMITMENT_DUE_DAYS
      FROM base
    `;

    let diaryMasterData = await db.query(finalQuery, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      diaryMasterData,
      "Event aging detail fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch event aging detail data",
      500
    );
  }
};
