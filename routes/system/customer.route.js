import express from "express";
import { adddeliverylocation, deleteCustomer, getAllCustomers, getCustomerById, getDeliveryLocationById, getDeliveryLocationsByCustomerId, patchCustomer, postCustomer } from "../../controllers/system/customer.js";
const router = express.Router();

router.get(`/listAllCustomer`, getAllCustomers)
router.get(`/detail/:custId`, getCustomerById)
router.post(`/newcustomer`, postCustomer, getCustomerById)
router.patch(`/updatecustomer`, patchCustomer, getCustomerById)
router.delete(`/delete/:custId`, deleteCustomer)


//customer delivery location 
router.get(`/listAlldeliveryloc/:custId`, getDeliveryLocationsByCustomerId)
router.get(`/spesific-delivery-location/:cudDelivId`, getDeliveryLocationById)
router.post(`/adddeliverylocation`, adddeliverylocation)

export default router;