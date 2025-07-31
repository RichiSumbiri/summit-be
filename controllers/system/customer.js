import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { CustomerDeliveryLoc, CustomerDetail } from "../../models/system/customer.mod.js";
import { qryRefIntCountry } from "../../models/list/referensiList.mod.js";


export const postCustomer = async (req, res, next) => {
    try {
        const dataCus = req.body

        if(!dataCus.CTC_CODE || !dataCus.CTC_NAME) return res.staus(404).json({message : 'Customer Name and Code Is required'})

        //check if customer code and name already exists
        const existingCustomer = await CustomerDetail.findOne({
            where: {
                [Op.or]: [
                    { CTC_CODE: dataCus.CTC_CODE },
                    { CTC_NAME: dataCus.CTC_NAME }
                ]
            },
            raw: true
        });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer code or name already exists" });
        }
        
        const lastCusId = await CustomerDetail.findOne({
            order : [['CTC_ID', 'DESC']],
            raw: true
        })

        
        const getId = !lastCusId ? '0000001' : (parseInt(lastCusId.CTC_ID.slice(-7)) + 1)
        const newId = `CTC${getId.toString().padStart(7, '0')}`
        const dataPost = {
            ...dataCus,
            CTC_ID : newId
        }

        const creatHeaderCus = await CustomerDetail.create(dataPost)
        if(creatHeaderCus){
            const { CTC_ID } = creatHeaderCus.get({ plain: true })
            req.params.custId = CTC_ID
            req.body.message = 'Success Create Customer'
            next()
        }else{
            return res.status(404).json({message : 'Failed Create Customer'})

        }
    } catch (error) {
        console.log(error);

        res
        .status(500)
        .json({ error, message: "Error When Save data customer" });
    }
}

//patch customer
export const patchCustomer = async (req, res, next) => {
    try {
        const dataCus = req.body

        if(!dataCus.CTC_ID) return res.staus(404).json({message : 'Customer ID Is required'})
      

        const creatHeaderCus = await CustomerDetail.update(dataCus, {
            where: {
                CTC_ID: dataCus.CTC_ID
            }
        })
        if(creatHeaderCus){
            req.params = {custId : dataCus.CTC_ID}
            req.body.message = 'Success Update Customer'
            next()
        }else{
            return res.status(404).json({message : 'Failed Update Customer'})

        }
    } catch (error) {
        console.log(error);

        res
        .status(500)
        .json({ error, message: "Error When Update data customer" });
    }
}

// Function to get all customers
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerDetail.findAll({
            where: {
                IS_DELETE: { [Op.or]: [0, null] } // Only fetch customers that are not deleted
            },
            order: [['CTC_ID', 'ASC']],
            raw: true
        });

        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching customers" });
    }
}

//get on e customer by ID
export const getCustomerById = async (req, res) => {
    try {
        const { custId } = req.params;
        let customer = await CustomerDetail.findOne({
            where: { CTC_ID: custId },
            raw: true
        });
        
        if(customer.CTC_COUNTRY_ID){
           const reqCountry = await db.query(qryRefIntCountry, {
                replacements: { qry : customer.CTC_COUNTRY_ID },
                type: QueryTypes.SELECT,
            });
            customer.CTC_COUNTRY_ID = reqCountry
        }

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        let message = req.body.message || 'Success Get Customer';
   
       return res.json({data: customer, message});
    } catch (error) {
        console.error(error);
      return  res.status(500).json({ error, message: "Error fetching customer" });
    }
}



//function soft delete customer
export const deleteCustomer = async (req, res) => {
    try {
        const { custId } = req.params;
        const customer = await CustomerDetail.findOne({
            where: { CTC_ID: custId },
            raw: true
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Soft delete logic (e.g., setting a deleted flag)
        await CustomerDetail.update({ IS_DELETE: 1 }, {
            where: { CTC_ID: custId }
        });

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting customer" });
    }
}



///control delivery location
export const adddeliverylocation = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID || !data.CTLOC_CODE || !data.CTLOC_NAME) {
            return res.status(400).json({ message: "Customer ID and Delivery Location are required" });
        }

        //check if delivery location code atau name lready exists for the customer
        const existingLocation = await CustomerDeliveryLoc.findOne({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { CTLOC_CODE: data.CTLOC_CODE },
                            { CTLOC_NAME: data.CTLOC_NAME }
                        ]
                    }
                ]
            },
            raw: true
        });
        if (existingLocation) {
            return res.status(400).json({ message: "Delivery location code or name already exists for this customer" });
        }


        // Assuming you have a model for customer delivery locations
        const newLocation = await CustomerDeliveryLoc.create(data);

        res.status(201).json({ message: "Delivery location added successfully", data: newLocation });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "Error adding delivery location" });
    }
}

//function to get all delivery locations for a customer
export const getDeliveryLocationsByCustomerId = async (req, res) => {
    try {
        const { custId } = req.params;

        const locations = await CustomerDeliveryLoc.findAll({
            where: { CTC_ID: custId },
            order: [['CTLOC_ID', 'ASC']],
            raw: true
        });

        if (locations.length === 0) {
            return res.status(404).json({ message: "No delivery locations found for this customer" });
        }

       return res.json({data: locations});
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error, message: "Error fetching delivery locations" });
    }
}

//fungsion to get a specific delivery location by ID
export const getDeliveryLocationById = async (req, res) => {
    try {
        const { cudDelivId } = req.params;

        const location = await CustomerDeliveryLoc.findOne({
            where: { CTLOC_ID: cudDelivId },
            raw: true
        });

        if (!location) {
            return res.status(404).json({ message: "Delivery location not found" });
        }

        res.json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching delivery location" });
    }
}