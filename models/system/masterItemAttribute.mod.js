export const queryGetItemMasterAttribute = `
SELECT
	miida.ID,
	miida.MASTER_ITEM_ID,
	miida.MASTER_ATTRIBUTE_ID,
	mas.NAME AS MASTER_ATTRIBUTE_NAME,
	miida.MASTER_ATTRIBUTE_VALUE_ID,
	mav.NAME AS MASTER_ATTRIBUTE_VALUE_NAME,
	miida.CREATED_AT,
	miida.UPDATED_AT,
	miida.IS_DELETED,
	miida.DELETED_AT,
	miida.NOTE
FROM
	master_item_id_attributes miida
LEFT JOIN master_attribute_setting mas ON mas.ID = miida.MASTER_ATTRIBUTE_ID 
LEFT JOIN master_attribute_value mav ON mav.ID = miida.MASTER_ATTRIBUTE_VALUE_ID 
WHERE miida.MASTER_ITEM_ID = :itemID
`;