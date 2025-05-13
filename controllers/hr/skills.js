import moment from "moment";
import { ModelCategorySkills, ModelMasterSkill, queryGetEmpSkillByNIK, queryGetEmpSkillDataAll, queryGetEmpSkillDataByCategory, queryGetEmpSkillDataPaginated, SumbiriEmployeeSkills } from "../../models/hr/skills.js";
import { dbSPL } from "../../config/dbAudit.js";
import { QueryTypes } from "sequelize";


export const getCategorySkills = async (req, res) => {
    try {
        const categorySkills = await ModelCategorySkills.findAll({
            order: [['skill_category_id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: categorySkills
        });
    } catch (err) {
        return res.status(404).json({
            success: false,
            message: "fail get category skills"
        });
    }
}

export const getSkillByCategoryID = async(req,res) => {
    try {
        const { id } = req.params;
        if(id){
            const dataSkill = await ModelMasterSkill.findAll({
                where: {
                    skill_category_id: id
                }
            });
            return res.status(200).json({
                success: true,
                data: dataSkill,
                message: "success get skills by category id"
            });
        }

    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get skills by category id"
        });
    }
}

export const deleteCategorySkills = async(req,res) => {
    try {
        const { id } = req.params;
        // check skill list by category id
        const checkSkill = await ModelMasterSkill.findAll({
            where: {
                skill_category_id: id
            }
        });
        if(checkSkill.length===0){
            await ModelCategorySkills.destroy({
                where: {
                    skill_category_id: id
                }
            });
            return res.status(200).json({
                success: true,
                message: "success delete category skill"
            });
        } else {
            return res.status(403).json({
                success: false,
                message: "fail delete category skill, please delete data skill first"
            });
        }
    } catch(err){
        console.error(err);
        return res.status(404).json({
            success: false,
            message: "fail delete category skill"
        });
    }
}

export const postNewCategorySkills = async(req,res) => {
    try {
        const { skill_category_id, skill_category_name } = req.body.DataCategory;
        if(skill_category_id===0){
            await ModelCategorySkills.create({
                skill_category_name: String(skill_category_name).toUpperCase()
            });
            return res.status(200).json({
                success: true,
                message: "Sukses menambahkan Kategori Skill"
            });
        } else {
            await ModelCategorySkills.update({
                skill_category_name: String(skill_category_name).toUpperCase()
            }, {
                where: {
                    skill_category_id: skill_category_id
                }
            });
            return res.status(200).json({
                success: true,
                message: "Berhasil update Kategori Skill"
            });    
        }
        
    } catch(err){
        console.log(err);
        return res.status(404).json({
            success: false,
            message: "fail post new skills category"
        });
    }
}

export const postNewSkills = async(req,res) => {
    try {
        const { skill_id, skill_category_id, skill_name, skill_description, skill_certification, skill_add_by, skill_update_by } = req.body.DataSkill;
        let action;
        if(skill_id>0){
            action = await ModelMasterSkill.update({
                skill_category_id,
                skill_name,
                skill_description,
                skill_certification,
                skill_update_by,
                skill_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    skill_id
                }
            });
        } else {
            action = await ModelMasterSkill.create({
                skill_category_id,
                skill_name,
                skill_description,
                skill_certification,
                skill_add_by,
                skill_add_date: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        if(action){
            return res.status(200).json({
                success: true,
                message: "success post new skills"
            });
        }
    } catch(err){
        console.error(err);
        return res.status(404).json({
            success: false,
            message: "fail post new skills"
        });
    }
}

export const deleteSkillData = async(req,res) => {
    try {
        const { id } = req.params;
        const checkEmpSkill = await SumbiriEmployeeSkills.findAll({
            where: {
                skill_id: id
            }
        });
        if(checkEmpSkill.length===0){
            const delSkill = await ModelMasterSkill.destroy({
                where:{
                    skill_id: id
                }
            });
            if(delSkill){
                return res.status(200).json({
                    success: true,
                    message: "success delete skills"
                });
            }
        } else {
            return res.status(403).json({
                success: false,
                message: "fail delete skills, there is employee set skill"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail delete skills"
        });
    }
} 



export const getEmpSkillDataByCat = async(req,res) => {
    try {
        const { idcategory } = req.params;
        const EmpSkillData = await dbSPL.query(queryGetEmpSkillDataByCategory, {
            replacements: {
                categoryID: idcategory
            }, type: QueryTypes.SELECT
        });


      return res.status(200).json({
        success: true,
        message: "success get employee skills",
        data: EmpSkillData
    });
      
          
    } catch(err){
        console.error(err);
        return res.status(404).json({
            success: false,
            message: "fail get employee skills"
        });
    }
}


export const getEmpSKillByNIK = async(req,res) => {
    try {
        const { nik } = req.params;
        const data = await dbSPL.query(queryGetEmpSkillByNIK, {
            replacements: {
                empNik: nik
            }, type: QueryTypes.SELECT
        });
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get employee skills",
                data: data
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get employee skills"
        });
    }
}


export const getEmpSkillDataPaginated = async(req,res) => {
    try {
        let { page, search, limit } = req.params; 
        page                    = Number(page) ? parseInt(page): 1;
        limit                   = Number(limit) ? parseInt(limit) : 100;
        const searchParam       = decodeURIComponent(search);
        const offset            = (page - 1) * limit; // Calculate offset

        const EmpSkillAll = await dbSPL.query(queryGetEmpSkillDataAll, {
            replacements: {
                searchParameter: `%${searchParam}%`
            }, type: QueryTypes.SELECT
        });

        

        const EmpSkillData = await dbSPL.query(queryGetEmpSkillDataPaginated, {
            replacements: {
                limitPage: limit,
                offsetPage: offset,
                searchParameter: `%${searchParam}%`
            }, type: QueryTypes.SELECT
        });


      return res.status(200).json({
        success: true,
        message: "success get employee skills",
        length: EmpSkillAll.length,
        totalPages: Math.ceil(EmpSkillAll.length / limit),
        data: EmpSkillData
    });
      
          
    } catch(err){
        console.error(err);
        return res.status(404).json({
            success: false,
            message: "fail get employee skills"
        });
    }
}


export const postEmpSKill = async(req,res) => {
    try {
        const { data } = req.body;
        let tryPost;
        if(data.checked===true){
            tryPost = await SumbiriEmployeeSkills.upsert({
                Nik: data.Nik,
                skill_id: data.skill_id
            });
        } else {
            tryPost = await SumbiriEmployeeSkills.destroy({
                where: {
                    Nik: data.Nik,
                    skill_id: data.skill_id
                }
            });
        }
        if(tryPost){
            return res.status(200).json({
                success: true,
                message: "success add emp skills"
            });
        }
    } catch(err){
        console.log(err);
        return res.status(404).json({
                success: false,
                message: "failed add emp skills"
            });
    }
}
