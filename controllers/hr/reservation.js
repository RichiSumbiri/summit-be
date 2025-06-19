import moment from "moment";
import { LocationReservation, queryGetReservationByDate, queryGetReservationByDateTime } from "../../models/hr/reservation.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import { QueryTypes } from "sequelize";

export const getLocationReservationByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const data = await dbSPL.query(queryGetReservationByDate, {
            replacements: { startDate, endDate },
            type: dbSPL.QueryTypes.SELECT
        });
        return res.status(200).json({
                success: true,
                message: `Successfully retrieved reservations from ${startDate} to ${endDate}`,
                data: data
        });
        
    } catch (err) {
        console.error("Error fetching reservations:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const postLocationReservation = async (req, res) => {
    try {
        const { data } = req.body;
        let checkExistingReservation;
        
        if(data.RESERVATION_ALL_DAY==='Y'){
            checkExistingReservation = await dbSPL.query(queryGetReservationByDateTime, {
                replacements: {
                    startDate: data.RESERVATION_DATE_START,
                    endDate: data.RESERVATION_DATE_FINISH,
                    startTime: '00:00:00',
                    endTime: '23:59:59',
                    locationID: parseInt(data.RESERVATION_LOCATION_ID)
                }, type: QueryTypes.SELECT
            });
        } else {
            checkExistingReservation = await dbSPL.query(queryGetReservationByDateTime, {
                replacements: {
                    startDate: data.RESERVATION_DATE_START,
                    endDate: data.RESERVATION_DATE_FINISH,
                    startTime: data.RESERVATION_TIME_START,
                    endTime: data.RESERVATION_TIME_FINISH,
                    locationID: parseInt(data.RESERVATION_LOCATION_ID)
                }, type: QueryTypes.SELECT
        })}
        
        if (checkExistingReservation.length > 0) {
            return res.status(400).json({ message: "Reservation already exists for the specified date and time" });
        } else {
            const newReservation = await LocationReservation.create({
                RESERVATION_LOCATION_ID: parseInt(data.RESERVATION_LOCATION_ID),
                RESERVATION_TITLE: data.RESERVATION_TITLE || null,
                RESERVATION_DESCRIPTION: data.RESERVATION_DESCRIPTION || null,
                RESERVATION_DATE_START: data.RESERVATION_DATE_START || null,
                RESERVATION_DATE_FINISH: data.RESERVATION_DATE_FINISH || null,
                RESERVATION_TIME_START: data.RESERVATION_ALL_DAY==='Y' ? '00:00:00' : data.RESERVATION_TIME_START,
                RESERVATION_TIME_FINISH: data.RESERVATION_ALL_DAY==='Y' ? '23:59:59' : data.RESERVATION_TIME_FINISH,
                RESERVATION_ALL_DAY: data.RESERVATION_ALL_DAY || 'N',
                RESERVATION_CREATE_BY: data.RESERVATION_CREATE_BY || null,
                RESERVATION_CREATE_DATE: moment().format("YYYY-MM-DD HH:mm:ss"),     
            });

            if(newReservation === null) {
                return res.status(400).json({ message: "Failed to create reservation" });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Reservation created successfully"
                });
            }
        }


    } catch (err) {
        console.error("Error creating location:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteLocationReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await LocationReservation.destroy({
            where: {
                RESERVATION_ID: id
        }});
        
        
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        
        return res.status(200).json({
            success: true,
            message: "Reservation deleted successfully"
        });
        
    } catch (err) {
        console.error("Error deleting reservation:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}