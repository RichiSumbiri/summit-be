import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import eventMaster from "../tna/eventMaster.mod.js"
import masterOffsetLink from "../system/masterOffsetLink.mod.js";

const eventTemplateLine = db.define(
  "event_template_line",
  {
    TEMPLATE_LINE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    TEMPLATE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      references: {
        model: "event_template",
        key: "TEMPLATE_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    EVENT_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      references: {
        model: "event_master",
        key: "EVENT_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    OFFSET_LINK_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "master_offset_link",
        key: "OFFSET_LINK_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    EVENT_OFFSET_DAYS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    IS_SPLIT_EVENT: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_COMPULSORY: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_AUTO_UPDATED: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_R2P_VALIDATE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DELETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
    deletedAt: "DELETED_AT",
    paranoid: true,
  }
);

export default eventTemplateLine;

eventTemplateLine.belongsTo(eventMaster, {
  foreignKey: "EVENT_ID",
  targetKey: "EVENT_ID",
  as: "event_master",
});

eventTemplateLine.belongsTo(masterOffsetLink, {
  foreignKey: "OFFSET_LINK_ID",
  targetKey: "OFFSET_LINK_ID",
  as: "master_offset_link",
});

export const QueryGetDiaryEventListingReport = `
SELECT 
  c.ORDER_REFERENCE_PO_NO AS ORDER_REFERENCE_NO, 
  c.ORDER_STYLE_DESCRIPTION AS ORDER_PO_STYLE_REF, 
  c.CUSTOMER_NAME, 
  c.CUSTOMER_DIVISION, 
  c.CUSTOMER_SEASON, 
  c.ORDER_NO AS ORDER_ID, 
  c.ORDER_PO_ID AS ORDER_POID, 
  g.EVENT_GROUP_NAME AS EVENT_GROUP, 
  f.EVENT_ID, 
  f.EVENT_NAME,
  a.EVENT_DIARY_LINE_ID AS EVENT_DIARY_ID, 
  a.COMMENT_NAME, 
  a.POTENTIAL_THREAT, 
  a.RECOMENDATION, 
  a.COMMITMENT_DATE AS EVENT_DIARY_COMMITMENT_DATE,

  (DATEDIFF(CURDATE(), DATE(a.COMMITMENT_DATE)) - 1) AS EVENT_DIARY_VARIANCE_DAYS,
  
  a.ACTION_TAKEN, 
  a.COMPLETED_STATUS AS EVENT_DIARY_COMPLETED_STATUS, 
  h.USER_INISIAL AS EVENT_DIARY_COMPLETED_ID,
  a.COMPLETED_AT AS EVENT_DIARY_COMPLETED_DATE,
  a.CREATED_AT AS EVENT_DIARY_CREATED_DATE,
  i.USER_INISIAL AS EVENT_DIARY_CREATED_ID, 

  CASE
    WHEN b.EVENT_STATUS IS NOT NULL AND LOWER(b.EVENT_STATUS) = 'complete'
      THEN 'Completed'
    WHEN (
        DATE_ADD(
          CASE 
            WHEN k.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
                THEN d.ORDER_CONFIRMED_DATE
            WHEN k.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
                THEN c.FINAL_DELIVERY_DATE
            WHEN k.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
                THEN c.PLAN_EXFACTORY_DATE
            WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
                THEN MIN(c.FINAL_DELIVERY_DATE) OVER (PARTITION BY d.ORDER_ID)
            WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
                THEN MIN(c.PLAN_EXFACTORY_DATE) OVER (PARTITION BY d.ORDER_ID)
            WHEN k.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
                THEN d.PLAN_CUT_DATE
            WHEN k.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
                THEN d.PLAN_SEW_DATE
          END,
          INTERVAL (j.EVENT_OFFSET_DAYS - 1) DAY
        ) < CURDATE()
      )
      THEN 'Overdue'
    ELSE 'In Progress'
  END AS EVENT_STATUS,

  CONCAT(k.OFFSET_LINK_NAME, " (", j.EVENT_OFFSET_DAYS ,")") AS OFFSET_LINK,

  DATE_ADD(
    CASE 
      WHEN k.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
          THEN d.ORDER_CONFIRMED_DATE
      WHEN k.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
          THEN c.FINAL_DELIVERY_DATE
      WHEN k.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
          THEN c.PLAN_EXFACTORY_DATE
      WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
          THEN MIN(c.FINAL_DELIVERY_DATE) OVER (PARTITION BY d.ORDER_ID)
      WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
          THEN MIN(c.PLAN_EXFACTORY_DATE) OVER (PARTITION BY d.ORDER_ID)
      WHEN k.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
          THEN d.PLAN_CUT_DATE
      WHEN k.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
          THEN d.PLAN_SEW_DATE
    END,
    INTERVAL (j.EVENT_OFFSET_DAYS - 1) DAY
  ) AS TARGET_DATE,

  b.COMMITMENT_DATE,

  DATEDIFF(
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    CASE 
      WHEN k.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
          THEN d.ORDER_CONFIRMED_DATE
      WHEN k.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
          THEN c.FINAL_DELIVERY_DATE
      WHEN k.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
          THEN c.PLAN_EXFACTORY_DATE
      WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
          THEN MIN(c.FINAL_DELIVERY_DATE) OVER (PARTITION BY d.ORDER_ID)
      WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
          THEN MIN(c.PLAN_EXFACTORY_DATE) OVER (PARTITION BY d.ORDER_ID)
      WHEN k.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
          THEN d.PLAN_CUT_DATE
      WHEN k.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
          THEN d.PLAN_SEW_DATE
    END
  ) AS VARIANCE_DAYS,

  l.NAME_DEPT AS EXECUTION_DEPARTMENT_SECTION, 
  m.EVENT_TYPE_NAME AS EVENT_TYPE,
  n.PRODUCTION_PROCESS_NAME AS LINKED_PRODUCTION_PROCESS, 
  j.IS_COMPULSORY, 
  j.IS_SPLIT_EVENT, 
  j.IS_R2P_VALIDATE, 
  b.EVENT_NOTE,
  b.EVENT_STATUS AS EVENT_COMPLETION_STATUS, 
  o.USER_INISIAL AS EVENT_COMPLETION_ID, 
  b.COMPLETED_AT AS EVENT_COMPLETED_DATE

FROM event_diary_line a
INNER JOIN event_diary_header b on a.EVENT_DIARY_ID  = b.EVENT_DIARY_ID
LEFT JOIN order_po_listing c ON b.ORDER_PO_ID = c.ORDER_PO_ID
LEFT JOIN order_po_header d ON d.ORDER_ID = c.ORDER_NO
LEFT JOIN event_framework e ON e.ORDER_ID = d.ORDER_ID
LEFT JOIN event_master f ON f.EVENT_ID = b.EVENT_ID
LEFT JOIN master_event_group g ON g.EVENT_GROUP_ID = f.EVENT_GROUP_ID
LEFT JOIN xref_user_web h ON h.USER_ID  = a.COMPLETED_BY 
INNER JOIN xref_user_web i ON i.USER_ID  = a.CREATED_BY 
LEFT JOIN event_template_line j ON j.EVENT_ID = f.EVENT_ID AND e.TEMPLATE_ID = j.TEMPLATE_ID
LEFT JOIN master_offset_link k ON k.OFFSET_LINK_ID = j.OFFSET_LINK_ID
LEFT JOIN master_department l ON l.ID_DEPT = f.EXECUTION_DEPARTMENT_ID
LEFT JOIN master_event_type m ON m.EVENT_TYPE_ID = f.EVENT_TYPE_ID
LEFT JOIN master_production_process n ON n.PRODUCTION_PROCESS_ID = f.PRODUCTION_PROCESS_ID
LEFT JOIN xref_user_web o ON o.USER_ID  = b.COMPLETED_BY`;

// export const QueryGetDiaryEventListingReport = `WITH base_data AS (
//   SELECT
//     a.EVENT_DIARY_LINE_ID,
//     a.EVENT_DIARY_ID,
//     a.COMMENT_NAME,
//     a.POTENTIAL_THREAT,
//     a.RECOMENDATION,
//     a.ACTION_TAKEN,
//     a.COMPLETED_STATUS AS EVENT_DIARY_COMPLETED_STATUS,
//     a.COMPLETED_AT AS EVENT_DIARY_COMPLETED_DATE,
//     a.CREATED_AT AS EVENT_DIARY_CREATED_DATE,
//     a.CREATED_BY,
//     a.COMPLETED_BY,
//     b.ORDER_PO_ID,
//     b.EVENT_ID,
//     b.EVENT_STATUS AS EVENT_COMPLETION_STATUS,
//     b.COMMITMENT_DATE,
//     b.EVENT_NOTE,
//     b.COMPLETED_BY AS EVENT_COMPLETION_BY,
//     j.EVENT_OFFSET_DAYS,
//     j.IS_COMPULSORY,
//     j.IS_SPLIT_EVENT,
//     j.IS_R2P_VALIDATE,
//     k.OFFSET_LINK_NAME,
//     CASE 
//       WHEN k.OFFSET_LINK_NAME IN ('Customer PO Confirmed Date','Order (Style) Confirmed Date')
//         THEN d.ORDER_CONFIRMED_DATE
//       WHEN k.OFFSET_LINK_NAME = 'Customer PO Delivery Date'
//         THEN c.FINAL_DELIVERY_DATE
//       WHEN k.OFFSET_LINK_NAME = 'Customer PO Ex-Factory Date'
//         THEN c.PLAN_EXFACTORY_DATE
//       WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Delivery Date'
//         THEN MIN(c.FINAL_DELIVERY_DATE) OVER (PARTITION BY d.ORDER_ID)
//       WHEN k.OFFSET_LINK_NAME = 'Earliest Customer PO Ex-Factory Date'
//         THEN MIN(c.PLAN_EXFACTORY_DATE) OVER (PARTITION BY d.ORDER_ID)
//       WHEN k.OFFSET_LINK_NAME = 'Plan Cut Date (PCD)'
//         THEN d.PLAN_CUT_DATE
//       WHEN k.OFFSET_LINK_NAME = 'Plan Sewing Date (PSD)'
//         THEN d.PLAN_SEW_DATE
//     END AS base_date,
//     c.ORDER_REFERENCE_PO_NO,
//     c.ORDER_STYLE_DESCRIPTION,
//     c.CUSTOMER_NAME,
//     c.CUSTOMER_DIVISION,
//     c.CUSTOMER_SEASON,
//     c.ORDER_NO AS ORDER_ID,
//     c.ORDER_PO_ID AS ORDER_POID,
//     c.FINAL_DELIVERY_DATE,
//     c.PLAN_EXFACTORY_DATE,
//     d.ORDER_CONFIRMED_DATE,
//     d.PLAN_CUT_DATE,
//     d.PLAN_SEW_DATE,
//     f.EVENT_NAME,
//     f.EVENT_TYPE_ID,
//     f.EVENT_GROUP_ID,
//     f.EXECUTION_DEPARTMENT_ID,
//     f.PRODUCTION_PROCESS_ID,
//     g.EVENT_GROUP_NAME,
//     l.NAME_DEPT AS EXECUTION_DEPARTMENT_SECTION,
//     m.EVENT_TYPE_NAME,
//     n.PRODUCTION_PROCESS_NAME AS LINKED_PRODUCTION_PROCESS,
//     h.USER_INISIAL AS EVENT_DIARY_COMPLETED_ID,
//     i.USER_INISIAL AS EVENT_DIARY_CREATED_ID,
//     o.USER_INISIAL AS EVENT_COMPLETION_ID
//   FROM event_diary_line a
//   LEFT JOIN event_diary_header b ON a.EVENT_DIARY_ID = b.EVENT_DIARY_ID
//   LEFT JOIN order_po_listing c ON b.ORDER_PO_ID = c.ORDER_PO_ID
//   LEFT JOIN order_po_header d ON d.ORDER_ID = c.ORDER_NO
//   LEFT JOIN event_framework e ON e.ORDER_ID = d.ORDER_ID
//   LEFT JOIN event_master f ON f.EVENT_ID = b.EVENT_ID
//   LEFT JOIN master_event_group g ON g.EVENT_GROUP_ID = f.EVENT_GROUP_ID
//   LEFT JOIN xref_user_web h ON h.USER_ID = a.COMPLETED_BY 
//   LEFT JOIN xref_user_web i ON i.USER_ID = a.CREATED_BY 
//   LEFT JOIN event_template_line j ON j.EVENT_ID = f.EVENT_ID AND e.TEMPLATE_ID = j.TEMPLATE_ID
//   LEFT JOIN master_offset_link k ON k.OFFSET_LINK_ID = j.OFFSET_LINK_ID
//   LEFT JOIN master_department l ON l.ID_DEPT = f.EXECUTION_DEPARTMENT_ID
//   LEFT JOIN master_event_type m ON m.EVENT_TYPE_ID = f.EVENT_TYPE_ID
//   LEFT JOIN master_production_process n ON n.PRODUCTION_PROCESS_ID = f.PRODUCTION_PROCESS_ID
//   LEFT JOIN xref_user_web o ON o.USER_ID = b.COMPLETED_BY
// )
// SELECT
//   ORDER_REFERENCE_PO_NO AS ORDER_REFERENCE_NO,
//   ORDER_STYLE_DESCRIPTION AS ORDER_PO_STYLE_REF,
//   CUSTOMER_NAME,
//   CUSTOMER_DIVISION,
//   CUSTOMER_SEASON,
//   ORDER_ID,
//   ORDER_POID,
//   EVENT_GROUP_NAME AS EVENT_GROUP,
//   EVENT_ID,
//   EVENT_NAME,
//   EVENT_DIARY_LINE_ID AS EVENT_DIARY_ID,
//   COMMENT_NAME,
//   POTENTIAL_THREAT,
//   RECOMENDATION,
//   COMMITMENT_DATE AS EVENT_DIARY_COMMITMENT_DATE,
//   (DATEDIFF(CURDATE(), DATE(COMMITMENT_DATE)) - 1) AS EVENT_DIARY_VARIANCE_DAYS,
//   ACTION_TAKEN,
//   EVENT_DIARY_COMPLETED_STATUS,
//   EVENT_DIARY_COMPLETED_ID,
//   EVENT_DIARY_COMPLETED_DATE,
//   EVENT_DIARY_CREATED_DATE,
//   EVENT_DIARY_CREATED_ID,
//   CASE
//     WHEN EVENT_COMPLETION_STATUS IS NOT NULL AND LOWER(EVENT_COMPLETION_STATUS) = 'complete'
//       THEN 'Completed'
//     WHEN DATE_ADD(base_date, INTERVAL (EVENT_OFFSET_DAYS - 1) DAY) < CURDATE()
//       THEN 'Overdue'
//     ELSE 'In Progress'
//   END AS EVENT_STATUS,
//   CONCAT(OFFSET_LINK_NAME, " (", EVENT_OFFSET_DAYS ,")") AS OFFSET_LINK,
//   DATE_ADD(base_date, INTERVAL (EVENT_OFFSET_DAYS - 1) DAY) AS TARGET_DATE,
//   COMMITMENT_DATE,
//   DATEDIFF(DATE_ADD(CURDATE(), INTERVAL 1 DAY), base_date) AS VARIANCE_DAYS,
//   EXECUTION_DEPARTMENT_SECTION,
//   EVENT_TYPE_NAME AS EVENT_TYPE,
//   LINKED_PRODUCTION_PROCESS,
//   IS_COMPULSORY,
//   IS_SPLIT_EVENT,
//   IS_R2P_VALIDATE,
//   EVENT_NOTE,
//   EVENT_COMPLETION_STATUS,
//   EVENT_COMPLETION_ID,
//   COMPLETED_AT AS EVENT_COMPLETED_DATE
// FROM base_data bd;
// `; 