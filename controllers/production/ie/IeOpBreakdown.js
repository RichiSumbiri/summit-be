import db from "../../../config/database.js";
import { QueryTypes, Op, where } from "sequelize";
import { getIdsToDelete, getLasIdOb, getListOb, IeObDetail, IeObFeatures, IeObHeader, IeObSize, listBobinThread, listGauge, listMachine, listNeedle, listNeedleThread, listSeamAllow, listStiches, listThrow, qryGetFeaturs, qryGetObDetail, qryGetObDetailForBe, qryGetSizeOb, qryGetStyleByTree, qryGetThreeStyle, qryIListBobinThreads, qryIListNeedleThreads, qryListFeatures, qryListSizesOb, qryObDetail, splitDataForUpdateAndCreate } from "../../../models/ie/IeOb.mod.js";
import { getUniqueAttribute } from "../../util/Utility.js";
import { pharsingImgStyle } from "../../list/listReferensi.js";
import { qryIListGauge, qryIListMachine, qryIListNeedle, qryIListSeamAllow, qryIListStitch, qryIListThrow } from "../../../models/ie/IeOb.mod.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        // const baseUrl = 'https://api.sumbiri.com';
        const baseUrl = `${req.protocol}://${req.get("host")}`;
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
      return next(); // lanjutkan ke proses penyimpanan data detail OB
    }else {

    const postObDetail = await IeObDetail.create(dataPost);
    if (!postObDetail) {
      
      return res.status(400).json({ success: false, message: "Failed to save OB detail" });
    }

    if(postObDetail){
     

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
            OB_TARGET: totalTargetHeader,
            OB_TAKE_TIME: takeTime,
            OB_SMV : totalObDetailSvm.toFixed(2),
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

        const obHeaderDetail = await IeObHeader.findOne({
          where: { OB_ID: dataObDetail.OB_ID },
          raw: true, // supaya hasilnya plain object
        });
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
    const { obDetailId } = req.params;

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