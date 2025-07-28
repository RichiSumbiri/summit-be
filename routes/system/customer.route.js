import express from "express";
import { postCustomer } from "../../controllers/system/customer.js";
const router = express.Router();

router.post(`/newcustomer`, postCustomer)


export default router;