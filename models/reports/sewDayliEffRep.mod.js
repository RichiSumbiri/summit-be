//query dailyplan update 90detik
// export const QueryEffCurDate = `SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
// 		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
// 		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
// 		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
// 		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
// 		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
// 		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
// 		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
// 		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
// 		       e.PLAN_WH MAIN_WH,
// 		       e.TTL_WH_OT MAIN_WH_OT,
// 		       e.TTL_WH_X_OT MAIN_WH_X_OT,
// 		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
//        		        CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
// 		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
// 		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
// 		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
// 		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, p.GROUP_ID, o.PLAN_REMARK
// 		           FROM weekly_prod_sch_detail a
// 		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
// 		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
// 		           --	untuk aktual SMV
// 		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
// 		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// 		           LEFT JOIN 	(
// 		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
// 								SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH,
// 									 SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
// 								FROM manpower_detail a 
// 								LEFT JOIN -- 
// 								item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
// 								LEFT JOIN 
// 								weekly_prod_sch_detail c ON c.SCHD_ID_SITELINE = b.ID_SITELINE AND c.SCHD_PROD_DATE = :schDate 
// 								LEFT JOIN 
// 								workinghour_detail d ON d.SCHD_ID = c.SCHD_ID AND d.SHIFT = :shift
// 								WHERE a.MP_DATE = :schDate    AND b.SHIFT = :shift -- AND  b.SITE_NAME = :sitename
// 								AND c.SCHD_PROD_DATE = :schDate 
// 								GROUP BY a.ID_SITELINE, b.SHIFT
// 								ORDER by a.ID_SITELINE
// 		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
// 		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
// 		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
// 		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
// 		           -- left join ciew qcendlineoutput untuk mendapatkan output
// 		           LEFT JOIN (
//                                SELECT 
// 									    a.ENDLINE_ACT_SCHD_ID, 
// 									    a.ENDLINE_SCHD_DATE, 
// 									    a.ENDLINE_SCH_ID, 
// 									    a.ENDLINE_ID_SITELINE, 
// 									    a.ENDLINE_LINE_NAME, 
// 									    a.GROUP_ID,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'N' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS NORMAL_OUTPUT,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'O' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS OT_OUTPUT,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'XO' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS X_OT_OUTPUT
// 									FROM 
// 									    qc_endline_output a
// 									LEFT JOIN 
// 									    item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
// 									WHERE 
// 									    ((a.ENDLINE_SCHD_DATE = :schDate ) OR (DATE(a.ENDLINE_MOD_TIME) = :schDate ))
// 									    AND b.SITE_NAME = :sitename
// 									    AND b.SHIFT = :shift
// 									    AND a.ENDLINE_OUT_UNDO IS NULL
// 									    AND (
// 									        (a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_REPAIR IS NULL) OR
// 									        (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
// 									    )
// 									GROUP BY 
// 									    a.ENDLINE_ACT_SCHD_ID, 
// 									    a.ENDLINE_SCHD_DATE, 
// 									    a.ENDLINE_SCH_ID, 
// 									    a.ENDLINE_ID_SITELINE, 
// 									    a.ENDLINE_LINE_NAME, 
// 									    a.GROUP_ID

// 		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
// 		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate  )) > 1 
//                            LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
// 		           WHERE a.SCHD_PROD_DATE = :schDate    AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename`;

	//query dailyplan lemot 36detik
export const QueryEffCurDate = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
I.PLAN_SEW_SMV, -- I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT,
I.PLAN_REMARK, I.GROUP_ID
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
        h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
       	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT,
        h.PLAN_REMARK, h.GROUP_ID
        FROM(
 			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT,
              n.PLAN_REMARK, n.GROUP_ID
		   FROM (
		           SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
		       e.PLAN_WH MAIN_WH,
		       e.TTL_WH_OT MAIN_WH_OT,
		       e.TTL_WH_X_OT MAIN_WH_X_OT,
		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
       		        CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, p.GROUP_ID, o.PLAN_REMARK
		           FROM weekly_prod_sch_detail a
		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		           --	untuk aktual SMV
		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		           LEFT JOIN 	(
		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
		                   SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH,
								 		 SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
								 FROM manpower_detail a 
								 LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
								 LEFT JOIN  weekly_prod_sch_detail c on c.SCHD_ID_SITELINE = b.ID_SITELINE 
								 LEFT JOIN workinghour_detail d ON d.SCHD_ID = c.SCHD_ID
								 WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift -- AND  b.SITE_NAME = :sitename
								 AND c.SCHD_PROD_DATE = :schDate
								 GROUP BY a.ID_SITELINE, b.SHIFT
								 ORDER by a.ID_SITELINE
		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
		           -- left join ciew qcendlineoutput untuk mendapatkan output
		           LEFT JOIN (
                                SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME, N.GROUP_ID,
                                SUM(N.ENDLINE_OUT_QTY) NORMAL_OUTPUT,
                                SUM(N.ENDLINE_OUT_QTY_OT) OT_OUTPUT,
                                SUM(N.ENDLINE_OUT_QTY_X_OT) X_OT_OUTPUT
                                FROM(
                                -- normal 
                                        SELECT  
                                        a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                         a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'N'
                                        -- RTT n Repair
                                        UNION ALL
                                        SELECT 
                                                a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                                a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL   AND a.ENDLINE_PORD_TYPE = 'N'
                                        UNION ALL
                                -- OT
                                        SELECT
                                                a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
                                                0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'O'
                                        UNION ALL
                                        SELECT 
                                        a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME,date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND  
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'O'
                                        UNION ALL 
                                -- extra ot
                                        SELECT
                                                a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
                                                0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'XO'
                                        UNION ALL
                                        SELECT 
                                        a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a  
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'XO'
                                ) N
                                GROUP BY  N.ENDLINE_ACT_SCHD_ID
		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate )) > 1 
                           LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
		           WHERE a.SCHD_PROD_DATE = :schDate   AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename
            )n
        )h
    ) I`;

// export const QueryEffCurDateShiftB = `SELECT	
// I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
// I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
// I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
// I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
// I.PLAN_SEW_SMV, -- I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
// I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
// I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
// I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
// I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
// I.TOTAL_TARGET,
// I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
// I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
// I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
// I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
// I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
// IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
// IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
// ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
// ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
// ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT,
// I.PLAN_REMARK, I.GROUP_ID
// FROM (
// SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
//         h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
//         h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
//         h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
//         h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
//         h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
//         IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
//         h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
//         h.PLAN_TARGET_OT PLAN_TARGET_OT, 
//         IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
//         IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
//         IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
//         h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
//         IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
//         (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
//         (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
//         (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
//        	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
//         (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
//         (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
//         (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT,
//         h.PLAN_REMARK, h.GROUP_ID
//         FROM(
//  			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
// 		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
// 		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
// 		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
// 		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
// 		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
// 		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
// 		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
// 		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
// 		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
// 		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
// 		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
// 				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
// 		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
// 		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
// 		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT,
//                        n.PLAN_REMARK, n.GROUP_ID
// 		   FROM (
// 		           SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
// 		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
// 		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
// 		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
// 		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
// 		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
// 		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
// 		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
// 		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
// 		       e.PLAN_WH MAIN_WH,
// 		       e.TTL_WH_OT MAIN_WH_OT,
// 		       e.TTL_WH_X_OT MAIN_WH_X_OT,
// 		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
//        		 CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
// 		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
// 		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
// 		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
// 		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, o.PLAN_REMARK, p.GROUP_ID
// 		           FROM weekly_prod_sch_detail a
// 		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
// 		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
// 		           --	untuk aktual SMV
// 		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
// 		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
// 		           LEFT JOIN 	(
// 		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
// 								SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH,
// 									 SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
// 								FROM manpower_detail a 
// 								LEFT JOIN -- 
// 								item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
// 								LEFT JOIN 
// 								weekly_prod_sch_detail c ON c.SCHD_ID_SITELINE = b.ID_SITELINE AND c.SCHD_PROD_DATE = :schDate 
// 								LEFT JOIN 
// 								workinghour_detail d ON d.SCHD_ID = c.SCHD_ID AND d.SHIFT = :shift
// 								WHERE a.MP_DATE = :schDate    AND b.SHIFT = :shift -- AND  b.SITE_NAME = :sitename
// 								AND c.SCHD_PROD_DATE = :schDate 
// 								GROUP BY a.ID_SITELINE, b.SHIFT
// 								ORDER by a.ID_SITELINE
// 		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
// 		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
// 		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
// 		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
// 		           -- left join ciew qcendlineoutput untuk mendapatkan output
// 		           LEFT JOIN (
// SELECT 
// 									    a.ENDLINE_ACT_SCHD_ID, 
// 									    a.ENDLINE_SCHD_DATE, 
// 									    a.ENDLINE_SCH_ID, 
// 									    a.ENDLINE_ID_SITELINE, 
// 									    a.ENDLINE_LINE_NAME, 
// 									    a.GROUP_ID,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'N' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS NORMAL_OUTPUT,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'O' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS OT_OUTPUT,
// 									    SUM(CASE 
// 									        WHEN a.ENDLINE_PORD_TYPE = 'XO' THEN a.ENDLINE_OUT_QTY 
// 									        ELSE 0 
// 									    END) AS X_OT_OUTPUT
// 									FROM 
// 									    qc_endline_output a
// 									LEFT JOIN 
// 									    item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
// 									WHERE 
// 									    ((a.ENDLINE_SCHD_DATE = :schDate ) OR (DATE(a.ENDLINE_MOD_TIME) = :schDate ))
// 									    AND b.SITE_NAME = :sitename
// 									    AND b.SHIFT = :shift
// 									    AND a.ENDLINE_OUT_UNDO IS NULL
// 									    AND (
// 									        (a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_REPAIR IS NULL) OR
// 									        (a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL)
// 									    )
// 									GROUP BY 
// 									    a.ENDLINE_ACT_SCHD_ID, 
// 									    a.ENDLINE_SCHD_DATE, 
// 									    a.ENDLINE_SCH_ID, 
// 									    a.ENDLINE_ID_SITELINE, 
// 									    a.ENDLINE_LINE_NAME, 
// 									    a.GROUP_ID
// 		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
//                            LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
// 		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate  )) > 1 
// 		           WHERE a.SCHD_PROD_DATE = :schDate    AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename
//             )n
//         )h
//     ) I`;


	//query dailyplan shift sebelumnya 36detik
export const QueryEffCurDateShiftB = `SELECT	
I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
I.PLAN_SEW_SMV, -- I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT,
I.PLAN_REMARK, I.GROUP_ID
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
        h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
       	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT,
        h.PLAN_REMARK, h.GROUP_ID
        FROM(
 			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT,
                       n.PLAN_REMARK, n.GROUP_ID
		   FROM (
		           SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
		       e.PLAN_WH MAIN_WH,
		       e.TTL_WH_OT MAIN_WH_OT,
		       e.TTL_WH_X_OT MAIN_WH_X_OT,
		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
       		 CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, o.PLAN_REMARK, p.GROUP_ID
		           FROM weekly_prod_sch_detail a
		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		           --	untuk aktual SMV
		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		           LEFT JOIN 	(
		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
						   SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH, SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
                           FROM manpower_detail a 
                           LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
                           INNER JOIN weekly_prod_sch_detail c ON a.ID_SITELINE = b.ID_SITELINE
                           INNER JOIN workinghour_detail d ON d.SCHD_ID = c.SCHD_ID
                           WHERE a.MP_DATE = :schDate   
                           AND b.SHIFT = :shift   AND b.SITE_NAME = :sitename
                           AND c.SCHD_PROD_DATE = '2024-09-12'
                           GROUP BY b.ID_SITELINE, b.SHIFT
                           ORDER BY b.ID_SITELINE
		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
		           -- left join ciew qcendlineoutput untuk mendapatkan output
		           LEFT JOIN (
                                SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME, N.GROUP_ID,
                                SUM(N.ENDLINE_OUT_QTY) NORMAL_OUTPUT,
                                SUM(N.ENDLINE_OUT_QTY_OT) OT_OUTPUT,
                                SUM(N.ENDLINE_OUT_QTY_X_OT) X_OT_OUTPUT
                                FROM(
                                -- normal 
                                        SELECT  
                                        a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                         a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'N'
                                        -- RTT n Repair
                                        UNION ALL
                                        SELECT 
                                                a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                                a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL   AND a.ENDLINE_PORD_TYPE = 'N'
                                        UNION ALL
                                -- OT
                                        SELECT
                                                a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
                                                0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'O'
                                        UNION ALL
                                        SELECT 
                                        a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME,date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND  
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'O'
                                        UNION ALL 
                                -- extra ot
                                        SELECT
                                                a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
                                                0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a 
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE a.ENDLINE_SCHD_DATE = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'XO'
                                        UNION ALL
                                        SELECT 
                                        a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
                                        0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
                                        FROM qc_endline_output a  
                                        LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
                                        WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND b.SITE_NAME = :sitename AND b.SHIFT = :shift AND 
                                        a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'XO'
                                ) N
                                GROUP BY  N.ENDLINE_ACT_SCHD_ID
		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
                           LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate  )) > 1 
		           WHERE a.SCHD_PROD_DATE = :schDate    AND  e.SHIFT = :shift AND d.SITE_NAME = :sitename
            )n
        )h
    ) I`;

export const QueryEffFromLog = `SELECT 
a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT, 
IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
a.PLAN_MP, a.PLAN_WH, a.ACT_MP, 
a.PLAN_TARGET, 	
a.PLAN_WH_X_OT,
a.PLAN_MP_OT, 
a.PLAN_WH_OT, 
a.ACT_MP_OT, 
a.PLAN_TARGET_OT, 
a.ACT_MP_X_OT,
(a.ACT_MP*a.ACT_WH/a.PLAN_SEW_SMV) ACT_TARGET, 
(a.ACT_MP_OT*a.ACT_WH_OT/a.PLAN_SEW_SMV) ACT_TARGET_OT,
(a.ACT_MP_X_OT*a.PLAN_WH_X_OT/a.PLAN_SEW_SMV) ACT_TARGET_X_OT,
a.TOTAL_TARGET,
a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, a.ACTUAL_AH, 
a.ACTUAL_EH_OT, IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT, 
a.ACTUAL_EH_X_OT, IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
a.EFF_NORMAL,
a.EFF_OT,
a.EFF_X_OT,
a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME, a.ORDER_REFERENCE_PO_NO, 
a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME,
o.PLAN_REMARK, a.GROUP_ID
FROM log_daily_output a
LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = a.shift
WHERE a.SCHD_PROD_DATE = :schDate AND a.SITE_NAME = :sitename  -- AND a.SHIFT = :shift
ORDER BY a.ID_SITELINE`;
// export const QueryEffFromLog = `SELECT
// a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT,
// IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
// a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
// a.PLAN_MP, a.PLAN_WH, a.ACT_MP, a.PLAN_TARGET, 	a.ACT_TARGET, a.PLAN_WH_X_OT,
// a.PLAN_MP_OT, a.PLAN_WH_OT,  a.ACT_MP_OT,
// a.PLAN_TARGET_OT, a.ACT_TARGET_OT,
// a.ACT_MP_X_OT, a.ACT_TARGET_X_OT,
// a.TOTAL_TARGET,
// a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,
// a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
// a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, a.ACTUAL_AH,
// a.ACTUAL_EH_OT, IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT,
// a.ACTUAL_EH_X_OT, IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
// a.EFF_NORMAL,
// a.EFF_OT,
// a.EFF_X_OT,
// a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME, a.ORDER_REFERENCE_PO_NO,
// a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME
// FROM log_daily_output a
// WHERE a.SCHD_PROD_DATE =:schDate AND a.SITE_NAME = :sitename -- AND a.SHIFT = :shift
// ORDER BY a.ID_SITELINE`;


export const qryRefreshOneSchd= ` -- query get one shcd id non shift
SELECT	I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
I.PLAN_SEW_SMV, -- I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT,
I.PLAN_REMARK, I.GROUP_ID
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
        h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
       	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT,
        h.PLAN_REMARK, h.GROUP_ID
        FROM(
 			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT,
              n.PLAN_REMARK, n.GROUP_ID
		   FROM (
		          	SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
						IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
						b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
						b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
						b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
						FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
						ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
						ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
						ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
						e.PLAN_WH MAIN_WH,
						e.TTL_WH_OT MAIN_WH_OT,
						e.TTL_WH_X_OT MAIN_WH_X_OT,
						CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
						  CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
						m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
						FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
						FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
						p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, p.GROUP_ID, o.PLAN_REMARK
						FROM weekly_prod_sch_detail a
						LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
						LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
						--	untuk aktual SMV
						LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
						LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
						LEFT JOIN 	(
						       -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
						       SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH,
								 		 SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
								 FROM manpower_detail a 
								 LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
								 LEFT JOIN  weekly_prod_sch_detail c on c.SCHD_ID_SITELINE = b.ID_SITELINE 
								 LEFT JOIN workinghour_detail d ON d.SCHD_ID = c.SCHD_ID
								 WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift -- AND  b.SITE_NAME = 'SBR_02A'
								 AND c.SCHD_ID =  :schdId
								 GROUP BY a.ID_SITELINE, b.SHIFT
								 ORDER by a.ID_SITELINE
						) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
						-- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
						LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
						LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
						-- left join ciew qcendlineoutput untuk mendapatkan output
						LEFT JOIN (
						              SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME, N.GROUP_ID,
						              SUM(N.ENDLINE_OUT_QTY) NORMAL_OUTPUT,
						              SUM(N.ENDLINE_OUT_QTY_OT) OT_OUTPUT,
						              SUM(N.ENDLINE_OUT_QTY_X_OT) X_OT_OUTPUT
						              FROM(
						              -- normal 
						                      SELECT  
						                      a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                       a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'N'
						                      -- RTT n Repair
						                      UNION ALL
						                      SELECT 
						                              a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                              a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL   AND a.ENDLINE_PORD_TYPE = 'N'
						                      UNION ALL
						              -- OT
						                      SELECT
						                              a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
						                              0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'O'
						                      UNION ALL
						                      SELECT 
						                      a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME,date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND  
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'O'
						                      UNION ALL 
						              -- extra ot
						                      SELECT
						                              a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
						                              0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'XO'
						                      UNION ALL
						                      SELECT 
						                      a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a  
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID = :schdId AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'XO'
						              ) N
						              GROUP BY  N.ENDLINE_ACT_SCHD_ID
						) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
						LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate )) > 1 
						LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
						WHERE a.SCHD_ID =  :schdId   AND  e.SHIFT = :shift
            )n
        )h
    ) I`


export const qryRefrshSchdOneShift = ` -- query get one shcd id shift
SELECT I.SCHD_ID, I.SCH_ID, I.SCHD_PROD_DATE, I.ID_SITELINE,  I.SITE_NAME, I.LINE_NAME, I.SHIFT, I.SCHD_QTY,
I.ORDER_REFERENCE_PO_NO, I.SCHD_DAYS_NUMBER,
I.ORDER_NO, I.CUSTOMER_NAME, I.CUSTOMER_PROGRAM, I.PRODUCT_ITEM_CODE, 
I.ITEM_COLOR_CODE,  I.ITEM_COLOR_NAME, I.ORDER_STYLE_DESCRIPTION,
I.PLAN_SEW_SMV, -- I.FT_NORMAL, I.LT_NORMAL, I.FT_OT, I.LT_OT,  I.FT_X_OT, I.LT_X_OT,
I.PLAN_MP, I.PLAN_WH, I.ACT_MP, I.PLAN_TARGET, 	I.ACT_TARGET,
I.PLAN_MP_OT, I.PLAN_WH_OT,  I.ACT_MP_OT, 
I.PLAN_TARGET_OT, I.ACT_TARGET_OT, I.PLAN_WH_X_OT,
I.ACT_MP_X_OT, I.ACT_TARGET_X_OT,
I.TOTAL_TARGET,
I.NORMAL_OUTPUT,  I.OT_OUTPUT, I.X_OT_OUTPUT, I.TOTAL_OUTPUT,  
I.PLAN_EH, I.PLAN_AH, I.PLAN_EH_OT, I.PLAN_AH_OT,  I.PLAN_EH_X_OT, I.PLAN_AH_X_OT,
I.ACT_WH, I.ACT_WH_OT, I.ACT_WH_X_OT, I.ACTUAL_EH, I.ACTUAL_AH, 
I.ACTUAL_EH_OT, I.ACTUAL_AH_OT, 
I.ACTUAL_EH_X_OT, I.ACTUAL_AH_X_OT,
IFNULL(I.ACTUAL_EH,0)+IFNULL(I.ACTUAL_EH_OT,0)+IFNULL(I.ACTUAL_EH_X_OT,0) AS TOTAL_EH,
IFNULL(I.ACTUAL_AH,0)+IFNULL(I.ACTUAL_AH_OT,0)+IFNULL(I.ACTUAL_AH_X_OT,0) AS TOTAL_AH,
ROUND(NULLIF(I.ACTUAL_EH/I.ACTUAL_AH,0)*100,2) EFF_NORMAL,
ROUND(NULLIF(I.ACTUAL_EH_OT/I.ACTUAL_AH_OT,0)*100,2) EFF_OT,
ROUND(NULLIF(I.ACTUAL_EH_X_OT/I.ACTUAL_AH_X_OT,0)*100,2) EFF_X_OT,
I.PLAN_REMARK, I.GROUP_ID
FROM (
SELECT h.SCHD_ID, h.SCH_ID, h.SCHD_PROD_DATE, h.ID_SITELINE,  h.SITE_NAME, h.LINE_NAME, h.SHIFT, h.SCHD_QTY,
        h.ORDER_REFERENCE_PO_NO, h.SCHD_DAYS_NUMBER,
        h.ORDER_NO, h.CUSTOMER_NAME, h.CUSTOMER_PROGRAM , h.PRODUCT_ITEM_CODE, 
        h.ITEM_COLOR_CODE,  h.ITEM_COLOR_NAME, h.ORDER_STYLE_DESCRIPTION,
        h.PLAN_SEW_SMV, -- h.FT_NORMAL,  h.LT_NORMAL, h.FT_OT, h.LT_OT,  h.FT_X_OT, h.LT_X_OT,
        h.PLAN_MP, h.PLAN_WH, h.ACT_MP, h.PLAN_TARGET, 
        IF(h.ACT_TARGET IS NULL, h.PLAN_TARGET, h.ACT_TARGET) ACT_TARGET, -- normal planning
        h.PLAN_MP_OT, h.PLAN_WH_OT,  h.ACT_MP_OT,  h.PLAN_WH_X_OT, h.ACT_MP_X_OT,
        h.PLAN_TARGET_OT PLAN_TARGET_OT, 
        IF( h.ACT_TARGET_OT IS NULL, h.PLAN_TARGET_OT, h.ACT_TARGET_OT)  ACT_TARGET_OT, -- ot planning
        IF( h.ACT_TARGET_X_OT IS NULL, h.PLAN_TARGET_X_OT, h.ACT_TARGET_X_OT) ACT_TARGET_X_OT,
        IFNULL(h.ACT_TARGET,0)+IFNULL(h.ACT_TARGET_OT,0)+IFNULL(ACT_TARGET_X_OT,0) TOTAL_TARGET, -- skip null total target
        h.NORMAL_OUTPUT,  h.OT_OUTPUT, h.X_OT_OUTPUT,
        IFNULL(h.NORMAL_OUTPUT,0)+IFNULL(h.OT_OUTPUT,0)+IFNULL(X_OT_OUTPUT,0) TOTAL_OUTPUT,  -- actual ouput
        (h.ACT_TARGET*h.PLAN_SEW_SMV) PLAN_EH, (h.ACT_MP*h.PLAN_WH) PLAN_AH, -- plan EH and AH Actual target Normal
        (h.ACT_TARGET_OT*h.PLAN_SEW_SMV) PLAN_EH_OT, (h.ACT_MP_OT*h.PLAN_WH_OT) PLAN_AH_OT, -- plan EH and AH Actual target OT
        (h.ACT_TARGET_X_OT*h.PLAN_SEW_SMV) PLAN_EH_X_OT, (h.ACT_MP_X_OT*h.PLAN_WH_X_OT) PLAN_AH_X_OT, 
       	h.ACT_WH, h.ACT_WH_OT, h.ACT_WH_X_OT,
        (h.NORMAL_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH, (h.ACT_MP*h.ACT_WH) ACTUAL_AH,
        (h.OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_OT, (h.ACT_MP_OT*h.ACT_WH_OT) ACTUAL_AH_OT,
        (h.X_OT_OUTPUT*h.PLAN_SEW_SMV) ACTUAL_EH_X_OT, (h.ACT_MP_X_OT*h.ACT_WH_X_OT)  ACTUAL_AH_X_OT,
        h.PLAN_REMARK, h.GROUP_ID
        FROM(
 			   SELECT n.SCHD_ID, n.SCH_ID, n.SCHD_PROD_DATE, n.ID_SITELINE,  n.SITE_NAME, n.LINE_NAME, n.SHIFT, n.SCHD_QTY,
		       n.ORDER_REFERENCE_PO_NO, n.SCHD_DAYS_NUMBER,
		       n.ORDER_NO, n.CUSTOMER_NAME, n.CUSTOMER_PROGRAM, n.PRODUCT_ITEM_CODE, 
		       n.ITEM_COLOR_CODE,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,
		       n.PLAN_MP*n.PLAN_WH/n.PLAN_SEW_SMV PLAN_TARGET,
		       n.ACT_MP*n.PLAN_WH/n.PLAN_SEW_SMV ACT_TARGET,
		       n.PLAN_MP_OT, n.PLAN_WH_OT,  n.PLAN_WH_X_OT, n.ACT_MP_OT, n.ACT_MP_X_OT, 
		       n.PLAN_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV PLAN_TARGET_OT,
		       n.ACT_MP_OT*n.PLAN_WH_OT/n.PLAN_SEW_SMV ACT_TARGET_OT,
		       n.PLAN_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV PLAN_TARGET_X_OT,
		       n.ACT_MP_X_OT*n.PLAN_WH_X_OT/n.PLAN_SEW_SMV ACT_TARGET_X_OT,
		       n.NORMAL_OUTPUT, n.OT_OUTPUT, n.X_OT_OUTPUT,
				 n.PLAN_SEW_SMV, n.PLAN_MP, n.PLAN_WH, n.ACT_MP, 
		       (n.PLAN_WH*n.ACT_MIN)/n.MAIN_WH ACT_WH, -- NEW FORMULA 
		       (n.PLAN_WH_OT*n.ACT_MIN_OT)/n.MAIN_WH_OT ACT_WH_OT,
		       (n.PLAN_WH_X_OT*n.ACT_MIN_XOT)/n.MAIN_WH_X_OT ACT_WH_X_OT,
                       n.PLAN_REMARK, n.GROUP_ID
		   FROM (
		           SELECT a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, e.ID_SITELINE,  d.SITE_NAME, d.LINE_NAME, e.SHIFT, 
		       IF(SUBSTRING(:shift ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
		       b.ORDER_REFERENCE_PO_NO, d.FOREMAN,  a.SCHD_DAYS_NUMBER,
		       b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
		       b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION,  
		       FIND_SMV(g.SMV_PLAN, c.ACTUAL_SEW_SMV,c.PLAN_SEW_SMV ) PLAN_SEW_SMV,
		       ACTUAL_MINUTE(:shift, a.SCHD_PROD_DATE, k.SHIFT_START_HOUR, k.SHIFT_END_HOUR, CURTIME(), e.PLAN_WH) ACT_MIN,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_END_HOUR, e.TTL_WH_OT, CURTIME(), f.PLAN_WH_OT)  ACT_MIN_OT,
		       ACT_MIN_OT(a.SCHD_PROD_DATE, k.SHIFT_HOURLY_OT2, e.TTL_WH_X_OT, CURTIME(), f.PLAN_WH_X_OT) ACT_MIN_XOT,
		       e.PLAN_WH MAIN_WH,
		       e.TTL_WH_OT MAIN_WH_OT,
		       e.TTL_WH_X_OT MAIN_WH_X_OT,
		       CASE WHEN ISNULL(m.PLAN_MP) THEN e.PLAN_MP ELSE m.PLAN_MP END PLAN_MP,
       		 CASE WHEN ISNULL(f.PLAN_WH)  THEN e.PLAN_WH ELSE f.PLAN_WH END PLAN_WH,  
		       m.PLAN_MP_OT, m.PLAN_MP_X_OT, f.PLAN_WH_OT, f.PLAN_WH_X_OT, m.ACT_MP, 
		       FIND_ACT_MP(m.ACT_MP_OT, m.PLAN_MP_OT, NULL) ACT_MP_OT,
		       FIND_ACT_MP(m.ACT_MP_X_OT, m.PLAN_MP_X_OT, NULL) ACT_MP_X_OT,
		       p.NORMAL_OUTPUT, p.OT_OUTPUT, p.X_OT_OUTPUT, o.PLAN_REMARK, p.GROUP_ID
		           FROM weekly_prod_sch_detail a
		           LEFT JOIN viewcapacity b ON a.SCHD_CAPACITY_ID = b.ID_CAPACITY 
		           LEFT JOIN item_smv_header c ON c.ORDER_NO = b.ORDER_NO
		           --	untuk aktual SMV
		           LEFT JOIN smv_daily_plan g ON g.SCHD_ID = a.SCHD_ID AND g.SHIFT = :shift
		           LEFT JOIN item_siteline d ON a.SCHD_ID_SITELINE = d.ID_SITELINE
		           LEFT JOIN 	(
		                   -- Manpower_detail di join dengan item siteline untunk mendapatkan line name dan shift
						   SELECT a.ID_MPD, a.MP_DATE, a.ID_SITELINE, b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.PLAN_MP,  a.PLAN_WH, SUM(d.PLAN_WH_OT) TTL_WH_OT, SUM(d.PLAN_WH_X_OT) TTL_WH_X_OT
                           FROM manpower_detail a 
                           LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
                           INNER JOIN weekly_prod_sch_detail c ON a.ID_SITELINE = b.ID_SITELINE
                           INNER JOIN workinghour_detail d ON d.SCHD_ID = c.SCHD_ID
                           WHERE a.MP_DATE = :schDate   AND b.SHIFT = :shift
                           AND b.SHIFT = :shift   -- AND b.SITE_NAME = :sitename
                           AND c.SCHD_ID =  :schdId
                           GROUP BY b.ID_SITELINE, b.SHIFT
                           ORDER BY b.ID_SITELINE
		           ) e ON e.LINE_NAME = d.LINE_NAME AND a.SCHD_SITE = e.SITE_NAME
		           -- untuk working hour dan mp_daily_detail dipakaikan kolom shift untuk mengambil data jika line mempunyai shifting
		           LEFT JOIN workinghour_detail f ON f.SCHD_ID = a.SCHD_ID AND f.SHIFT = :shift
		           LEFT JOIN mp_daily_detail m  ON m.SCHD_ID = a.SCHD_ID AND m.SHIFT = :shift 
		           -- left join ciew qcendlineoutput untuk mendapatkan output
		           LEFT JOIN (
                                   SELECT N.ENDLINE_ACT_SCHD_ID, N.ENDLINE_SCHD_DATE,  N.ENDLINE_SCH_ID, N.ENDLINE_ID_SITELINE, N.ENDLINE_LINE_NAME, N.GROUP_ID,
						              SUM(N.ENDLINE_OUT_QTY) NORMAL_OUTPUT,
						              SUM(N.ENDLINE_OUT_QTY_OT) OT_OUTPUT,
						              SUM(N.ENDLINE_OUT_QTY_X_OT) X_OT_OUTPUT
						              FROM(
						              -- normal 
						                      SELECT  
						                      a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                       a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'N'
						                      -- RTT n Repair
						                      UNION ALL
						                      SELECT 
						                              a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                              a.ENDLINE_OUT_QTY, 0 ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL   AND a.ENDLINE_PORD_TYPE = 'N'
						                      UNION ALL
						              -- OT
						                      SELECT
						                              a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
						                              0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'O'
						                      UNION ALL
						                      SELECT 
						                      a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME,date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      0 ENDLINE_OUT_QTY, a.ENDLINE_OUT_QTY  ENDLINE_OUT_QTY_OT, 0 ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND  
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'O'
						                      UNION ALL 
						              -- extra ot
						                      SELECT
						                              a.ENDLINE_ACT_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, a.ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE,
						                              0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a 
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_ACT_SCHD_ID =  :schdId  AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_PORD_TYPE = 'XO'
						                      UNION ALL
						                      SELECT 
						                      a.ENDLINE_ACT_RPR_SCHD_ID, a.ENDLINE_SCH_ID, a.ENDLINE_ID_SITELINE, a.ENDLINE_LINE_NAME, date(a.ENDLINE_MOD_TIME) ENDLINE_SCHD_DATE, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, 
						                      0 ENDLINE_OUT_QTY, 0  ENDLINE_OUT_QTY_OT, a.ENDLINE_OUT_QTY ENDLINE_OUT_QTY_X_OT, a.GROUP_ID
						                      FROM qc_endline_output a  
						                      LEFT JOIN item_siteline b ON a.ENDLINE_ID_SITELINE = b.ID_SITELINE
						                      WHERE DATE(a.ENDLINE_MOD_TIME) = :schDate AND a.ENDLINE_ACT_SCHD_ID = :schdId AND b.SHIFT = :shift AND 
						                      a.ENDLINE_OUT_TYPE <> 'BS' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' AND a.ENDLINE_ACT_RPR_SCHD_ID IS NOT NULL  AND a.ENDLINE_PORD_TYPE = 'XO'
                                ) N
                                GROUP BY  N.ENDLINE_ACT_SCHD_ID
		           ) p ON a.SCHD_ID = p.ENDLINE_ACT_SCHD_ID
                  LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = :shift 
		           LEFT JOIN item_working_shift k ON k.SHIFT_ID  = :shift AND INSTR(k.SHIFT_DAYS, DAYNAME (:schDate  )) > 1 
		           WHERE a.SCHD_ID =  :schdId   AND  e.SHIFT = :shift
            )n
        )h
    ) I`



	 export const dailyPlanFromLog = `SELECT a.ORDER_NO,
a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT, 
IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
a.PLAN_MP, a.PLAN_WH, a.ACT_MP, 
a.PLAN_TARGET, 	
a.PLAN_WH_X_OT,
a.PLAN_MP_OT, 
a.PLAN_WH_OT, 
a.ACT_MP_OT, 
a.PLAN_TARGET_OT, 
a.ACT_MP_X_OT,
(a.ACT_MP*a.ACT_WH/a.PLAN_SEW_SMV) ACT_TARGET, 
(a.ACT_MP_OT*a.ACT_WH_OT/a.PLAN_SEW_SMV) ACT_TARGET_OT,
(a.ACT_MP_X_OT*a.PLAN_WH_X_OT/a.PLAN_SEW_SMV) ACT_TARGET_X_OT,
a.TOTAL_TARGET,
a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, a.ACTUAL_AH, 
a.ACTUAL_EH_OT, IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT, 
a.ACTUAL_EH_X_OT, IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
a.EFF_NORMAL,
a.EFF_OT,
a.EFF_X_OT,
a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME, a.ORDER_REFERENCE_PO_NO, 
a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME,
o.PLAN_REMARK, a.GROUP_ID
FROM log_daily_output a
LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = a.shift
WHERE a.SCHD_PROD_DATE = :schDate AND a.SITE_NAME = :sitename  AND a.SHIFT = :shift
ORDER BY a.ID_SITELINE`