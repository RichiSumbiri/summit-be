
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {  ieCtDetailCount, IeCtGroupCount, IeCtMpProcesses, IeCycleTimeHeader, IeCycleTimeMp, IeObDetailCT, IeObFeaturesCT, IeObHeaderCT, qryGetFeatCt, qryGetIctMpProcces, qryGetListEffCt, qryGetObDetailCt } from "../../../models/ie/IeCT.mod.js";
import { qryGetEmpForIeCt } from "../../../models/hr/employe.mod.js";
import { dbSPL } from "../../../config/dbAudit.js";
import { IeObDetail, IeObFeatures, IeObHeader } from "../../../models/ie/IeOb.mod.js";

//query get dailly eff report
export const getSewRepEffforCt = async (req, res) => {
  try {
    const { schDate, sitename } = req.params;
    // const { schDate, sitename, shift } = req.params;

    // const today = moment().format("YYYY-MM-DD");

    // let queryEff = today === schDate ? QueryEffCurDate : QueryEffFromLog;
    const paramsQry = `a.SCHD_PROD_DATE = '${schDate}' AND a.SITE_NAME = '${sitename}'  -- AND a.SHIFT = :shift`
    const queryEff  = qryGetListEffCt(paramsQry)

    const detailSch = await db.query(queryEff, {
      // replacements: {
      //   schDate: schDate,
      //   sitename: sitename,
      //   // shift: shift,
      // },
      type: QueryTypes.SELECT,
    });

    //jika ada result
    if (detailSch.length > 0) {
      //buat uniq line berdasrkan data eff
      const uniqueListLineExist = [
        ...new Map(
          detailSch.map((item) => [item["ID_SITELINE"], item])
        ).values(),
      ];
      const listLineExist = uniqueListLineExist.map(
        ({ SITE_NAME, SHIFT, ID_SITELINE, LINE_NAME }) => ({
          SITE_NAME,
          SHIFT,
          ID_SITELINE,
          LINE_NAME,
          LINE_SHIFT: `${LINE_NAME} - ${SHIFT}`,
        })
      );
      return res.status(200).json({
        success: true,
        data: detailSch,
        lineList: listLineExist,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: [],
        lineList: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data sewing daily eff",
      data: error,
    });
  }
};


export const postHeaderIeCt = async (req, res, next) => {
  try {
    const dataPost = req.body 

    const ieCtHeaderPost = await IeCycleTimeHeader.create(dataPost)
    if(ieCtHeaderPost){
      const dataReturn = ieCtHeaderPost.get({ plain: true });
      
      req.body = dataReturn
      return next()
    }else{
      return res.status(404).json({message : 'Failed to create new header CT'})
    }
    
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post ct header",
      data: error,
    });
  }
}


export const afterPostHeaderCt = async (req, res) => {
  try {
    const dataPost = req.body 

    if(!dataPost.OB_ID) return res.status(404).json({message: 'OB ID required'})
    if(!dataPost.CT_DATE) return res.status(404).json({message: 'OB ID required'})

    const checkHeaderExist = await IeObHeaderCT.findOne({
      where : {
        OB_ID : dataPost.OB_ID,
        CT_DATE: dataPost.CT_DATE
      },
      raw: true
    })

    if(!checkHeaderExist){
      let getDataOBheader = await IeObHeader.findOne({
          where : {
            OB_ID : dataPost.OB_ID
         },
         raw: true
      })

      delete getDataOBheader.createdAt
      delete getDataOBheader.updatedAt
      
      const dataObHeaderCt = {...getDataOBheader, CT_DATE: dataPost.CT_DATE, CT_ID : dataPost.CT_ID, OB_ADD_ID : dataPost.ADD_ID}
      const postObHeaderCt = await IeObHeaderCT.create(dataObHeaderCt)

      if(postObHeaderCt){
        const checkFeature = await IeObFeaturesCT.findOne({
            where : {
              OB_ID : dataPost.OB_ID,
              CT_DATE: dataPost.CT_DATE
          }
        })

        if(!checkFeature){
          const getDataFeatures = await IeObFeatures.findAll({
             where : {
                  OB_ID : dataPost.OB_ID
              },
              raw : true
          })

          const structureFeatures =  getDataFeatures.map(ft => ({
            ...ft,
            CT_DATE: dataPost.CT_DATE, ADD_ID : dataPost.ADD_ID
          }))

          const postFeaturesCt = await IeObFeaturesCT.bulkCreate(structureFeatures)
        }


          const checkObDetail = await IeObDetailCT.findOne({
            where : {
              OB_ID : dataPost.OB_ID,
              CT_DATE: dataPost.CT_DATE
          }
        })

        if(!checkObDetail){
            const getDataObDetail = await IeObDetail.findAll({
             where : {
                  OB_ID : dataPost.OB_ID
              },
              raw : true
          })

          const structureObDeatil =  getDataObDetail.map(ft => ({
            ...ft,
            CT_DATE: dataPost.CT_DATE, ADD_ID : dataPost.ADD_ID
          }))

          const postFeaturesCt = await IeObDetailCT.bulkCreate(structureObDeatil)
        }


      
      }
    }

    return res.json({message: 'success post Ie Cycletime Header', data : dataPost})
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post ct header",
      data: error,
    });
  }
}


export const patchHeaderIeCt = async (req, res) => {
  try {
    const dataPost = req.body 
    if(!dataPost.CT_ID) return res.status(404).json({message : 'CT ID required'})
    const ieCtHeaderPost = await IeCycleTimeHeader.update(dataPost, {
      where : {
        CT_ID : dataPost.CT_ID
      }
    })
    let dataReturn = {}
    if(ieCtHeaderPost){
       dataReturn =  !dataPost.CT_ID ? ieCtHeaderPost.get({ plain: true }) : dataPost      
      return res.json({message: 'success post Ie Cycletime Header', data : dataReturn})
    }else{
      return res.status(404).json({message : 'Failed to create new header CT'})
    }
    
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing patch header ct",
      data: error,
    });
  }
}

export const qryGetEmpForCt = async(req,res) => {
  try {
    // const inputQry  = parseInt(req.params.inputQry);
    const {inputQry} = req.params
    const qry       = `%${inputQry}%`;
    const data      = await dbSPL.query(qryGetEmpForIeCt, {
      replacements: {
        inputQry: qry
      }, type: QueryTypes.SELECT
    });
    return res.status(200).json({
      success: true,
      message: "success get employee by nik or name",
      data: data,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "error get employee with NIK or name",
    });
  }
}



export const postIeCtMp = async (req, res) => {
  try {
    const {dataPostMp} = req.body 

    const ieCtHeaderPost = await IeCycleTimeMp.bulkCreate(dataPostMp, { returning: true })
    if(ieCtHeaderPost){
      
      return res.json({message: 'success post Ie Cycletime manpower', data : ieCtHeaderPost})
    }else{
      return res.status(404).json({message : 'Failed to create new manpower CT'})
    }
    
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing post mp ct",
      data: error,
    });
  }
}


export const getBaseDataIeCyc = async (req, res) => {
  try {
    const CT_ID  = req.params.ctId

    const dataCtHeader = await IeCycleTimeHeader.findOne({
      where : {
        CT_ID : CT_ID
      }
    })


    const dataCtMp = await IeCycleTimeMp.findAll({
      where : {
        CT_ID : CT_ID
      }
    })

    const obHeader = await IeObHeaderCT.findAll({
      where : {
        OB_ID : dataCtHeader.OB_ID,
        CT_DATE : dataCtHeader.CT_DATE
      }
    })

      
    const obFeatures = await db.query(qryGetFeatCt, {
      replacements: {obId : dataCtHeader.OB_ID, ctDate : dataCtHeader.CT_DATE},
      type: QueryTypes.SELECT,
    })


    const obDetail = await db.query(qryGetObDetailCt, {
      replacements: {obId : dataCtHeader.OB_ID, ctDate : dataCtHeader.CT_DATE},
      type: QueryTypes.SELECT,
    })


    const getDataAllMpp = await db.query(qryGetIctMpProcces, {
      replacements: {ctId : CT_ID},
      type: QueryTypes.SELECT,
    })


    const paramGetSch = `a.SCHD_ID =  '${dataCtHeader.SCHD_ID}' AND a.ID_SITELINE ='${dataCtHeader.ID_SITELINE}' `
    const qryGetSchEff = qryGetListEffCt(paramGetSch)
    

    const getDetailSch = await db.query(qryGetSchEff, {
      type: QueryTypes.SELECT,
    })

    const detailSch = getDetailSch[0] || {}
    const dataMpProc = getDataAllMpp || []

    const dataOb = {
        obHeader : obHeader[0] || {},
        obDetail : obDetail || [],
        obFeatures : obFeatures || [],
        
      }

    return res.json({dataCtHeader, detailSch, dataOb, dataCtMp, dataMpProc})

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get CT data",
      data: error,
    });
  }
}


export const postIeCtMpProccesses = async (req, res) => {
  try {
      const dataIeCtMPP = req.body

      const checkExist =  await IeCtMpProcesses.findAll({
        where : {
          CT_ID : dataIeCtMPP[0].CT_ID,
          CT_MP_ID : dataIeCtMPP[0].CT_MP_ID
        },
        raw: true
      })

      if(checkExist.length > 0){
        const deleteCt = await IeCtMpProcesses.destroy({
          where : {
            CT_ID : dataIeCtMPP[0].CT_ID,
            CT_MP_ID : dataIeCtMPP[0].CT_MP_ID
          }
        })
      }

      const postIeCtMpp = await IeCtMpProcesses.bulkCreate(dataIeCtMPP)

      if(postIeCtMpp){
          const getDataAllMpp = await db.query(qryGetIctMpProcces, {
            replacements: {ctId :  dataIeCtMPP[0].CT_ID},
            type: QueryTypes.SELECT,
          })

        return res.json({message : 'Success Set Proccess To Manpower', data: getDataAllMpp})
      }
  } catch (error) {
      console.log(error);
      return res.status(404).json({
        message: "error set manpower proccess",
        data: error,
      }); 
  }
}

//handle uncheck all untuk satu mp
export const deleteIeCtMpProccesses = async (req, res) => {
  try {
      const {ctId, ctMpId} = req.params

      const deleteCt = await IeCtMpProcesses.destroy({
        where : {
          CT_ID : ctId,
          CT_MP_ID : ctMpId
        }
      })

      if(deleteCt){
          const getDataAllMpp = await db.query(qryGetIctMpProcces, {
            replacements: {ctId : ctId},
            type: QueryTypes.SELECT,
          })
        return res.json({message : 'Success Set Proccess To Manpower', data: getDataAllMpp})
      }
  } catch (error) {
      console.log(error);
      return res.status(404).json({
        message: "error set manpower proccess",
        data: error,
      }); 
  }
}

export const postIeGroupCount = async (req, res) => {
  try {
    const dataBody = req.body

       const getAllIeGc = await IeCtGroupCount.findAll({
        where : {
          CT_ID : dataBody.CT_ID,
          CT_MP_ID : dataBody.CT_MP_ID
        },
        raw : true
      })

      const dataPost = {
        ...dataBody,
        CT_GC_NO : getAllIeGc.length+1
      }

    const postIeGc = await IeCtGroupCount.create(dataPost)

    if(postIeGc){
      const getAllIeGc = await IeCtGroupCount.findAll({
        where : {
          CT_ID : dataPost.CT_ID,
          CT_MP_ID : dataPost.CT_MP_ID
        },
        raw : true
      })

      return  res.json({message : 'Success Create Group Count', data : getAllIeGc})
    }else{
      return res.status(404).json({message : 'Filed Create Group Count'})
    }
  } catch (error) {
     console.log(error);
      return res.status(404).json({
        message: "error set manpower proccess",
        data: error,
      }); 
  }
}

export const getIeCtGroupCount = async(req,res) => {
  try {
    // const inputQry  = parseInt(req.params.inputQry);
    const {ctId, ieMpId} = req.params
      const getAllIeGc = await IeCtGroupCount.findAll({
        where : {
          CT_ID : ctId,
          CT_MP_ID : ieMpId
        },
        raw : true
      })
    return res.status(200).json({
      success: true,
      message: "success get group ct",
      data: getAllIeGc,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "errorget group ct",
    });
  }
}

export const postIeCtDetailCount = async (req, res) => {
  try {
    const dataBody = req.body

       const getAllIeDtlCount = await ieCtDetailCount.findAll({
        where : {
          CT_ID : dataBody.CT_ID,
          CT_MP_ID : dataBody.CT_MP_ID,
          CT_MPP_ID : dataBody.CT_MPP_ID
        },
        raw : true
      })

      const dataPost = {
        ...dataBody,
        CT_DETAIL_NO : getAllIeDtlCount.length+1
      }

    const postIeGc = await ieCtDetailCount.create(dataPost)

    if(postIeGc){
      const getAllIeDetailCount = await ieCtDetailCount.findAll({
        where : {
          CT_ID : dataPost.CT_ID,
          CT_MP_ID : dataPost.CT_MP_ID,
          CT_MPP_ID : dataPost.CT_MPP_ID,
        },
        raw : true
      })

      return  res.json({message : 'Success Add Detail Count', data : getAllIeDetailCount})
    }else{
      return res.status(404).json({message : 'Filed Add Detail Count'})
    }
  } catch (error) {
     console.log(error);
      return res.status(404).json({
        message: "error set manpower proccess",
        data: error,
      }); 
  }
}

export const getIeCtDetailCount = async(req,res) => {
  try {
    const {ctId, ieMpId, ieMppId} = req.params
      const getAllIeDetailCount = await ieCtDetailCount.findAll({
        where : {
          CT_ID : ctId,
          CT_MP_ID : ieMpId,
          CT_MPP_ID : ieMppId,
        },
        raw : true
      })
    return res.status(200).json({
      success: true,
      message: "success get detail ct",
      data: getAllIeDetailCount,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "errorget get detail ct",
    });
  }
}