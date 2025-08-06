import express from "express";
import currencyRoute from "./currency.route.js";


const router = express.Router();

router.use("/currency", currencyRoute);

export default router;
