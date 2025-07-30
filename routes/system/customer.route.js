import express from "express";
import { getAllCustomers, getCustomerById, patchCustomer, postCustomer } from "../../controllers/system/customer.js";
const router = express.Router();

router.get(`/listAllCustomer`, getAllCustomers)
router.get(`/detail/:custId`, getCustomerById)
router.post(`/newcustomer`, postCustomer)
router.patch(`/newcustomer`, patchCustomer)


export default router;