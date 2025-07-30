import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { CustomerDetail } from "../../models/system/customer.mod.js";
import { qryRefIntCountry } from "../../models/list/referensiList.mod.js";


export const postCustomer = async (req, res) => {
    try {
        const dataCus = req.body

        if(!dataCus.CTC_CODE || !dataCus.CTC_NAME) return res.staus(404).json({message : 'Customer Name and Code Is required'})
        
        const lastCusId = await CustomerDetail.findOne({
            order : [['CTC_ID']],
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
            return res.json({message : 'Success Create Customer'})
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
export const patchCustomer = async (req, res) => {
    try {
        const dataCus = req.body

        if(!dataCus.CTC_ID) return res.staus(404).json({message : 'Customer ID Is required'})
      

        const creatHeaderCus = await CustomerDetail.update(dataCus, {
            where: {
                CTC_ID: dataCus.CTC_ID
            }
        })
        if(creatHeaderCus){
            return res.json({message : 'Success Update Customer'})
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

       return res.json({data: customer});
    } catch (error) {
        console.error(error);
      return  res.status(500).json({ error, message: "Error fetching customer" });
    }
}