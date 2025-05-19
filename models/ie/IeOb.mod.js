export const qryGetThreeStyle = `SELECT DISTINCT
	ils.CUSTOMER_NAME,
	ils.PRODUCT_TYPE, 
	TRIM(SUBSTRING_INDEX(ils.PRODUCT_CATEGORY, '/', -1)) AS PRODUCT_CATEGORY,
	COUNT(ils.PRODUCT_CATEGORY) TTL_PRODUCT
FROM item_list_style ils
WHERE ils.DELETE_STATUS  = 0
GROUP BY ils.CUSTOMER_NAME,	ils.PRODUCT_TYPE, ils.PRODUCT_CATEGORY`

export const qryGetStyleByTree = (buyer, prodType, prodCat) => {
	let basedQry =  `SELECT 
		ils.ID,
		ils.PRODUCT_ID,
		ils.CUSTOMER_NAME,
		ils.PRODUCT_ITEM_ID,
		ils.PRODUCT_ITEM_CODE,
		ils.PRODUCT_TYPE,
		ils.PRODUCT_CATEGORY,
		ils.PRODUCT_ITEM_DESCRIPTION,
		ils.FRONT_IMG,
		ils.BACK_IMG
	FROM item_list_style ils 
	WHERE ils.DELETE_STATUS = 0 
	AND ils.CUSTOMER_NAME = '${buyer}' `

		if(prodType){
			basedQry = basedQry + ` AND ils.PRODUCT_TYPE = '${prodType}' `
		}
		if(prodCat){
			basedQry = basedQry + ` AND TRIM(SUBSTRING_INDEX(ils.PRODUCT_CATEGORY, '/', -1))  = '${prodCat}' `
		}
	return basedQry
}