import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QueryWipMonitor = `SELECT N.*, 
IFNULL(N.SCH_SIZE_QTY - N.TTL_SEWING_IN, 0) AS TTL_SEWING_IN_BAL,
IFNULL(N.TTL_SEWING_IN - N.TTL_QC_QTY, 0) AS TTL_SEWING_WIP,
IFNULL(N.TTL_QC_QTY - N.TTL_SEWING_OUT, 0) AS TTL_QC_BALANCE,
IFNULL(N.TTL_SEWING_OUT - N.TTL_PACKING_IN, 0) AS TTL_SEWING_OUT_BALANCE,
IF(IFNULL(N.TTL_SEWING_IN / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_LOADING_STATUS,
IF(IFNULL(N.TTL_QC_QTY / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_QC_STATUS,
IF(IFNULL(N.TTL_SEWING_OUT / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_SEWING_OUT_STATUS,
IF(IFNULL(N.TTL_PACKING_IN / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_PACKING_IN_STATUS,
CONCAT(ROUND(IFNULL(N.TTL_SEWING_IN / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_LOADING_PERCENTAGE,
CONCAT(ROUND(IFNULL(N.TTL_QC_QTY / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_QC_PERCENTAGE,
CONCAT(ROUND(IFNULL(N.TTL_SEWING_OUT / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_SEWING_OUT_PERCENTAGE,
CONCAT(ROUND(IFNULL(N.TTL_PACKING_IN / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_PACKING_IN_PERCENTAGE
FROM (
    SELECT 
        M.SCH_ID, M.ACTUAL_MONTH,
        M.PRODUCTION_MONTH, M.MANUFACTURING_SITE,
        M.SCH_SITE, M.SCH_ID_SITELINE, M.LINE_NAME, M.CUSTOMER_NAME, 
        M.SCH_CAPACITY_ID, M.ORDER_REFERENCE_PO_NO, 
        M.PRODUCT_ITEM_CODE, M.PRODUCT_ITEM_DESCRIPTION,
        M.ORDER_STYLE_DESCRIPTION, M.ITEM_COLOR_NAME, 
        M.ITEM_COLOR_CODE, M.TARGET_PCD, 
        IFNULL(M.NEW_PLAN_EXFACTORY_DATE,  M.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
        M.FINAL_DELIVERY_DATE, M.SCH_START_PROD, M.SCH_FINISH_PROD, M.SCH_ORDER,
        M.NEW_TARGET_PCD, M.NEW_FINAL_DELIVERY_DATE, 
        M.SCH_QTY, M.MO_QTY, CASE WHEN M.SCH_QTY = M.MO_QTY  THEN  'ALL' ELSE 'PARTIAL' END AS SIZE_CODE,
        SUM(M.SCH_SIZE_QTY) SCH_SIZE_QTY,
        SUM(M.TTL_SEWING_IN) TTL_SEWING_IN,
        SUM(M.TTL_QC_QTY) TTL_QC_QTY,
        SUM(M.TTL_SEWING_OUT) TTL_SEWING_OUT,
        SUM(M.TTL_PACKING_IN) TTL_PACKING_IN
    FROM (
	       SELECT a.SCH_ID, 
	        CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
	        b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, 
	        a.SCH_CAPACITY_ID, a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, 
	        b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION,
	        b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, 
	        b.ITEM_COLOR_CODE, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
	        b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
	        b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE,
	        
	        d.SIZE_CODE, 
	        IFNULL(d.SCH_SIZE_QTY,0) AS SCH_SIZE_QTY, 
	        IFNULL(e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
	        IFNULL(e.TTL_QC_QTY, 0) AS TTL_QC_QTY,
	        IFNULL(e.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
	        IFNULL(e.TTL_PACKING_IN, 0) AS TTL_PACKING_IN
	        FROM weekly_prod_schedule a  
	        LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
	        LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
	        LEFT JOIN (
	            SELECT p.SCH_ID, p.SIZE_CODE, SUM(p.SCH_SIZE_QTY) SCH_SIZE_QTY
	            FROM  weekly_sch_size p 
	            WHERE  p.SCH_ID IN (
	                SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
	                WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
	            ) 
	            GROUP BY p.SCH_ID, p.SIZE_CODE
	        ) d ON d.SCH_ID = a.SCH_ID
	        LEFT JOIN (
	   			SELECT a.SCH_ID, a.SIZE_CODE, a.TTL_SEWING_IN, a.TTL_QC_QTY, a.TTL_SEWING_OUT, a.TTL_PACKING_IN
					FROM log_sewing_wip_monitoring a 
					WHERE a.SCH_SITE =:sitename AND  a.SCH_ID IN (
						SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
					  	WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
					)
	        ) e ON(a.SCH_ID = e.SCH_ID AND d.SIZE_CODE = e.SIZE_CODE)
	     WHERE a.SCH_SITE =:sitename AND a.SCH_ID IN  (
	      	SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
	     ) AND (d.SCH_SIZE_QTY + IFNULL(e.TTL_SEWING_IN, 0) <> 0)  
	     ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC
    ) M GROUP BY M.SCH_ID
) N ORDER BY N.SCH_ID_SITELINE`;
// export const QueryWipMonitor = `SELECT N.*, 
// IFNULL(N.SCH_SIZE_QTY - N.TTL_SEWING_IN, 0) AS TTL_SEWING_IN_BAL,
// IFNULL(N.TTL_SEWING_IN - N.TTL_QC_QTY, 0) AS TTL_SEWING_WIP,
// IFNULL(N.TTL_QC_QTY - N.TTL_SEWING_OUT, 0) AS TTL_QC_BALANCE,
// IFNULL(N.TTL_SEWING_OUT - N.TTL_PACKING_IN, 0) AS TTL_SEWING_OUT_BALANCE,
// IF(IFNULL(N.TTL_SEWING_IN / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_LOADING_STATUS,
// IF(IFNULL(N.TTL_QC_QTY / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_QC_STATUS,
// IF(IFNULL(N.TTL_SEWING_OUT / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_SEWING_OUT_STATUS,
// IF(IFNULL(N.TTL_PACKING_IN / N.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_PACKING_IN_STATUS,
// CONCAT(ROUND(IFNULL(N.TTL_SEWING_IN / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_LOADING_PERCENTAGE,
// CONCAT(ROUND(IFNULL(N.TTL_QC_QTY / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_QC_PERCENTAGE,
// CONCAT(ROUND(IFNULL(N.TTL_SEWING_OUT / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_SEWING_OUT_PERCENTAGE,
// CONCAT(ROUND(IFNULL(N.TTL_PACKING_IN / N.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_PACKING_IN_PERCENTAGE
// FROM (
//     SELECT 
//         M.SCH_ID, M.ACTUAL_MONTH,
//         M.PRODUCTION_MONTH, M.MANUFACTURING_SITE,
//         M.SCH_SITE, M.SCH_ID_SITELINE, M.LINE_NAME, M.CUSTOMER_NAME, 
//         M.SCH_CAPACITY_ID, M.ORDER_REFERENCE_PO_NO, 
//         M.PRODUCT_ITEM_CODE, M.PRODUCT_ITEM_DESCRIPTION,
//         M.ORDER_STYLE_DESCRIPTION, M.ITEM_COLOR_NAME, 
//         M.ITEM_COLOR_CODE, M.TARGET_PCD, 
//         IFNULL(M.NEW_PLAN_EXFACTORY_DATE,  M.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
//         M.FINAL_DELIVERY_DATE, M.SCH_START_PROD, M.SCH_FINISH_PROD, M.SCH_ORDER,
//         M.NEW_TARGET_PCD, M.NEW_FINAL_DELIVERY_DATE, 
//         M.SCH_QTY, M.MO_QTY, CASE WHEN M.SCH_QTY = M.MO_QTY  THEN  'ALL' ELSE 'PARTIAL' END AS SIZE_CODE,
//         SUM(M.SCH_SIZE_QTY) SCH_SIZE_QTY,
//         SUM(M.TTL_SEWING_IN) TTL_SEWING_IN,
//         SUM(M.TTL_QC_QTY) TTL_QC_QTY,
//         SUM(M.TTL_SEWING_OUT) TTL_SEWING_OUT,
//         SUM(M.TTL_PACKING_IN) TTL_PACKING_IN
//     FROM (
//         SELECT a.SCH_ID, 
//         CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
//         b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, 
//         a.SCH_CAPACITY_ID, a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, 
//         b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION,
//         b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME, 
//         b.ITEM_COLOR_CODE, b.TARGET_PCD, b.PLAN_EXFACTORY_DATE,
//         b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
//         b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE,
        
//         d.SIZE_CODE, 
//         IFNULL(d.SCH_SIZE_QTY,0) AS SCH_SIZE_QTY, 
//         IFNULL(e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
//         IFNULL(f.TTL_QC_QTY, 0) AS TTL_QC_QTY,
//         IFNULL(g.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
//         IFNULL(h.TTL_PACKING_IN, 0) AS TTL_PACKING_IN
//         FROM weekly_prod_schedule a  
//         LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
//         LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
//         LEFT JOIN (
//             SELECT p.SCH_ID, p.SIZE_CODE, SUM(p.SCH_SIZE_QTY) SCH_SIZE_QTY
//             FROM  weekly_sch_size p 
//             WHERE p.SCH_ID IN (
//                 SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                 WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//             ) 
//             GROUP BY p.SCH_ID, p.SIZE_CODE
//         ) d ON d.SCH_ID = a.SCH_ID
//         LEFT JOIN (
//         SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) TTL_SEWING_IN
//                 FROM scan_sewing_in a 
//                 LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
//                 WHERE a.SCH_ID IN (
//                             SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                             WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//                 ) 
//                 GROUP BY a.SCH_ID, b.ORDER_SIZE
//         ) e ON(a.SCH_ID = e.SCH_ID AND d.SIZE_CODE = e.ORDER_SIZE)
//         LEFT JOIN (
//                 SELECT  
//                     a.ENDLINE_SCH_ID, 
//                     a.ENDLINE_PLAN_SIZE, 
//                     SUM(a.ENDLINE_OUT_QTY) AS TTL_QC_QTY
//                     FROM qc_endline_output a 
//                     WHERE a.ENDLINE_SCH_ID IN (
//                             SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                             WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//                     )  AND 
//                         (
//                             (a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL) OR 
//                             (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
//                         )
//                     GROUP BY 
//                         a.ENDLINE_SCH_ID, 
//                         a.ENDLINE_PLAN_SIZE
//         ) f ON(a.SCH_ID = f.ENDLINE_SCH_ID AND d.SIZE_CODE = f.ENDLINE_PLAN_SIZE)
//         LEFT JOIN (
//                     SELECT a.SCH_ID, a.ORDER_SIZE, SUM(a.ORDER_QTY) TTL_SEWING_OUT 
//                     FROM (
//                         SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
//                         a.BARCODE_MAIN AS BARCODE_SERIAL,
//                         CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
//                         FROM scan_sewing_out a 
//                         LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
//                         LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
//                         WHERE a.SCH_ID IN (
//                             SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                                 WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//                         ) 
//                         GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
//                     ) a GROUP BY a.SCH_ID, a.ORDER_SIZE
//         ) g ON(a.SCH_ID = g.SCH_ID AND d.SIZE_CODE = g.ORDER_SIZE)
//         LEFT JOIN (
//                 SELECT a.SCH_ID, a.ORDER_SIZE, SUM(a.ORDER_QTY) AS TTL_PACKING_IN 
//                     FROM (
//                         SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
//                         a.BARCODE_MAIN AS BARCODE_SERIAL,
//                         CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
//                         FROM scan_packing_in a 
//                         LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
//                         LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
//                         WHERE a.SCH_ID IN (
//                             SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                                 WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//                         ) 
//                         GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
//                     ) a GROUP BY a.SCH_ID, a.ORDER_SIZE
//         ) h ON(h.SCH_ID = a.SCH_ID AND h.ORDER_SIZE = d.SIZE_CODE)
//         WHERE a.SCH_SITE = :sitename AND a.SCH_ID IN  (
//          SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//         ) AND (d.SCH_SIZE_QTY + IFNULL(e.TTL_SEWING_IN, 0) <> 0)  
//         ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC
//     ) M GROUP BY M.SCH_ID
// ) N ORDER BY N.SCH_ID_SITELINE`;

export const QueryWipMonitorSize = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME,  b.ITEM_COLOR_CODE, b.TARGET_PCD, IFNULL(b.NEW_PLAN_EXFACTORY_DATE,  b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE, 
b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE,
d.SIZE_CODE, d.SCH_SIZE_QTY,
    IFNULL(h.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
    IFNULL( d.SCH_SIZE_QTY - h.TTL_SEWING_IN, 0) AS TTL_SEWING_IN_BAL,
    IFNULL(h.TTL_SEWING_IN - h.TTL_QC_QTY, 0) AS TTL_SEWING_WIP,
    IFNULL(h.TTL_QC_QTY, 0) AS TTL_QC_QTY,
    IFNULL(h.TTL_QC_QTY - h.TTL_SEWING_OUT, 0) AS TTL_QC_BALANCE,
    IFNULL(h.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
    IFNULL(h.TTL_SEWING_OUT - h.TTL_PACKING_IN, 0) AS TTL_SEWING_OUT_BALANCE,
    IFNULL(h.TTL_PACKING_IN, 0) AS TTL_PACKING_IN,
    IF(IFNULL(h.TTL_SEWING_IN / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_LOADING_STATUS,
    IF(IFNULL(h.TTL_QC_QTY / d.SCH_SIZE_QTY, 0)* 100 < 100, 'OPEN', 'COMPLETE') AS TTL_QC_STATUS,
    IF(IFNULL(h.TTL_SEWING_OUT / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_SEWING_OUT_STATUS,
    IF(IFNULL(h.TTL_PACKING_IN / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_PACKING_IN_STATUS,
    CONCAT(ROUND(IFNULL(h.TTL_SEWING_IN / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_LOADING_PERCENTAGE,
    CONCAT(ROUND(IFNULL(h.TTL_QC_QTY / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_QC_PERCENTAGE,
    CONCAT(ROUND(IFNULL(h.TTL_SEWING_OUT / d.SCH_SIZE_QTY, 0)  * 100, 2), '%') AS TTL_SEWING_OUT_PERCENTAGE,
    CONCAT(ROUND(IFNULL(h.TTL_PACKING_IN / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_PACKING_IN_PERCENTAGE
FROM weekly_prod_schedule a  
LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
LEFT JOIN (
    SELECT p.SCH_ID, p.SIZE_CODE, SUM(p.SCH_SIZE_QTY) SCH_SIZE_QTY
    FROM  weekly_sch_size p 
    WHERE p.SCH_ID IN (
        SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
        WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
    ) 
    GROUP BY p.SCH_ID, p.SIZE_CODE
) d ON d.SCH_ID = a.SCH_ID
LEFT JOIN (
		SELECT a.SCH_ID, a.SIZE_CODE, a.TTL_SEWING_IN, a.TTL_QC_QTY, a.TTL_SEWING_OUT, a.TTL_PACKING_IN
		FROM log_sewing_wip_monitoring a 
		WHERE a.SCH_ID IN (
			SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
		  	WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
		)
) h ON(h.SCH_ID = a.SCH_ID AND h.SIZE_CODE = d.SIZE_CODE)
WHERE a.SCH_SITE = :sitename AND a.SCH_ID IN  (
	SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN :startDate and :endDate
) AND (d.SCH_SIZE_QTY + IFNULL(h.TTL_SEWING_IN, 0) <> 0)  
ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC`;

// export const QueryWipMonitorSize = `SELECT a.SCH_ID, b.PROD_MONTH, CASE WHEN ISNULL(a.SCH_START_PROD) THEN b.PRODUCTION_MONTH ELSE DATE_FORMAT(a.SCH_START_PROD,'%M/%Y') END ACTUAL_MONTH,
// b.PRODUCTION_MONTH, b.MANUFACTURING_SITE,  a.SCH_SITE, a.SCH_ID_SITELINE, c.LINE_NAME, b.CUSTOMER_NAME, a.SCH_CAPACITY_ID,
// a.SCH_QTY, b.MO_QTY, b.ORDER_REFERENCE_PO_NO, b.PRODUCT_ITEM_CODE, b.PRODUCT_ITEM_DESCRIPTION, b.ORDER_STYLE_DESCRIPTION, b.ITEM_COLOR_NAME,  b.ITEM_COLOR_CODE, b.TARGET_PCD, IFNULL(b.NEW_PLAN_EXFACTORY_DATE,  b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE, 
// b.FINAL_DELIVERY_DATE, a.SCH_START_PROD, a.SCH_FINISH_PROD, a.SCH_ORDER,
// b.NEW_TARGET_PCD, b.NEW_PLAN_EXFACTORY_DATE,  b.NEW_FINAL_DELIVERY_DATE,
// d.SIZE_CODE, d.SCH_SIZE_QTY,
//     IFNULL(e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
//     IFNULL( d.SCH_SIZE_QTY - e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN_BAL,
//     IFNULL(e.TTL_SEWING_IN - f.TTL_QC_QTY, 0) AS TTL_SEWING_WIP,
//     IFNULL(f.TTL_QC_QTY, 0) AS TTL_QC_QTY,
//     IFNULL(f.TTL_QC_QTY - g.TTL_SEWING_OUT, 0) AS TTL_QC_BALANCE,
//     IFNULL(g.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
//     IFNULL(g.TTL_SEWING_OUT - h.TTL_PACKING_IN, 0) AS TTL_SEWING_OUT_BALANCE,
//     IFNULL(h.TTL_PACKING_IN, 0) AS TTL_PACKING_IN,
//     IF(IFNULL(e.TTL_SEWING_IN / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_LOADING_STATUS,
//     IF(IFNULL(f.TTL_QC_QTY / d.SCH_SIZE_QTY, 0)* 100 < 100, 'OPEN', 'COMPLETE') AS TTL_QC_STATUS,
//     IF(IFNULL(g.TTL_SEWING_OUT / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_SEWING_OUT_STATUS,
//     IF(IFNULL(h.TTL_PACKING_IN / d.SCH_SIZE_QTY, 0) * 100 < 100, 'OPEN', 'COMPLETE') AS TTL_PACKING_IN_STATUS,
//     CONCAT(ROUND(IFNULL(e.TTL_SEWING_IN / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_LOADING_PERCENTAGE,
//     CONCAT(ROUND(IFNULL(f.TTL_QC_QTY / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_QC_PERCENTAGE,
//     CONCAT(ROUND(IFNULL(g.TTL_SEWING_OUT / d.SCH_SIZE_QTY, 0)  * 100, 2), '%') AS TTL_SEWING_OUT_PERCENTAGE,
//     CONCAT(ROUND(IFNULL(h.TTL_PACKING_IN / d.SCH_SIZE_QTY, 0) * 100, 2), '%') AS TTL_PACKING_IN_PERCENTAGE
// FROM weekly_prod_schedule a  
// LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
// LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
// LEFT JOIN (
//     SELECT p.SCH_ID, p.SIZE_CODE, SUM(p.SCH_SIZE_QTY) SCH_SIZE_QTY
//     FROM  weekly_sch_size p 
//     WHERE p.SCH_ID IN (
//         SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//         WHERE a.SCHD_PROD_DATE BETWEEN :startDate  AND :endDate 
//     ) 
//     GROUP BY p.SCH_ID, p.SIZE_CODE
// ) d ON d.SCH_ID = a.SCH_ID
// LEFT JOIN (
// SELECT 
//     A1.SCH_ID AS SCH_ID,
//     A1.SCHD_ID AS SCHD_ID,
//     A1.ORDER_STYLE AS ORDER_STYLE,
//     A1.ORDER_SIZE AS ORDER_SIZE,
//     A1.ORDER_COLOR AS ORDER_COLOR,
//     SUM(A1.SEWIN_QTY) AS TTL_SEWING_IN
// FROM viewsewingscaninqty A1
// WHERE  A1.SCH_ID  IN (
// 	        SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
// 	          WHERE a.SCHD_PROD_DATE  BETWEEN :startDate  AND :endDate
// ) 
// GROUP BY A1.SCH_ID, A1.ORDER_COLOR, A1.ORDER_SIZE
// ) e ON(a.SCH_ID = e.SCH_ID AND d.SIZE_CODE = e.ORDER_SIZE)
// LEFT JOIN (
//     SELECT  
//     a.ENDLINE_SCH_ID, 
//     a.ENDLINE_PLAN_SIZE, 
//     SUM(a.ENDLINE_OUT_QTY) AS TTL_QC_QTY
//     FROM qc_endline_output a 
//     WHERE a.ENDLINE_SCH_ID IN (
//               SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
//                WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
//     )  AND 
//         (
//             (a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL) OR 
//             (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
//         )
//     GROUP BY 
//         a.ENDLINE_SCH_ID, 
//         a.ENDLINE_PLAN_SIZE
// ) f ON(a.SCH_ID = f.ENDLINE_SCH_ID AND d.SIZE_CODE = f.ENDLINE_PLAN_SIZE)
// LEFT JOIN (
// 		SELECT a.SCH_ID, a.ORDER_COLOR, a.ORDER_SIZE, SUM(a.ORDER_QTY) TTL_SEWING_OUT 
// 		FROM (
// 		  SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, b.ORDER_COLOR, 
// 		  a.BARCODE_MAIN AS BARCODE_SERIAL,
// 		  CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
// 		  FROM scan_sewing_out a 
// 		  LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
// 		  LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
// 		  WHERE a.SCH_ID IN (
// 		        SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
// 		          WHERE a.SCHD_PROD_DATE  BETWEEN :startDate  AND :endDate
// 		  ) 
// 		  GROUP BY a.SCH_ID, b.ORDER_COLOR, b.ORDER_SIZE, a.BARCODE_MAIN
// 		) a GROUP BY a.SCH_ID, a.ORDER_COLOR, a.ORDER_SIZE
// ) g ON(a.SCH_ID = g.SCH_ID  AND d.SIZE_CODE = g.ORDER_SIZE)
// LEFT JOIN (
// 		SELECT a.SCH_ID, a.ORDER_COLOR, a.ORDER_SIZE, SUM(a.ORDER_QTY) AS TTL_PACKING_IN 
// 		 FROM (
// 		     SELECT DISTINCT a.SCH_ID, b.ORDER_COLOR, b.ORDER_SIZE, 
// 		     a.BARCODE_MAIN AS BARCODE_SERIAL,
// 		     CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
// 		     FROM scan_packing_in a 
// 		     LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
// 		     LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
// 		     WHERE a.SCH_ID IN (
// 		           SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
// 		             WHERE a.SCHD_PROD_DATE BETWEEN :startDate  AND :endDate
// 		     ) 
// 		     GROUP BY a.SCH_ID,  b.ORDER_COLOR, b.ORDER_SIZE, a.BARCODE_MAIN
// 		 ) a GROUP BY a.SCH_ID,  a.ORDER_COLOR, a.ORDER_SIZE
// ) h ON(h.SCH_ID = a.SCH_ID AND h.ORDER_SIZE = d.SIZE_CODE)
// WHERE a.SCH_SITE = :sitename AND a.SCH_ID IN  (
// 	SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN :startDate  AND :endDate 
// ) AND (d.SCH_SIZE_QTY + IFNULL(e.TTL_SEWING_IN, 0) <> 0)  
// ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC`;

export const QueryQrTrackByWipMonitor = `SELECT  m.BUYER_CODE, f.BARCODE_SERIAL, o.BUNDLE_SEQUENCE SEQUENCE, m.ORDER_NO, SUBSTRING_INDEX(m.BUYER_PO,',',-1) BUYER_PO, SUBSTRING_INDEX(m.MO_NO,',',-1) MO_NO, 
m.ORDER_STYLE, m.ORDER_COLOR, m.ORDER_SIZE, m.ORDER_QTY, m.SITE_LINE FX_SITE, t.SITE_NAME, t.LINE_NAME, s.SCHD_PROD_DATE,
CASE WHEN o.BARCODE_SERIAL IS NOT NULL  THEN 1  END  AS GENERATE, 
CASE WHEN p.BARCODE_SERIAL IS NOT NULL THEN 2  END  AS SEWING_IN, 
CASE WHEN q.BARCODE_SERIAL IS NOT NULL THEN 3  END  AS SEWING_OUT,
CASE WHEN r.BARCODE_SERIAL IS NOT NULL THEN 4  END  AS PACKING_IN, 
v.COUNT_SPLIT,
o.CREATE_TIME GENERATE_TIME,
p.SEWING_SCAN_TIME SEWING_IN_TIME, 
q.SEWING_SCAN_TIME SEWING_OUT_TIME,
r.PACKING_SCAN_TIME PACKING_IN_TIME
FROM (
	SELECT DISTINCT  n.BARCODE_SERIAL
	FROM (
	  SELECT a.BARCODE_SERIAL
	  FROM scan_sewing_in a 
	  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	  WHERE a.SCH_ID = :schId AND b.ORDER_SIZE = :orderSize
	  UNION ALL 
	  SELECT a.BARCODE_MAIN AS BARCODE_SERIAL
	  FROM scan_sewing_out a 
	  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	  WHERE a.SCH_ID = :schId AND b.ORDER_SIZE = :orderSize
      GROUP BY a.BARCODE_MAIN
      UNION ALL
	  SELECT a.BARCODE_MAIN AS BARCODE_SERIAL
	  FROM scan_packing_in a 
	  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	  WHERE a.SCH_ID = :schId AND b.ORDER_SIZE = :orderSize
      GROUP BY a.BARCODE_MAIN
      ) n 
	GROUP BY n.BARCODE_SERIAL
) f LEFT JOIN order_detail m ON f.BARCODE_SERIAL = m.BARCODE_SERIAL
LEFT JOIN order_qr_generate o ON f.BARCODE_SERIAL = o.BARCODE_SERIAL
LEFT JOIN scan_sewing_in p ON f.BARCODE_SERIAL = p.BARCODE_SERIAL
LEFT JOIN (
	SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL, a.SEWING_SCAN_TIME
	FROM scan_sewing_out a 
	WHERE a.SCH_ID =  :schId
	GROUP BY a.BARCODE_MAIN
) q ON  f.BARCODE_SERIAL = q.BARCODE_SERIAL
LEFT JOIN (
  SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL,  a.PACKING_SCAN_TIME
  FROM scan_packing_in a 
  	WHERE a.SCH_ID =  :schId
  GROUP BY a.BARCODE_MAIN
) r ON f.BARCODE_SERIAL = r.BARCODE_SERIAL
LEFT JOIN (
	SELECT DISTINCT a.BARCODE_MAIN AS BARCODE_SERIAL, COUNT(a.BARCODE_MAIN) COUNT_SPLIT, a.NEW_QTY, a.SEWING_SCAN_TIME
	FROM scan_sewing_qr_split a
	WHERE a.SCH_ID =  :schId 
	GROUP BY a.BARCODE_MAIN
) v ON  f.BARCODE_SERIAL =  v.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail s ON s.SCHD_ID = p.SCHD_ID
LEFT JOIN item_siteline t ON s.SCHD_ID_SITELINE = t.ID_SITELINE
GROUP BY f.BARCODE_SERIAL`;


//lawas tidak dipakai query ini
export const qryRecapSewWip = ` SELECT a.SCH_ID, 
 		  a.SCH_SITE,
        d.SIZE_CODE, 
        IFNULL(d.SCH_SIZE_QTY,0) AS SCH_SIZE_QTY, 
        IFNULL(e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
        IFNULL(f.TTL_QC_QTY, 0) AS TTL_QC_QTY,
        IFNULL(g.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
        IFNULL(h.TTL_PACKING_IN, 0) AS TTL_PACKING_IN
        FROM weekly_prod_schedule a  
        LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
        LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
        LEFT JOIN (
            SELECT p.SCH_ID, p.SIZE_CODE, SUM(p.SCH_SIZE_QTY) SCH_SIZE_QTY
            FROM  weekly_sch_size p 
            WHERE p.SCH_ID IN (
                SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
                WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
            ) 
            GROUP BY p.SCH_ID, p.SIZE_CODE
        ) d ON d.SCH_ID = a.SCH_ID
        LEFT JOIN (
        SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) TTL_SEWING_IN
                FROM scan_sewing_in a 
                LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
                WHERE a.SCH_ID IN (
                            SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
                            WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
                ) 
                GROUP BY a.SCH_ID, b.ORDER_SIZE
        ) e ON(a.SCH_ID = e.SCH_ID AND d.SIZE_CODE = e.ORDER_SIZE)
        LEFT JOIN (
                SELECT  
                    a.ENDLINE_SCH_ID, 
                    a.ENDLINE_PLAN_SIZE, 
                    SUM(a.ENDLINE_OUT_QTY) AS TTL_QC_QTY
                    FROM qc_endline_output a 
                    WHERE a.ENDLINE_SCH_ID IN (
                            SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
                            WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
                    )  AND 
                        (
                            (a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL) OR 
                            (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
                        )
                    GROUP BY 
                        a.ENDLINE_SCH_ID, 
                        a.ENDLINE_PLAN_SIZE
        ) f ON(a.SCH_ID = f.ENDLINE_SCH_ID AND d.SIZE_CODE = f.ENDLINE_PLAN_SIZE)
        LEFT JOIN (
                    SELECT a.SCH_ID, a.ORDER_SIZE, SUM(a.ORDER_QTY) TTL_SEWING_OUT 
                    FROM (
                        SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
                        a.BARCODE_MAIN AS BARCODE_SERIAL,
                        CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
                        FROM scan_sewing_out a 
                        LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
                        LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
                        WHERE a.SCH_ID IN (
                            SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
                                WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
                        ) 
                        GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
                    ) a GROUP BY a.SCH_ID, a.ORDER_SIZE
        ) g ON(a.SCH_ID = g.SCH_ID AND d.SIZE_CODE = g.ORDER_SIZE)
        LEFT JOIN (
                SELECT a.SCH_ID, a.ORDER_SIZE, SUM(a.ORDER_QTY) AS TTL_PACKING_IN 
                    FROM (
                        SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
                        a.BARCODE_MAIN AS BARCODE_SERIAL,
                        CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
                        FROM scan_packing_in a 
                        LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
                        LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
                        WHERE a.SCH_ID IN (
                            SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
                                WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
                        ) 
                        GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
                    ) a GROUP BY a.SCH_ID, a.ORDER_SIZE
        ) h ON(h.SCH_ID = a.SCH_ID AND h.ORDER_SIZE = d.SIZE_CODE)
        WHERE  a.SCH_ID IN  (
         SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a WHERE a.SCHD_PROD_DATE BETWEEN '2024-11-01' AND  '2024-12-31'
        ) AND (d.SCH_SIZE_QTY + IFNULL(e.TTL_SEWING_IN, 0) <> 0)  
        ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC`;

export const queryGetRecapWip = `WITH relevant_sch_ids AS (
    SELECT DISTINCT SCH_ID
    FROM (
        SELECT SCH_ID FROM scan_sewing_in WHERE DATE(SEWING_SCAN_TIME) BETWEEN :startDate and :endDate
        UNION
        SELECT SCH_ID FROM scan_sewing_out WHERE DATE(SEWING_SCAN_TIME) BETWEEN :startDate and :endDate
        UNION
        SELECT SCH_ID FROM scan_packing_in WHERE DATE(PACKING_SCAN_TIME) BETWEEN :startDate and :endDate
        UNION
        SELECT SCH_ID FROM weekly_prod_sch_detail WHERE SCHD_PROD_DATE BETWEEN :startDate and :endDate
    ) temp
),
size_data AS (
    SELECT SCH_ID, SIZE_CODE, SUM(SCH_SIZE_QTY) AS SCH_SIZE_QTY
    FROM weekly_sch_size
    WHERE SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
    GROUP BY SCH_ID, SIZE_CODE
),
sewing_in_data AS (
    SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) AS TTL_SEWING_IN
    FROM scan_sewing_in a
    LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    WHERE a.SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
    GROUP BY a.SCH_ID, b.ORDER_SIZE
),
qc_data AS (
    SELECT ENDLINE_SCH_ID AS SCH_ID, ENDLINE_PLAN_SIZE AS SIZE_CODE, SUM(ENDLINE_OUT_QTY) AS TTL_QC_QTY
    FROM qc_endline_output
    WHERE ENDLINE_SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
      AND (
        (ENDLINE_OUT_TYPE = 'RTT' AND ENDLINE_OUT_UNDO IS NULL) OR
        (ENDLINE_OUT_TYPE <> 'BS' AND ENDLINE_OUT_UNDO IS NULL AND ENDLINE_REPAIR = 'Y' AND ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
      )
    GROUP BY ENDLINE_SCH_ID, ENDLINE_PLAN_SIZE
),
sewing_out_data AS (
    SELECT SCH_ID, ORDER_SIZE, SUM(ORDER_QTY) AS TTL_SEWING_OUT
    FROM (
        SELECT a.SCH_ID, b.ORDER_SIZE, 
               CASE WHEN c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
        FROM scan_sewing_out a
        LEFT JOIN order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
        LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
        WHERE a.SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
        GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
    ) temp
    GROUP BY SCH_ID, ORDER_SIZE
),
packing_in_data AS (
    SELECT SCH_ID, ORDER_SIZE, SUM(ORDER_QTY) AS TTL_PACKING_IN
    FROM (
        SELECT a.SCH_ID, b.ORDER_SIZE, 
               CASE WHEN c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
        FROM scan_packing_in a
        LEFT JOIN order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
        LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
        WHERE a.SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
        GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
    ) temp
    GROUP BY SCH_ID, ORDER_SIZE
)
SELECT a.SCH_ID, 
       a.SCH_SITE,
       d.SIZE_CODE, 
       IFNULL(d.SCH_SIZE_QTY, 0) AS SCH_SIZE_QTY,
       IFNULL(e.TTL_SEWING_IN, 0) AS TTL_SEWING_IN,
		 IFNULL(f.TTL_QC_QTY, 0) AS TTL_QC_QTY,
	    IFNULL(g.TTL_SEWING_OUT, 0) AS TTL_SEWING_OUT,
	    IFNULL(h.TTL_PACKING_IN, 0) AS TTL_PACKING_IN
FROM weekly_prod_schedule a
-- LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
-- LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
LEFT JOIN size_data d ON d.SCH_ID = a.SCH_ID
LEFT JOIN sewing_in_data e ON e.SCH_ID = a.SCH_ID AND e.ORDER_SIZE = d.SIZE_CODE
LEFT JOIN qc_data f ON f.SCH_ID = a.SCH_ID AND f.SIZE_CODE = d.SIZE_CODE
LEFT JOIN sewing_out_data g ON g.SCH_ID = a.SCH_ID AND g.ORDER_SIZE = d.SIZE_CODE
LEFT JOIN packing_in_data h ON h.SCH_ID = a.SCH_ID AND h.ORDER_SIZE = d.SIZE_CODE
WHERE a.SCH_ID IN (SELECT SCH_ID FROM relevant_sch_ids)
  AND (d.SCH_SIZE_QTY + IFNULL(e.TTL_SEWING_IN, 0) <> 0)
ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC;
`

export const LogSewingWipMonitoring = db.define(
  "log_sewing_wip_monitoring",
  {
    SCH_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      primaryKey: true,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    SCH_SITE: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    TTL_SEWING_IN: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
    },
    TTL_QC_QTY: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
    },
    TTL_SEWING_OUT: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
    },
    TTL_PACKING_IN: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "log_sewing_wip_monitoring",
    timestamps: true, // Sequelize will manage createdAt and updatedAt
  }
);


export const qryGetWipPrepDtl = `-- query wip loading one site 
SELECT 
ind.SITE,
ind.SCH_ID_SITELINE,
il.LINE_NAME,
ind.WIP,
ws.WIP_SEWING
FROM (
  SELECT smo.CUT_SITE AS SITE, wps.SCH_ID_SITELINE,  SUM(od.ORDER_QTY) WIP
  FROM scan_supermarket_out smo
  JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
  JOIN weekly_prod_schedule wps ON wps.SCH_ID = smo.SCH_ID
  WHERE NOT EXISTS (
          SELECT 1
          FROM scan_sewing_in ssi
          WHERE ssi.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(ssi.SEWING_SCAN_TIME) <= :date AND ssi.SEWING_SCAN_LOCATION = :site
	 ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
	AND smo.CUT_SITE = :site
	GROUP BY smo.CUT_SITE, wps.SCH_ID_SITELINE
) ind
LEFT JOIN (
		SELECT 
		wip.SITE,
		wip.SCHD_ID_SITELINE,
		SUM(wip.WIP_SEWING) AS WIP_SEWING
		FROM (
				SELECT a.SCHD_SITE AS SITE, a.SCHD_ID_SITELINE, a.SCH_ID, b.TTL_SEWING_IN-b.TTL_QC_QTY AS WIP_SEWING
				FROM weekly_prod_sch_detail a 
				JOIN log_sewing_wip_monitoring b ON a.SCH_ID = b.SCH_ID AND b.TTL_SEWING_IN > b.TTL_QC_QTY
				WHERE a.SCHD_PROD_DATE = :date  AND a.SCHD_SITE = :site
				AND a.SCHD_QTY != 0 
		) AS wip
		GROUP BY 
		wip.SITE,
		wip.SCHD_ID_SITELINE
) ws ON ws.SCHD_ID_SITELINE = ind.SCH_ID_SITELINE
LEFT JOIN item_siteline il ON il.ID_SITELINE = ind.SCH_ID_SITELINE
-- WHERE  ind.WIP <= 50 
GROUP BY 
ind.SITE,
ind.SCH_ID_SITELINE
ORDER BY ind.SCH_ID_SITELINE`