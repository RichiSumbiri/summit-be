import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryApprovedPelamarByDate } from "../../models/hr/acceptance.mod.js";




export const getApprovedPelamar = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const data                      = await dbSPL.query(queryApprovedPelamarByDate, {
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        console.log(data);
        res.status(200).json({
            success: true,
            message: "success get approved lamaran",
            data: data
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get approved lamaran",
        });
    }
}