import { Op, QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { CustomerBillingAddress, CustomerBuyPlan, CustomerDeliveryLoc, CustomerDetail, CustomerProductDivision, CustomerProductSeason, CustomerProgramName } from "../../models/system/customer.mod.js";
import { qryRefIntCountry } from "../../models/list/referensiList.mod.js";
import { getPagination } from "../util/Query.js";


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

export const getAllCustomers = async (req, res) => {
    try {
        const { SEARCH_TEXT, page, limit } = req.query;

        const whereClause = {
            IS_DELETE: { [Op.or]: [0, null] },
        };

        if (SEARCH_TEXT) {
        whereClause[Op.or] = [
            { CTC_ID: { [Op.like]: `%${SEARCH_TEXT}%` } },
            { CTC_CODE: { [Op.like]: `%${SEARCH_TEXT}%` } },
            { CTC_NAME: { [Op.like]: `%${SEARCH_TEXT}%` } },
            { CTC_CURRENCY: { [Op.like]: `%${SEARCH_TEXT}%` } },
        ];
        }

        const queryOptions = {
            where: whereClause,
            order: [['CTC_ID', 'ASC']],
            raw: true,
            ...getPagination(page, limit),
        };

        if (req.query.is_dropdown === 'true') {
            queryOptions.attributes = ['CTC_ID', 'CTC_CODE', 'CTC_NAME', 'CTC_CURRENCY'];
        }

        const customers = await CustomerDetail.findAll(queryOptions);

        if (!customers.length) {
            return res.status(404).json({ message: "No customers found" });
        }

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching customers" });
    }
};


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
        }else{
            customer.CTC_COUNTRY_ID = []
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
            return res.status(202).json({ message: "Customer ID and Delivery Location are required" });
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

        res.status(200).json({ message: "Delivery location added successfully", data: newLocation });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "Error adding delivery location" });
    }
}

//patch delivery location
export const patchDeliveryLocation = async (req, res) => {
    try {
        const data = req.body;
        if (!data.CTLOC_ID) {
            return res.status(400).json({ message: "Delivery Location ID is required" });
        }
        const updatedLocation = await CustomerDeliveryLoc.update(data, {
            where: { CTLOC_ID: data.CTLOC_ID }
        });
        if (updatedLocation[0] === 0) {
            return res.status(404).json({ message: "Delivery location not found" });
        }
        res.json({ message: "Delivery location updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating delivery location" });
    }
}

//function soft delete delivery location
export const deleteDeliveryLocation = async (req, res) => {
    try {
        const { CTLOC_ID } = req.params;
        if (!CTLOC_ID) {
            return res.status(400).json({ message: "Delivery Location ID is required" });
        }  
        const location = await CustomerDeliveryLoc.findOne({
            where: { CTLOC_ID },
            raw: true
        }); 
        if (!location) {
            return res.status(404).json({ message: "Delivery location not found" });
        } 
        const deletedLocation = await CustomerDeliveryLoc.update({ IS_DELETE: 1 }, {
            where: { CTLOC_ID }
        });
        if (deletedLocation[0] === 0) {
            return res.status(404).json({ message: "Delivery location not found" });
        }
        res.json({ message: "Delivery location deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting delivery location" });
    }
}

//function to get all delivery locations for a customer
export const getDeliveryLocationsByCustomerId = async (req, res) => {
    try {
        const { custId } = req.params;

        const locations = await CustomerDeliveryLoc.findAll({
            where: { CTC_ID: custId, IS_DELETE: { [Op.or]: [0, null] } }, // Only fetch locations that are not deleted
            order: [['CTLOC_ID', 'ASC']],
            raw: true
        });



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

        let location = await CustomerDeliveryLoc.findOne({
            where: { CTLOC_ID: cudDelivId },
            raw: true
        });

        if (!location) {
            return res.status(404).json({ message: "Delivery location not found" });
        }

        if(location.CTLOC_COUNTRY_ID){
            const reqCountry = await db.query(qryRefIntCountry, {
                replacements: { qry : location.CTLOC_COUNTRY_ID },
                type: QueryTypes.SELECT,
            });
            location.CTLOC_COUNTRY_ID = reqCountry
        }else{
            location.CTLOC_COUNTRY_ID = []
        }

        res.json({data: location});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching delivery location" });
    }
}




//billing address controller

export const addbillingaddress = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID) {
            return res.status(202).json({ message: "Customer ID and Company Name are required" });
        }


        const newLocation = await CustomerBillingAddress.create(data);

        res.status(200).json({ message: "Billing Address added successfully", data: newLocation });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "Error Adding Billing Address" });
    }
}


export const patchBillingaddress = async (req, res) => {
    try {
        const data = req.body;
        if (!data.CTBIL_ID) {
            return res.status(400).json({ message: "Billing Address ID is required" });
        }
        const updatedLocation = await CustomerBillingAddress.update(data, {
            where: { CTBIL_ID: data.CTBIL_ID }
        });
        if (updatedLocation[0] === 0) {
            return res.status(404).json({ message: "Billing Address not found" });
        }
        res.json({ message: "Billing Addressupdated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating Billing Address" });
    }
}


export const getListBillingAdderss = async (req, res) => {
    try {
        const { custId } = req.params;

        const locations = await CustomerBillingAddress.findAll({
            where: { CTC_ID: custId, IS_DELETE: { [Op.or]: [0, null] } }, // Only fetch locations that are not deleted
            order: [['CTBIL_ID', 'ASC']],
            raw: true
        });



       return res.json({data: locations});
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error, message: "Error fetching  Billing Address" });
    }
}


export const getSpesBillAddress = async (req, res) => {
    try {
        const { cusBillId } = req.params;

        let billAddress = await CustomerBillingAddress.findOne({
            where: { CTBIL_ID: cusBillId },
            raw: true
        });

        if (!billAddress) {
            return res.status(404).json({ message: "Billing Address not found" });
        }

        if(billAddress.CTBIL_COUNTRY_ID){
            const reqCountry = await db.query(qryRefIntCountry, {
                replacements: { qry : billAddress.CTBIL_COUNTRY_ID },
                type: QueryTypes.SELECT,
            });
            billAddress.CTBIL_COUNTRY_ID = reqCountry
        }else{
            billAddress.CTBIL_COUNTRY_ID = []
        }

        res.json({data: billAddress});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Billing Address" });
    }
}


export const deleteBillAddressById = async (req, res) => {
    try {
        const { CTBIL_ID } = req.params;
        if (!CTBIL_ID) {
            return res.status(400).json({ message: "Billing Address ID is required" });
        }  
        const location = await CustomerBillingAddress.findOne({
            where: { CTBIL_ID },
            raw: true
        }); 
        if (!location) {
            return res.status(404).json({ message: "Billing Address not found" });
        } 
        const deletedLocation = await CustomerBillingAddress.update({ IS_DELETE: 1 }, {
            where: { CTBIL_ID }
        });
        if (deletedLocation[0] === 0) {
            return res.status(404).json({ message: "Billing Address not found" });
        }
        res.json({ message: "Billing Address deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting Billing Address" });
    }
}



export const getListProdDivision = async (req, res) => {
    try {
        const { custId } = req.params;
        const { is_dropdown } = req.query;

        const queryOptions = {
            where: {
                CTC_ID: custId,
                IS_DELETE: { [Op.or]: [0, null] }
            },
            order: [['CTPROD_DIVISION_ID', 'ASC']],
            raw: true
        };

        if (is_dropdown === "true") {
            queryOptions.attributes = [
                "CTPROD_DIVISION_ID",
                "CTPROD_DIVISION_CODE",
                "CTPROD_DIVISION_NAME"
            ];
        }

        const locations = await CustomerProductDivision.findAll(queryOptions);



       return res.json({data: locations});
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error, message: "Error fetching Production Division" });
    }
}


export const getSpesificProdDivision = async (req, res) => {
    try {
        const { prodDivisionId } = req.params;

        let producDiv = await CustomerProductDivision.findOne({
            where: { CTPROD_DIVISION_ID: prodDivisionId },
            raw: true
        });

        if (!producDiv) {
            return res.status(404).json({ message: "Production Division not found" });
        }


        res.json({data: producDiv});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Production Division" });
    }
}

export const addproductionDivision = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID) {
            return res.status(202).json({ message: "Customer ID and Company Name are required" });
        }

        //check if production division code atau name lready exists for the customer
        const existingDivision = await CustomerProductDivision.findOne({
            where: {
                CTPROD_DIVISION_CODE: data.CTPROD_DIVISION_CODE,
            },
            raw: true
        })
        if (existingDivision) {
            return res.status(400).json({ message: "Production Division code already exists for this customer" });
        }

        const newLocation = await CustomerProductDivision.create(data);

        res.status(200).json({ message: "Production Division  added successfully", data: newLocation });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error, message: "Error Adding Production Division " });
    }
}


export const updateproductionDivision = async (req, res) => {
    try {
        const data = req.body;
        if (!data.CTPROD_DIVISION_ID) {
            return res.status(400).json({ message: "Production Division ID is required" });
        }
        const updateProdDiv = await CustomerProductDivision.update(data, {
            where: { CTPROD_DIVISION_ID: data.CTPROD_DIVISION_ID }
        });
        if (updateProdDiv[0] === 0) {
            return res.status(404).json({ message: "Production Division not found" });
        }
        res.json({ message: "Production Divisionupdated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating Production Division" });
    }
}


export const deleteProdDivisionById = async (req, res) => {
    try {
        const { CTPROD_DIVISION_ID } = req.params;
        if (!CTPROD_DIVISION_ID) {
            return res.status(400).json({ message: "Production Division ID is required" });
        }  
        const location = await CustomerProductDivision.findOne({
            where: { CTPROD_DIVISION_ID },
            raw: true
        }); 
        if (!location) {
            return res.status(404).json({ message: "Production Division not found" });
        } 
        const deletedLocation = await CustomerProductDivision.update({ IS_DELETE: 1 }, {
            where: { CTPROD_DIVISION_ID }
        });
        if (deletedLocation[0] === 0) {
            return res.status(404).json({ message: "Production Division not found" });
        }
        res.json({ message: "Production Division deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting Production Division" });
    }
}


// ✅ Get All Product Season by Customer
export const getListProdSeason = async (req, res) => {
    try {
        const { custId } = req.params;
        const { is_dropdown } = req.query;

        const queryOptions = {
            where: {
                CTC_ID: custId,
                IS_DELETE: { [Op.or]: [0, null] }
            },
            order: [["CTPROD_SESION_ID", "ASC"]],
            raw: true
        };

        if (is_dropdown === "true") {
            queryOptions.attributes = [
                "CTPROD_SESION_ID",
                "CTPROD_SESION_CODE",
                "CTPROD_SESION_NAME",
                "CTPROD_SESION_YEAR",
            ];
        }

        const seasons = await CustomerProductSeason.findAll(queryOptions);

        return res.json({ data: seasons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Product Season" });
    }
};


// ✅ Get Specific Product Season
export const getSpesificProdSeason = async (req, res) => {
    try {
        const { prodSeasionId } = req.params;

        const season = await CustomerProductSeason.findOne({
            where: { CTPROD_SESION_ID: prodSeasionId },
            raw: true
        });

        if (!season) {
            return res.status(404).json({ message: "Product Season not found" });
        }

        res.json({ data: season });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Product Season" });
    }
};

// ✅ Add New Product Season
export const addProductSeason = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID) {
            return res.status(400).json({ message: "Customer ID is required" });
        }

        // 🔍 Check duplicate code
        const existingSeason = await CustomerProductSeason.findOne({
            where: { CTPROD_SESION_CODE: data.CTPROD_SESION_CODE },
            raw: true
        });

        if (existingSeason) {
            return res.status(400).json({ message: "Product Season code already exists for this customer" });
        }

        const newSeason = await CustomerProductSeason.create(data);

        res.status(200).json({ message: "Product Season added successfully", data: newSeason });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error adding Product Season" });
    }
};

// ✅ Update Product Season
export const updateProductSeason = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTPROD_SESION_ID) {
            return res.status(400).json({ message: "Product Season ID is required" });
        }

        const updatedSeason = await CustomerProductSeason.update(data, {
            where: { CTPROD_SESION_ID: data.CTPROD_SESION_ID }
        });

        if (updatedSeason[0] === 0) {
            return res.status(404).json({ message: "Product Season not found" });
        }

        res.json({ message: "Product Season updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating Product Season" });
    }
};

// ✅ Soft Delete Product Season
export const deleteProdSeasonById = async (req, res) => {
    try {
        const { CTPROD_SESION_ID } = req.params;

        if (!CTPROD_SESION_ID) {
            return res.status(400).json({ message: "Product Season ID is required" });
        }

        const season = await CustomerProductSeason.findOne({
            where: { CTPROD_SESION_ID },
            raw: true
        });

        if (!season) {
            return res.status(404).json({ message: "Product Season not found" });
        }

        const deletedSeason = await CustomerProductSeason.update(
            { IS_DELETE: 1 },
            { where: { CTPROD_SESION_ID } }
        );

        if (deletedSeason[0] === 0) {
            return res.status(404).json({ message: "Product Season not found" });
        }

        res.json({ message: "Product Season deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting Product Season" });
    }
};





// ✅ Get All Program Name by Customer
export const getListProgramName = async (req, res) => {
    try {
        const { custId } = req.params;

        const attributes = req.query.is_dropdown === 'true' ? ['CTPROG_ID', 'CTPROG_CODE', 'CTPROG_NAME'] : undefined;

        const programs = await CustomerProgramName.findAll({
            where: { CTC_ID: custId, IS_DELETE: { [Op.or]: [0, null] } },
            attributes,
            order: [["CTPROG_ID", "ASC"]],
            raw: true
        });

        return res.json({ data: programs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Program Name" });
    }
};

// ✅ Get Specific Program Name
export const getSpecificProgramName = async (req, res) => {
    try {
        const { programId } = req.params;

        const program = await CustomerProgramName.findOne({
            where: { CTPROG_ID: programId },
            raw: true
        });

        if (!program) {
            return res.status(404).json({ message: "Program Name not found" });
        }

        res.json({ data: program });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Program Name" });
    }
};

// ✅ Add New Program Name
export const addProgramName = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID) {
            return res.status(400).json({ message: "Customer ID is required" });
        }

        // 🔍 Check duplicate program code
        const existingProgram = await CustomerProgramName.findOne({
            where: { CTPROG_CODE: data.CTPROG_CODE },
            raw: true
        });

        if (existingProgram) {
            return res.status(400).json({ message: "Program Code already exists for this customer" });
        }

        const newProgram = await CustomerProgramName.create(data);

        res.status(200).json({ message: "Program Name added successfully", data: newProgram });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error adding Program Name" });
    }
};

// ✅ Update Program Name
export const updateProgramName = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTPROG_ID) {
            return res.status(400).json({ message: "Program Name ID is required" });
        }

        const updatedProgram = await CustomerProgramName.update(data, {
            where: { CTPROG_ID: data.CTPROG_ID }
        });

        if (updatedProgram[0] === 0) {
            return res.status(404).json({ message: "Program Name not found" });
        }

        res.json({ message: "Program Name updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating Program Name" });
    }
};

// ✅ Soft Delete Program Name
export const deleteProgramNameById = async (req, res) => {
    try {
        const { CTPROG_ID } = req.params;

        if (!CTPROG_ID) {
            return res.status(400).json({ message: "Program Name ID is required" });
        }

        const program = await CustomerProgramName.findOne({
            where: { CTPROG_ID },
            raw: true
        });

        if (!program) {
            return res.status(404).json({ message: "Program Name not found" });
        }

        const deletedProgram = await CustomerProgramName.update(
            { IS_DELETE: 1 },
            { where: { CTPROG_ID } }
        );

        if (deletedProgram[0] === 0) {
            return res.status(404).json({ message: "Program Name not found" });
        }

        res.json({ message: "Program Name deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting Program Name" });
    }
};




// ✅ Get All Buy Plan by Customer
export const getListBuyPlan = async (req, res) => {
    try {
        const { custId } = req.params;

        const buyPlans = await CustomerBuyPlan.findAll({
            where: { CTC_ID: custId, IS_DELETE: { [Op.or]: [0, null] } },
            order: [["CTBUYPLAN_ID", "ASC"]],
            raw: true
        });

        return res.json({ data: buyPlans });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Buy Plan Name" });
    }
};

// ✅ Get Specific Buy Plan
export const getSpecificBuyPlan = async (req, res) => {
    try {
        const { buyPlanId } = req.params;

        const buyPlan = await CustomerBuyPlan.findOne({
            where: { CTBUYPLAN_ID: buyPlanId },
            raw: true
        });

        if (!buyPlan) {
            return res.status(404).json({ message: "Buy Plan Name not found" });
        }

        res.json({ data: buyPlan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error fetching Buy Plan Name" });
    }
};

// ✅ Add New Buy Plan
export const addBuyPlan = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTC_ID) {
            return res.status(400).json({ message: "Customer ID is required" });
        }

        // 🔍 Check duplicate code
        const existingBuyPlan = await CustomerBuyPlan.findOne({
            where: { CTBUYPLAN_CODE: data.CTBUYPLAN_CODE },
            raw: true
        });

        if (existingBuyPlan) {
            return res.status(400).json({ message: "Buy Plan Code already exists for this customer" });
        }

        const newBuyPlan = await CustomerBuyPlan.create(data);

        res.status(200).json({ message: "Buy Plan Name added successfully", data: newBuyPlan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error adding Buy Plan Name" });
    }
};

// ✅ Update Buy Plan
export const updateBuyPlan = async (req, res) => {
    try {
        const data = req.body;

        if (!data.CTBUYPLAN_ID) {
            return res.status(400).json({ message: "Buy Plan Name ID is required" });
        }

        const updatedBuyPlan = await CustomerBuyPlan.update(data, {
            where: { CTBUYPLAN_ID: data.CTBUYPLAN_ID }
        });

        if (updatedBuyPlan[0] === 0) {
            return res.status(404).json({ message: "Buy Plan Name not found" });
        }

        res.json({ message: "Buy Plan Name updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error updating Buy Plan Name" });
    }
};

// ✅ Soft Delete Buy Plan
export const deleteBuyPlanById = async (req, res) => {
    try {
        const { CTBUYPLAN_ID } = req.params;

        if (!CTBUYPLAN_ID) {
            return res.status(400).json({ message: "Buy Plan Name ID is required" });
        }

        const buyPlan = await CustomerBuyPlan.findOne({
            where: { CTBUYPLAN_ID },
            raw: true
        });

        if (!buyPlan) {
            return res.status(404).json({ message: "Buy Plan Name not found" });
        }

        const deletedBuyPlan = await CustomerBuyPlan.update(
            { IS_DELETE: 1 },
            { where: { CTBUYPLAN_ID } }
        );

        if (deletedBuyPlan[0] === 0) {
            return res.status(404).json({ message: "Buy Plan Name not found" });
        }

        res.json({ message: "Buy Plan Name deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "Error deleting Buy Plan Name" });
    }
};
