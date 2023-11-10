// import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QryListSiteZd = `SELECT DISTINCT
zis.SITE, zis.SITE_NAME, zis.CUS_NAME
FROM zd_item_siteline zis
WHERE zis.ZD_STATUS  = 1`;
export const QryListLineZd = `SELECT  zis.SITE, zis.SITE_NAME, zis.CUS_NAME, zis.ID_SITELINE, zis.LINE_NAME 
FROM zd_item_siteline zis  WHERE zis.ZD_STATUS  = 1`;
