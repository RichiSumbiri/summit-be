import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const LocationReservation = dbSPL.define('sumbiri_location_reservation', {
    RESERVATION_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    RESERVATION_LOCATION_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    RESERVATION_TITLE: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    RESERVATION_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    RESERVATION_DATE_START: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    RESERVATION_DATE_FINISH: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    RESERVATION_TIME_START: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    RESERVATION_TIME_FINISH: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    RESERVATION_ALL_DAY: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true,
    },
    RESERVATION_CREATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    RESERVATION_CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    RESERVATION_UPDATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    RESERVATION_UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'sumbiri_location_reservation',
    timestamps: false
  });


  export const queryGetReservation = `
  SELECT
	slr.RESERVATION_ID,
	slr.RESERVATION_LOCATION_ID,
	ml.LOCATION_NAME,
	slr.RESERVATION_TITLE,
	slr.RESERVATION_DESCRIPTION,
	slr.RESERVATION_DATE_START,
	slr.RESERVATION_DATE_FINISH,
	slr.RESERVATION_TIME_START,
	slr.RESERVATION_TIME_FINISH,
	slr.RESERVATION_ALL_DAY,
	slr.RESERVATION_CREATE_BY,
	slr.RESERVATION_CREATE_DATE,
	slr.RESERVATION_UPDATE_BY,
	slr.RESERVATION_UPDATE_DATE
FROM
	sumbiri_location_reservation slr
LEFT JOIN master_location ml ON ml.LOCATION_ID = slr.RESERVATION_LOCATION_ID
	
  `;

export const queryGetReservationByDate = queryGetReservation + `WHERE 
	slr.RESERVATION_DATE_START BETWEEN :startDate AND :endDate
	OR 
	slr.RESERVATION_DATE_FINISH BETWEEN :startDate AND :endDate
`;

export const queryGetReservationByDateTime = queryGetReservation + `
WHERE
(
	slr.RESERVATION_DATE_START BETWEEN :startDate AND :endDate
	OR 
	slr.RESERVATION_DATE_FINISH BETWEEN :startDate AND :endDate
) AND
(
	slr.RESERVATION_TIME_START BETWEEN :startTime AND :endTime
	OR 
	slr.RESERVATION_TIME_FINISH BETWEEN :startTime AND :endTime
) AND 
 slr.RESERVATION_LOCATION_ID = :locationID

`;