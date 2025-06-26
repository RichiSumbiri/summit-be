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
ils.SIZE_ID,
ils.PRODUCT_TYPE,
ils.SIZE_COUNTRY,
ils.SIZE_NAME
FROM 
item_list_sizes ils 
WHERE ils.PRODUCT_TYPE = :prodType OR ils.PRODUCT_TYPE = 'ALL' `


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
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    OB_TARGET: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    OB_TAKE_TIME: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },
    OB_SMV: {
      type: DataTypes.DECIMAL(10,4),
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
    OB_SKETCH: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    OB_REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    OB_DELETE_STATUS: {
      type: DataTypes.INTEGER,
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
    updatedAt: {
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
    SIZE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SIZE_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_DELETE_STATUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
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
WHERE ioh.PRODUCT_ITEM_ID = :prodItemId
AND ioh.OB_DELETE_STATUS = 0
`

export const getListObByThree = (buyer, prodType, prodCat) => {
  let baseQuery = `AND ioh.CUSTOMER_NAME = '${buyer}' `

  if(prodType){
    baseQuery = baseQuery + `AND ils.PRODUCT_TYPE = '${prodType}'`
  }

  if(prodCat){
    baseQuery =  baseQuery + `AND TRIM(SUBSTRING_INDEX(ils.PRODUCT_CATEGORY, '/', -1)) = '${prodCat}'`
  }

  return `SELECT 
 ioh.*,
 ils.PRODUCT_CATEGORY,
 xuw.USER_INISIAL AS USER_ADD,
 xux.USER_INISIAL AS USER_MOD
 FROM ie_ob_header ioh 
 LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ioh.OB_ADD_ID
 LEFT JOIN xref_user_web xux ON xux.USER_ID = ioh.OB_MOD_ID 
 LEFT JOIN item_list_style ils ON ils.CUSTOMER_NAME = ioh.CUSTOMER_NAME AND ioh.PRODUCT_ITEM_CODE = ils.PRODUCT_ITEM_CODE
 WHERE   ioh.OB_DELETE_STATUS = 0 ${baseQuery}
 `
}

export const getListObItemCOde = `SELECT 
ioh.*,
xuw.USER_INISIAL AS USER_ADD,
xux.USER_INISIAL AS USER_MOD
FROM ie_ob_header ioh 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ioh.OB_ADD_ID
LEFT JOIN xref_user_web xux ON xux.USER_ID = ioh.OB_MOD_ID 
WHERE ioh.PRODUCT_ITEM_CODE = :prodItemCode AND ioh.CUSTOMER_NAME = :buyer
AND ioh.OB_DELETE_STATUS = 0
`

export const qryGetSizeOb = `SELECT 
	ios.OB_SIZE_ID,
	ios.OB_ID,
	ios.SIZE_NAME,
	ils.PRODUCT_TYPE,
	ils.SIZE_COUNTRY,
  ils.SIZE_ID
FROM ie_ob_sizes ios 
LEFT JOIN item_list_sizes ils ON ils.SIZE_ID = ios.SIZE_ID
WHERE ios.OB_ID = :obId`


export const qryObDetail = `SELECT 
ioh.*,
ils.PRODUCT_ITEM_DESCRIPTION,
ils.PRODUCT_TYPE,
ils.PRODUCT_CATEGORY,
xuw.USER_INISIAL AS USER_ADD,
xux.USER_INISIAL AS USER_MOD
FROM ie_ob_header ioh 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ioh.OB_ADD_ID
LEFT JOIN xref_user_web xux ON xux.USER_ID = ioh.OB_MOD_ID 
LEFT JOIN item_list_style ils ON ils.PRODUCT_ITEM_ID = ioh.PRODUCT_ITEM_ID AND ils.CUSTOMER_NAME  = ioh.CUSTOMER_NAME
WHERE ioh.OB_ID = :obId
AND ioh.OB_DELETE_STATUS = 0
`

export const dbListFeatures = db.define('item_list_features', {
    FEATURES_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PRODUCT_TYPE: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    FEATURES_NAME: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    FEATURES_NAME_2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    FEATURES_CATEGORY: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    timestamps: false
  });

  
export const IeObFeatures = db.define('ie_ob_features', {
    ID_OB_FEATURES: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    FEATURES_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SEQ_NO: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ADD_ID: {
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
  }, {
    freezeTableName: true,
    timestamps: false
  });

export const qryListFeatures = `SELECT
	iof.ID_OB_FEATURES,
	iof.SEQ_NO,
	ilf.*
FROM item_list_features ilf
LEFT JOIN ie_ob_features iof ON iof.OB_ID = :obId AND iof.FEATURES_ID = ilf.FEATURES_ID
WHERE ilf.PRODUCT_TYPE IN (:prodType, 'ALL')
ORDER BY iof.ID_OB_FEATURES, iof.SEQ_NO, ilf.FEATURES_ID`

// helper.js

/**
 * Get IDs to delete (exist in DB but not in incoming data)
 */
export const getIdsToDelete = (existingItems, incomingItems) => {
  const existingIds = existingItems.map(f => f.ID_OB_FEATURES);
  const incomingIds = incomingItems
    .filter(f => f.ID_OB_FEATURES !== null)
    .map(f => f.ID_OB_FEATURES);

  return existingIds.filter(id => !incomingIds.includes(id));
};

/**
 * Split data into update and create sets
 */
export const splitDataForUpdateAndCreate = (incomingItems) => {
  const dataToUpdate = incomingItems.filter(f => f.ID_OB_FEATURES !== null);
  const dataToCreate = incomingItems.filter(f => f.ID_OB_FEATURES === null);
  return { dataToUpdate, dataToCreate };
};


export const qryGetFeaturs = `SELECT
	iof.ID_OB_FEATURES,
	iof.SEQ_NO,
	ilf.*
FROM ie_ob_features iof 
LEFT JOIN item_list_features ilf ON iof.FEATURES_ID = ilf.FEATURES_ID
WHERE iof.OB_ID = :obId
ORDER BY iof.ID_OB_FEATURES, iof.SEQ_NO, ilf.FEATURES_ID`



export const qryIListMachine = `SELECT 
	ilm.*
FROM item_list_machine ilm`

export const qryIListStitch = `SELECT 
	ils.*
FROM item_list_stitches ils`

export const qryIListSeamAllow = `SELECT 
	ils2.*
FROM item_list_seamallow ils2`

export const qryIListGauge = `SELECT 
	ilg.*
FROM item_list_gauge ilg`

export const qryIListThrow = `SELECT 
	ilt.*
FROM item_list_throw ilt`

export const qryIListNeedle= `SELECT 
	iln.*
FROM item_list_needle iln `

export const qryIListNeedleThreads= `SELECT 
	iln.*
FROM item_list_needle_thread iln `

export const qryIListBobinThreads= `SELECT
  ilbt.* 
FROM item_list_boobin_thread ilbt `

export const listStiches = db.define('item_list_stitches', {
    STITCHES_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    STITCHES: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listMachine = db.define('item_list_machine', {
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_TYPE: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listSeamAllow = db.define('item_list_seamallow', {
    SEAM_ALLOW_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    SEAM_ALLOW: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listGauge = db.define('item_list_gauge', {
    GAUGE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    GAUGE: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listThrow = db.define('item_list_throw', {
    THROW_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    THROW_NAME: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listNeedle = db.define('item_list_needle', {
    NEEDLE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MACHINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    NEEDLE_NAME: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});

export const listNeedleThread = db.define('item_list_needle_thread', {
    ID_NEEDLE_THREAD: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    NEEDLE_THREAD: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

}, {
   freezeTableName: true,
   timestamps: false,
});

export const listBobinThread = db.define('item_list_boobin_thread', {
    ID_BOBIN_THREAD: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    BOBIN_THREAD: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

}, {
   freezeTableName: true,
   timestamps: false,
});

export const IeObDetail = db.define('ie_ob_detail', {
    OB_DETAIL_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ID_OB_FEATURES: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_ID: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    OB_DETAIL_NO: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_DESCRIPTION: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    OB_DETAIL_DESCRIPTION_IDN: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    OB_DETAIL_REMARK: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    OB_DETAIL_REMARK_IDN: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    OB_DETAIL_MACHINE: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_SPI: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_SEAMALLOW: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_GAUGE: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_THROW: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_ND: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_ND_THREADS: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_BOBIN_THREADS: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_MC_SETUP: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    OB_DETAIL_SMV: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
    },
    OB_DETAIL_TARGET: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ADD_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    MOD_ID: {
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
}, {
   freezeTableName: true,
});




export const qryGetObDetail = `SELECT 
 iod.*,
 ilm.MACHINE_TYPE,
 ils.STITCHES,
 ils2.SEAM_ALLOW,
 ilg.GAUGE,
 ilt.THROW_NAME,
 iln.NEEDLE_NAME,
 ilnt.NEEDLE_THREAD,
 ilbt.BOBIN_THREAD,
 iof.SEQ_NO,
 ilf.FEATURES_CATEGORY
FROM ie_ob_detail iod
LEFT JOIN item_list_machine ilm ON ilm.MACHINE_ID = iod.OB_DETAIL_MACHINE
LEFT JOIN item_list_stitches ils ON ils.STITCHES_ID = iod.OB_DETAIL_SPI 
LEFT JOIN item_list_seamallow ils2 ON ils2.SEAM_ALLOW_ID = iod.OB_DETAIL_SEAMALLOW 
LEFT JOIN item_list_gauge ilg ON ilg.GAUGE_ID = iod.OB_DETAIL_GAUGE 
LEFT JOIN item_list_throw ilt ON ilt.THROW_ID = iod.OB_DETAIL_THROW 
LEFT JOIN item_list_needle iln ON iln.NEEDLE_ID = iod.OB_DETAIL_ND 
LEFT JOIN item_list_needle_thread ilnt ON ilnt.ID_NEEDLE_THREAD = iod.OB_DETAIL_ND_THREADS 
LEFT JOIN item_list_boobin_thread ilbt ON ilbt.ID_BOBIN_THREAD = iod.OB_DETAIL_BOBIN_THREADS 
LEFT JOIN ie_ob_features iof ON iof.ID_OB_FEATURES = iod.ID_OB_FEATURES
LEFT JOIN item_list_features ilf ON iof.FEATURES_ID = ilf.FEATURES_ID
WHERE iod.OB_ID = :obId
ORDER BY iof.SEQ_NO, iod.OB_DETAIL_NO`

export const qryGetObDetailForBe = `SELECT 
 iod.*,
 iof.ID_OB_FEATURES,
 iof.SEQ_NO,
 ilf.FEATURES_CATEGORY
FROM ie_ob_detail iod
LEFT JOIN ie_ob_features iof ON iof.ID_OB_FEATURES = iod.ID_OB_FEATURES
LEFT JOIN item_list_features ilf ON ilf.FEATURES_ID = iof.FEATURES_ID
WHERE iod.OB_ID = :obId 
ORDER BY iof.SEQ_NO, iod.OB_DETAIL_NO`

export const lastObNoBYSeq = `SELECT 
	COUNT(iod.OB_DETAIL_NO) LAST_OB_DETAIL_NO
FROM ie_ob_detail iod 
JOIN ie_ob_features iof ON iof.ID_OB_FEATURES = iod.ID_OB_FEATURES
WHERE iod.OB_ID = :obId AND iof.SEQ_NO < :seqNo`

export const getListSugestObDetail = `SELECT 
 iod.OB_DETAIL_DESCRIPTION,
 iod.OB_DETAIL_DESCRIPTION_IDN,
 iod.OB_DETAIL_REMARK,
 iod.OB_DETAIL_REMARK_IDN,
 iod.OB_DETAIL_MACHINE,
 iod.OB_DETAIL_SPI,
 iod.OB_DETAIL_SEAMALLOW,
 iod.OB_DETAIL_GAUGE,
 iod.OB_DETAIL_THROW,
 iod.OB_DETAIL_ND,
 iod.OB_DETAIL_ND_THREADS,
 iod.OB_DETAIL_BOBIN_THREADS,
 iod.OB_DETAIL_MC_SETUP,
 iod.OB_DETAIL_SMV,
 iod.OB_DETAIL_TARGET,
 ilm.MACHINE_TYPE,
 ils.STITCHES,
 ils2.SEAM_ALLOW,
 ilg.GAUGE,
 ilt.THROW_NAME,
 iln.NEEDLE_NAME,
 ilnt.NEEDLE_THREAD,
 ilbt.BOBIN_THREAD,
 iof.SEQ_NO
FROM ie_ob_detail iod
LEFT JOIN item_list_machine ilm ON ilm.MACHINE_ID = iod.OB_DETAIL_MACHINE
LEFT JOIN item_list_stitches ils ON ils.STITCHES_ID = iod.OB_DETAIL_SPI 
LEFT JOIN item_list_seamallow ils2 ON ils2.SEAM_ALLOW_ID = iod.OB_DETAIL_SEAMALLOW 
LEFT JOIN item_list_gauge ilg ON ilg.GAUGE_ID = iod.OB_DETAIL_GAUGE 
LEFT JOIN item_list_throw ilt ON ilt.THROW_ID = iod.OB_DETAIL_THROW 
LEFT JOIN item_list_needle iln ON iln.NEEDLE_ID = iod.OB_DETAIL_ND 
LEFT JOIN item_list_needle_thread ilnt ON ilnt.ID_NEEDLE_THREAD = iod.OB_DETAIL_ND_THREADS 
LEFT JOIN item_list_boobin_thread ilbt ON ilbt.ID_BOBIN_THREAD = iod.OB_DETAIL_BOBIN_THREADS 
LEFT JOIN ie_ob_features iof ON iof.ID_OB_FEATURES = iod.ID_OB_FEATURES
WHERE  iof.FEATURES_ID = :featId
GROUP BY iod.OB_DETAIL_DESCRIPTION, iod.OB_DETAIL_MACHINE
ORDER BY iof.SEQ_NO, iod.OB_DETAIL_NO`

export const IeObHistory = db.define('ie_ob_history', {
    OB_HISTORY_ID: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_USER_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    OB_TYPE_ACTION: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_UPDATE_LOCATION: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_VALUE_BEFORE: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    OB_VALUE_AFTER: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    OB_ACTION_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    createdAt: 'OB_ACTION_DATE',
    updatedAt: false,
  });



  export const getOneObDetailCompare = `SELECT 
iod.OB_DETAIL_NO,
 iod.OB_DETAIL_DESCRIPTION,
 iod.OB_DETAIL_DESCRIPTION_IDN,
 iod.OB_DETAIL_REMARK,
 iod.OB_DETAIL_REMARK_IDN,
 iod.OB_DETAIL_MC_SETUP,
 iod.OB_DETAIL_SMV,
 iod.OB_DETAIL_TARGET,
 ilm.MACHINE_TYPE,
 ils.STITCHES,
 ils2.SEAM_ALLOW,
 ilg.GAUGE,
 ilt.THROW_NAME,
 iln.NEEDLE_NAME,
 ilnt.NEEDLE_THREAD,
 ilbt.BOBIN_THREAD,
 iof.SEQ_NO
FROM ie_ob_detail iod
LEFT JOIN item_list_machine ilm ON ilm.MACHINE_ID = iod.OB_DETAIL_MACHINE
LEFT JOIN item_list_stitches ils ON ils.STITCHES_ID = iod.OB_DETAIL_SPI 
LEFT JOIN item_list_seamallow ils2 ON ils2.SEAM_ALLOW_ID = iod.OB_DETAIL_SEAMALLOW 
LEFT JOIN item_list_gauge ilg ON ilg.GAUGE_ID = iod.OB_DETAIL_GAUGE 
LEFT JOIN item_list_throw ilt ON ilt.THROW_ID = iod.OB_DETAIL_THROW 
LEFT JOIN item_list_needle iln ON iln.NEEDLE_ID = iod.OB_DETAIL_ND 
LEFT JOIN item_list_needle_thread ilnt ON ilnt.ID_NEEDLE_THREAD = iod.OB_DETAIL_ND_THREADS 
LEFT JOIN item_list_boobin_thread ilbt ON ilbt.ID_BOBIN_THREAD = iod.OB_DETAIL_BOBIN_THREADS 
LEFT JOIN ie_ob_features iof ON iof.ID_OB_FEATURES = iod.ID_OB_FEATURES
WHERE  iod.OB_DETAIL_ID = :obDetailId
GROUP BY iod.OB_DETAIL_DESCRIPTION, iod.OB_DETAIL_MACHINE
ORDER BY iof.SEQ_NO, iod.OB_DETAIL_NO`


export const qryGetObHistory = `SELECT 
	ioh.*,
	xuw.USER_INISIAL
FROM 
ie_ob_history ioh
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ioh.OB_USER_ID
WHERE ioh.OB_ID = :obId
`