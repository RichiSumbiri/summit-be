import moment from "moment";
import { getJobPostingActive, getJobPostingById, jobPosting, putJobById } from "../../models/hr/jobposting.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import { QueryTypes } from "sequelize";


export const postJobActive = async(req,res) => {
    try {
        const dataJob = req.body.dataJob;
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

export const getJobPostingByID = async(req,res) => {
    try {
        const idPost = req.params.id;
        const data = await dbSPL.query(getJobPostingById, { 
            replacements: {
                idPost: idPost
            },
            type: QueryTypes.SELECT});
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

export const updateJobPosting = async(req,res) => {
    try {
        const { idPost, Posisi, Kualifikasi, TenggatWaktu } = req.body.newJob;
        const data = await dbSPL.query(putJobById, { 
            replacements: {
                idPost: idPost,
                postPosisi: Posisi,
                postKualifikasi: Kualifikasi,
                postTenggatWaktu: TenggatWaktu
            },
            type: QueryTypes.UPDATE});
        res.status(200).json({
            success: true,
            message: "update job posting active success",
            data: data
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error update job posting",
        });
    }
}