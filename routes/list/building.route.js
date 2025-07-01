import express from "express";
import { createBuilding, deleteBuilding, getAllBuildings, getBuildingById, updateBuilding } from "../../controllers/list/building.js";
import { createRoom, deleteRoom, getAllRooms, getRoomById, updateRoom } from "../../controllers/list/buildingRoom.js";

const router = express.Router();
router.post("/", createBuilding);


router.get("/", getAllBuildings);


router.get("/detail/:id", getBuildingById);


router.put("/detail/:id", updateBuilding);


router.delete("/detail/:id", deleteBuilding);

router.post("/room", createRoom);


router.get("/room", getAllRooms);


router.get("/room/:id", getRoomById);


router.put("/room/:id", updateRoom);


router.delete("/room/:id", deleteRoom);
export default router;
