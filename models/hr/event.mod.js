import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const queryGetEventList = `SELECT a.EVENT_ID id, a.EVENT_TITLE title, a.EVENT_START_TIME 'start', a.EVENT_END_TIME 'end',
a.EVENT_COLOR AS backgroundColor,
a.EVENT_DESCRIPTION, a.EVENT_TYPE, a.EVENT_LOCATION
FROM event_and_traning a WHERE YEAR(a.EVENT_START_TIME) = :year`;

export const qryGetUserList = `SELECT a.USER_ID, a.USER_INISIAL, a.USER_EMAIL, b.DEP_ID,  b.DEP_NAME,
CONCAT(a.USER_INISIAL, ' - ', IFNULL(b.DEP_NAME, '-')) LABEL
FROM xref_user_web a 
LEFT JOIN xref_dept b ON a.USER_DEP = b.DEP_ID
WHERE a.USER_NAME LIKE :query OR b.DEP_NAME LIKE :query`;
