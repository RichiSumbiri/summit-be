import moment from "moment";
import { ModelCategorySkills, ModelMasterSkill, ModelMasterSubSkill, queryGetEmpSkillByNIK, queryGetEmpSkillDataAll, queryGetEmpSkillDataByCategory, queryGetEmpSkillDataPaginated, SumbiriEmployeeSkills } from "../../models/hr/skills.js";
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

export const getSkillAll = async(req,res) => {
    try {
        const data = await ModelMasterSkill.findAll();
        if(data){
            return res.status(200).json({
                success: true,
                data: data,
                message: "success get skills all"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get skills all"
        });
    }
}

export const getSubSkillAll = async(req,res) => {
    try {
        const data = await ModelMasterSubSkill.findAll();
        if(data){
            return res.status(200).json({
                success: true,
                data: data,
                message: "success get sub skills all"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get sub skills all"
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

export const getSubSkillBySkillID = async(req,res) => {
    try {
        const { id } = req.params;
        if(id){
            const dataSkill = await ModelMasterSubSkill.findAll({
                where: {
                    skill_id: id
                }
            });
            return res.status(200).json({
                success: true,
                data: dataSkill,
                message: "success get sub skills by skill id"
            });
        }
    }
    catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get sub skills by skill id"
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
        return res.status(404).json({
            success: false,
            message: "fail post new skills"
        });
    }
}

export const postNewSubSkills = async(req,res) => {
    try {
        const { sub_skill_id, skill_id, sub_skill_name, sub_description, sub_update_by } = req.body.DataSubSkill;
        let action;
        if(sub_skill_id){
            action = await ModelMasterSubSkill.update({
                skill_id,
                sub_skill_name,
                sub_description,
                sub_update_by,
                sub_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    sub_skill_id
                }
            });
        } else {
            action = await ModelMasterSubSkill.create({
                skill_id,
                sub_skill_name,
                sub_description,
                sub_add_by: sub_update_by,
                sub_add_date: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        if(action){
            return res.status(200).json({
                success: true,
                message: "success post new skills"
            });
        }
    } catch(err){
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


export const deleteSubSkillData = async(req,res) => {
    try {
        const { id } = req.params;
        const delSkill = await ModelMasterSubSkill.destroy({
                where:{
                    sub_skill_id: id
                }
            });
        if(delSkill){
            return res.status(200).json({
                success: true,
                message: "success delete skills"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail delete skills"
        });
    }
} 


export const getMatrixSkillReportByCat = async(req,res) => {
    try {
        const { idskill } = req.params;
        const EmpSkillData = await dbSPL.query(queryGetEmpSkillDataByCategory, {
            replacements: {
                skillID: idskill
            }, type: QueryTypes.SELECT
        });
        
        const groupedData = EmpSkillData.reduce((acc, item) => {
            // Create a unique key based on employee identity
            const key = `${item.Nik}-${item.NamaLengkap}-${item.Departemen}-${item.SubDepartemen}-${item.Section}`;

            // If group doesn't exist yet, initialize it
            if (!acc[key]) {
                acc[key] = {
                Nik: item.Nik,
                NamaLengkap: item.NamaLengkap,
                Departemen: item.Departemen,
                SubDepartemen: item.SubDepartemen,
                Section: item.Section,
                detail: [],
            };
        }

        // Push skill details to the "detail" array
        acc[key].detail.push({
            skill_category_id: item.skill_category_id,
            skill_category_name: item.skill_category_name,
            skill_id: item.skill_id,
            skill_name: item.skill_name,
            sub_skill_id: item.sub_skill_id,
            sub_skill_name: item.sub_skill_name,
            skill_level: item.skill_level,
        });

        
        return acc;
        }, {});

        // Convert back to array
        const finalResult = Object.values(groupedData);
        
        
        return res.status(200).json({
            success: true,
            message: "success get employee matrix skills data",
            data: finalResult
        });
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get employee skills"
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
        return res.status(404).json({
            success: false,
            message: "fail get employee skills"
        });
    }
}


export const getEmpSkillDataAll = async(req,res) => {
    try {
        const EmpSkillAll = await dbSPL.query(queryGetEmpSkillDataAll, {
            replacements: {
                searchParameter: `%%`
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get employee skills for all employee",
            length: EmpSkillAll.length,
            data: EmpSkillAll
        });  
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get employee skills for all employee"
        });
    }
}



export const postEmpSKill = async(req,res) => {
    try {
        const { data } = req.body;
        // console.log(data);
        let tryPost;
        const findEmpData = await SumbiriEmployeeSkills.findAll({
                where: {
                 Nik: data.Nik,
                skill_id: data.skill_id,
                sub_skill_id: data.sub_skill_id
                }, raw: true
        });
        if(findEmpData.length===0){
            tryPost = await SumbiriEmployeeSkills.create({
                Nik: data.Nik,
                skill_id: data.skill_id,
                sub_skill_id: data.sub_skill_id,
                skill_level: data.skill_level,
                last_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        } else {
            tryPost = await SumbiriEmployeeSkills.update({
                skill_level: data.skill_level,
                last_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    Nik: data.Nik,
                skill_id: data.skill_id,
                sub_skill_id: data.sub_skill_id,
                
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
        return res.status(404).json({
                success: false,
                message: "failed add emp skills"
            });
    }
}

export const deleteEmpSKill = async(req,res) => {
    try {
        const actionDelete = await SumbiriEmployeeSkills.destroy({
            where: {
                Nik: parseInt(req.params.empnik),
                skill_id: parseInt(req.params.idskill),
                sub_skill_id: parseInt(req.params.idsubskill)
            }
        });
        if(actionDelete){
            return res.status(200).json({
                success: true,
                message: "success delete emp skills"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "failed delete emp skills"
        });
    }
}


export const postMassEmpSKill = async(req,res) => {
    try {
        const { data } = req.body;
        const EmpDetail = data.detail;
        EmpDetail.map(async (item) => {
            const checkEmpSkill = await SumbiriEmployeeSkills.findOne({
                where: {
                    Nik: item.Nik,
                    skill_id: item.skill_id,
                    sub_skill_id: item.sub_skill_id,
                    skill_level: item.sub_skill_level
                }
            });
            if(!checkEmpSkill){
                await SumbiriEmployeeSkills.create({
                    Nik: item.Nik,
                    skill_id: item.skill_id,
                    sub_skill_id: item.sub_skill_id,
                    skill_level: item.sub_skill_level,
                    certified: data.certified,
                    last_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
                });
            } else {
                await SumbiriEmployeeSkills.update({
                    skill_level: item.sub_skill_level,
                    certified: item.certified,
                    last_update_date: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        Nik: item.Nik,
                        skill_id: item.skill_id,
                        sub_skill_id: item.sub_skill_id
                    }
                });
            }
        });
        return res.status(200).json({
            success: true,
            message: "success add multiple emp skills"
        });
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "failed add emp skills"
        });       
    }
}