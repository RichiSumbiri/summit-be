export const qryGetListCompDetail = `SELECT 
	pic.ID, pic.PRODUCT_ID, pic.IS_ACTIVE, pic.MASTER_ITEM_COMPONENT_ID,
	mic.NAME
FROM product_item_component pic
LEFT JOIN master_item_component mic ON mic.ID = pic.MASTER_ITEM_COMPONENT_ID 
WHERE pic.IS_ACTIVE = 1 AND pic.PRODUCT_ID = :productId`