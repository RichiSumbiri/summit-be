import moment from "moment";
import { getJobPostingActive } from "../../models/hr/jobposting.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import { QueryTypes } from "sequelize";



export const getJobPosting = async(req,res) => {
    try {
        const data = await dbSPL.query(getJobPostingActive, { type: QueryTypes.SELECT});
        res.status(200).json({
            success: true,
            message: "success get job posting active",
            data: data
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get job posting",
        });
    }
}