import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const qryGetListEffCt = (params) => {
  return `SELECT DISTINCT 
  a.SCHD_ID, a.SCH_ID, a.SCHD_PROD_DATE, a.ID_SITELINE,  a.SITE_NAME, a.LINE_NAME, a.SHIFT, 
  IF(SUBSTRING(a.SHIFT ,1,5) = 'Shift', CAST(ROUND(a.SCHD_QTY/2) AS INT), a.SCHD_QTY ) SCHD_QTY,
  a.PLAN_SEW_SMV, a.FT_NORMAL, a.LT_NORMAL, a.FT_OT, a.LT_OT,  a.FT_X_OT, a.LT_X_OT,
  a.PLAN_MP, a.PLAN_WH, a.ACT_MP, 
  a.PLAN_TARGET, 	
  a.PLAN_WH_X_OT,
  a.PLAN_MP_OT, 
  a.PLAN_WH_OT, 
  a.ACT_MP_OT, 
  a.PLAN_TARGET_OT, 
  a.ACT_MP_X_OT,
  (a.ACT_MP*a.ACT_WH/a.PLAN_SEW_SMV) ACT_TARGET, 
  (a.ACT_MP_OT*a.ACT_WH_OT/a.PLAN_SEW_SMV) ACT_TARGET_OT,
  (a.ACT_MP_X_OT*a.PLAN_WH_X_OT/a.PLAN_SEW_SMV) ACT_TARGET_X_OT,
  a.TOTAL_TARGET,
  a.NORMAL_OUTPUT,  a.OT_OUTPUT, a.X_OT_OUTPUT, a.TOTAL_OUTPUT,  
  a.PLAN_EH, a.PLAN_AH, a.PLAN_EH_OT, a.PLAN_AH_OT,  a.PLAN_EH_X_OT, a.PLAN_AH_X_OT,
  a.ACT_WH, a.ACT_WH_OT, a.ACT_WH_X_OT, a.ACTUAL_EH, a.ACTUAL_AH, 
  a.ACTUAL_EH_OT, IFNULL(a.PLAN_AH_OT,0) ACTUAL_AH_OT, 
  a.ACTUAL_EH_X_OT, IFNULL(a.PLAN_AH_X_OT,0) ACTUAL_AH_X_OT,
  a.EFF_NORMAL,
  a.EFF_OT,
  a.EFF_X_OT,
  a.SCHD_DAYS_NUMBER, a.CUSTOMER_NAME, a.ORDER_REFERENCE_PO_NO, 
  a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.ITEM_COLOR_CODE, a.ITEM_COLOR_NAME,
  o.PLAN_REMARK, a.GROUP_ID,
  opl.PRODUCT_ITEM_ID,
  ist.CUS_NAME
  FROM log_daily_output a
  LEFT JOIN remark_detail o ON o.SCHD_ID = a.SCHD_ID AND o.SHIFT = a.shift
  LEFT JOIN order_po_listing opl ON opl.ORDER_NO = a.ORDER_NO AND a.ORDER_REFERENCE_PO_NO = opl.ORDER_REFERENCE_PO_NO 
        AND a.PRODUCT_ITEM_CODE = opl.ORDER_PRODUCT_ITEM_CODE AND a.ITEM_COLOR_CODE = opl.ITEM_COLOR_CODE
  LEFT JOIN item_siteline ist ON ist.ID_SITELINE = a.ID_SITELINE
  WHERE ${params}
  GROUP BY a.SCHD_ID 
  ORDER BY a.ID_SITELINE`
}

// models/IeCycleTimeHeader.js


export  const IeCycleTimeHeader = db.define('ie_cycle_time_header', {
    CT_ID: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      autoIncrement: true
    },
    CT_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    ID_SITELINE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CT_MP: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CT_WH: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CT_SMV: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: true,
    },
    CT_TARGET: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CT_TAKE_TIME: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    CT_NO_OF_DAYS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CT_SIZE_REF: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    OB_SIZE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SCHD_ID: {
      type: DataTypes.BIGINT,
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
  }, {
    freezeTableName: true,
  });


export  const IeCycleTimeMp = db.define('ie_cycle_time_mp', {
    CT_MP_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CT_ID: {
      type: DataTypes.INTEGER,
    },
    CT_NO: {
      type: DataTypes.INTEGER,
    },
    CT_NIK: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CT_NAME: {
      type: DataTypes.STRING,
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
  }, {
    freezeTableName: true,
  });


export const IeObHeaderCT = db.define('ie_ct_ob_header', {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    OB_ID: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CT_DATE: {
        type: DataTypes.DATEONLY,
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
    OB_REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    OB_ADD_ID: {
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

  IeObHeaderCT.removeAttribute('id')
  

  export const IeObFeaturesCT = db.define('ie_ct_ob_features', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_OB_FEATURES: {
      type: DataTypes.INTEGER,
    },
    CT_DATE: {
        type: DataTypes.DATEONLY,
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



  export const IeObDetailCT = db.define('ie_ct_ob_detail', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    OB_DETAIL_ID: {
        type: DataTypes.INTEGER,
    },
    CT_DATE: {
        type: DataTypes.DATEONLY,
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

export const qryGetFeatCt = `SELECT
	iof.ID_OB_FEATURES,
	iof.SEQ_NO,
	ilf.*
FROM ie_ct_ob_features iof 
LEFT JOIN item_list_features ilf ON iof.FEATURES_ID = ilf.FEATURES_ID
WHERE iof.OB_ID = :obId AND iof.CT_DATE = :ctDate
ORDER BY iof.ID_OB_FEATURES, iof.SEQ_NO, ilf.FEATURES_ID`

export const qryGetObDetailCt = `SELECT 
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
FROM ie_ct_ob_detail iod
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
WHERE iod.OB_ID = :obId AND iod.CT_DATE  = :ctDate
ORDER BY iof.SEQ_NO, iod.OB_DETAIL_NO`



export const IeCtMpProcesses = db.define(`ie_ct_mp_processes`, {
  CT_MPP_ID : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
  CT_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_DATE : {// wajib ada untuk join OB_ID dan CT_DATE karena mengambil ob_header berdasarakan tanggal menghindari revisi OB
        type: DataTypes.DATEONLY, 
        allowNull: true,
    },
  CT_MP_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  OB_DETAIL_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  OB_DETAIL_NO : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  // CT_ACT_TAKET_TIME : {
  //       type: DataTypes.INTEGER,
  //       allowNull: true,
  //   },
  // CT_ACT_TARGET_PCS : {
  //       type: DataTypes.INTEGER,
  //       allowNull: true,
  //   },
  ADD_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  MOD_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  createdAt : {
        type: DataTypes.DATE,
        allowNull: true,
    },
  updatedAt : {
        type: DataTypes.DATE,
        allowNull: true,
    },
},{
  freezeTableName: true
})

export const qryGetIctMpProcces = `SELECT 
 icmp.CT_ID,
 icmp.CT_MP_ID,
 icmp.CT_DATE,
 icmp.CT_MPP_ID,
 icmp.OB_DETAIL_ID,
 icmp.OB_DETAIL_NO,
-- icmp.CT_ACT_TAKET_TIME,
-- icmp.CT_ACT_TARGET_PCS,
 icth.CT_WH,
 icth.CT_MP,
 icod.OB_DETAIL_SMV,
 ctco.COUNT_USING,
 ROUND(((icth.CT_WH*60)/(icth.CT_WH/icod.OB_DETAIL_SMV))/ctco.COUNT_USING) AS CT_TAKET_TIME,
 ROUND((icth.CT_WH/icod.OB_DETAIL_SMV)/ctco.COUNT_USING) AS CT_TARGET_PCS
FROM ie_ct_mp_processes icmp 
LEFT JOIN ie_cycle_time_header icth ON icth.CT_ID = icmp.CT_ID
LEFT JOIN ie_ct_ob_detail icod ON icod.OB_DETAIL_ID = icmp.OB_DETAIL_ID AND icmp.CT_DATE = icod.CT_DATE
LEFT JOIN (
	SELECT 
	 icmp2.OB_DETAIL_ID,
	 COUNT(icmp2.OB_DETAIL_ID) COUNT_USING
	FROM ie_ct_mp_processes icmp2 
  WHERE icmp2.CT_ID = :ctId
	GROUP BY  icmp2.CT_ID, icmp2.OB_DETAIL_ID
) ctco ON ctco.OB_DETAIL_ID = icmp.OB_DETAIL_ID
WHERE icmp.CT_ID = :ctId
`


export const IeCtGroupCount = db.define(`ie_ct_group_count`, {
  CT_GC_ID : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
  CT_GC_NO : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_MP_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_GC_TTIME : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_GC_PCS : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  ADD_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  MOD_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  createdAt : {
        type: DataTypes.DATE,
        allowNull: true,
    },
  updatedAt : {
        type: DataTypes.DATE,
        allowNull: true,
    },
},{
  freezeTableName: true
})


export const ieCtDetailCount = db.define(`ie_ct_detail_count`, {
  CT_DETAIL_ID : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
  CT_GC_ID : {
        type: DataTypes.INTEGER,
    },
  CT_DETAIL_NO : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_MP_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_MPP_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_DETAIL_TTIME : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  CT_DETAIL_GET_TIME : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  ADD_ID : {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
  createdAt : {
        type: DataTypes.DATE,
        allowNull: true,
    },
},{
  freezeTableName: true,
  updatedAt : false
})


export const qryListCtSite = `SELECT 
 icth.*,
 is3.LINE_NAME,
 ioh.OB_NAME,
 ioh.PRODUCT_ITEM_CODE,
 ldo.ORDER_STYLE_DESCRIPTION,
 ldo.CUSTOMER_NAME,
 ldo.PRODUCT_ITEM_CODE,
 xuw.USER_INISIAL,
 ldo.SHIFT
FROM ie_cycle_time_header icth 
LEFT JOIN item_siteline is3  ON is3.ID_SITELINE = icth.ID_SITELINE
LEFT JOIN ie_ob_header ioh ON ioh.OB_ID = icth.OB_ID
LEFT JOIN log_daily_output ldo ON ldo.SCHD_ID = icth.SCHD_ID AND icth.ID_SITELINE = ldo.ID_SITELINE
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = icth.ADD_ID
WHERE icth.CT_DATE  = :schDate AND is3.SITE_NAME = :sitename
ORDER BY is3.ID_SITELINE
`

export const qryGetIeCtMppOne = `SELECT 
 icmp.CT_ID,
 icmp.CT_MP_ID,
 icmp.CT_DATE,
 icmp.CT_MPP_ID,
 icmp.OB_DETAIL_ID,
 icmp.OB_DETAIL_NO,
 icth.CT_WH,
 icth.CT_MP,
 icod.OB_DETAIL_SMV,
 ctco.COUNT_USING,
 ROUND(((icth.CT_WH*60)/(icth.CT_WH/icod.OB_DETAIL_SMV))/ctco.COUNT_USING) AS CT_TAKET_TIME,
 ROUND((icth.CT_WH/icod.OB_DETAIL_SMV)/ctco.COUNT_USING) AS CT_TARGET_PCS
FROM ie_ct_mp_processes icmp 
LEFT JOIN ie_cycle_time_header icth ON icth.CT_ID = icmp.CT_ID
LEFT JOIN ie_ct_ob_detail icod ON icod.OB_DETAIL_ID = icmp.OB_DETAIL_ID AND icmp.CT_DATE = icod.CT_DATE
LEFT JOIN (
	SELECT 
	 icmp2.OB_DETAIL_ID,
	 COUNT(icmp2.OB_DETAIL_ID) COUNT_USING
	FROM ie_ct_mp_processes icmp2 
    WHERE icmp2.CT_ID = :ctId
	GROUP BY  icmp2.CT_ID, icmp2.OB_DETAIL_ID
) ctco ON ctco.OB_DETAIL_ID = icmp.OB_DETAIL_ID
WHERE icmp.CT_MPP_ID  = :ctMpId
`


 export const IeCtMpProcessGroup = db.define('ie_ct_mp_process_group', {
    CT_MPP_GC_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CT_MPP_ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    CT_GC_ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    CT_ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    CT_MP_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    // OB_DETAIL_ID: {
    //   type: DataTypes.BIGINT,
    //   allowNull: true,
    // },
    // OB_DETAIL_NO: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    CT_ACT_TAKE_TIME: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CT_ACT_TARGET_PCS: {
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
    }
  }, {
    freezeTableName: true,
    timestamps: true, // aktifkan kalau createdAt dan updatedAt dikelola Sequelize
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });


  export const qryGetDataBarChart = `WITH base_mp_proccesses AS (
	SELECT 
	 icmp.CT_ID,
	 icmp.CT_MPP_ID,
	 icmp.CT_MP_ID,
	 icmp.CT_DATE,
	 icmp.OB_DETAIL_ID,
	 icmp.OB_DETAIL_NO,
	 icth.CT_WH,
	 icth.CT_MP,
	 icod.OB_DETAIL_SMV,
	 ctco.COUNT_USING,
	 ((icth.CT_WH*60)/(icth.CT_WH/icod.OB_DETAIL_SMV))/ctco.COUNT_USING AS CT_TAKET_TIME,
	 ROUND((icth.CT_WH/icod.OB_DETAIL_SMV)/ctco.COUNT_USING) AS CT_TARGET_PCS
	FROM ie_ct_mp_processes icmp 
	LEFT JOIN ie_cycle_time_header icth ON icth.CT_ID = icmp.CT_ID
	LEFT JOIN ie_ct_ob_detail icod ON icod.OB_DETAIL_ID = icmp.OB_DETAIL_ID AND icmp.CT_DATE = icod.CT_DATE
	LEFT JOIN (
		SELECT 
		 icmp2.OB_DETAIL_ID,
		 COUNT(icmp2.OB_DETAIL_ID) COUNT_USING
		FROM ie_ct_mp_processes icmp2 
	    WHERE icmp2.CT_ID = :ctId
		GROUP BY  icmp2.CT_ID, icmp2.OB_DETAIL_ID
	) ctco ON ctco.OB_DETAIL_ID = icmp.OB_DETAIL_ID
	WHERE icmp.CT_ID = :ctId
), mppAct AS (
	SELECT 
		 bmp.*,
		 icmpg.CT_GC_ID,
		 icmpg.CT_ACT_TAKE_TIME,
		 icmpg.CT_ACT_TARGET_PCS
	FROM base_mp_proccesses bmp 
	LEFT JOIN ie_ct_mp_process_group icmpg ON icmpg.CT_MPP_ID = bmp.CT_MPP_ID 
	WHERE icmpg.CT_ID = :ctId
),
sumMpp AS  (
	SELECT
 	 Ma.CT_ID,
	 Ma.CT_MPP_ID,
	 Ma.CT_MP_ID,
	 Ma.CT_GC_ID,
	 Ma.CT_DATE,
--	 Ma.OB_DETAIL_ID,
--	 Ma.OB_DETAIL_NO,
	 Ma.CT_WH,
--	 Ma.CT_MP,
	 COUNT(Ma.CT_MP_ID) COUNT_PROCCES,
	 Ma.COUNT_USING,
 	 SUM(Ma.OB_DETAIL_SMV) AS OB_DETAIL_SMV,
	 SUM(Ma.CT_TAKET_TIME) AS CT_TAKET_TIME,
	 SUM(Ma.CT_ACT_TAKE_TIME) AS CT_ACT_TAKE_TIME
  	 -- Ma.CT_TARGET_PCS,
	 -- Ma.CT_ACT_TARGET_PCS,
	 FROM mppAct AS Ma
	 GROUP BY   Ma.CT_ID,
			 	Ma.CT_MP_ID,
			 	Ma.CT_GC_ID
) 
SELECT 
 smp.CT_ID,
 smp.CT_MPP_ID,
 smp.CT_MP_ID,
 smp.CT_DATE,
 smp.CT_GC_ID,
 smp.CT_WH,
 icgc.CT_GC_NO,
 smp.COUNT_PROCCES,
 smp.COUNT_USING,
 smp.OB_DETAIL_SMV,
 ROUND(smp.CT_TAKET_TIME) AS CT_TAKET_TIME,
 ROUND(smp.CT_ACT_TAKE_TIME) AS CT_ACT_TAKE_TIME,
 ROUND((smp.CT_WH/smp.OB_DETAIL_SMV)) AS CT_TARGET_PCS,
 ROUND((smp.CT_WH*60)/smp.CT_ACT_TAKE_TIME) AS CT_ACT_TARGET_PCS
FROM sumMpp AS smp
LEFT JOIN ie_ct_group_count icgc ON icgc.CT_GC_ID = smp.CT_GC_ID
`