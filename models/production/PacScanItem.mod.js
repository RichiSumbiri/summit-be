import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryGetListPoBuyer = `SELECT DISTINCT
	a.BUYER_PO
FROM packing_plan_child a
LEFT JOIN packing_plan_header b ON b.PACKPLAN_ID = a.PACKPLAN_ID
 WHERE a.BUYER_PO LIKE  :qryPO --  b.PACKPLAN_EX_FACTORY > CURDATE() AND`;

export const qryGetRowByPoBuyer = `SELECT a.ROWID, a.PACKPLAN_ID, e.PACKPLAN_EX_FACTORY, a.ROW_TYPE, a.BOX_ID, a.CTN_START, a.CTN_END, a.PO_INDEX, a.COL_INDEX,
 a.ROW_INDEX, a.BUYER_PO, a.BUYER_COLOR_CODE, a.BOX_CODE, a.SIZE_CODE,    a.SHIPMENT_QTY,
 a.AFTER_SET_QTY, a.QTY_PER_BOX, a.TTL_QTY_BOX, a.TTL_BOX,
 c.LENGTH_CM, c.WIDTH_CM, c.HEIGHT_CM, c.WEIGHT,
 b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME , SUBSTRING_INDEX(a.ROWID, '|', 4) AS PLAN_SEQUANCE_ID,
 IFNULL(a.PO_ITEM,d.PO_ITEM) PO_ITEM, IFNULL(a.ARTICLE_GENERIC, d.ARTICLE_GENERIC) ARTICLE_GENERIC, IFNULL(d.UPC_CODE, a.UPC_CODE) UPC_CODE
 FROM 
packing_plan_box_row a 
LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID 
		AND a.BUYER_PO = b.BUYER_PO 
		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
      AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
LEFT JOIN item_carton_list c ON c.BOX_ID = a.BOX_ID
LEFT JOIN (
		SELECT 
		f.PO_NUMBER, f.PO_ITEM, f.ARTICLE_GENERIC, f.COLOR_CODE, f.SIZE_CODE, f.UPC_CODE
		FROM order_po_buyer f
		WHERE f.PO_NUMBER = :poBuyer
        GROUP BY f.PO_NUMBER, f.ARTICLE_GENERIC, f.PO_ITEM, f.COLOR_CODE, f.SIZE_CODE
) d ON d.PO_NUMBER = a.BUYER_PO AND a.BUYER_COLOR_CODE = d.COLOR_CODE AND a.SIZE_CODE = d.SIZE_CODE
 LEFT JOIN packing_plan_header e ON e.PACKPLAN_ID = b.PACKPLAN_ID 
WHERE a.BUYER_PO = :poBuyer
ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.ROW_INDEX, a.CTN_START`;

export const qryGetDtlRowByr = `SELECT a.ROWID, a.PACKPLAN_ID, a.SIZE_CODE, a.QTY , (a.QTY*b.TTL_BOX) TTL_QTY, b.BUYER_COLOR_CODE,
d.PO_ITEM, d.ARTICLE_GENERIC, d.UPC_CODE
FROM pack_plan_row_detail a 
LEFT JOIN packing_plan_box_row  b ON a.ROWID = b.ROWID
LEFT JOIN (
		SELECT 
		f.PO_NUMBER, f.PO_ITEM, f.ARTICLE_GENERIC, f.COLOR_CODE, f.SIZE_CODE, f.UPC_CODE
		FROM order_po_buyer f
		WHERE f.PO_NUMBER = :poBuyer
      GROUP BY f.PO_NUMBER, f.ARTICLE_GENERIC,  f.COLOR_CODE, f.SIZE_CODE -- f.PO_ITEM,
	  ) d ON d.PO_NUMBER = b.BUYER_PO AND b.BUYER_COLOR_CODE = d.COLOR_CODE AND a.SIZE_CODE = d.SIZE_CODE
WHERE a.ROWID IN (
	SELECT c.ROWID FROM  packing_plan_box_row c WHERE c.BUYER_PO = :poBuyer
)`;

export const PackItemScan = db.define(
  "packing_item_scan",
  {
    ROWID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    UNIX_BOX_NO: { type: DataTypes.STRING },
    PACKPLAN_ID: { type: DataTypes.STRING },
    BUYER_PO: { type: DataTypes.STRING },
    UPC_CODE: { type: DataTypes.STRING },
    INDEX_CTN: { type: DataTypes.INTEGER },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    SCAN_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SCAN_TIME",
    updatedAt: "MOD_TIME",
  }
);

export const qryGetBoxUnix = `SELECT CAST(SUBSTRING(a.UNIX_BOX_NO,15) AS INTEGER)+1 LAST_ID
FROM packing_item_scan a 
WHERE a.PACKPLAN_ID = :ppid
ORDER BY a.SCAN_TIME DESC
LIMIT 1`;

export const qryGetLastIndex = `SELECT a.INDEX_CTN+1 LAST_INDEX
FROM packing_item_scan a 
WHERE a.ROWID = :rowId
ORDER BY a.SCAN_TIME DESC
LIMIT 1`;
