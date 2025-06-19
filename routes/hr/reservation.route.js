import express from "express";
import { deleteLocationReservation, getLocationReservationByDate, postLocationReservation } from "../../controllers/hr/reservation.js";
const router = express.Router();


router.post("/new", postLocationReservation);
router.get("/by-date/:startDate/:endDate", getLocationReservationByDate); // Assuming you have this function defined in your controller
router.delete("/delete/:id", deleteLocationReservation )

export default router;
