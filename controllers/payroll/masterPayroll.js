import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, fn, col, QueryTypes } from "sequelize";
import { MasterSalType } from "../../models/payroll/masterPayroll.mod.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

export const getListTypePayroll = async (req, res) => {
    try {
        const listTypePay = await MasterSalType.findAll({
            order: [['IDSalType', 'ASC']] 
        })

        res.json({data: listTypePay, message: 'success get data payroll'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat ambil list type payroll" });
    }
}


export const postListTypePayroll = async (req, res) => {
    try {
        const dataPost = req.body

        if(!dataPost){
            return res.status(404).json({message: 'tidak ada Data yang di Add'})
        }
        const listTypePay = await MasterSalType.create(dataPost)

        res.json({data: listTypePay, message: 'success Add Type payroll'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat Post type payroll" });
    }
}


export const patchListTypePayroll = async (req, res) => {
    try {
        const dataPost = req.body

        if(!dataPost.IDSalType){
            return res.status(404).json({message: 'tidak ada yang ID Type Payroll '})
        }
        const listTypePay = await MasterSalType.update(dataPost, {
            where : {
                IDSalType: dataPost.IDSalType
            }
        })

        res.json({data: listTypePay, message: 'success Update Type payroll'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat Post type payroll" });
    }
}

export const deleteListTypePayroll = async (req, res) => {
    try {
        const {id} = req.params

        if(!id){
            return res.status(404).json({message: 'tidak ada yang ID Type Payroll '})
        }
        
        const findAllempSet = await modelSumbiriEmployee.findAll({
            where: {
                IDJenisUpah : id
            },
            raw: true
        })
        
        if(findAllempSet.length > 0){
            return res.status(404).json({message: 'Type Payroll Sudah digunakan'})
            
        }

        const listTypePay = await MasterSalType.destroy({
            where : {
                IDSalType: id
            }
        })

        res.json({data: listTypePay, message: 'success delete Type payroll'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Terjadi kesalahan saat Post type payroll" });
    }
}