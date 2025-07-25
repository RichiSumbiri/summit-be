import express from "express";
const router = express.Router();

import {
  getUserAcces,
  postAccessUser,
  getViewAccess,
} from "../../controllers/auth/UserAccess.js";

router.get("/:id", getUserAcces);
router.get("/menuview/:id", getViewAccess);
router.post("/", postAccessUser);

export default router;
