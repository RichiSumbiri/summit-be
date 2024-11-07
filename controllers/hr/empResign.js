import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryEmpResignSPK } from "../../models/hr/empResign.mod.js";


export const getEmpResignSPK = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const actionGetEmpSPK           = await dbSPL.query(queryEmpResignSPK, {
            replacements: {
                startDate: startDate,
                endDate: endDate,
            }, type: QueryTypes.SELECT
        });
        if(actionGetEmpSPK){
            res.status(200).json({
                success: true,
                message: `Success get list Emp Resign SPK between ${startDate} and :${endDate}`,
                data: actionGetEmpSPK,
            })
        } else {
            res.status(404).json({
                success:false,
                message: `fail get list Emp Resign SPK between ${startDate} and :${endDate}`
            })    
        }
    } catch(err){
        res.status(404).json({
            success:false,
            message: err
        })
    }
}