import db from "../../../config/database.js";
import { QueryTypes, Op, where } from "sequelize";
import { dbListFeatures, getIdsToDelete, getLasIdOb, getListOb, getListSugestObDetail, IeObDetail, IeObFeatures, IeObHeader, IeObHistory, IeObSize, lastObNoBYSeq, listBobinThread, listGauge, listMachine, listNeedle, listNeedleThread, listSeamAllow, listStiches, listThrow, qryGetFeaturs, qryGetObDetail, qryGetObDetailForBe, qryGetObHistory, qryGetSizeOb, qryGetStyleByTree, qryGetThreeStyle, qryIListBobinThreads, qryIListNeedleThreads, qryListFeatures, qryListSizesOb, qryObDetail, splitDataForUpdateAndCreate } from "../../../models/ie/IeOb.mod.js";
import { baseUrl, getUniqueAttribute } from "../../util/Utility.js";
import { pharsingImgStyle } from "../../list/listReferensi.js";
import { qryIListGauge, qryIListMachine, qryIListNeedle, qryIListSeamAllow, qryIListStitch, qryIListThrow } from "../../../models/ie/IeOb.mod.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateHistory(dataPost, existingObDetail) {
  const nameAndKey = {
    'OB_DETAIL_NO': 'NO',
    'OB_DETAIL_DESCRIPTION': 'Description',
    'OB_DETAIL_DESCRIPTION_IDN': 'Description IDN',
    'OB_DETAIL_REMARK': 'Remark',
    'OB_DETAIL_REMARK_IDN': 'Remark IDN',
    'OB_DETAIL_MACHINE': 'Machine Type',
    'OB_DETAIL_SPI': 'SPI',
    'OB_DETAIL_SEAMALLOW': 'Seam Allow',
    'OB_DETAIL_GAUGE': 'Gauge',
    'OB_DETAIL_THROW': 'Throw',
    'OB_DETAIL_ND': 'Needle',
    'OB_DETAIL_ND_THREADS': 'Needle Thread',
    'OB_DETAIL_BOBIN_THREADS': 'Bobin Thread',
    'OB_DETAIL_MC_SETUP': 'MC Setup',
    'OB_DETAIL_SMV': 'SMV',
    'OB_DETAIL_TARGET': 'Target',
  };
  const keysToCheck = Object.keys(nameAndKey);

  const changedLabels = [];
  const valueBeforeParts = [];
  const valueAfterParts = [];

  keysToCheck.forEach(key => {
    const oldVal = existingObDetail[key];
    const newVal = dataPost[key];
    if (oldVal !== newVal) {
      changedLabels.push(nameAndKey[key]);
      valueBeforeParts.push(`'${key}': '${oldVal ?? ''}'`);
      valueAfterParts.push(`'${key}': '${newVal ?? ''}'`);
    }
  });

  return {
    OB_UPDATE_LOCATION: changedLabels.join(', '),
    OB_VALUE_BEFORE: valueBeforeParts.join(', '),
    OB_VALUE_AFTER: valueAfterParts.join(', ')
  };
}


export const getDataTreeStyleOb = async (req, res) => {
  try {
    const styleThree = await db.query(qryGetThreeStyle, {
      type: QueryTypes.SELECT,
    });

    let buyerIndex = 1;

    const treeData = {
      name: '',
      children: [
        {
          name: 'PT SUMBIRI',
          id: '0',
          children: [],
        }
      ]
    };

    const buyerList = getUniqueAttribute(styleThree, 'CUSTOMER_NAME');

    for (const buyerName of buyerList) {
      const byrPadId = String(buyerIndex).padStart(2, '0');
      const buyerId = `B${byrPadId}`;
      const buyerNode = {
        name: buyerName,
        id: buyerId,
        level: 'Buyer',
        children: [],
      };

      const typeList = getUniqueAttribute(
        styleThree.filter(item => item.CUSTOMER_NAME === buyerName),
        'PRODUCT_TYPE'
      );

      let typeIndex = 1;

      for (const type of typeList) {
        const padType = String(typeIndex + 1).padStart(2, '0');
        const typeId = `${buyerId}T${padType}`;
        const typeNode = {
          name: type,
          id: typeId,
          level: 'Product Type',
          children: [],
        };

        const filteredCategories = styleThree.filter(
          item => item.CUSTOMER_NAME === buyerName && item.PRODUCT_TYPE === type
        );

        let categoryIndex = 1;

        for (const cat of filteredCategories) {
          const padCategoryId = String(categoryIndex + 1).padStart(2, '0');
          const categoryId = `${typeId}C${padCategoryId}`;
          const categoryNode = {
            name: cat.PRODUCT_CATEGORY,
            id: categoryId,
            level: 'Category',
            ttl_product: cat.TTL_PRODUCT,
          };

          typeNode.children.push(categoryNode);
          categoryIndex++;
        }

        buyerNode.children.push(typeNode);
        typeIndex++;
      }

      treeData.children[0].children.push(buyerNode);
      buyerIndex++;
    }

    return res.status(200).json({
      success: true,
      message: "Tree data berhasil dibuat",
      data: treeData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
    });
  }
};


export const getListStyleByOb= async (req,res) => {
    try {
        const {buyer} = req.params
        const {prodType, prodCat} = req.query
        
        const query = qryGetStyleByTree(buyer, prodType, prodCat)

        let listStyle = await db.query(query, {
                type: QueryTypes.SELECT,
            });

        if(listStyle.length>0){
            listStyle = pharsingImgStyle(listStyle, req)
        }

        return res.status(200).json({data: listStyle})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "Filed get data",
            error: error.message,
            });
    }
}

//ini sebetulnya list size aja
export const getSizesOb = async (req, res) =>{
  try {
    const {prodType} = req.params

    const listSizes = await db.query(qryListSizesOb, {
      replacements: {prodType},
      type: QueryTypes.SELECT,
    })
    return res.status(200).json({data: listSizes})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


//jadi untuk view dan update
export const getSizesObSelected = async (req, res) =>{
  try {
    const {obId} = req.params

    const listSizesSelected = await db.query(qryGetSizeOb, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })
    return res.status(200).json({data: listSizesSelected})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}

export const postIeOb = async (req, res) =>{
  try {
    let {dataNewOb, dataSize} = req.body

    //ambil ob id
    const getLastId = await db.query(getLasIdOb, {
      replacements: {prodItemId : dataNewOb.PRODUCT_ITEM_ID},
      type: QueryTypes.SELECT,
    })

    //jika belum ada ob id sebelumnya maka masukan initial id 0001
    const lastId = getLastId[0]? getLastId[0].LATST_ID.toString().padStart(3, "0") : '001'

    //masukan ob id ke object ob header
    const OB_ID = dataNewOb.OB_CODE+lastId
    dataNewOb.OB_ID = OB_ID

    //masukan ob id ke array of obj sizes
    const sizeOb = dataSize.map(sz => ({...sz, OB_ID}))
    
    const createNewOb = await IeObHeader.create(dataNewOb)

    if(createNewOb){
      const createNewObSize = await IeObSize.bulkCreate(sizeOb)
    }

    return res.status(200).json({message:'Success Create New OB'})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const getlistObApi = async (req, res) =>{
  try {
    const {prodItemId} = req.params

    const listIeOb = await db.query(getListOb, {
      replacements: {prodItemId},
      type: QueryTypes.SELECT,
    })
    
    return res.status(200).json({data: listIeOb})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const deletIeOb = async (req, res) =>{
  try {
    const {obId, userId} = req.params

    //soft delete
    const deleteHeader = await IeObHeader.update({OB_DELETE_STATUS : 1, OB_MOD_ID : userId},{
      where : {OB_ID: obId},
    })

    if(deleteHeader){
      //soft delete deteail
      const createNewObSize = await IeObSize.update({OB_DELETE_STATUS : 1}, {
          where : {OB_ID: obId},
        })
      const destroyOBFeatures = await IeObFeatures.destroy({
          where : {OB_ID: obId},
        })
      const detroyObDetail = await IeObDetail.destroy({
          where : {OB_ID: obId},
        })
    }


    return res.status(200).json({message: `Success Delete OB ${obId}`})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed delete OB",
      error: error.message,
      });
  }
}


//update ob header
export const patchIeOb = async (req, res) =>{
  try {
    let {dataNewOb, dataSize} = req.body


    if(!dataNewOb.OB_ID) return res.status(400).json({message: "OB ID is required"})
    
    const updateHedaer = await IeObHeader.update(dataNewOb , {
      where : {
        OB_ID : dataNewOb.OB_ID
      }
    })

    if(updateHedaer){
      const deleteFirstSz = await IeObSize.destroy({
          where : {
            OB_ID : dataNewOb.OB_ID,
            }
      })
      
      if(deleteFirstSz){
          const addBoId = dataSize.map(item => ({...item, OB_ID : dataNewOb.OB_ID}))
          const createNewObSize = await IeObSize.bulkCreate(addBoId)
      }
    }

    return res.status(200).json({message:'Success Update OB'})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}

//update only remarks
export const postObRemark = async (req, res) =>{
  try {
    let dataObRemark = req.body


    if(!dataObRemark.OB_ID) return res.status(400).json({message: "OB ID is required"})
    
    const updateHedaer = await IeObHeader.update(dataObRemark , {
      where : {
        OB_ID : dataObRemark.OB_ID
      }
    })

    
if(updateHedaer){
    return res.status(200).json({message:'Success Update OB'})
  }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const getObData = async (req, res) =>{
  try {
    const {obId} = req.params

    const obHeader = await db.query(qryObDetail, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })
    
    if(obHeader.length === 0) return res.status(404).json({message: "OB not found", success: false})

    let dataObDetail = {obHeader: obHeader[0]}  


    const listSizesSelected = await db.query(qryGetSizeOb, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })

    if(listSizesSelected){
        dataObDetail = {...dataObDetail, obSizes: listSizesSelected}
      }
    
      if(obHeader[0].OB_SKETCH){
        const sketchPath = `/images/sketch/${obHeader[0].OB_SKETCH}`;
        const sketchUrl = `${baseUrl}${sketchPath}`;
        dataObDetail.obHeader.OB_SKETCH = sketchUrl; // Update the OB_SKETCH field with the full URL
      }
      
    const listFeatures = await db.query(qryGetFeaturs, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })

    if(listFeatures){
        dataObDetail = {...dataObDetail, obFeatures: listFeatures}
      }
      
    return res.status(200).json({data: dataObDetail})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}

export const getListFeatures = async (req, res) =>{
  try {
    const {prodType, obId} = req.params

    const listFeatures = await db.query(qryListFeatures, {
      replacements: {prodType, obId},
      type: QueryTypes.SELECT,
    })
    
    return res.status(200).json({data: listFeatures})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const getObFeatures = async (req, res) =>{
  try {
    const { obId} = req.params

    const listFeatures = await db.query(qryGetFeaturs, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })

    return res.status(200).json({data: listFeatures})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const postFeatures = async (req, res) => {
  try {
    const data = req.body;
    const obId = data[0]?.OB_ID;

    if (!obId) {
      return res.status(400).json({ success: false, message: "OB_ID is required" });
    }

    // Ambil data existing dari DB
    const existingFeatures = await IeObFeatures.findAll({
      where: { OB_ID: obId },
    });

    const idsToDelete = getIdsToDelete(existingFeatures, data);

    if (idsToDelete.length > 0) {
      await IeObFeatures.destroy({
        where: { ID_OB_FEATURES: idsToDelete },
      });
    }

    const { dataToUpdate, dataToCreate } = splitDataForUpdateAndCreate(data);

    if (dataToUpdate.length > 0) {
      await IeObFeatures.bulkCreate(dataToUpdate, {
        updateOnDuplicate: ["FEATURES_ID", "FEATURES_NAME", "SEQ_NO", "USER_ID", "PRODUCT_TYPE"],
      });
    }

    if (dataToCreate.length > 0) {
      await IeObFeatures.bulkCreate(dataToCreate);
    }

    // Ambil hasil terbaru dari DB
    const updatedList = await IeObFeatures.findAll({
      where: { OB_ID: obId },
      raw: true, // supaya hasilnya plain object
    });

    // Combine dengan data awal
    const combinedResult = data.map(item => {
      const matched = updatedList.find(u =>
        u.FEATURES_ID === item.FEATURES_ID && u.OB_ID === item.OB_ID
      );

      return {
        ...item,
        ID_OB_FEATURES: matched ? matched.ID_OB_FEATURES : null,
      };
    });

    //masukan ke ie history
    const featureName = data.map(item => item.FEATURES_NAME).join(', ');
    const historyData = {
      OB_ID: obId,
      OB_USER_ID: data[0].USER_ID,
      OB_TYPE_ACTION: 'Post Features',
      OB_VALUE_AFTER : featureName
    }
    await IeObHistory.create(historyData);
    return res.status(200).json({ success: true, data: combinedResult });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync features",
      error: error.message,
    });
  }
};


//get referensi for ob detail
export const getRefObDetail = async (req, res) => {
  try {

      const listMachine = await db.query(qryIListMachine, {
        type: QueryTypes.SELECT,
      })

      const listStitch = await db.query(qryIListStitch, {
        type: QueryTypes.SELECT,
      })

      const listSeamAllow = await db.query(qryIListSeamAllow, {
        type: QueryTypes.SELECT,
      })

      const listGauge = await db.query(qryIListGauge, {
        type: QueryTypes.SELECT,
      })


      const listThrow = await db.query(qryIListThrow, {
        type: QueryTypes.SELECT,
      })

      const listNeedle = await db.query(qryIListNeedle, {
        type: QueryTypes.SELECT,
      })

      const listNeedlThread = await db.query(qryIListNeedleThreads, {
        type: QueryTypes.SELECT,
      })

      const listBobinThread = await db.query(qryIListBobinThreads, {
        type: QueryTypes.SELECT,
      })

      const dataRefObDetail = {
        listMachine,
        listStitch,
        listSeamAllow,
        listGauge,
        listThrow,
        listNeedle,
        listNeedlThread,
        listBobinThread
      }
    return res.status(200).json({ success: true, data: dataRefObDetail });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get references for OB detail",
      error: error.message,
    });
  }
}

// controlller untuk prePost ie ob detail untuk memastikan ada referensi baru atau tidak
export const prePostIeObDetail = async (req, res, next) => {
  try {
    let dataObDetail = req.body;
    if(!dataObDetail.OB_ID || !dataObDetail.OB_DETAIL_DESCRIPTION) {
      return res.status(400).json({ success: false, message: "OB ID and OB Description are required" });
    }

    // cek object dibawah ini apakah memiliki parameter customOption : true jika ada maka kita post ke masing
    const {
      OB_DETAIL_MACHINE,
      OB_DETAIL_SPI,
      OB_DETAIL_SEAMALLOW,
      OB_DETAIL_GAUGE,
      OB_DETAIL_THROW,
      OB_DETAIL_ND,
      OB_DETAIL_ND_THREADS,
      OB_DETAIL_BOBIN_THREADS,
      ADD_ID,
    } = dataObDetail;

    let machineId = OB_DETAIL_MACHINE?.MACHINE_ID || null;

    if(OB_DETAIL_MACHINE?.customOption){
      const newMachine = await listMachine.create({
        MACHINE_TYPE: OB_DETAIL_MACHINE.MACHINE_TYPE,
         ADD_ID: ADD_ID,
      })
     const plainMachine = newMachine.get({ plain: true });
      machineId = plainMachine.MACHINE_ID;
      dataObDetail.OB_DETAIL_MACHINE = plainMachine; // update machine id di dataObDetail
    }

    if(OB_DETAIL_SPI?.customOption){
      const newStitch = await listStiches.create({
        MACHINE_ID: machineId,
        STITCHES: OB_DETAIL_SPI.STITCHES,
         ADD_ID: ADD_ID,
      })
      const plainStiches = newStitch.get({ plain: true });
      dataObDetail.OB_DETAIL_SPI = plainStiches; // update stitch id di dataObDetail
    }
    if(OB_DETAIL_SEAMALLOW?.customOption){
      const newSeamAllow = await listSeamAllow.create({
        MACHINE_ID: machineId,
        SEAM_ALLOW: OB_DETAIL_SEAMALLOW.SEAM_ALLOW,
         ADD_ID: ADD_ID,
      })
      const plainSeamAllow = newSeamAllow.get({ plain: true });
      dataObDetail.OB_DETAIL_SEAMALLOW = plainSeamAllow; // update seam allow id di dataObDetail
    }
    if(OB_DETAIL_GAUGE?.customOption){
      const newGauge = await listGauge.create({
        MACHINE_ID: machineId,
        GAUGE: OB_DETAIL_GAUGE.GAUGE,
         ADD_ID: ADD_ID,
      })
      const plainGauge = newGauge.get({ plain: true });
      dataObDetail.OB_DETAIL_GAUGE = plainGauge; // update gauge id di dataObDetail
    }
    if(OB_DETAIL_THROW?.customOption){
      const newThrow = await listThrow.create({
        MACHINE_ID: machineId,
        THROW_NAME: OB_DETAIL_THROW.THROW_NAME,
         ADD_ID: ADD_ID,
      })
      const plainNewthrow = newThrow.get({ plain: true });
      dataObDetail.OB_DETAIL_THROW = plainNewthrow; // update throw id di dataObDetail
    }
    if(OB_DETAIL_ND?.customOption){
      const newNeedle = await listNeedle.create({
        MACHINE_ID: machineId,
        NEEDLE_NAME: OB_DETAIL_ND.NEEDLE_NAME,
        ADD_ID: ADD_ID,
      })
      const palinNeedle = newNeedle.get({ plain: true });
      dataObDetail.OB_DETAIL_ND = palinNeedle; // update needle id di dataObDetail
    }
    if(OB_DETAIL_ND_THREADS?.customOption){
      const newNeedleThread = await listNeedleThread.create({
        NEEDLE_THREAD: OB_DETAIL_ND_THREADS.NEEDLE_THREAD,
      })
      const planNdThread = newNeedleThread.get({ plain: true });
      dataObDetail.OB_DETAIL_ND_THREADS = planNdThread; // update needle thread id di dataObDetail
    }
    if(OB_DETAIL_BOBIN_THREADS?.customOption){
      const newBobinThread = await listBobinThread.create({
        BOBIN_THREAD: OB_DETAIL_BOBIN_THREADS.BOBIN_THREAD,
      })
      const plainBobinThread = newBobinThread.get({ plain: true });
      dataObDetail.OB_DETAIL_BOBIN_THREADS = plainBobinThread; // update bobin thread id di dataObDetail
    }

    next(); // lanjutkan ke proses post
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate OB detail data",
      error: error.message,
    });
  }
}

export const postIeObDetail = async (req, res, next) => {
  try {
    const dataObDetail = req.body;
    if(!dataObDetail.OB_DETAIL_DESCRIPTION) {
      return res.status(400).json({ success: false, message: "OB_ID and OB_DETAIL_DESCRIPTION are required" });
    }

    let dataPost = {
      ...dataObDetail,
        OB_DETAIL_MACHINE: dataObDetail.OB_DETAIL_MACHINE.MACHINE_ID,
        OB_DETAIL_SPI: dataObDetail.OB_DETAIL_SPI.STITCHES_ID,
        OB_DETAIL_SEAMALLOW: dataObDetail.OB_DETAIL_SEAMALLOW.SEAM_ALLOW_ID,
        OB_DETAIL_GAUGE: dataObDetail.OB_DETAIL_GAUGE.GAUGE_ID,
        OB_DETAIL_THROW: dataObDetail.OB_DETAIL_THROW.THROW_ID,
        OB_DETAIL_ND: dataObDetail.OB_DETAIL_ND.NEEDLE_ID,
        OB_DETAIL_ND_THREADS: dataObDetail.OB_DETAIL_ND_THREADS.ID_NEEDLE_THREAD,
        OB_DETAIL_BOBIN_THREADS: dataObDetail.OB_DETAIL_BOBIN_THREADS.ID_BOBIN_THREAD,
    }
    
  
  if(dataPost.OB_DETAIL_ID){
      // Jika OB_DETAIL_ID ada, berarti update
      const existingObDetail = await IeObDetail.findOne({
        where: { OB_DETAIL_ID: dataPost.OB_DETAIL_ID },
      });

      if (!existingObDetail) {
        return res.status(404).json({ success: false, message: "OB detail not found" });
      }
      dataPost.MOD_ID = dataPost.ADD_ID; // ubah ADD_ID menjadi MOD_ID
      delete dataPost.ADD_ID
      // Update data
      await IeObDetail.update(dataPost, {
        where: { OB_DETAIL_ID: dataPost.OB_DETAIL_ID },
      });

      const { OB_UPDATE_LOCATION, OB_VALUE_BEFORE, OB_VALUE_AFTER } = generateHistory(dataPost, existingObDetail);

      if (OB_UPDATE_LOCATION) {
        const dataHistory = {
          OB_ID: dataPost.OB_ID,
          OB_USER_ID: dataPost.MOD_ID,
          OB_TYPE_ACTION: 'Update Detail',
          OB_UPDATE_LOCATION,
          OB_VALUE_BEFORE,
          OB_VALUE_AFTER
        };

        await IeObHistory.create(dataHistory);
      }

      return next(); // lanjutkan ke proses penyimpanan data detail OB
    }else {

    const postObDetail = await IeObDetail.create(dataPost);

    if (!postObDetail) {
      return res.status(400).json({ success: false, message: "Failed to save OB detail" });
    }

    if(postObDetail){
     const dataHistory = {
        OB_ID: dataPost.OB_ID,
        OB_USER_ID: dataPost.ADD_ID,
        OB_TYPE_ACTION: 'Post Detail',
        OB_UPDATE_LOCATION: `Row No : ${dataPost.OB_DETAIL_NO}`,
        OB_VALUE_AFTER : `OB DESCRIPTION : ${dataPost.OB_DETAIL_DESCRIPTION} `
      }
      await IeObHistory.create(dataHistory); // simpan ke history
      
      return next(); // lanjutkan ke proses penyimpanan data detail OB
    } 
    // Proses penyimpanan data detail OB
    // Misalnya, simpan ke database atau lakukan operasi lainnya
  }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to save OB detail",
      error: error.message,
    });
  }
}

export const reNoIeObDetail = async (req, res, next) => {
  try {
    const dataObDetail = req.body;
    
    if(!dataObDetail.OB_DETAIL_ID) {
      const {OB_ID} = dataObDetail;
        // Ambil data terbaru dari DB
        const allObDetail =   await db.query(qryGetObDetailForBe, {
            replacements: {obId: dataObDetail.OB_ID},
            type: QueryTypes.SELECT,
          }) 


        //hitung semua ob_detail_smv yang bernilai decimal

        const totalObDetailSvm = allObDetail.reduce((total, item) => {
          const smv = parseFloat(item.OB_DETAIL_SMV);
          return total + (isNaN(smv) ? 0 : smv);
        }, 0);
        
        const obHeader = await IeObHeader.findOne({
          where: { OB_ID },
          raw: true, // supaya hasilnya plain object
        });
        
        //hitung total target header  (Work Hours / TOTAL SEWING SMV)*Manpower lalu pembulatan 2
        const totalTargetHeader = Math.round((obHeader.OB_WH * 60 / totalObDetailSvm) * obHeader.OB_MP);

        //hitung take time = (Work Hours*60*60)/Target (pcs.) lalu pembulatan nilai
        const takeTime = Math.round((obHeader.OB_WH * 60 * 60) / totalTargetHeader, 1);

        
        //update total target header dan total smv di header
        await IeObHeader.update(
          {
            OB_TARGET: totalObDetailSvm ? totalTargetHeader : null, // jika totalTargetHeader NaN maka set ke 0
            OB_TAKE_TIME: totalObDetailSvm ? takeTime : null, // jika takeTime NaN maka set ke 0
            OB_SMV : totalObDetailSvm ? totalObDetailSvm.toFixed(2) : null,
          },
          {
            where: { OB_ID },
          }
        );
      
        // lalu check urutan ob_detail_no yang ada di dalam ada feature id lebih besar dari dataObDetail.OB_DETAIL_FEATURES_NO
        const underOrSameFeatures = dataObDetail.SEQ_NO ?  allObDetail.filter(item => item.SEQ_NO <= dataObDetail.SEQ_NO) : allObDetail.filter(item => item.OB_DETAIL_NO <= dataObDetail.OB_DETAIL_NO);
        const upperFieatuers = dataObDetail.SEQ_NO ? allObDetail.filter(item => item.SEQ_NO > dataObDetail.SEQ_NO) : allObDetail.filter(item => item.OB_DETAIL_NO > dataObDetail.OB_DETAIL_NO);

        
        // jika ada yang lebih besar atau sama dengan maka update semua dataObDetail.OB_DETAIL_NO dari existingObDetail maka tambahkan 1 
        if (upperFieatuers.length > 0) {

          const updatePromises = upperFieatuers.map((item, idx) => {
            return IeObDetail.update(
              { OB_DETAIL_NO:  underOrSameFeatures.length + idx + 1 },
              { where: { OB_DETAIL_ID: item.OB_DETAIL_ID } }
            );
          });
          
          await Promise.all(updatePromises);
        }
      next(); // lanjutkan ke proses penyimpanan data detail OB
    }else {
      next(); // lanjutkan ke proses penyimpanan data detail OB
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to renumber OB detail",
      error: error.message,
    });
    
  }
}

export const returnPostIeObDetail = async (req, res) => {
  try {
    const dataObDetail = req.body;
          // Ambil data terbaru dari DB ob detail berdsarkan query qryGetObDetail dan ob header berdsarkan query qryObDetail
        const listObDetail = await db.query(qryGetObDetail, {
          replacements: {obId: dataObDetail.OB_ID},
          type: QueryTypes.SELECT,
        }) 

        let obHeaderDetail = await IeObHeader.findOne({
          where: { OB_ID: dataObDetail.OB_ID },
          raw: true, // supaya hasilnya plain object
        });

         if(obHeaderDetail.OB_SKETCH){
            const urls = baseUrl;

            const sketchPath = `/images/sketch/${obHeaderDetail.OB_SKETCH}`;
            const sketchUrl = `${urls}${sketchPath}`;
            obHeaderDetail.OB_SKETCH = sketchUrl; // Update the OB_SKETCH field with the full URL
        }

        const dataObDetailResponse = {
          obHeader: obHeaderDetail,
          obDetail: listObDetail
        }
        return res.status(200).json({ success: true, data: dataObDetailResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to return OB detail",
      error: error.message,
    });
  }
}


export const getListObDetail = async (req, res) =>{
  try {
    const {obId} = req.params

    const listObDetail = await db.query(qryGetObDetail, {
      replacements: {obId},
      type: QueryTypes.SELECT,
    })
    
    return res.status(200).json({data: listObDetail})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


// controller untuk post sketch dengan cara simpan file ke //assets/images/sketch/ dan simpan nama file ke database
export const postIeObSketch = async (req, res) => {
  try {
      let dataSketch = req.body;
      
      const imageFile = req.files.file; // Ambil file gambar dari request
      const fileName = imageFile.name; // Ambil nama file
      const fileExtension = path.extname(fileName).toLowerCase(); // Ambil ekstensi file
      const newFileName = `${dataSketch.OB_ID}${fileExtension}`; // Buat nama file baru dengan OB_ID
      if (!imageFile) {
        return res.status(400).json({ success: false, message: "Image file is required" });
      }
      const obId = dataSketch.OB_ID;
      const userId = dataSketch.userId;
      if (!obId) {
        return res.status(400).json({ success: false, message: "OB_ID is required" });
      }
      const sketchPath = path.join(__dirname, "../../../assets/images/sketch", newFileName); // Tentukan path penyimpanan
       fs.writeFile(sketchPath, imageFile.data,  (err) => {
            if(err){
              msg = msg + ` but error upload front Img`
            }
        })
      // upadate nama file sketch di database
      const updateSketch = await IeObHeader.update(
        { OB_SKETCH: newFileName, OB_MOD_ID: userId },
        {
          where: { OB_ID: obId, OB_DELETE_STATUS: 0 },
        }
      );
      
      if (!updateSketch[0]) {
        return res.status(404).json({ success: false, message: "OB not found or already deleted" });
      }
      // Jika berhasil, kembalikan respons sukses

    return res.status(200).json({ success: true, message: "Sketch updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update sketch",
      error: error.message,
    });
  }
}

export const deleteIeObSketch = async (req, res) => {
  try {
      const { obId } = req.params;
      if (!obId) {
        return res.status(400).json({ success: false, message: "OB_ID is required" });
      }
      const getOb = await IeObHeader.findOne({
        where: { OB_ID: obId, OB_DELETE_STATUS: 0 },
      });
      
      // Hapus file sketch dari server
      const sketchPath = path.join(__dirname, "../../../assets/images/sketch", getOb.OB_SKETCH);
      if (fs.existsSync(sketchPath)) {
        fs.unlinkSync(sketchPath);
      }
      // Update database untuk menghapus nama file sketch
      await IeObHeader.update(
        { OB_SKETCH: null },
        { where: { OB_ID: obId, OB_DELETE_STATUS: 0 } }
      );
      return res.status(200).json({ success: true, message: "Sketch deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete sketch",
      error: error.message,
    });
  }
}


//controler untuk delete ob detail
export const deleteIeObDetail = async (req, res, next) => {
  try {
    const { obDetailId, userId } = req.params;

    if (!obDetailId) {
      return res.status(400).json({ success: false, message: "OB detail id is required" });
    }

    // Cek apakah detail OB ada
    const existingObDetail = await IeObDetail.findOne({
      where: { OB_DETAIL_ID: obDetailId },
    });

    if (!existingObDetail) {
      return res.status(404).json({ success: false, message: "OB detail not found" });
    }



    // Hapus detail OB
    await IeObDetail.destroy({
      where: { OB_DETAIL_ID: obDetailId },
    });

      const dataHistory = {
        OB_ID: existingObDetail.OB_ID,
        OB_USER_ID: userId,
        OB_TYPE_ACTION: 'Delete Detail',
        OB_UPDATE_LOCATION: `Row No : ${existingObDetail.OB_DETAIL_NO}`,
      }
      await IeObHistory.create(dataHistory); // simpan ke history
      

    req.body.OB_ID = existingObDetail.OB_ID; // Set OB_ID untuk proses renumbering
    req.body.OB_DETAIL_NO = existingObDetail.OB_DETAIL_NO; // Set OB_DETAIL_NO untuk proses renumbering
    

    // Lanjutkan ke proses renumbering
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete OB detail",
      error: error.message,
    });
  }
}


//conrtoler multiple delete ob detail
export const deleteMultipleIeObDetail = async (req, res, next) => {
  try {
    const { obDetailIds, userId } = req.body;

    if (!obDetailIds || obDetailIds.length === 0) {
      return res.status(400).json({ success: false, message: "OB detail ids are required" });
    }

    // Cek apakah detail OB ada
    const existingObDetails = await IeObDetail.findAll({
      where: { OB_DETAIL_ID: obDetailIds },
    });

    if (existingObDetails.length === 0) {
      return res.status(404).json({ success: false, message: "OB details not found" });
    }

    // Hapus detail OB
  const deletListOb = await IeObDetail.destroy({
      where: { OB_DETAIL_ID: obDetailIds },
    });

    if(deletListOb) {
    const dataHistory = {
      OB_ID: existingObDetails[0].OB_ID,
      OB_USER_ID: userId,
      OB_TYPE_ACTION: 'Delete Detail',
      OB_UPDATE_LOCATION: `Row No : ${obDetailIds.join(', ')}`,
    }
    await IeObHistory.create(dataHistory); // simpan ke history
  }

    // Set OB_ID dan OB_DETAIL_NO untuk proses renumbering
    req.body.OB_ID = existingObDetails[0].OB_ID; // Ambil OB_ID dari detail pertama
    req.body.OB_DETAIL_NO = existingObDetails[0].OB_DETAIL_NO; // Ambil OB_DETAIL_NO dari detail pertama

    

    // Lanjutkan ke proses renumbering
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete multiple OB details",
      error: error.message,
    });
  }
}

//sort ob detail dalam satu features
export const sortObDetail = async (req, res) => {
  try {
    let {dataUpdate, userId, } = req.body;
    
    if (!dataUpdate || dataUpdate.length === 0) {
      return res.status(400).json({ success: false, message: "Data to update is required" });
    }
    //cari no urut pertama berdsarakan ob feateures no sebelumnya
    const firsRow = dataUpdate[0];

    if(firsRow.SEQ_NO !== 1){
      //getLas ob no 
      const lastObNo = await db.query(lastObNoBYSeq, {
        replacements: {obId : firsRow.OB_ID, seqNo : firsRow.SEQ_NO},
        type: QueryTypes.SELECT,
      });

      dataUpdate = dataUpdate.map((item, index) => {
        return {
          ...item,
          OB_DETAIL_NO: lastObNo[0].LAST_OB_DETAIL_NO + item.OB_DETAIL_NO, // update OB_DETAIL_NO berdasarkan urutan
          MOD_ID: userId, // set MOD_ID
        };
      });
    }
    // Update setiap item dalam dataUpdate
    const updatePromises = dataUpdate.map(item => {
      return IeObDetail.update(
        { OB_DETAIL_NO: item.OB_DETAIL_NO, MOD_ID: item.MOD_ID },
        { where: { OB_DETAIL_ID: item.OB_DETAIL_ID } }
      );
    });
    await Promise.all(updatePromises);
    return res.status(200).json({ success: true, message: "OB details sorted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to sort OB details",
      error: error.message,
    });
    
  }
}

export const getListSugesObRow = async (req, res) => {
  try {
    const { featId } = req.params;

    if (!featId) {
      return res.status(400).json({ success: false, message: "Features ID is required" });
    }

    const listObDetail = await db.query(getListSugestObDetail, {
      replacements: { featId },
      type: QueryTypes.SELECT,
    });

    if (listObDetail.length === 0) {
      return res.status(404).json({ success: false, message: "OB details not found" });
    }

    return res.status(200).json({ success: true, data: listObDetail });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get Sugest OB details",
      error: error.message,
    });
  }
}


//controler untuk get list ob history
export const getListObHistory = async (req, res) => {
  try {
    const { obId } = req.params;

    if (!obId) {
      return res.status(400).json({ success: false, message: "OB ID is required" });
    }

    const listObHistory  = await db.query(qryGetObHistory, {
      replacements: { obId },
      type: QueryTypes.SELECT,
    });

    if (listObHistory.length === 0) {
      return res.status(404).json({ success: false, message: "OB history not found" });
    }

    return res.status(200).json({ success: true, data: listObHistory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get OB history",
      error: error.message,
    });
  }
}

const extractNumbers = (str) => {
  if ("-") return str; // Jika hasilnya "-", jangan ubah
  return str.match(/\d+(\.\d+)?|\d+\/\d+/g) || []; // Ekstrak angka seperti biasa
};




// controller untuk post import ob detail by excel
export const postImportObDetail = async (req, res, next) => {
  try {
    const { dataImport, obId, userId, prodType } = req.body;

    if (!obId || !userId) {
      return res.status(400).json({ success: false, message: "OB ID and User ID are required" });
    }

    if (!dataImport) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }
    if (!prodType) {
      return res.status(400).json({ success: false, message: "Product Type is required" });
    }



    const pureData = dataImport.filter(item => !item.hasOwnProperty('REMARKS'));
    const remaks = dataImport.filter(item => item.hasOwnProperty('REMARKS'));

    //jika ada remarks header maka post remarks
    if(remaks.length > 0){
      const dataObRemark = {OB_ID : obId, OB_REMARKS: remaks[0].REMARKS}
       await IeObHeader.update(dataObRemark , {
          where : {
            OB_ID : obId
          }
    })
    }
    //ambil unique features 
    const uniqueFeatures = [...new Set(pureData.map(item => item.FEATURES_NAME))];

 
//coba upsert dulu features
    const upsertFeatures = uniqueFeatures.map(async (ft) => {
      if(ft.includes('PACKING')){
      const checkExistFt = await dbListFeatures.findAll({
        where : {
           FEATURES_NAME : ft
        },
        raw : true
      })
      if(checkExistFt.length === 0){
         return await dbListFeatures.create({PRODUCT_TYPE : 'ALL', FEATURES_NAME : ft, FEATURES_CATEGORY : ft }) 
      }}
    })
    
   await Promise.all(upsertFeatures) 

    //ambil FEATURES_ID dari db berdasarkan uniqueFeatures
    const checkListFeatures = await dbListFeatures.findAll({
      where: {
        FEATURES_NAME: uniqueFeatures,
        PRODUCT_TYPE : [prodType, 'ALL'], // pastikan prodType didefinisikan sebelumnya
      }, 
      attributes: ['FEATURES_NAME', 'FEATURES_ID'],
      raw: true,
    });
    

    if(checkListFeatures.length !== uniqueFeatures.length){
      const arrFeatDb = checkListFeatures.map(ft => ft.FEATURES_NAME)
      const findNoFeaturesInDb = uniqueFeatures.filter(ft => !arrFeatDb.includes(ft) ).join(", ")
      
      return res.status(400).json({ success: false, message: `Not Found Features (${findNoFeaturesInDb})` });
    }

      //destroy ob features and ob detail
      const checkExistDetail = await IeObDetail.findAll({
          where : {
            OB_ID : obId
          },
          raw : true
        })

        const checkExistFeat = await IeObFeatures.findAll({
          where : {
            OB_ID : obId
          },
          raw : true
        })

        if(checkExistFeat.length > 0){
            await IeObFeatures.destroy({
              where : {
                OB_ID : obId
              },
            })
        }
        if(checkExistDetail.length > 0){
            await IeObDetail.destroy({
              where : {
                OB_ID : obId
              },
            })
        }

    
    //data post features siap 
    const dataPostFeatures = uniqueFeatures.map((ft, i) => {
      const findFeatures = checkListFeatures.find(ftl => ftl.FEATURES_NAME === ft)
     const objFeat = {...findFeatures, SEQ_NO: i+1, OB_ID: obId, USER_ID: userId}
     return objFeat
    })

    const postFeatures = await IeObFeatures.bulkCreate(dataPostFeatures, { returning: true })
    const planFeatures = postFeatures.map(item =>{
      const fet = item.dataValues
      const featName = checkListFeatures.find(ft => ft.FEATURES_ID === fet.FEATURES_ID)
      
      return {...fet, ...featName}
      //adding features name untuk looping dibawah
      
    });

    //referensi 

    
      const dataParsing = pureData.map(async (item) => {
          const original = item.OB_DETAIL_DESCRIPTION || '';

          // Pisahkan berdasarkan \r\n menjadi dua baris
          const [line1 = '', line2 = ''] = original.split('\r\n');

          // Proses baris pertama (description dan description_idn)
          const [descEn = '', descId = ''] = line1.split('/').map(part => part.trim());

          // Proses baris kedua (remark dan remarks_idn)
          const [remarkEn = '', remarkId = ''] = line2.split('/').map(part => part.trim());
          
          //cari features id
          const findIdFeatures = planFeatures.find(ft => ft.FEATURES_NAME === item.FEATURES_NAME)
          
          //cari machine id 
          let findIdMachine = await listMachine.findOne({
            where : {
              MACHINE_TYPE : item.OB_DETAIL_MACHINE
            }
          })
          
         if(!findIdMachine){
            const newMachine = {MACHINE_TYPE : item.OB_DETAIL_MACHINE.toLowerCase().trim(), ADD_ID : userId}
            const createMachine = await listMachine.create(newMachine)
            findIdMachine = createMachine.get({ plain: true });
          }
          
          const obFeaturesId = findIdFeatures?.ID_OB_FEATURES || null
          const machineId = findIdMachine?.MACHINE_ID || null

          
          let findSPI = await listStiches.findOne({
                    where: {
                      MACHINE_ID: machineId,
                      STITCHES: {
                        [Op.like]: `${parseInt(item.OB_DETAIL_SPI)}%`
                      }
                    }
                })
          if(!findSPI){
              const newStitch = await listStiches.create({
                MACHINE_ID: machineId,
                STITCHES: item.OB_DETAIL_SPI,
                ADD_ID: userId,
              })
              findSPI = newStitch.get({ plain: true });
            } 

          let findSeamAllow = await listSeamAllow.findOne({
            where : {
                MACHINE_ID : machineId,
                SEAM_ALLOW : item.OB_DETAIL_SEAMALLOW
          }})
          if(!findSeamAllow){
              const newSamAllow = await listSeamAllow.create({
                MACHINE_ID: machineId,
                SEAM_ALLOW: item.OB_DETAIL_SEAMALLOW,
                ADD_ID: userId,
              })
              findSeamAllow = newSamAllow.get({ plain: true });
            } 

          let findGauge = await listGauge.findOne({
            where : {
                MACHINE_ID : machineId,
                GAUGE : item.OB_DETAIL_GAUGE
          }})
          if(!findGauge){
              const newGauge = await listGauge.create({
                MACHINE_ID: machineId,
                GAUGE: item.OB_DETAIL_GAUGE,
                ADD_ID: userId,
              })
              findGauge = newGauge.get({ plain: true });
            } 



          let findThrow = await listThrow.findOne({
            where : {
                MACHINE_ID : machineId,
                THROW_NAME : item.OB_DETAIL_THROW
          }})
          if(!findThrow){
              const newThrow = await listThrow.create({
                MACHINE_ID: machineId,
                THROW_NAME: item.OB_DETAIL_THROW,
                ADD_ID: userId,
              })
              findThrow = newThrow.get({ plain: true });
            } 


          let findNd = await listNeedle.findOne({
            where : {
                MACHINE_ID : machineId,
                NEEDLE_NAME : item.OB_DETAIL_ND
          }})
          if(!findNd){
              const newNd = await listNeedle.create({
                MACHINE_ID: machineId,
                NEEDLE_NAME: item.OB_DETAIL_ND,
                ADD_ID: userId,
              })
              findNd = newNd.get({ plain: true });
            } 


          let findNdThread = await listNeedleThread.findOne({
            where : {
                NEEDLE_THREAD : item.OB_DETAIL_ND_THREADS
          }})
          if(!findNd){
              const newNdThd = await listNeedleThread.create({
                NEEDLE_THREAD: item.OB_DETAIL_ND_THREADS,
                ADD_ID: userId,
              })
              findNdThread = newNdThd.get({ plain: true });
            } 



          let findBobinThreads = await listBobinThread.findOne({
            where : {
                BOBIN_THREAD : item.OB_DETAIL_BOBIN_THREADS
          }})
          if(!findNd){
              const newBobinThd = await listBobinThread.create({
                BOBIN_THREAD: item.OB_DETAIL_BOBIN_THREADS,
                ADD_ID: userId,
              })
              findBobinThreads = newBobinThd.get({ plain: true });
            } 

          return {
            ...item,
            OB_ID : obId,
            ID_OB_FEATURES : obFeaturesId,
            OB_DETAIL_MACHINE : findIdMachine.MACHINE_ID,
            OB_DETAIL_SPI : findSPI.STITCHES_ID,
            OB_DETAIL_SEAMALLOW : findSeamAllow.SEAM_ALLOW_ID,
            OB_DETAIL_GAUGE : findGauge.GAUGE_ID,
            OB_DETAIL_THROW : findThrow.THROW_ID,
            OB_DETAIL_ND : findNd.NEEDLE_ID,
            OB_DETAIL_ND_THREADS : findNdThread?.ID_NEEDLE_THREAD || null,
            OB_DETAIL_BOBIN_THREADS : findBobinThreads?.ID_BOBIN_THREAD || null,
            OB_DETAIL_DESCRIPTION: descEn || '',
            OB_DETAIL_DESCRIPTION_IDN: descId || '',
            OB_DETAIL_REMARK: remarkEn || '',
            OB_DETAIL_REMARK_IDN: remarkId || '',
            OB_DETAIL_TARGET: Math.round(Number(item.OB_DETAIL_TARGET) || 0)
          };
        });
      const resolvedData = await Promise.all(dataParsing);

      const postObDetail = await IeObDetail.bulkCreate(resolvedData);

    //hitung smv dan target
        // Ambil data terbaru dari DB
        const allObDetail =   await db.query(qryGetObDetailForBe, {
            replacements: {obId: obId },
            type: QueryTypes.SELECT,
          }) 


        //hitung semua ob_detail_smv yang bernilai decimal

        const totalObDetailSvm = allObDetail.reduce((total, item) => {
          const smv = parseFloat(item.OB_DETAIL_SMV);
          return total + (isNaN(smv) ? 0 : smv);
        }, 0);
        
        const obHeader = await IeObHeader.findOne({
          where: { OB_ID : obId },
          raw: true, // supaya hasilnya plain object
        });
        
        //hitung total target header  (Work Hours / TOTAL SEWING SMV)*Manpower lalu pembulatan 2
        const totalTargetHeader = Math.round((obHeader.OB_WH * 60 / totalObDetailSvm) * obHeader.OB_MP);

        //hitung take time = (Work Hours*60*60)/Target (pcs.) lalu pembulatan nilai
        const takeTime = Math.round((obHeader.OB_WH * 60 * 60) / totalTargetHeader, 1);

        
        //update total target header dan total smv di header
        await IeObHeader.update(
          {
            OB_TARGET: totalObDetailSvm ? totalTargetHeader : null, // jika totalTargetHeader NaN maka set ke 0
            OB_TAKE_TIME: totalObDetailSvm ? takeTime : null, // jika takeTime NaN maka set ke 0
            OB_SMV : totalObDetailSvm ? totalObDetailSvm.toFixed(2) : null,
          },
          {
            where: { OB_ID : obId },
          }
        );
      

    //jika data sudah siap manka lakukan delete terlebih dahulu 
    if(postObDetail){
      req.body = resolvedData[0]
      next()
    }else{
     return res.status(400).json({message : 'failed import excel'})
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to import OB details",
      error: error.message,
    });
  }
}


export const getImageOb = async(req,res) => {
  try {
    const { obid } = req.params;
    const getFileName = await IeObHeader.findOne({
      where: {
        OB_ID: obid
      }, raw: true
    });
    if(getFileName){
      const filePath = path.join( __dirname, "../../../assets/images/sketch", getFileName.OB_SKETCH );
      if(filePath){
        res.sendFile(filePath, (err) => {
          if (err) {
            res.status(404).send('File not found');
          }
        });
      } else {
        res.status(404).send('File not found');
      }
    } else {
          res.status(404).send('File not found');
    }
  } catch(err){
    return res.status(500).json({
      success: false,
      message: "Failed to import OB details",
      error: err,
    });
  }
}