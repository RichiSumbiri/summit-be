import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryGetListCompDetail = `SELECT 
	pic.ID, pic.PRODUCT_ID, pic.IS_ACTIVE, pic.COMPONENT_ID, pic.COMPONENT_NAME 
FROM product_item_component pic
WHERE pic.IS_ACTIVE = 1 AND pic.PRODUCT_ID = :productId`


export const qryGetBomRmList = `SELECT
	bs.ORDER_ID,
	bs.ID AS BOM_STRUCTURE_ID,
	bsl.MASTER_ITEM_ID,
	bsl.ID AS BOM_STRUCTURE_LIST_ID,
	mig.ITEM_GROUP_CODE,
	mii.ITEM_CODE,
	mii.ITEM_DESCRIPTION,
	mii.ITEM_CATEGORY_ID,
	mic.ITEM_CATEGORY_CODE,
	mic.ITEM_CATEGORY_DESCRIPTION,
	mii.ITEM_TYPE_ID,
	mit.ITEM_TYPE_CODE,
	mit.ITEM_TYPE_DESCRIPTION
-- 	bsld.EXTRA_APPROVAL_ID
FROM bom_structure bs
 LEFT JOIN bom_structure_list bsl ON bsl.BOM_STRUCTURE_ID = bs.ID  
 LEFT JOIN master_item_id mii ON mii.ITEM_ID = bsl.MASTER_ITEM_ID
 LEFT JOIN master_item_group mig ON mig.ITEM_GROUP_ID = mii.ITEM_GROUP_ID 
 LEFT JOIN master_item_category mic ON mic.ITEM_CATEGORY_ID  = mii.ITEM_CATEGORY_ID
 LEFT JOIN master_item_type mit ON mit.ITEM_TYPE_ID = mii.ITEM_TYPE_ID
 WHERE bs.ORDER_ID = :orderId AND bs.IS_DELETED = 0 AND mit.ITEM_TYPE_CODE = 'RM' AND bsl.IS_DELETED = 0 AND bsl.STATUS = 'Confirmed'
 GROUP BY bs.ORDER_ID, bs.ID, bsl.MASTER_ITEM_ID
 
 `


 export const qryGetCompListColor = `SELECT 
	opl.ITEM_COLOR_ID,
	opl.ITEM_COLOR_CODE, 
	opl.ITEM_COLOR_NAME,
	'' AS DIMD,
	'' AS MATERIAL_ITEM,
	'' AS MATERIAL_COLOR
FROM order_po_listing opl 
WHERE opl.ORDER_NO = :orderId
GROUP BY opl.ITEM_COLOR_ID, opl.ITEM_COLOR_CODE, opl.ITEM_COLOR_NAME`


// models/OrderComponentDetail.js
  export const OrderComponentDetail = db.define(
    "order_component_detail",
    {
      ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ORDER_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ITEM_CATEGORY_CODE: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      MASTER_ITEM_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ITEM_COLOR_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ITEM_COLOR_CODE: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      PRODUCT_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      COMPONENT_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      DIMESION_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      MAIN_COMPONENT: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ADD_ID: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      MOD_ID: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true, // Sequelize otomatis pakai createdAt & updatedAt
      indexes: [
        {
          name: "order_component_detail_ORDER_ID_IDX",
          fields: ["ORDER_ID"],
        },
        {
          name: "order_component_detail_MASTER_ITEM_ID_IDX",
          fields: ["MASTER_ITEM_ID"],
        },
        {
          name: "order_component_detail_COMPONENT_ID_IDX",
          fields: ["COMPONENT_ID"],
        },
      ],
    }
  );



  export const qryListOrderCompDetail = `SELECT
    ocd.ID,
    ocd.ORDER_ID,
    ocd.ITEM_CATEGORY_CODE,
    ocd.MASTER_ITEM_ID,
    ocd.ITEM_COLOR_ID,
    ocd.ITEM_COLOR_CODE,
    ocd.PRODUCT_ID,
    ocd.COMPONENT_ID,
    ocd.DIMESION_ID,
    ocd.ADD_ID,
    ocd.MOD_ID,
    mcc.COLOR_CODE,
    mcc.COLOR_DESCRIPTION,
    pic.COMPONENT_NAME,
    mii.ITEM_CODE,
    mii.ITEM_DESCRIPTION
  FROM
    order_component_detail ocd 
  LEFT JOIN master_color_chart mcc ON mcc.COLOR_ID = ocd.ITEM_COLOR_ID  
  LEFT JOIN product_item_component pic ON pic.PRODUCT_ID = ocd.PRODUCT_ID AND pic.COMPONENT_ID = ocd.COMPONENT_ID
  LEFT JOIN master_item_id mii ON mii.ITEM_ID = ocd.MASTER_ITEM_ID
  WHERE ocd.ORDER_ID  = :orderId
`