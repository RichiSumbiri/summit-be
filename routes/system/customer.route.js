import express from "express";
import { addbillingaddress, addBuyPlan, adddeliverylocation, addproductionDivision, addProductSeason, addProgramName, deleteBillAddressById, deleteBuyPlanById, deleteCustomer, deleteDeliveryLocation, deleteProdDivisionById, deleteProdSeasonById, deleteProgramNameById, getAllCustomers, getCustomerById, getDeliveryLocationById, getDeliveryLocationsByCustomerId, getListBillingAdderss, getListBuyPlan, getListProdDivision, getListProdSeason, getListProgramName, getSpecificBuyPlan, getSpecificProgramName, getSpesBillAddress, getSpesificProdDivision, getSpesificProdSeason, patchBillingaddress, patchCustomer, patchDeliveryLocation, postCustomer, updateBuyPlan, updateproductionDivision, updateProductSeason, updateProgramName } from "../../controllers/system/customer.js";
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
router.patch(`/updatedeliverylocation`, patchDeliveryLocation)
router.delete(`/deletedeliverylocation/:CTLOC_ID`, deleteDeliveryLocation)


//billing address
router.get(`/getlistBillingAddess/:custId`, getListBillingAdderss)
router.get(`/spesific-billing-address/:cusBillId`, getSpesBillAddress)
router.post(`/addbillingaddress`, addbillingaddress)
router.patch(`/updatbillingaddress`, patchBillingaddress)
router.delete(`/deleteBillAddess/:CTBIL_ID`, deleteBillAddressById)


//biling division 
router.get(`/getListProdDivision/:custId`, getListProdDivision)
router.get(`/spesific-prodiction-division/:prodDivisionId`, getSpesificProdDivision)
router.post(`/addProductionDivision`, addproductionDivision)
router.patch(`/updateProductionDivison`, updateproductionDivision)
router.delete(`/deleteProductionDivision/:CTPROD_DIVISION_ID`, deleteProdDivisionById)


//billing season
router.get(`/getListProdSeason/:custId`, getListProdSeason)
router.get(`/spesific-prodiction-sesion/:prodSeasionId`, getSpesificProdSeason)
router.post(`/addProductionSesion`, addProductSeason)
router.patch(`/updateProductionSesion`, updateProductSeason)
router.delete(`/deleteProductionSesion/:CTPROD_DIVISION_ID`, deleteProdSeasonById)

//program name
router.get(`/getListCusProgram/:custId`, getListProgramName)
router.get(`/spesific-customer-program/:programId`, getSpecificProgramName)
router.post(`/addCustomerProgram`, addProgramName)
router.patch(`/updateCustomerProgram`, updateProgramName)
router.delete(`/deleteCustomerProgram/:CTPROG_ID`, deleteProgramNameById)


//buy plan
router.get(`/getListCusByPlan/:custId`, getListBuyPlan)
router.get(`/spesific-customer-buyplan/:buyPlanId`, getSpecificBuyPlan)
router.post(`/addCustomerBuyPlan`, addBuyPlan)
router.patch(`/updateCustomerBuyPlan`, updateBuyPlan)
router.delete(`/deleteCustomerBuyPlan/:CTBUYPLAN_ID`, deleteBuyPlanById)



export default router;