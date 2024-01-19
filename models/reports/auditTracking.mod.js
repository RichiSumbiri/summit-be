export const mainTraceOrder = `SELECT 
NA.Production_Month PRODUCTION_MONTH,
NA.Mfg_Site MANUFACTURING_SITE,
NA.Customer_Name CUSTOMER_NAME,
NA.Customer_Divison CUSTOMER_DIVISON,
NA.Order_ID ORDER_NO,
NA.Order_Reference_PONo ORDER_REFERENCE_PO_NO, 
NA.MOID,
NA.PO_Status PO_STATUS,
NA.Product_Item_ID PRODUCT_ID,
NA.Product_Item_ID PRODUCT_IT,
NA.Product_Item_Code ORDER_STYLE_DESCRIPTION,
NA.Order_Reference_PONo,
NA.Item_Color_Name ITEM_COLOR_NAME,
NA.Plan_Exfactory_Date PLAN_EX_FACTORY, 
NF.ACTUAL_EX_FACTORY_DATE,
NA.ORDER_QTY,
NA.MO_QTY MO_QTY,
NB.BUNDLE_QTY SEWING_IN_QTY,
IFNULL((NB.BUNDLE_QTY-NA.MO_QTY), 0) SEWNGN_IN_VAR,
NC.BUNDLE_QTY SEWING_OUT_QTY,
IFNULL((NC.BUNDLE_QTY-NA.MO_QTY), 0) SEWNGN_OUT_VAR,
ND.BUNDLE_QTY PACKING_IN_QTY,
IFNULL((ND.BUNDLE_QTY-NA.MO_QTY), 0) PACKING_IN_VAR,
NE.PACKING_OUT,
IFNULL((NE.PACKING_OUT-NA.MO_QTY), 0) PACKING_OUT_VAR,
NF.PACKING_SLIP_QTY,
IFNULL((NF.PACKING_SLIP_QTY-NA.MO_QTY), 0) PACKING_SLIP_VAR,
NA.Shipped_Qty SHIPPED_QTY, -- HARUS GANTI DENGAN finish prod detail
IFNULL((NA.Shipped_Qty-NA.MO_QTY), 0) SHIPPED_VAR
FROM (
    SELECT 
        nb.Production_Month,
        nb.Mfg_Site,
        nb.Customer_Name,
        nb.Customer_Divison,
        nb.Order_ID,
        nb.Order_Reference_PONo, 
        nb.PO_Status,
        nb.Product_Item_ID,
        nb.Product_Item_Code,
        nb.MOID,
        nb.Plan_Exfactory_Date,
        nb.Item_Color_Name,
        SUM(nb.ORDER_QTY) ORDER_QTY,
        SUM(nb.MO_QTY) MO_QTY,
        SUM(nb.Shipped_Qty) Shipped_Qty
    FROM (
        SELECT 
        a.Production_Month,
        a.Mfg_Site,
        a.Customer_Name,
        a.Customer_Divison,
        a.Order_ID,
        a.Order_Reference_PONo, 
        a.PO_Status,
        a.Product_Item_ID,
        a.Product_Item_Code,
        a.MOID,
        a.Plan_Exfactory_Date,
        a.Item_Color_Name,
        CAST(REPLACE(a.Order_Qty,',','') AS INT) ORDER_QTY,
        CAST(REPLACE(a.MO_Qty,',','') AS INT) MO_QTY,
        a.Shipped_Qty
        FROM OrderPOListing a 
        WHERE a.Production_Month IN (:listMonth)
    ) nb 
    GROUP BY nb.Order_ID, nb.MOID
) NA LEFT JOIN (
    SELECT 
        a.Order_ID ORDER_ID, a.MOID,  SUM(a.Bundle_Qty) BUNDLE_QTY
    FROM 
    sewing_in a 
    WHERE a.MOID IN (
            SELECT 
            v.MOID
            FROM OrderPOListing v 
            WHERE v.Production_Month IN (:listMonth)
    ) 
    GROUP BY a.Order_ID, a.MOID
) NB ON NB.ORDER_ID = NA.ORDER_ID AND NB.MOID = NA.MOID
LEFT JOIN (
	SELECT 
	    a.Order_ID ORDER_ID, a.MOID, SUM(a.Bundle_Qty) BUNDLE_QTY
	FROM 
	sewing_out a 
	WHERE a.MOID IN (
	        SELECT 
	        v.MOID
	        FROM OrderPOListing v 
	        WHERE v.Production_Month IN (:listMonth)
	) 
	GROUP BY a.Order_ID, a.MOID
) NC ON NC.ORDER_ID = NA.ORDER_ID AND NC.MOID = NA.MOID
LEFT JOIN (
	SELECT 
	    a.Order_ID ORDER_ID, a.MOID, SUM(a.Bundle_Qty) BUNDLE_QTY
	FROM 
	packing_in a 
	WHERE a.MOID IN (
	        SELECT 
	        v.MOID
	        FROM OrderPOListing v 
	        WHERE v.Production_Month IN (:listMonth)
	) 
	GROUP BY a.Order_ID, a.MOID
) ND ON ND.ORDER_ID = NA.ORDER_ID AND ND.MOID = NA.MOID
LEFT JOIN (
	SELECT 
	a.OrderID ORDER_ID,  a.OrderRefPONo, a.MOID, SUM(a.GoodQty) PACKING_OUT
	FROM 
	FX_FinishingProdDetail a 
	WHERE a.MOID IN (
	        SELECT 
	        v.MOID
	        FROM OrderPOListing v 
	        WHERE v.Production_Month IN (:listMonth)
	) 
	GROUP BY a.OrderID,  a.MOID
) NE ON NE.ORDER_ID = NA.ORDER_ID AND NE.MOID = NA.MOID
LEFT JOIN (
	SELECT 
        a.ORDER_ID, a.ORDER_REF_PO_No, b.MOID, a.ACTUAL_EX_FACTORY_DATE, SUM(a.PACKING_SLIP_QTY) PACKING_SLIP_QTY
	FROM 
	CustomerPackingSlip a
	LEFT JOIN OrderPOListing b ON a.ORDER_PO_ID	= b.Order_PO_ID
	WHERE b.Production_Month IN (:listMonth)
	GROUP BY a.ORDER_ID, a.ORDER_REF_PO_No,  b.MOID
)NF ON NF.ORDER_ID = NA.ORDER_ID AND NF.MOID = NA.MOID
ORDER BY NA.Production_Month, NA.Customer_Name`;

export const XmainTraceOrder = `SELECT 
NA.Production_Month PRODUCTION_MONTH,
NA.Mfg_Site MANUFACTURING_SITE,
NA.Customer_Name CUSTOMER_NAME,
NA.Customer_Divison CUSTOMER_DIVISON,
NA.Order_ID ORDER_NO,
NA.Order_Reference_PONo ORDER_REFERENCE_PO_NO, 
NA.PO_Status PO_STATUS,
NA.Product_Item_ID PRODUCT_ID,
NA.Product_Item_Code ORDER_STYLE_DESCRIPTION,
NA.Order_Reference_PONo,
NA.Item_Color_Name ITEM_COLOR_NAME,
NA.ORDER_QTY,
NA.MO_QTY MO_QTY,
NB.BUNDLE_QTY SEWING_IN_QTY,
IFNULL((NB.BUNDLE_QTY-NA.MO_QTY), 0) SEWNGN_IN_VAR,
NC.BUNDLE_QTY SEWING_OUT_QTY,
IFNULL((NC.BUNDLE_QTY-NA.MO_QTY), 0) SEWNGN_OUT_VAR,
ND.BUNDLE_QTY PACKING_IN_QTY,
IFNULL((ND.BUNDLE_QTY-NA.MO_QTY), 0) PACKING_IN_VAR,
NE.PACKING_OUT,
IFNULL((ND.BUNDLE_QTY-NA.MO_QTY), 0) PACKING_OUT_VAR,
NF.PACKING_SLIP_QTY,
IFNULL((NF.PACKING_SLIP_QTY-NA.MO_QTY), 0) PACKING_SLIP_VAR,
NA.Shipped_Qty SHIPPED_QTY, -- HARUS GANTI DENGAN finish prod detail
IFNULL((NA.Shipped_Qty-NA.MO_QTY), 0) SHIPPED_VAR
FROM (
        SELECT 
        nb.Production_Month,
        nb.Mfg_Site,
        nb.Customer_Name,
        nb.Customer_Divison,
        nb.Order_ID,
        nb.Order_Reference_PONo, 
        nb.PO_Status,
        nb.Product_Item_ID,
        nb.Product_Item_Code,
        nb.MOID,
        nb.Item_Color_Name,
        SUM(nb.ORDER_QTY) ORDER_QTY,
        SUM(nb.MO_QTY) MO_QTY,
        SUM(nb.Shipped_Qty) Shipped_Qty
    FROM (
        SELECT 
        a.Production_Month,
        a.Mfg_Site,
        a.Customer_Name,
        a.Customer_Divison,
        a.Order_ID,
        a.Order_Reference_PONo, 
        a.PO_Status,
        a.Product_Item_ID,
        a.Product_Item_Code,
        a.MOID,
        a.Item_Color_Name,
        CAST(REPLACE(a.Order_Qty,',','') AS INT) ORDER_QTY,
        CAST(REPLACE(a.MO_Qty,',','') AS INT) MO_QTY,
        a.Shipped_Qty
        FROM OrderPOListing a 
        WHERE a.Production_Month IN (:listMonth)
    ) nb 
    GROUP BY nb.Order_ID, nb.Order_Reference_PONo
) NA LEFT JOIN (
    SELECT 
        a.Order_ID ORDER_ID, a.Order_Ref_PO_No, a.MOID,  SUM(a.Bundle_Qty) BUNDLE_QTY
    FROM 
    sewing_in a 
    WHERE a.Order_Ref_PO_No IN (
        SELECT 
        v.Order_Reference_PONo
        FROM OrderPOListing v 
        WHERE v.Production_Month IN (:listMonth)
    ) 
    GROUP BY a.Order_ID, a.Order_Ref_PO_No
) NB ON NB.ORDER_ID = NA.ORDER_ID AND NB.Order_Ref_PO_No = NA.Order_Reference_PONo
LEFT JOIN (
SELECT 
    a.Order_ID ORDER_ID,  a.Order_Ref_PO_No, a.MOID, SUM(a.Bundle_Qty) BUNDLE_QTY
FROM 
sewing_out a 
WHERE a.Order_Ref_PO_No IN (
        SELECT 
        v.Order_Reference_PONo
        FROM OrderPOListing v 
        WHERE v.Production_Month IN (:listMonth)
) 
GROUP BY a.Order_ID, a.Order_Ref_PO_No
) NC ON NC.ORDER_ID = NA.ORDER_ID AND NC.Order_Ref_PO_No = NA.Order_Reference_PONo
LEFT JOIN (
SELECT 
    a.Order_ID ORDER_ID,  a.Order_Ref_PO_No, a.MOID, SUM(a.Bundle_Qty) BUNDLE_QTY
FROM 
packing_in a 
WHERE a.Order_Ref_PO_No IN (
        SELECT 
        v.Order_Reference_PONo
        FROM OrderPOListing v 
        WHERE v.Production_Month IN (:listMonth)
) 
GROUP BY a.Order_ID,  a.Order_Ref_PO_No
) ND ON ND.ORDER_ID = NA.ORDER_ID AND ND.Order_Ref_PO_No = NA.Order_Reference_PONo
LEFT JOIN (
SELECT 
a.OrderID ORDER_ID,  a.OrderRefPONo, a.MOID, SUM(a.GoodQty) PACKING_OUT
FROM 
FX_FinishingProdDetail a 
WHERE a.OrderRefPONo IN (
        SELECT 
        v.Order_Reference_PONo
        FROM OrderPOListing v 
        WHERE v.Production_Month IN (:listMonth)
) 
GROUP BY a.OrderID,  a.OrderRefPONo
) NE ON NE.ORDER_ID = NA.ORDER_ID AND NE.OrderRefPONo = NA.Order_Reference_PONo
LEFT JOIN (
SELECT 
    a.ORDER_ID, a.ORDER_REF_PO_No, SUM(a.PACKING_SLIP_QTY) PACKING_SLIP_QTY
FROM 
CustomerPackingSlip a 
WHERE a.ORDER_REF_PO_No IN (
        SELECT 
        v.Order_Reference_PONo
        FROM OrderPOListing v 
        WHERE v.Production_Month IN (:listMonth)
) 
GROUP BY a.ORDER_ID, a.ORDER_REF_PO_No
) NF ON NF.ORDER_ID = NA.ORDER_ID AND NF.ORDER_REF_PO_No = NA.Order_Reference_PONo`;
