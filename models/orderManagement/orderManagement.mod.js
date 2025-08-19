import db from "../../config/database.js";
import { DataTypes } from "sequelize";
import MasterItemIdModel from "../system/masterItemId.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
  CustomerProgramName
} from "../system/customer.mod.js";

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
	oph.NOTE_REMARKS,
  oph.PLAN_CUT_DATE,
  oph.PLAN_SEW_DATE,
  oph.PLAN_FIN_DATE,
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
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = oph.CREATE_BY 
LEFT JOIN xref_user_web xuw2 ON xuw2.USER_ID = oph.UPDATE_BY 
WHERE oph.ORDER_STATUS= :orderStatus    `;


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