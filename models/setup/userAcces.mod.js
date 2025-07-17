import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

//update or Create User Access
const UserAxs = db.define(
  //module user axces
  "xref_user_acess_web",
  {
    USER_ID: { type: DataTypes.BIGINT },
    MENU_ID: { type: DataTypes.BIGINT },
    USER_ACESS_VIEW: { type: DataTypes.INTEGER },
    USER_ACESS_ADD: { type: DataTypes.INTEGER },
    USER_ACESS_MOD: { type: DataTypes.INTEGER },
    USER_ACESS_DELETE: { type: DataTypes.INTEGER },
    USER_ACESS_SAVE: { type: DataTypes.INTEGER },
    USER_ACESS_PRINT: { type: DataTypes.INTEGER },
    USER_ACESS_IMPORT: { type: DataTypes.INTEGER },
    USER_ACESS_EXPORT: { type: DataTypes.INTEGER },
    USER_ACESS_ADD_DATE: { type: DataTypes.DATE },
    USER_ACESS_ADD_ID: { type: DataTypes.BIGINT },
    USER_ACESS_MOD_DATE: { type: DataTypes.DATE },
    USER_ACESS_MOD_ID: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "USER_ACESS_ADD_DATE",
    updatedAt: "USER_ACESS_MOD_DATE",
    // createdAt: false,
    // updatedAt: false,
  }
);
UserAxs.removeAttribute("id");
export const UserAcc = UserAxs;

//query role Access
export const MenuAccessRole = `SELECT 
a.MENU_ID, 
a.MENU_CONTROL_ID, 
a.MENU_MODUL,
a.MENU_GROUP,
a.MENU_GROUP_SUB,
a.MENU_SUB,
a.MENU_SUB_KEY,
a.MENU_KEY,
a.MENU_NAME, 
a.MENU_TITLE,
a.MENU_ACT_VIW, 
a.MENU_ACT_ADD, 
a.MENU_ACT_MOD, 
a.MENU_ACT_DEL, 
a.MENU_ACT_SAV, 
a.MENU_ACT_PRN,
b.USER_ACESS_VIEW,
b.USER_ACESS_ADD,
b.USER_ACESS_MOD,
b.USER_ACESS_DELETE,
b.USER_ACESS_PRINT  FROM xref_menu_web a
LEFT JOIN xref_user_acess_web b ON a.MENU_ID = b.MENU_ID AND b.USER_ID = :id ORDER BY a.MENU_ID`;

export const QueryMenuView = `SELECT a.USER_ACESS_VIEW, c.MENU_ID, c.MENU_CONTROL_ID, c.MENU_MODUL, c.MENU_GROUP,
c.MENU_GROUP_SUB, c.MENU_SUB, c.MENU_SUB_KEY, c.MENU_KEY, c.MENU_FORM, c.MENU_NAME,
c.MENU_TITLE, c.MENU_DESC, c.MENU_PATH, c.MENU_ICON FROM xref_user_acess_web a 
LEFT JOIN xref_user_web b ON a.USER_ID = b.USER_ID
LEFT JOIN xref_menu_web c ON a.MENU_ID = c.MENU_ID
WHERE b.USER_ID = :userid  AND a.USER_ACESS_VIEW = 1
ORDER BY c.MENU_ORDER`;


export const UserRole = db.define(
  //module user axces
  "xref_user_role",
  {
    ROLE_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ROLE_UNIT: { type: DataTypes.INTEGER },
    ROLE_DEPT: { type: DataTypes.INTEGER },
    ROLE_NAME: { type: DataTypes.STRING },
    ROLE_NOTE: { type: DataTypes.STRING },
    ROLE_PATH: { type: DataTypes.STRING },
    ROLE_STATUS: { type: DataTypes.INTEGER },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    // createdAt: false,
    // updatedAt: false,
  }
);

export const qryGetDeptAll = `SELECT 
 md.*
FROM master_department md `


export const qryGetAllRole = `SELECT 
 xur.*,
 mu.UNIT_NAME AS UNIT_NAME,
 md.NAME_DEPT 
FROM xref_user_role xur
LEFT JOIN master_unit mu ON mu.UNIT_ID = xur.ROLE_UNIT
LEFT JOIN master_department md ON md.ID_DEPT  = xur.ROLE_DEPT `