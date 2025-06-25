
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {  ieCtDetailCount, IeCtGroupCount, IeCtMpProcesses, IeCtMpProcessGroup, IeCycleTimeHeader, IeCycleTimeMp, IeObDetailCT, IeObFeaturesCT, IeObHeaderCT, qryGetDataBarChart, qryGetFeatCt, qryGetIctMpProcces, qryGetIeCtMppOne, qryGetListEffCt, qryGetObDetailCt, qryListCtSite } from "../../../models/ie/IeCT.mod.js";
import { qryGetEmpForIeCt } from "../../../models/hr/employe.mod.js";
import { dbSPL } from "../../../config/dbAudit.js";
import { IeObDetail, IeObFeatures, IeObHeader } from "../../../models/ie/IeOb.mod.js";
import { averageCol } from "../../util/Utility.js";

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


export const getListCtHeader= async (req, res) => {
  try {
      const { schDate, sitename } = req.params;
      const listCtSite = await db.query(qryListCtSite, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        // shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({data : listCtSite})
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data CT Site",
      data: error,
    });
  }
}

export const deleteCtHeader= async (req, res) => {
  try {
      const { ctId } = req.params;
     const deleteCtHeader = await IeCycleTimeHeader.destroy({
      where : {
        CT_ID : ctId
      }
     })

     if(deleteCtHeader){
      const checkMp = await IeCycleTimeMp.findAll({
         where : {
          CT_ID : ctId
        },
        raw : true
      })

      if(checkMp.length > 0){
          const deleteMp = await IeCycleTimeMp.destroy({
          where : {
            CT_ID : ctId
          }
        })
      }
      const checkMpProccesses = await IeCtMpProcesses.findAll({
         where : {
          CT_ID : ctId
        },
          raw : true
      })

      if(checkMpProccesses.length > 0){
          const deleteMpp = await IeCtMpProcesses.destroy({
          where : {
            CT_ID : ctId
          }
        })
      }


      const groupCount = await IeCtGroupCount.findAll({
         where : {
          CT_ID : ctId
        },
          raw : true
      })

      if(groupCount.length > 0){
          const deletegroupCount = await IeCtGroupCount.destroy({
          where : {
            CT_ID : ctId
          }
        })
      }

      const checkDetailCount = await ieCtDetailCount.findAll({
         where : {
          CT_ID : ctId
        },
          raw : true
      })

      if(checkDetailCount.length > 0){
          const deletegroupCount = await ieCtDetailCount.destroy({
          where : {
            CT_ID : ctId
          }
        })


      }
      
      return res.json({message : 'Success Deleted CT'})

     }else{
        return res.status(404).json({message : 'Filed Delete'})

      }

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data CT Site",
      data: error,
    });
  }
}


export const postHeaderIeCt = async (req, res, next) => {
  try {
    const dataPost = req.body 

    const checkExist = await IeCycleTimeHeader.findOne({
      where : { 
        SCHD_ID : dataPost.SCHD_ID
      } })

    if(checkExist){
      return res.status(202).json({message : 'Already Cycle Time '})
    }
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
          const ieCtHeaderPost = await IeCycleTimeMp.findAll({
            where : {
              CT_ID : dataPostMp[0].CT_ID
            },
            raw: true
          })

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

export const deleteCtMp= async (req, res) => {
  try {
      const { ctMpId } = req.params;
      
      const findMp = await IeCycleTimeMp.findOne({
            where : {
              CT_MP_ID : ctMpId
            },
            raw: true
        })


      const deleteMp = await IeCycleTimeMp.destroy({
            where : {
              CT_MP_ID : ctMpId
            }
        })

     if(deleteMp){

      const checkMpProccesses = await IeCtMpProcesses.findAll({
         where : {
          CT_MP_ID : ctMpId
        },
          raw : true
      })

      if(checkMpProccesses.length > 0){
          const deleteMpp = await IeCtMpProcesses.destroy({
          where : {
            CT_MP_ID : ctMpId
          }
        })
      }


      const groupCount = await IeCtGroupCount.findAll({
         where : {
          CT_MP_ID : ctMpId
        },
          raw : true
      })

      if(groupCount.length > 0){
          const deletegroupCount = await IeCtGroupCount.destroy({
          where : {
            CT_MP_ID : ctMpId
          }
        })
      }

      const checkDetailCount = await ieCtDetailCount.findAll({
         where : {
          CT_MP_ID : ctMpId
        },
          raw : true
      })

      if(checkDetailCount.length > 0){
          const deletegroupCount = await ieCtDetailCount.destroy({
          where : {
            CT_MP_ID : ctMpId
          }
        })

      }

         const getAllIeDetailCount = await IeCtMpProcessGroup.findAll({
        where : {
          CT_MP_ID : ctMpId
        },
        raw : true
      })


      if(getAllIeDetailCount.length > 0){
          const delMppGrp = await IeCtMpProcessGroup.destroy({
          where : {
            CT_MP_ID : ctMpId
          }
        })

      }

       const ctMpList = await IeCycleTimeMp.findAll({
            where : {
              CT_ID : findMp.CT_ID
            }
          })
        
       const getDataAllMpp = await db.query(qryGetIctMpProcces, {
          replacements: {ctId : findMp.CT_ID},
          type: QueryTypes.SELECT,
        })

        const dataMpProc = getDataAllMpp || []

      
      return res.status(200).json({message : 'Success Deleted Manpower CT', ctMpList: ctMpList, dataMpProc : dataMpProc })

     }else{
      
        return res.status(404).json({message : 'Filed Delete Manpower CT'})

      }

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get Manpower CT",
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

    const ctMppGrpAct = await IeCtMpProcessGroup.findAll({
      where : {
        CT_ID : dataCtHeader.CT_ID
      }
    })

    const detailSch = getDetailSch[0] || {}
    const dataMpProc = getDataAllMpp || []
    const dataMppGrp = ctMppGrpAct || []

    const dataOb = {
        obHeader : obHeader[0] || {},
        obDetail : obDetail || [],
        obFeatures : obFeatures || [],
        
      }

    return res.json({dataCtHeader, detailSch, dataOb, dataCtMp, dataMpProc, dataMppGrp})

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

export const postIeCtDetailCount = async (req, res, next) => {
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

      if(getAllIeDtlCount.length === 5){
          return res.status(202).json({message: "Max 5 time Detail"})
      }

      //check apakah kpo ambil time yang sama (untuk menghindari cheat)
      const checkExistTime = getAllIeDtlCount.some(item => {
        const dbTime = new Date(item.CT_DETAIL_GET_TIME).getTime();
        const inputTime = new Date(dataBody.CT_DETAIL_GET_TIME).getTime();
        return dbTime === inputTime && parseInt(item.CT_DETAIL_TTIME) === dataBody.CT_DETAIL_TTIME;
      });

      if(checkExistTime){
        return res.status(202).json({message: "Already get this time"})
      }


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
      req.body.arrResult = getAllIeDetailCount
      req.body.message = 'Success add detail'
      next()
      // return  res.json({message : 'Success Add Detail Count', data : getAllIeDetailCount})
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



export const deleteIeCtDetailCount = async (req, res, next) => {
  try {
    const {ctDetailId} = req.params

       const checkexistDtl = await ieCtDetailCount.findOne({
        where : {
          CT_DETAIL_ID : ctDetailId,
        },
        raw : true
      })

      if(!checkexistDtl){
          return res.status(404).json({message: "No Data Detail"})
      }

      const deleteDetail = await ieCtDetailCount.destroy({
            where : {
              CT_DETAIL_ID : ctDetailId,
            }
          })


    if(deleteDetail){
      const getAllIeDetailCount = await ieCtDetailCount.findAll({
        where : {
          CT_ID : checkexistDtl.CT_ID,
          CT_MP_ID : checkexistDtl.CT_MP_ID,
          CT_MPP_ID : checkexistDtl.CT_MPP_ID,
        },
        raw : true
      })

      const dataBody = {
        ...checkexistDtl,
        arrResult : getAllIeDetailCount,
        message: 'success delete detail'
      }
      req.body = dataBody
      
      next()
      // return  res.json({message : 'Success Add Detail Count', data : getAllIeDetailCount})
    }else{
      return res.status(404).json({message : 'Filed delete Detail Count'})
    }
  } catch (error) {
     console.log(error);
      return res.status(404).json({
        message: "error set delete Detail",
        data: error,
      }); 
  }
}



export const midGetAvgMpp = async (req, res) => {
  try {
    const dataPost = req.body;
    const arrResult = req.body.arrResult;

     // Cek apakah sudah ada group yang cocok
    const findMppGroup = await IeCtMpProcessGroup.findOne({
      where: {
        CT_ID: dataPost.CT_ID,
        CT_MP_ID: dataPost.CT_MP_ID,
        CT_MPP_ID: dataPost.CT_MPP_ID,
        CT_GC_ID: dataPost.CT_GC_ID,
      },
      raw: true
    });

    //handle array kosong
    if (!Array.isArray(arrResult) || arrResult.length === 0) {
      // return res.status(400).json({ message: "arrResult is required and must be a non-empty array." });

      //jika ada groupnya 
      if(findMppGroup){
          const patchMppGrp = await IeCtMpProcessGroup.destroy(
            {
              where: { CT_MPP_GC_ID: findMppGroup.CT_MPP_GC_ID }
            }
            );
          }

            const getAllMppGrp= await IeCtMpProcessGroup.findAll({
            where : {
              CT_ID : dataPost.CT_ID,
            },
            raw : true
          })

          return res.json({
            message: req.body.message,
            data: arrResult,
            ctMppGroup : getAllMppGrp || []
          });

    }
    
    const avgMppTT = averageCol(arrResult, 'CT_DETAIL_TTIME');

    const getDataOne = await db.query(qryGetIeCtMppOne, {
      replacements: {
        ctId: dataPost.CT_ID,
        ctMpId: dataPost.CT_MPP_ID
      },
      type: QueryTypes.SELECT,
    });

    if (getDataOne.length === 0) {
      return res.status(404).json({ message: "CT MPP data not found." });
    }

    const dataMpp = getDataOne[0];
    // console.log({avgMppTT, count_using :dataMpp.COUNT_USING });
    
    const targetPcs =( (dataMpp.CT_WH * 60) / avgMppTT) / dataMpp.COUNT_USING;

   

    if (findMppGroup) {
      const patchMppGrp = await IeCtMpProcessGroup.update(
        {
          CT_ACT_TAKE_TIME: avgMppTT,
          CT_ACT_TARGET_PCS: targetPcs
        },
        {
          where: { CT_MPP_GC_ID: findMppGroup.CT_MPP_GC_ID }
        }
      );

      if (patchMppGrp[0] === 0) {
        // Sequelize update returns [affectedCount]
        throw new Error("Failed to update process group.");
      }
    } else {
      const postMppGc = {
        CT_ID: dataPost.CT_ID,
        CT_MP_ID: dataPost.CT_MP_ID,
        CT_MPP_ID: dataPost.CT_MPP_ID,
        CT_GC_ID: dataPost.CT_GC_ID,
        CT_ACT_TAKE_TIME: avgMppTT,
        CT_ACT_TARGET_PCS: targetPcs,
        ADD_ID: dataPost.ADD_ID
      };

      const createMppGrp = await IeCtMpProcessGroup.create(postMppGc);
      if (!createMppGrp) {
        throw new Error("Failed to create process group.");
      }
    }

      const getAllMppGrp= await IeCtMpProcessGroup.findAll({
        where : {
          CT_ID : dataPost.CT_ID,
        },
        raw : true
      })

    return res.json({
      message: req.body.message,
      data: arrResult,
      ctMppGroup : getAllMppGrp || []
    });

  } catch (error) {
    console.error('Error in midGetAvgMpp:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


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


export const getIeCtMppGroupCount = async(req,res) => {
  try {
    const {ctId} = req.params
      const getAllIeDetailCount = await IeCtMpProcessGroup.findAll({
        where : {
          CT_ID : ctId,
        },
        raw : true
      })
    return res.status(200).json({
      success: true,
      message: "success get mpp group ct",
      data: getAllIeDetailCount,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "errorget get mpp group ct",
    });
  }
}


function getCategoryStrings(data) {
  const categoriesMap = {};

  data.forEach(item => {
    const mpId = item.CT_MP_ID;
    const obDetailNo = item.OB_DETAIL_NO;

    if (!categoriesMap[mpId]) {
      categoriesMap[mpId] = new Set();
    }

    categoriesMap[mpId].add(obDetailNo);
  });

  const categoryStrings = Object.values(categoriesMap).map(obDetailSet => {
    const sortedNos = Array.from(obDetailSet).sort((a, b) => a - b);
    return sortedNos.join('+');
  });

  return categoryStrings;
}



export const getIeCtBarChartSeries = async(req,res) => {
  try {
    const {ctId} = req.params

    const getHeaderCt = await IeCycleTimeHeader.findOne({
      where : {
        CT_ID : ctId
      },
      raw: true
    })

    const getDataOne = await db.query(qryGetDataBarChart, {
      replacements: {
        ctId: ctId,
      },
      type: QueryTypes.SELECT,
    });


    //untuk categories
     const getDataAllMpp = await db.query(qryGetIctMpProcces, {
      replacements: {ctId : ctId},
      type: QueryTypes.SELECT,
    })

    const onlyGroupOne = getDataOne.filter(br => br.CT_GC_NO === 1)
    //ambil array mpid untuk filter Mpp
    const arrMpId = onlyGroupOne.map(br => br.CT_MP_ID)
    const mppWithValue = getDataAllMpp.filter(mp => arrMpId.includes(mp.CT_MP_ID))

   // time
    const arrTargetTT = onlyGroupOne.map(br => br.CT_TAKET_TIME)
    const arrStdTt = onlyGroupOne.map(br => getHeaderCt.CT_TAKE_TIME ? Math.round(getHeaderCt.CT_TAKE_TIME).toFixed() : 0)
    const arrActTT = getDataOne.map(br => br.CT_ACT_TAKE_TIME)

    // pcs
    const arrStdPcs = onlyGroupOne.map(br => getHeaderCt.CT_TARGET ? getHeaderCt.CT_TARGET : 0)
    const arrTargetPcs = onlyGroupOne.map(br => br.CT_TARGET_PCS)
    const arrActTTPcs = getDataOne.map(br => br.CT_ACT_TARGET_PCS)

    let seriesTT = []
    if(arrStdTt.length > 0){
      const objSeriesStd = {
              name: 'STD',
              type: 'line',
              data: arrStdTt
            }
        seriesTT.push(objSeriesStd)
    }

    if(arrTargetTT.length > 0){
      const objSeriesTgt = {
              name: 'Target',
              type: 'column',
              data: arrTargetTT
            }
        seriesTT.push(objSeriesTgt)
    }

    if(arrActTT.length > 0){
      const objSeriesTT = {
              name: 'Actual',
              type: 'column',
              data: arrActTT
            }
        seriesTT.push(objSeriesTT)
    }

    let seriesPcs = []
    if(arrStdPcs.length > 0){
      const objSeriesStdPCs = {
              name: 'STD',
              type: 'line',
              data: arrStdPcs
            }
        seriesPcs.push(objSeriesStdPCs)
    }

    if(arrTargetPcs.length > 0){
      const objSeriesTgtPcs = {
              name: 'Target',
              type: 'column',
              data: arrTargetPcs
            }
        seriesPcs.push(objSeriesTgtPcs)
    }

    if(arrActTTPcs.length > 0){
      const objSeriesTTPcs = {
              name: 'Actual',
              type: 'column',
              data: arrActTTPcs
            }
        seriesPcs.push(objSeriesTTPcs)
    }

    const categories = getCategoryStrings(mppWithValue)

    return res.status(200).json({
      success: true,
      message: "success get mpp group ct",
      data: {seriesTT, seriesPcs, categories},
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "errorget get mpp group ct",
    });
  }
}