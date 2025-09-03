import db from "../../config/database.js";
import { DataTypes } from "sequelize";
import MasterItemIdModel from "../system/masterItemId.mod.js";
import ProductItemModel from "../system/productItem.mod.js";
import {
  CustomerBuyPlan,
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
  CustomerProgramName
} from "../system/customer.mod.js";
import { orderitemSMV } from "./orderitemSMV.mod.js";

export const ModelOrderPOHeader = db.define('order_po_header', {
  ORDER_ID: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  ORDER_TYPE_CODE: {
    type: DataTypes.CHAR(3),
    allowNull: false,
  },
  ORDER_STATUS: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ORDER_PLACEMENT_COMPANY: {
    type: DataTypes.CHAR(3),
    allowNull: true,
  },
  ORDER_REFERENCE_PO_NO: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_STYLE_DESCRIPTION: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ITEM_ID: {
    type: DataTypes.CHAR(10),
    allowNull: true,
  },
  CURRENCY_CODE: {
    type: DataTypes.STRING(3),
    allowNull: true,
  },
  PRICE_TYPE_CODE: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CUSTOMER_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_DIVISION_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_SEASON_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_PROGRAM_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_BUYPLAN_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_UOM: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_CONFIRMED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_CONFIRMED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_EXPIRED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_NO: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  PROJECTION_ORDER_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  FLAG_MULTISET_ITEMS: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  SIZE_TEMPLATE_ID: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  SIZE_TEMPLATE_LIST: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  NOTE_REMARKS: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  PLAN_CUT_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  PLAN_SEW_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  PLAN_FIN_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  PLAN_PP_MEETING: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  CREATE_BY: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CREATE_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  UPDATE_BY: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  UPDATE_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  
}, {
  tableName: 'order_po_header',
  timestamps: false,
  freezeTableName: true,
});

ModelOrderPOHeader.belongsTo(MasterItemIdModel, {
    foreignKey: "ITEM_ID",
    as: "ITEM"
})

ModelOrderPOHeader.belongsTo(CustomerDetail, {
    foreignKey: "CUSTOMER_ID",
    as: "CUSTOMER"
})

ModelOrderPOHeader.belongsTo(CustomerProductDivision, {
    foreignKey: "CUSTOMER_DIVISION_ID",
    as: "CUSTOMER_DIVISION"
})

ModelOrderPOHeader.belongsTo(CustomerProductSeason, {
    foreignKey: "CUSTOMER_SEASON_ID",
    as: "CUSTOMER_SEASON"
})

ModelOrderPOHeader.belongsTo(CustomerProgramName, {
    foreignKey: "CUSTOMER_PROGRAM_ID",
    as: "CUSTOMER_PROGRAM"
})

ModelOrderPOHeader.belongsTo(ProductItemModel, {
    foreignKey: "PRODUCT_ID",
    as: "PRODUCT"
})

ModelOrderPOHeader.belongsTo(CustomerBuyPlan, {
    foreignKey: "CUSTOMER_BUYPLAN_ID",
    as: "CUSTOMER_BUYPLAN"
})

export const ModelOrderPODetail = db.define('order_po_detail', {
    PO_ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    ORDER_ID: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    PO_REF_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ITEM_COLOR_CODE: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    COUNTRY: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    DELIVERY_LOCATION_ID: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    DELIVERY_LOCATION_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PACKING_METHOD: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    DELIVERY_MODE_CODE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PO_CONFIRMED_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PO_EXPIRED_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ORIGINAL_DELIVERY_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    FINAL_DELIVERY_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PLAN_EXFACTORY_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PRODUCTION_MONTH: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    SHIPPING_TERMS_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    UNIT_PRICE: {
      type: DataTypes.DECIMAL(60, 6),
      allowNull: true
    },
    MO_COST: {
      type: DataTypes.DECIMAL(60, 6),
      allowNull: true
    },
    REVISED_UNIT_PRICE: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    MANUFACTURING_COMPANY: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    MANUFACTURING_SITE: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ORDER_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MO_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SCRAP_PERCENTAGE: {
      type: DataTypes.DECIMAL(60, 4),
      allowNull: true
    },
    NOTE_REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CREATE_BY: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UPDATE_BY: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'order_po_detail',
    schema: 'db_sumbiri_one',
    timestamps: false,
    freezeTableName: true
  });

export const queryGetListOrderHeader = `
SELECT
	oph.ORDER_ID,
	oph.ORDER_TYPE_CODE,
	oph.ORDER_STATUS,
	oph.ORDER_PLACEMENT_COMPANY,
	mc.NAME  AS ORDER_PLACEMENT_COMPANY_NAME,
	oph.ORDER_REFERENCE_PO_NO,
	oph.ORDER_STYLE_DESCRIPTION,
	oph.ITEM_ID,
	mii.ITEM_CODE,
	mii.ITEM_DESCRIPTION,
	oph.CURRENCY_CODE,
  oph.PRICE_TYPE_CODE,
	oph.CUSTOMER_ID,
	cd.CTC_NAME AS CUSTOMER_NAME,
	oph.CUSTOMER_DIVISION_ID,
	cpd.CTPROD_DIVISION_NAME AS CUSTOMER_DIVISION_NAME,
	oph.CUSTOMER_SEASON_ID,
	cps.CTPROD_SESION_NAME AS CUSTOMER_SEASON_NAME,
	oph.CUSTOMER_PROGRAM_ID,
	cpn.CTPROG_NAME AS CUSTOMER_PROGRAM_NAME,
	oph.CUSTOMER_BUYPLAN_ID,
	cbp.CTBUYPLAN_NAME AS CUSTOMER_BUYPLAN_NAME,
	oph.ORDER_UOM,
	oph.ORDER_CONFIRMED_DATE,
	oph.CONTRACT_CONFIRMED_DATE,
	oph.CONTRACT_EXPIRED_DATE,
	oph.CONTRACT_NO,
	oph.PROJECTION_ORDER_ID,
	po.PRJ_CODE AS PROJECTION_ORDER_CODE,
	po.PRJ_DESCRIPTION AS PROJECTION_ORDER_DESCRIPTION,
	oph.FLAG_MULTISET_ITEMS,
	oph.SIZE_TEMPLATE_ID,
  oph.SIZE_TEMPLATE_LIST,
	sct.DESCRIPTION AS SIZE_TEMPLATE_DESCRIPTION,
	oph.NOTE_REMARKS,
	oph.PRODUCT_ID,
	vfgp.PRODUCT_ITEM_TYPE AS PRODUCT_TYPE,
	vfgp.PRODUCT_ITEM_CATEGORIES AS PRODUCT_CATEGORIES,
	mit.ITEM_TYPE_ID AS MASTER_TYPE_ID,
	mit.ITEM_TYPE_DESCRIPTION AS MASTER_TYPE_DESCRIPTION,
	mic.ITEM_CATEGORY_ID AS MASTER_CATEGORY_ID,
	mic.ITEM_CATEGORY_DESCRIPTION AS MASTER_CATEGORY_DESCRIPTION,
  oph.PLAN_CUT_DATE,
  oph.PLAN_SEW_DATE,
  oph.PLAN_FIN_DATE,
  oph.PLAN_PP_MEETING,
  TblOrderQty.TOTAL_ORDER_QTY AS ORDER_QTY,
  TblOrderQty.TOTAL_MO_QTY AS MO_QTY,
  oph.CREATE_BY,
	xuw.USER_NAME AS CREATE_NAME,
	oph.CREATE_DATE,
	oph.UPDATE_BY,
	xuw2.USER_NAME AS UPDATE_NAME,
	oph.UPDATE_DATE
FROM
	order_po_header oph
LEFT JOIN master_company mc ON mc.CODE = oph.ORDER_PLACEMENT_COMPANY 
LEFT JOIN master_item_id mii ON mii.ITEM_ID = oph.ITEM_ID 
LEFT JOIN customer_detail cd ON cd.CTC_ID = oph.CUSTOMER_ID 
LEFT JOIN customer_product_division cpd ON cpd.CTPROD_DIVISION_ID = oph.CUSTOMER_DIVISION_ID 
LEFT JOIN customer_product_season cps ON cps.CTPROD_SESION_ID = oph.CUSTOMER_SEASON_ID 
LEFT JOIN customer_program_name cpn ON cpn.CTPROG_ID = oph.CUSTOMER_PROGRAM_ID 
LEFT JOIN customer_buy_plan cbp ON cbp.CTBUYPLAN_ID = oph.CUSTOMER_BUYPLAN_ID 
LEFT JOIN projection_order po ON po.PRJ_ID = oph.PROJECTION_ORDER_ID 
LEFT JOIN view_finish_good_product vfgp ON vfgp.ITEM_ID  = oph.ITEM_ID 
LEFT JOIN size_chart_template sct ON sct.ID = oph.SIZE_TEMPLATE_ID 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = oph.CREATE_BY 
LEFT JOIN xref_user_web xuw2 ON xuw2.USER_ID = oph.UPDATE_BY 
LEFT JOIN master_item_category mic ON mic.ITEM_CATEGORY_ID = mii.ITEM_CATEGORY_ID 
LEFT JOIN master_item_type mit ON mit.ITEM_TYPE_ID = mic.ITEM_TYPE_ID
LEFT JOIN (
	SELECT 
		ORDER_NO,
		SUM(ORDER_QTY) AS TOTAL_ORDER_QTY,
		SUM(MO_QTY) AS TOTAL_MO_QTY
	FROM order_po_listing
	WHERE PO_STATUS IN('Open','Confirmed','Released to Production')
	GROUP BY ORDER_NO
) AS TblOrderQty ON TblOrderQty.ORDER_NO = oph.ORDER_ID 
WHERE oph.ORDER_STATUS= :orderStatus
`;

ModelOrderPOHeader.belongsTo(CustomerDetail, {
  foreignKey: "CUSTOMER_ID",
  targetKey: "CTC_ID",
  as: "customer_detail",
});
ModelOrderPOHeader.belongsTo(CustomerProductDivision, {
  foreignKey: "CUSTOMER_DIVISION_ID",
  targetKey: "CTPROD_DIVISION_ID",
  as: "customer_product_division",
});
ModelOrderPOHeader.belongsTo(CustomerProductSeason, {
  foreignKey: "CUSTOMER_SEASON_ID",
  targetKey: "CTPROD_SESION_ID",
  as: "customer_product_season",
});


export const ModelSupplyChainPlanning = db.define(
    "order_supply_chain_planning",
    {
      ID_SCP: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ORDER_ID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      ITEM_GROUP_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ITEM_TYPE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ITEM_CATEGORY_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ITEM_ID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      VENDOR_ID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      LEAD_TIME_TYPE: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ORDER_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DELIVERY_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DELIVERY_MODE_CODE: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      GREIGE_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PRODUCTION_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      INSPECTION_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      OTHER_LEAD_TIME: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NOTE_REMARKS: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CREATE_BY: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      CREATE_DATE: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UPDATE_BY: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      UPDATE_DATE: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "order_supply_chain_planning",
      timestamps: false, // disable default Sequelize timestamps
      freezeTableName: true,
    }
  );

  export const querySupplyChainPlanningByOrderID = `
SELECT
	scp.ID_SCP,
  oph.ORDER_CONFIRMED_DATE,
	scp.ORDER_ID,
	oph.CUSTOMER_ID,
	scp.ITEM_GROUP_ID,
	mig.ITEM_GROUP_CODE,
	mig.ITEM_GROUP_DESCRIPTION,
	scp.ITEM_TYPE_ID,
	mit.ITEM_TYPE_CODE,
	mit.ITEM_TYPE_DESCRIPTION,
	scp.ITEM_CATEGORY_ID,
	mic.ITEM_CATEGORY_CODE,
	mic.ITEM_CATEGORY_DESCRIPTION,
	CONCAT(mig.ITEM_GROUP_CODE, ' | ',mit.ITEM_TYPE_CODE,' | ',scp.ITEM_CATEGORY_ID) AS CONCAT_ITEM_CATEGORY_DESCRIPTION,
	scp.ITEM_ID,
	mii.ITEM_CODE,
	mii.ITEM_DESCRIPTION,
	scp.VENDOR_ID,
	vd.VENDOR_CODE,
	vd.VENDOR_NAME,
	scp.LEAD_TIME_TYPE,
	scp.ORDER_LEAD_TIME,
	scp.DELIVERY_LEAD_TIME,
	scp.DELIVERY_MODE_CODE,
	scp.GREIGE_LEAD_TIME,
	scp.PRODUCTION_LEAD_TIME,
	scp.INSPECTION_LEAD_TIME,
	(scp.ORDER_LEAD_TIME + scp.DELIVERY_LEAD_TIME + scp.GREIGE_LEAD_TIME + scp.PRODUCTION_LEAD_TIME + scp.INSPECTION_LEAD_TIME) AS TOTAL_LEAD_TIME,
	scp.OTHER_LEAD_TIME,
	DATE_ADD(oph.ORDER_CONFIRMED_DATE , INTERVAL (scp.ORDER_LEAD_TIME + scp.DELIVERY_LEAD_TIME + scp.GREIGE_LEAD_TIME + scp.PRODUCTION_LEAD_TIME + scp.INSPECTION_LEAD_TIME) DAY) AS ESTIMATED_MATERIAL_DATE,
	scp.NOTE_REMARKS,
	scp.CREATE_BY,
	scp.CREATE_DATE,
	scp.UPDATE_BY,
	scp.UPDATE_DATE
FROM
	order_supply_chain_planning scp
LEFT JOIN master_item_group mig ON mig.ITEM_GROUP_ID = scp.ITEM_GROUP_ID 
LEFT JOIN master_item_type mit ON mit.ITEM_TYPE_ID = scp.ITEM_TYPE_ID 
LEFT JOIN master_item_category mic ON mic.ITEM_CATEGORY_ID = scp.ITEM_CATEGORY_ID 
LEFT JOIN master_item_id mii ON mii.ITEM_ID = scp.ITEM_ID 
LEFT JOIN vendor_detail vd ON vd.VENDOR_ID = scp.VENDOR_ID 
LEFT JOIN order_po_header oph ON oph.ORDER_ID = scp.ORDER_ID 
WHERE scp.ORDER_ID = :orderID
  `;

export const ModelOrderPOHeaderLogStatus = db.define(
    "order_po_header_log_status",
    {
      LOG_ID: {
        type: DataTypes.INTEGER, // int(200) still = INTEGER
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      ORDER_ID: {
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
      ORDER_STATUS: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      CREATE_BY: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      CREATE_DATE: {
        type: DataTypes.DATE, // datetime → DATE
        allowNull: true,
      },
    },
    {
      tableName: "order_po_header_log_status",
      timestamps: false,
    }
  );

export const ModelOrderPOListingLogStatus = db.define("order_po_listing_log_status", {
  LOG_ID: {
    type: DataTypes.INTEGER(200),
    primaryKey: true,
    autoIncrement: true,
  },
  ORDER_ID: {
    type: DataTypes.CHAR(10),
    allowNull: true,
  },
  ORDER_PO_ID: {
    type: DataTypes.CHAR(10),
    allowNull: true,
  },
  PO_STATUS: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CREATE_BY: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CREATE_DATE: {
    type: DataTypes.DATE, // since it's DATE type, not DATETIME
    allowNull: true,
  },
}, {
  tableName: "order_po_listing_log_status",
  timestamps: false, // since CREATE_DATE is manually managed
});

export const queryGetListPOIDStatus = `
SELECT
	opls.LOG_ID,
	opls.ORDER_ID,
	opls.ORDER_PO_ID,
	opls.PO_STATUS,
	opls.CREATE_BY,
  xuw.USER_NAME AS CREATE_NAME,
	opls.CREATE_DATE
FROM
	order_po_listing_log_status opls
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = opls.CREATE_BY 
WHERE opls.ORDER_ID = :orderID AND opls.ORDER_PO_ID = :orderPOID
ORDER BY opls.CREATE_DATE ASC
`;



export const queryGetAllPOIDByOrderID = `
SELECT
    opl.ID_PO,
    opl.MANUFACTURING_COMPANY,
    opl.ORDER_PLACEMENT_COMPANY,
    opl.CUSTOMER_ID,
    opl.CUSTOMER_NAME,
    opl.CUSTOMER_DIVISION_ID,
    opl.CUSTOMER_DIVISION,
    opl.CUSTOMER_SEASON_ID,
    opl.CUSTOMER_SEASON,
    opl.CUSTOMER_PROGRAM_ID,
    opl.CUSTOMER_PROGRAM,
    opl.CUSTOMER_BUYPLAN_ID,
    opl.CUSTOMER_BUY_PLAN,
    opl.PROJECTION_ORDER_ID,
    opl.PROJECTION_ORDER_CODE,
    opl.ORDER_TYPE_CODE,
    opl.ORDER_NO,
    opl.ORDER_REFERENCE_PO_NO,
    opl.ORDER_STYLE_DESCRIPTION,
    opl.ORDER_PO_ID,
    opl.PO_STATUS,
    opl.MO_AVAILABILITY,
    opl.MO_NO,
    opl.MO_RELEASED_DATE,
    opl.PO_REF_CODE,
    opl.PRODUCT_ITEM_ID,
    opl.PRODUCT_ITEM_CODE,
    opl.PRODUCT_ITEM_DESCRIPTION,
    oph.PRODUCT_ID,
    pi2.PRODUCT_TYPE_CODE AS PRODUCT_TYPE, 
    pi2.PRODUCT_CAT_CODE AS PRODUCT_CATEGORY, 
    opl.ITEM_COLOR_ID,
    opl.ITEM_COLOR_CODE,
    opl.ITEM_COLOR_NAME,
    opl.ORDER_QTY,
    opl.MO_QTY,
    opl.SHIPMENT_PO_QTY,
    opl.ORDER_UOM,
    opl.PLAN_MO_QTY_PERCENTAGE,
    opl.SHIPMENT_PO_QTY_VARIANCE,
    opl.PLAN_SHIPMENT_PO_PERCENTAGE,
    opl.SHIPPED_QTY,
    opl.ORDER_TO_SHIPPED_PERCENTAGE,
    opl.DELIVERY_TERM,
    opl.PRICE_TYPE,
    opl.UNIT_PRICE,
    opl.MO_COST,
    opl.TOTAL_ORDER_COST,
    opl.TOTAL_MO_COST,
    opl.CURRENCY_CODE,
    opl.DELIVERY_LOCATION_ID,
    opl.DELIVERY_LOCATION_NAME,
    opl.COUNTRY,
    opl.PACKING_METHOD,
    opl.DELIVERY_MODE_CODE,
    opl.PO_CREATED_DATE,
    opl.PO_CONFIRMED_DATE,
    opl.TARGET_PCD,
    opl.ORIGINAL_DELIVERY_DATE,
    opl.FINAL_DELIVERY_DATE,
    opl.PLAN_EXFACTORY_DATE,
    opl.NEW_TARGET_PCD,
    opl.NEW_FINAL_DELIVERY_DATE,
    opl.NEW_PLAN_EXFACTORY_DATE,
    opl.PO_EXPIRY_DATE,
    DATE_FORMAT(STR_TO_DATE(opl.PRODUCTION_MONTH, '%M/%Y'), '%Y-%m') AS PRODUCTION_MONTH,
    opl.MANUFACTURING_SITE,
    opl.NEW_MANUFACTURING_SITE,
    opl.ORDER_CONFIRMED_DATE,
    opl.CONTRACT_CONFIRMED_DATE,
    opl.CONTRACT_EXPIRED_DATE,
    opl.CREATE_DATE,
    opl.CREATE_BY,
    opl.UPDATE_DATE,
    opl.UPDATE_BY
FROM
    order_po_listing opl
LEFT JOIN order_po_header oph ON oph.ORDER_ID = opl.ORDER_NO 
LEFT JOIN product_item pi2 ON pi2.PRODUCT_ID = oph.PRODUCT_ID
WHERE opl.ORDER_NO = :orderID
`;

export const queryGetMOListingByOrderID = `
SELECT
	oml.MO_ID,
	oml.MO_CODE,
	oml.MO_DESCRIPTION,
	oml.MO_STATUS,
	oml.ORDER_ID,
	oml.ITEM_COLOR_ID,
	oml.ITEM_COLOR_CODE,
	mcc.COLOR_DESCRIPTION as ITEM_COLOR_NAME,
	oph.ORDER_UOM,
	SUM(opl.ORDER_QTY) AS ORDER_QTY,
	SUM(opl.MO_QTY) AS MO_QTY,
	opl.PRODUCTION_MONTH,
	opl.FINAL_DELIVERY_DATE,
	opl.PLAN_EXFACTORY_DATE,
	oml.CREATE_BY,
	xuw.USER_INISIAL AS CREATE_NAME,
	oml.CREATE_DATE,
	oml.UPDATE_BY,
	xuw2.USER_INISIAL AS UPDATE_NAME,
	oml.UPDATE_DATE
FROM
	order_mo_listing oml
LEFT JOIN order_po_listing opl ON opl.MO_NO = oml.MO_ID 
LEFT JOIN order_po_header oph ON oph.ORDER_ID = oml.ORDER_ID 
LEFT JOIN master_color_chart mcc ON mcc.COLOR_ID = opl.ITEM_COLOR_ID 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = oml.CREATE_BY 
LEFT JOIN xref_user_web xuw2 ON xuw2.USER_ID = oml.UPDATE_BY
WHERE oml.ORDER_ID = :orderID
`;

export const OrderMOListing = db.define("order_mo_listing", {
    MO_ID: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true,
    },
    MO_CODE: {
      type: DataTypes.STRING(200),
      allowNull: true,
      unique: true,
    },
    MO_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    MO_STATUS: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    ORDER_ID: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    ITEM_COLOR_ID: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
    ITEM_COLOR_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CREATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UPDATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: "order_mo_listing",
    timestamps: false, // no createdAt/updatedAt fields
    indexes: [
      {
        name: "MO_CODE",
        unique: true,
        fields: ["MO_CODE"],
      },
    ],
  });


  export const queryGetOrderInventoryDetail = `
  SELECT
   pl.ORDER_PO_ID,
   pl.PO_STATUS,
   pl.MO_NO,
   pl.COUNTRY,
   pl.FINAL_DELIVERY_DATE,
   pl.PRODUCT_ITEM_ID,
   pl.ITEM_COLOR_CODE,
   pl.ITEM_COLOR_NAME,
   pl.FINAL_DELIVERY_DATE,
   opl.SIZE_CODE,
   opl.ORDER_UOM,
   opl.ORDER_QTY,
   opl.MO_QTY,
   opl.SHIPMENT_PO_QTY,
   opl.SHIPPED_QTY,
   0 AS ONHAND_QTY
FROM
    order_po_listing_size opl
LEFT JOIN order_po_listing pl ON pl.ORDER_NO = opl.ORDER_NO AND pl.ORDER_PO_ID = opl.ORDER_PO_ID 
LEFT JOIN order_po_header oph ON oph.ORDER_ID = pl.ORDER_NO 
WHERE pl.SUMMIT_FLAG ='1' AND opl.ORDER_NO = :OrderID
  `;


  export const queryGetLogStatusOrderHeaderByOrderID = `
  SELECT
    LOG_ID,
    opls.ORDER_ID,
    opls.ORDER_STATUS,
    opls.CREATE_BY,
    xuw.USER_NAME AS CREATE_NAME,
    opls.CREATE_DATE
  FROM
    order_po_header_log_status opls
  LEFT JOIN xref_user_web xuw ON xuw.USER_ID = opls.CREATE_BY 
  WHERE opls.ORDER_ID = :orderID
  `;


  export const ModelMasterOrderExecuteInfo = db.define(
  "master_order_execute_info",
  {
    ID: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    NAME: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    VALIDATION_DEFAULT: {
      type: DataTypes.BOOLEAN, // tinyint(1) → BOOLEAN in Sequelize
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "master_order_execute_info",
    timestamps: false, // no createdAt/updatedAt in your DDL
    underscored: false, // keep original column naming
  }
);

export const queryCheckTNAEventStatusByOrderID = `
SELECT
	ef.ORDER_ID,
	ef.TEMPLATE_ID,
	etl.TEMPLATE_LINE_ID,
	etl.EVENT_ID,
	em.EVENT_NAME,
	em.EVENT_GROUP_ID,
	meg.EVENT_GROUP_NAME,
	met.EVENT_TYPE_ID,
	met.EVENT_TYPE_NAME,
	edh.EVENT_DIARY_ID,
	edh.EVENT_STATUS 
FROM
	event_framework ef
LEFT JOIN event_template et ON et.TEMPLATE_ID = ef.TEMPLATE_ID 
LEFT JOIN event_template_line etl ON etl.TEMPLATE_ID = et.TEMPLATE_ID 
LEFT JOIN event_master em ON em.EVENT_ID = etl.EVENT_ID 
LEFT JOIN master_event_group meg ON meg.EVENT_GROUP_ID = em.EVENT_GROUP_ID 
LEFT JOIN master_event_type met ON met.EVENT_TYPE_ID = em.EVENT_TYPE_ID 
LEFT JOIN event_diary_header edh ON edh.EVENT_ID = etl.EVENT_ID 
WHERE ef.ORDER_ID = :orderID AND met.EVENT_TYPE_NAME='Pre-Production'
`;

export const queryCheckBOMStructureByOrderIDAndItemTypeCode = `
SELECT
	bsl.BOM_STRUCTURE_ID,
	bsl.STATUS,
  bs.ORDER_ID,
	bs.LAST_REV_ID,
	bsl.MASTER_ITEM_ID,
	mii.ITEM_GROUP_ID,
	mig.ITEM_GROUP_CODE,
	mii.ITEM_TYPE_ID,
	mit.ITEM_TYPE_CODE,
	mii.ITEM_CATEGORY_ID,
	mic.ITEM_CATEGORY_CODE
FROM
	bom_structure_list bsl
LEFT JOIN master_item_id mii ON mii.ITEM_ID = bsl.MASTER_ITEM_ID
LEFT JOIN master_item_group mig ON mig.ITEM_GROUP_ID = mii.ITEM_GROUP_ID 
LEFT JOIN master_item_type mit ON mit.ITEM_TYPE_ID = mii.ITEM_TYPE_ID 
LEFT JOIN master_item_category mic ON mic.ITEM_CATEGORY_ID = mii.ITEM_CATEGORY_ID
LEFT JOIN bom_structure bs ON bs.ID = bsl.BOM_STRUCTURE_ID
WHERE 
  bs.ORDER_ID = :orderID 
  AND bs.LAST_REV_ID = :lastRevID
`;


export const queryListOrderPOAlteration = `
SELECT
	oplll.ID,
	oplll.ORDER_ID,
	oplll.ORDER_PO_ID,
	oplll.ALT_ID,
	oplll.PO_REF_CODE,
	oplll.DELIVERY_LOCATION_ID,
	cdl.CTLOC_CODE AS DELIVERY_LOCATION_CODE,
	cdl.CTLOC_NAME AS DELIVERY_LOCATION_NAME,
	oplll.COUNTRY_CODE,
	mc.COUNTRY_NAME,
	oplll.PACKING_METHOD,
	mpm.DESCRIPTION AS PACKING_METHOD_NAME,
	oplll.DELIVERY_MODE_CODE,
	oplll.MANUFACTURING_COMPANY,
	oplll.MANUFACTURING_SITE,
	oplll.PO_CONFIRMED_DATE,
	oplll.PO_EXPIRY_DATE,
	oplll.ORIGINAL_DELIVERY_DATE,
	oplll.FINAL_DELIVERY_DATE,
	oplll.PLAN_EXFACTORY_DATE,
	oplll.PRODUCTION_MONTH,
	oplll.NOTE_REMARKS,
	oplll.CREATE_BY,
	oplll.CREATE_DATE
FROM
	order_po_listing_log_alteration oplll
LEFT JOIN master_country mc ON mc.COUNTRY_CODE = oplll.COUNTRY_CODE 
LEFT JOIN customer_delivery_loc cdl ON cdl.CTLOC_ID = oplll.DELIVERY_LOCATION_ID 
LEFT JOIN master_packing_method mpm ON mpm.CODE = oplll.PACKING_METHOD 
WHERE oplll.ORDER_ID = :orderID AND oplll.ORDER_PO_ID = :orderPOID
`;