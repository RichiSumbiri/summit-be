import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryGetListCompDetail = `SELECT 
	pic.ID, pic.PRODUCT_ID, pic.IS_ACTIVE, pic.COMPONENT_ID, pic.COMPONENT_NAME 
FROM product_item_component pic
WHERE pic.IS_ACTIVE = 1 AND pic.PRODUCT_ID = :productId`


export const qryListGetServices = `SELECT
	miis.ID,
	miis.MASTER_ITEM_ID,
	miis.MASTER_SERVICE_ID,
	miis.MASTER_SERVICE_VALUE_ID,
	sa.ATTRIBUTE_NAME,
	sav.SERVICE_ATTRIBUTE_VALUE_CODE,
	sav.SERVICE_ATTRIBUTE_VALUE_NAME 
FROM
	master_item_id_service miis 
LEFT JOIN service_attributes sa  ON sa.SERVICE_ATTRIBUTE_ID = miis.MASTER_SERVICE_ID 
LEFT JOIN service_attribute_values sav ON sav.SERVICE_ATTRIBUTE_VALUE_ID = miis.MASTER_SERVICE_VALUE_ID 
WHERE miis.IS_DELETED = 0 AND miis.MASTER_ITEM_ID = :productId`


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
	opl.ITEM_COLOR_NAME
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
      BOM_STRUCTURE_LIST_ID: {
        type: DataTypes.INTEGER,
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
      COMPONENT_TBL_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      COMPONENT_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      DIMENSION_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ITEM_DIMENSION_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MAIN_COMPONENT: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      IS_ACTIVE: {
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
      IS_DELETED: {
        type: DataTypes.INTEGER,
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
    ocd.DIMENSION_ID,
    ocd.MAIN_COMPONENT,
    ocd.ADD_ID,
    ocd.MOD_ID,
    ocd.IS_ACTIVE,
    oph.ITEM_ID,
    mcc.COLOR_CODE,
    mcc.COLOR_DESCRIPTION,
    mcc2.COLOR_CODE AS DIM_COLOR_CODE,
    mcc2.COLOR_DESCRIPTION AS DIM_COLOR_DESCRIPTION,
    pic.COMPONENT_NAME,
    mii.ITEM_CODE,
    mii.ITEM_DESCRIPTION,
	ocs.SERVICE_FLAG,
    ocs.IS_SUBCON,
    ocs.SUBCON_NAME,
	sa.ATTRIBUTE_NAME,
	sav.SERVICE_ATTRIBUTE_VALUE_CODE,
	sav.SERVICE_ATTRIBUTE_VALUE_NAME
  FROM
    order_component_detail ocd 
  LEFT JOIN master_color_chart mcc ON mcc.COLOR_ID = ocd.ITEM_COLOR_ID  
  LEFT JOIN order_po_header oph ON oph.ORDER_ID = ocd.ORDER_ID 
  LEFT JOIN product_item_component pic ON pic.PRODUCT_ID = ocd.PRODUCT_ID AND pic.COMPONENT_ID = ocd.COMPONENT_ID
  LEFT JOIN master_item_id mii ON mii.ITEM_ID = ocd.MASTER_ITEM_ID
  LEFT JOIN master_item_dimension mid2 ON mid2.ID = ocd.ITEM_DIMENSION_ID
  LEFT JOIN master_color_chart mcc2 ON mcc2.COLOR_ID = mid2.COLOR_ID 
  LEFT JOIN order_component_service ocs ON ocd.ID = ocs.ORDER_COMP_DETAIL_ID AND ocd.IS_ACTIVE = 1 
  LEFT JOIN master_item_id_service miis ON miis.ID = ocs.SERVICE_ID 
  LEFT JOIN service_attributes sa  ON sa.SERVICE_ATTRIBUTE_ID = miis.MASTER_SERVICE_ID 
  LEFT JOIN service_attribute_values sav ON sav.SERVICE_ATTRIBUTE_VALUE_ID = miis.MASTER_SERVICE_VALUE_ID 
  WHERE ocd.ORDER_ID  = :orderId AND ocd.IS_DELETED = 0
`

export const qryGetDimByStructure = `SELECT 
	bsld.BOM_STRUCTURE_LIST_ID,
	bsld.ITEM_DIMENSION_ID,
	mid2.DIMENSION_ID,
	mid2.COLOR_ID,
	mcc.COLOR_CODE,
	mcc.COLOR_DESCRIPTION,
	bsl.BOM_LINE_ID,
	bsl.CONSUMPTION_UOM,
	bsl.BOOKING_CONSUMPTION_PER_ITEM,
	bsl.NOTE,
	bsl.ITEM_POSITION
	FROM bom_structure_list bsl 
LEFT JOIN bom_structure_list_detail bsld  ON bsl.ID = bsld.BOM_STRUCTURE_LIST_ID 
LEFT JOIN master_item_dimension mid2 ON mid2.ID = bsld.ITEM_DIMENSION_ID
LEFT JOIN master_color_chart mcc ON mcc.COLOR_ID = mid2.COLOR_ID 
WHERE bsl.MASTER_ITEM_ID = :itemId
GROUP BY bsld.BOM_STRUCTURE_LIST_ID, bsld.ITEM_DIMENSION_ID, mid2.COLOR_ID`



// models/order_component_service.js
export const OrderComponentService = db.define(
    "order_component_service",
    {
      ID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true, // sesuaikan: true kalau ID auto increment, false kalau manual
      },
      ORDER_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      SERVICE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // MASTER_ITEM_ID: {
      //   type: DataTypes.STRING(100),
      //   allowNull: true,
      // },
      // MASTER_SERVICE_ID: {
      //   type: DataTypes.STRING(100),
      //   allowNull: true,
      // },
      // MASTER_SERVICE_VALUE_ID: {
      //   type: DataTypes.STRING(100),
      //   allowNull: true,
      // },
      ORDER_COMP_DETAIL_ID: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      SERVICE_FLAG: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      IS_ACTIVE: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      IS_DELETED: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      SERVICE_REMARK: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      IS_SUBCON: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      SUBCON_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      SUBCON_NAME: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ITEM_SERVICE_NOTE: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ADD_ID: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      MOD_ID: {
        type: DataTypes.STRING(100),
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
      tableName: "order_component_service",
      timestamps: true, // Sequelize akan otomatis handle createdAt & updatedAt
      freezeTableName: true,
    }
  );


  export const qryGetService = `SELECT
	ocs.ID,
	ocs.ORDER_ID,
	ocs.SERVICE_ID,
	ocs.ORDER_COMP_DETAIL_ID,
	ocs.SERVICE_FLAG,
	ocs.IS_ACTIVE,
	ocs.IS_DELETED,
	ocs.SERVICE_REMARK,
	ocs.IS_SUBCON,
	ocs.SUBCON_ID,
	ocs.SUBCON_NAME,
	ocs.ITEM_SERVICE_NOTE,
	ocd.MAIN_COMPONENT,
	ocd.MASTER_ITEM_ID,
 	ocd.DIMENSION_ID,
  mcc.COLOR_CODE,
  mcc.COLOR_DESCRIPTION,
  pic.COMPONENT_NAME,
  mii.ITEM_CODE,
  mii.ITEM_DESCRIPTION,
	sa.ATTRIBUTE_NAME,
	sav.SERVICE_ATTRIBUTE_VALUE_CODE,
	sav.SERVICE_ATTRIBUTE_VALUE_NAME,
  mcc2.COLOR_CODE AS DIM_COLOR_CODE,
  mcc2.COLOR_DESCRIPTION AS DIM_COLOR_DESCRIPTION
FROM
	order_component_service ocs 
LEFT JOIN order_component_detail ocd ON ocd.ID = ocs.ORDER_COMP_DETAIL_ID AND ocd.IS_DELETED = 0
LEFT JOIN master_item_id_service miis ON miis.ID = ocs.SERVICE_ID 
LEFT JOIN service_attributes sa  ON sa.SERVICE_ATTRIBUTE_ID = miis.MASTER_SERVICE_ID 
LEFT JOIN service_attribute_values sav ON sav.SERVICE_ATTRIBUTE_VALUE_ID = miis.MASTER_SERVICE_VALUE_ID 
LEFT JOIN master_color_chart mcc ON mcc.COLOR_ID = ocd.ITEM_COLOR_ID  
LEFT JOIN product_item_component pic ON pic.PRODUCT_ID = ocd.PRODUCT_ID AND pic.COMPONENT_ID = ocd.COMPONENT_ID
LEFT JOIN master_item_id mii ON mii.ITEM_ID = ocd.MASTER_ITEM_ID
LEFT JOIN master_item_dimension mid2 ON mid2.ID = ocd.ITEM_DIMENSION_ID
LEFT JOIN master_color_chart mcc2 ON mcc2.COLOR_ID = mid2.COLOR_ID 
WHERE ocs.ORDER_ID = :orderId 

`