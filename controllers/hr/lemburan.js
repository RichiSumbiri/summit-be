import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryLemburanPending } from "../../models/hr/lemburanspl.mod.js";
import { sumbiriUserSummitNIK } from "../../models/hr/lemburan.mod.js";

export const getSPLAccess = async(req,res) => {
    try {
        const { userId }    = req.params;
        const checkAccess   = await sumbiriUserSummitNIK.findAll({
            where: {
                USER_ID: userId
            }
        });
        if(checkAccess.length !== 0){
            res.status(200).json({
                success: true,
                message: "success get spl access for specified user",
                data: checkAccess
            });
        } else {
            res.status(400).json({
                success: false,
                message: "fail get spl access for specified user",
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get spl access",
        });
    }
}

export const getLemburanPending = async(req,res) => {
    try {
        const listPending = await dbSPL.query(queryLemburanPending, { type: QueryTypes.SELECT });
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}