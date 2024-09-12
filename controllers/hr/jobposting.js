import moment from "moment";
import { getJobPostingActive, jobPosting } from "../../models/hr/jobposting.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import { QueryTypes } from "sequelize";


export const postJobActive = async(req,res) => {
    try {
        const dataJob = req.body.dataJob;
        console.log(dataJob);
        const posting = await jobPosting.create(dataJob);
        if(posting){
            res.status(200).json({
                success: true,
                message: "success post job posting active"
            });
        } else {
            res.status(400).json({
                success: true,
                message: "fail to job posting active"
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get job posting",
        });
    }
}


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