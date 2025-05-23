import { DataTypes } from "sequelize";
import db from "../../config/database.js";

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
		ils.BACK_IMG,
    CONCAT(
		ilc.CUSTOMER_CODE,
		ilpt.PRODUCT_TYPE_CODE,
		ilpc.PRODUCT_CATEGORY_CODE,
		RIGHT(ils.PRODUCT_ITEM_ID, 4)
	) AS OB_CODE,
   	xuw.USER_INISIAL AS USER_ADD,
	  xux.USER_INISIAL AS USER_MOD,
    ils.createdAt,
    ils.updatedAt
	FROM item_list_style ils 
  LEFT JOIN item_list_customer ilc ON ilc.CUSTOMER_NAME = ils.CUSTOMER_NAME
  LEFT JOIN item_list_product_type ilpt ON ilpt.PRODUCT_TYPE  = ils.PRODUCT_TYPE
  LEFT JOIN item_list_product_category ilpc ON ilpc.PRODUCT_CATEGORY  = TRIM(SUBSTRING_INDEX(ils.PRODUCT_CATEGORY, '/', -1))
  LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ils.USER_ADD_ID
  LEFT JOIN xref_user_web xux ON xux.USER_ID = ils.USER_MOD_ID 
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


export const qryListSizesOb = `SELECT 
ils.PRODUCT_TYPE,
ils.SIZE_COUNTRY,
ils.SIZE_NAME
FROM 
item_list_sizes ils 
WHERE ils.PRODUCT_TYPE = :prodType `


export const IeObHeader = db.define('ie_ob_header', {
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true,
    },
    CUSTOMER_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    PRODUCT_ITEM_ID: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'style',
    },
    PRODUCT_ITEM_CODE: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'style',
    },
     OB_UNIT: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'style',
    },
    OB_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_DESCRIPTION: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_SIZES: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_SIZE_REF: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_MP: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_WH: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    OB_TARGET: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    OB_TAKE_TIME: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    OB_REVISION: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    OB_STATUS: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_ADD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    OB_MOD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    upatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
  });


export const IeObSize = db.define('ie_ob_sizes', {
    OB_SIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    SIZE_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });

//ini untuk next get OB_CODE
  const qryGetListStyleWithCode = `SELECT 
	ils.*,
	CONCAT(
		ilc.CUSTOMER_CODE,
		ilpt.PRODUCT_TYPE_CODE,
		ilpc.PRODUCT_CATEGORY_CODE,
		RIGHT(ils.PRODUCT_ITEM_ID, 4)
	) AS OB_CODE,
	xuw.USER_INISIAL AS USER_ADD,
	xux.USER_INISIAL AS USER_MOD
FROM item_list_style ils 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ils.USER_ADD_ID
LEFT JOIN xref_user_web xux ON xux.USER_ID = ils.USER_MOD_ID 
LEFT JOIN item_list_customer ilc ON ilc.CUSTOMER_NAME = ils.CUSTOMER_NAME
LEFT JOIN item_list_product_type ilpt ON ilpt.PRODUCT_TYPE  = ils.PRODUCT_TYPE
LEFT JOIN item_list_product_category ilpc ON ilpc.PRODUCT_CATEGORY  = TRIM(SUBSTRING_INDEX(ils.PRODUCT_CATEGORY, '/', -1))
WHERE ils.DELETE_STATUS = 0 AND ils.CUSTOMER_NAME = :buyer`


export const getLasIdOb = `SELECT 
	CAST(SUBSTRING(ioh.OB_ID,12) AS UNSIGNED)+1 AS LATST_ID
FROM ie_ob_header ioh 
WHERE ioh.PRODUCT_ITEM_ID = :prodItemId
ORDER BY ioh.OB_ID DESC 
LIMIT 1`


export const getListOb = `SELECT 
ioh.*,
xuw.USER_INISIAL AS USER_ADD,
xux.USER_INISIAL AS USER_MOD
FROM ie_ob_header ioh 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ioh.OB_ADD_ID
LEFT JOIN xref_user_web xux ON xux.USER_ID = ioh.OB_MOD_ID 
WHERE ioh.PRODUCT_ITEM_ID = :prodItemId`