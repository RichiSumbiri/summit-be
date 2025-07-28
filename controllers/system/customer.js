import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { CustomerDetail } from "../../models/system/customer.mod.js";


export const postCustomer = (req, res) => {
    try {
        const dataCus = req.body

        if(!dataCus.CTC_CODE || !dataCus.CTC_NAME) return res.staus(404).json({message : 'Customer Name and Code Is required'})
        
        const lastCusId = CustomerDetail.findAll({
            order : [['CTC_ID']],
            raw: true
        })
        const newIdCus = lastCusId ? '0000001' : (parseInt(lastCusId.CTC_ID.slice(-7)) + 1)
        const dataPost = {
            ...dataCus,
            CTC_ID : `CTC${newIdCus}`
        }

        const creatHeaderCus = CustomerDetail.create(dataPost)
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